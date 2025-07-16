/**
 * Twitter OAuth Logging Diagnostic Script
 * 
 * This script tests the enhanced OAuth logging functionality by simulating
 * various parts of the Twitter OAuth flow and verifying that logs are
 * properly generated and stored.
 * 
 * Usage: node test-twitter-oauth-logging-enhanced.js
 */

const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const mongoose = require('mongoose');
const axios = require('axios');
const uuid = require('uuid').v4;
const oauthSignature = require('oauth-signature');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

// Import logging system
const logging = require('./app/logging');

// Create Express app for testing
const app = express();
const PORT = 3099; // Use a different port than your main app

// Configure session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'test-secret',
  resave: false,
  saveUninitialized: true,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/sosh-test',
    ttl: 60 * 60 // 1 hour
  }),
  cookie: {
    secure: false, // Set to true in production with HTTPS
    httpOnly: true,
    maxAge: 1000 * 60 * 60 // 1 hour
  }
}));

// Mock Twitter OAuth configuration
const mockTwitterConfig = {
  TWITTER_CONSUMER_API_KEY: process.env.TWITTER_CONSUMER_API_KEY || 'mock-consumer-key',
  TWITTER_CONSUMER_API_SECRET: process.env.TWITTER_CONSUMER_API_SECRET || 'mock-consumer-secret',
  SERVER_BASE_URL: process.env.SERVER_BASE_URL || 'http://localhost:3099',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000'
};

// Initialize logging system
async function initLogging() {
  try {
    await logging.initializeLogging();
    console.log('Logging system initialized successfully');
  } catch (error) {
    console.error('Failed to initialize logging system:', error);
    process.exit(1);
  }
}

