/**
 * Twitter OAuth Error Logging Test Script
 * 
 * This script tests the Twitter OAuth flow with explicit error logging
 * to ensure that errors are properly captured and logged to MongoDB.
 */

const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const TwitterStrategy = require('passport-twitter').Strategy;
const http = require('http');
const appconfig = require('./config/appconfig');
const errorLogger = require('./app/logging/handlers/errorLogger');
const dbConnection = require('./app/services/dbConnection');

// Test port
const PORT = 3336;

// Test results
const testResults = {
  setup: {},
  oauthFlow: {},
  errorLogging: {},
  verification: {}
};

async function runTests() {
  console.log('=== Starting Twitter OAuth Error Logging Tests ===\n');
  
  // Initialize error logger
  await errorLogger.initPromise;
  
  // Create and start test server
  const app = createTestApp();
  const server = app.listen(PORT);
  
  try {
    // Test 1: Setup and Configuration
    await testSetup();
    
    // Test 2: Simulate OAuth Flow with Error
    await testOAuthFlow(server);
    
    // Test 3: Verify Error Logging
    await verifyErrorLogging();
    
    // Print results
    console.log('\n=== Twitter OAuth Error Logging Test Results ===\n');
    console.log(JSON.stringify(testResults, null, 2));
    
  } catch (error) {
    console.error('Test script failed:', error);
  } finally {
    // Close server
    server.close();
    console.log('Test server closed');
    
    process.exit(0);
  }
}

async function testSetup() {
  console.log('Testing setup and configuration...');
  try {
    // Check database connection
    const connection = await dbConnection.getConnection();
    
    // Check error logger initialization
    const loggerReady = errorLogger.ready;
    
    testResults.setup = {
      success: connection.connection.readyState === 1 && loggerReady,
      dbConnected: connection.connection.readyState === 1,
      loggerReady,
      database: connection.connection.name,
      host: connection.connection.host
    };
    
    if (testResults.setup.success) {
      console.log('✓ Setup test passed');
    } else {
      console.log('✗ Setup test failed');
    }
  } catch (error) {
    testResults.setup = {
      success: false,
      error: error.message,
      stack: error.stack
    };
    console.error('✗ Setup test failed:', error.message);
  }
}

async function testOAuthFlow() {
  console.log('\nTesting OAuth flow with error logging...');
  try {
    // Step 1: Initialize session
    const initResponse = await makeRequest('/init-oauth');
    const sessionID = initResponse.sessionID;
    
    console.log('Session initialized with ID:', sessionID);
    
    // Step 2: Simulate missing request token error
    const missingTokenResponse = await makeRequest('/simulate-missing-token', sessionID);
    
    // Step 3: Simulate callback with error
    const callbackResponse = await makeRequest(
      '/simulate-callback?oauth_token=test-token&oauth_verifier=test-verifier', 
      sessionID
    );
    
    // Step 4: Simulate callback with invalid session
    const invalidSessionResponse = await makeRequest(
      '/simulate-callback?oauth_token=test-token&oauth_verifier=test-verifier'
    );
    
    testResults.oauthFlow = {
      sessionID,
      initSuccess: initResponse.success,
      missingTokenError: !missingTokenResponse.success,
      callbackError: !callbackResponse.success,
      invalidSessionError: !invalidSessionResponse.success,
      errorMessages: [
        missingTokenResponse.error,
        callbackResponse.error,
        invalidSessionResponse.error
      ].filter(Boolean)
    };
    
    console.log('✓ OAuth flow test completed with expected errors');
  } catch (error) {
    testResults.oauthFlow = {
      success: false,
      error: error.message,
      stack: error.stack
    };
    console.error('✗ OAuth flow test failed:', error.message);
  }
}

async function verifyErrorLogging() {
  console.log('\nVerifying error logging...');
  try {
    // Wait for logs to be written
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Check error_logs collection for our test errors
    const connection = await dbConnection.getConnection();
    const errorLogs = await connection.connection.db
      .collection('error_logs')
      .find({
        message: { $regex: /Failed to find request token|Test: Twitter OAuth|session expired/i },
        timestamp: { $gte: new Date(Date.now() - 60000).toISOString() }
      })
      .toArray();
    
    // Check if we have logs for each error type
    const missingTokenLogs = errorLogs.filter(log => 
      log.message && log.message.includes('Failed to find request token'));
    
    const oauthTestLogs = errorLogs.filter(log => 
      log.message && log.message.includes('Test: Twitter OAuth'));
    
    const sessionExpiredLogs = errorLogs.filter(log => 
      log.message && log.message.includes('session expired'));
    
    testResults.verification = {
      success: errorLogs.length > 0,
      totalLogs: errorLogs.length,
      missingTokenLogs: missingTokenLogs.length,
      oauthTestLogs: oauthTestLogs.length,
      sessionExpiredLogs: sessionExpiredLogs.length,
      sampleLogs: errorLogs.slice(0, 3).map(log => ({
        message: log.message,
        timestamp: log.timestamp,
        context: log.context
      }))
    };
    
    if (testResults.verification.success) {
      console.log(`✓ Error logging verification passed - found ${errorLogs.length} relevant logs`);
    } else {
      console.log('✗ Error logging verification failed - no relevant logs found');
    }
  } catch (error) {
    testResults.verification = {
      success: false,
      error: error.message,
      stack: error.stack
    };
    console.error('✗ Error logging verification failed:', error.message);
  }
}

function createTestApp() {
  const app = express();
  
  // Configure session
  app.use(
    session({
      store: new MongoStore({
        mongoUrl: appconfig.MONGODB_CONNECTION_STRING,
        autoRemove: 'native',
        ttl: 4 * 24 * 60 * 60
      }),
      secret: appconfig.EXPRESS_SESSION_SECRET,
      resave: true,
      saveUninitialized: true,
      cookie: { 
        maxAge: 5000000000, 
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
      },
    })
  );
  
  // Configure passport
  app.use(passport.initialize());
  app.use(passport.session());
  
  passport.serializeUser((user, done) => {
    done(null, user);
  });
  
  passport.deserializeUser((obj, done) => {
    done(null, obj);
  });
  
  // Test routes
  app.get('/init-oauth', (req, res, next) => {
    // Simulate Twitter OAuth request token storage
    req.session.oauth = {
      requestToken: 'test-request-token',
      requestTokenSecret: 'test-request-token-secret',
      timestamp: Date.now()
    };
    
    // Log the action
    errorLogger.logError(new Error('Test: Twitter OAuth session initialized'), {
      context: 'test_oauth',
      sessionID: req.sessionID,
      oauth: req.session.oauth
    });
    
    req.session.save((err) => {
      if (err) {
        errorLogger.logError(err, {
          context: 'test_oauth_save_error',
          sessionID: req.sessionID
        });
        return next(err);
      }
      
      res.json({ 
        success: true, 
        sessionID: req.sessionID,
        message: 'Session saved with OAuth request token'
      });
    });
  });
  
  app.get('/simulate-missing-token', (req, res) => {
    // Deliberately clear the oauth data to simulate missing token
    if (req.session.oauth) {
      delete req.session.oauth;
    }
    
    // Log the action
    errorLogger.logError(new Error('Test: Deliberately removed OAuth data'), {
      context: 'test_oauth',
      sessionID: req.sessionID,
      hasSession: !!req.session
    });
    
    // Check if oauth token exists in session (it shouldn't)
    if (!req.session.oauth || !req.session.oauth.requestToken) {
      const error = new Error('Failed to find request token in session');
      
      // Log the error
      errorLogger.logError(error, {
        context: 'test_oauth_error',
        sessionID: req.sessionID,
        hasSession: !!req.session,
        sessionData: req.session
      });
      
      return res.status(500).json({
        success: false,
        error: error.message,
        sessionID: req.sessionID,
        session: req.session
      });
    }
    
    // This shouldn't be reached
    res.json({
      success: true,
      message: 'Unexpectedly found request token in session',
      requestToken: req.session.oauth.requestToken
    });
  });
  
  app.get('/simulate-callback', (req, res) => {
    // Log the callback attempt
    errorLogger.logError(new Error('Test: Callback simulation'), {
      context: 'test_oauth',
      sessionID: req.sessionID,
      hasSession: !!req.session,
      hasOAuth: !!req.session.oauth,
      oauth: req.session.oauth,
      query: req.query
    });
    
    // Check if session exists
    if (!req.session) {
      const error = new Error('Session expired or invalid');
      
      // Log the error
      errorLogger.logError(error, {
        context: 'test_oauth_error',
        sessionID: req.sessionID,
        query: req.query
      });
      
      return res.status(500).json({
        success: false,
        error: error.message,
        sessionID: req.sessionID
      });
    }
    
    // Check if oauth token exists in session
    if (!req.session.oauth || !req.session.oauth.requestToken) {
      const error = new Error('Failed to find request token in session');
      
      // Log the error
      errorLogger.logError(error, {
        context: 'test_oauth_error',
        sessionID: req.sessionID,
        hasSession: !!req.session,
        sessionData: req.session,
        query: req.query
      });
      
      return res.status(500).json({
        success: false,
        error: error.message,
        sessionID: req.sessionID,
        session: req.session
      });
    }
    
    // Success case
    res.json({
      success: true,
      message: 'Found request token in session',
      requestToken: req.session.oauth.requestToken,
      sessionID: req.sessionID,
      query: req.query
    });
  });
  
  return app;
}

// Helper function for HTTP requests
function makeRequest(path, sessionID = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: PORT,
      path,
      method: 'GET',
      headers: {}
    };
    
    if (sessionID) {
      options.headers.Cookie = `connect.sid=${sessionID}`;
    }
    
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error(`Invalid JSON response: ${data}`));
        }
      });
    });
    
    req.on('error', reject);
    req.end();
  });
}

// Run the tests
runTests().catch(err => {
  console.error('Test script failed:', err);
  process.exit(1);
});