// Mock functions to simulate Twitter OAuth flow
async function mockTwitterRequestToken(req, res) {
  const requestId = `test-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
  req.oauthRequestId = requestId;
  
  // Log the request token request
  await logging.oauthLogger.logOAuthRequest('twitter', {
    action: 'generate_request_token',
    ip: req.ip,
    userAgent: req.headers['user-agent']
  }, {
    requestId,
    sessionID: req.sessionID
  });
  
  // Log session state before request
  await logging.oauthLogger.logSessionState(req.sessionID, 'before_request_token', req.session, {
    requestId,
    path: req.path,
    method: req.method
  });
  
  try {
    const oauth_timestamp = Math.floor(Date.now() / 1000);
    const oauth_nonce = uuid();

    // Log OAuth parameters
    await logging.oauthLogger.logTokenOperation('generate_parameters', {
      oauth_consumer_key: mockTwitterConfig.TWITTER_CONSUMER_API_KEY,
      oauth_nonce: oauth_nonce,
      oauth_timestamp: oauth_timestamp,
      oauth_callback: `${mockTwitterConfig.SERVER_BASE_URL}/api/V1/social/twitter/callback`
    }, {
      requestId,
      sessionID: req.sessionID
    });

    // Mock successful response
    const mockResponseData = {
      oauth_token: `mock-token-${Date.now()}`,
      oauth_token_secret: `mock-secret-${Date.now()}`,
      oauth_callback_confirmed: 'true'
    };

    // Log successful response
    await logging.oauthLogger.logOAuthCallback('twitter', true, {
      responseTime: 100,
      status: 200,
      oauth_token: mockResponseData.oauth_token,
      oauth_token_secret: '[REDACTED]',
      oauth_callback_confirmed: mockResponseData.oauth_callback_confirmed
    }, {
      requestId,
      sessionID: req.sessionID
    });

    // Store token in session
    req.session.oauth = {
      requestToken: mockResponseData.oauth_token,
      requestTokenSecret: mockResponseData.oauth_token_secret
    };
    
    // Save session explicitly
    req.session.save(async (err) => {
      if (err) {
        await logging.oauthLogger.logOAuthError(err, {
          requestId,
          operation: 'save_request_token',
          sessionID: req.sessionID
        });
      } else {
        // Log session after saving token
        await logging.oauthLogger.logSessionState(req.sessionID, 'after_request_token_save', req.session, {
          requestId,
          hasToken: !!req.session.oauth?.requestToken
        });
      }
    });
    
    return res.json({
      oauth_token: mockResponseData.oauth_token,
      oauth_token_secret: '[REDACTED]',
      oauth_callback_confirmed: mockResponseData.oauth_callback_confirmed
    });
  } catch (error) {
    // Log error
    await logging.oauthLogger.logOAuthError(error, {
      requestId,
      operation: 'request_token',
      sessionID: req.sessionID,
      errorMessage: error.message
    });
    
    // Return error response
    return res.status(500).json({
      status: 'error',
      message: 'Failed to get request token from Twitter',
      error: error.message
    });
  }
}

async function mockTwitterCallback(req, res) {
  // Try to get request ID from session or generate a new one
  const requestId = (req.session && req.session.oauthRequestId) ? 
    req.session.oauthRequestId : 
    `callback-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
  
  req.oauthRequestId = requestId;
  
  // Add mock query parameters
  req.query = {
    oauth_token: req.session?.oauth?.requestToken || `mock-token-${Date.now()}`,
    oauth_verifier: `mock-verifier-${Date.now()}`
  };
  
  // Log callback request
  await logging.oauthLogger.logOAuthCallback('twitter', true, {
    query: req.query,
    sessionPresent: !!req.session,
    sessionID: req.sessionID,
    hasOAuthToken: !!req.query.oauth_token,
    hasOAuthVerifier: !!req.query.oauth_verifier
  }, {
    requestId,
    ip: req.ip,
    userAgent: req.headers['user-agent']
  });
  
  // Verify token match
  if (req.session && req.session.oauth) {
    await logging.oauthLogger.logTokenOperation('verify', {
      sessionToken: req.session.oauth.requestToken,
      queryToken: req.query.oauth_token,
      match: req.session.oauth.requestToken === req.query.oauth_token
    }, {
      requestId,
      sessionID: req.sessionID
    });
    
    // Mock successful authentication
    req.session.passport = {
      user: {
        profile: {
          id: `mock-twitter-id-${Date.now()}`,
          username: `mock-user-${Date.now()}`,
          displayName: `Mock User ${Date.now()}`
        },
        accesstokenid: `mock-access-token-id-${Date.now()}`,
        accesstoken: `mock-access-token-${Date.now()}`
      }
    };
    
    // Mock user ID in session
    req.session.userid = `mock-user-id-${Date.now()}`;
    
    // Log session state
    await logging.oauthLogger.logSessionState(req.sessionID, 'twitter_callback_authenticated', req.session, {
      requestId,
      path: req.path,
      method: req.method
    });
    
    // Log successful authentication
    await logging.oauthLogger.logOAuthCallback('twitter', true, {
      action: 'authentication_success',
      userId: req.session.userid,
      twitterId: req.session.passport.user.profile.id
    }, {
      requestId
    });
    
    return res.json({
      status: 'success',
      message: 'Mock Twitter authentication successful',
      userId: req.session.userid,
      twitterUsername: req.session.passport.user.profile.username
    });
  } else {
    // Log token verification failure
    await logging.oauthLogger.logOAuthError(new Error('Failed to find request token in session'), {
      requestId,
      sessionID: req.sessionID,
      operation: 'token_verification',
      sessionExists: !!req.session,
      hasOAuth: !!(req.session && req.session.oauth)
    });
    
    return res.status(400).json({
      status: 'error',
      message: 'Failed to find request token in session'
    });
  }
}

// Test routes
app.get('/test/request-token', mockTwitterRequestToken);
app.get('/test/callback', mockTwitterCallback);

// Test route for session inspection
app.get('/test/session', async (req, res) => {
  const requestId = `session-test-${Date.now()}`;
  
  // Log session state
  await logging.oauthLogger.logSessionState(req.sessionID, 'session_inspection', req.session, {
    requestId,
    path: req.path,
    method: req.method
  });
  
  res.json({
    sessionID: req.sessionID,
    session: req.session
  });
});

// Test route for error logging
app.get('/test/error', async (req, res) => {
  const requestId = `error-test-${Date.now()}`;
  const error = new Error('Test OAuth error');
  
  // Log error
  await logging.oauthLogger.logOAuthError(error, {
    requestId,
    operation: 'test_error',
    sessionID: req.sessionID,
    path: req.path
  });
  
  res.json({
    status: 'error_logged',
    message: 'Test error has been logged',
    error: error.message
  });
});

// Test route for missing session token
app.get('/test/missing-token', async (req, res) => {
  const requestId = `missing-token-${Date.now()}`;
  
  // Log callback with missing token
  await logging.oauthLogger.logOAuthCallback('twitter', false, {
    query: {},
    sessionPresent: !!req.session,
    sessionID: req.sessionID,
    hasOAuthToken: false,
    hasOAuthVerifier: false
  }, {
    requestId,
    ip: req.ip,
    userAgent: req.headers['user-agent']
  });
  
  // Log error
  await logging.oauthLogger.logOAuthError(new Error('Missing OAuth token'), {
    requestId,
    sessionID: req.sessionID,
    operation: 'token_verification',
    sessionExists: !!req.session,
    hasOAuth: !!(req.session && req.session.oauth)
  });
  
  res.json({
    status: 'error',
    message: 'Missing OAuth token scenario logged'
  });
});

// Run the test server
async function runTests() {
  try {
    // Initialize logging
    await initLogging();
    
    // Start server
    const server = app.listen(PORT, () => {
      console.log(`Test server running on http://localhost:${PORT}`);
      console.log('\nAvailable test endpoints:');
      console.log('- GET http://localhost:3099/test/request-token');
      console.log('- GET http://localhost:3099/test/callback');
      console.log('- GET http://localhost:3099/test/session');
      console.log('- GET http://localhost:3099/test/error');
      console.log('- GET http://localhost:3099/test/missing-token');
      console.log('\nRun tests in sequence to simulate OAuth flow:');
      console.log('1. curl http://localhost:3099/test/request-token');
      console.log('2. curl http://localhost:3099/test/callback');
      console.log('3. curl http://localhost:3099/test/session');
      console.log('\nPress Ctrl+C to exit');
    });
    
    // Automatically run tests if --auto flag is provided
    if (process.argv.includes('--auto')) {
      console.log('\nRunning automated tests...');
      
      // Create a test session
      const testSession = session({
        secret: 'test-secret',
        resave: false,
        saveUninitialized: true
      });
      
      // Mock request and response objects
      const mockReq = {
        ip: '127.0.0.1',
        headers: {
          'user-agent': 'Test Script'
        },
        path: '/test/auto',
        method: 'GET',
        session: {},
        sessionID: `test-session-${Date.now()}`
      };
      
      const mockRes = {
        json: (data) => {
          console.log('Response:', JSON.stringify(data, null, 2));
          return mockRes;
        },
        status: (code) => {
          console.log('Status:', code);
          return mockRes;
        }
      };
      
      // Run request token test
      console.log('\n1. Testing request token...');
      await mockTwitterRequestToken(mockReq, mockRes);
      
      // Run callback test
      console.log('\n2. Testing callback...');
      await mockTwitterCallback(mockReq, mockRes);
      
      // Run error test
      console.log('\n3. Testing error logging...');
      await logging.oauthLogger.logOAuthError(new Error('Test automated error'), {
        requestId: `auto-test-${Date.now()}`,
        operation: 'automated_test',
        sessionID: mockReq.sessionID
      });
      
      console.log('\nAutomated tests completed. Check MongoDB for logs.');
      console.log('Server will remain running for manual tests. Press Ctrl+C to exit.');
    }
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}

// Run the tests
runTests();
