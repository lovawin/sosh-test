/**
 * Twitter OAuth and Logging Diagnostic Script
 * 
 * This script tests various components to identify issues with:
 * 1. Session management
 * 2. MongoDB transport
 * 3. Error logging flow
 * 4. Twitter OAuth flow
 */

const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const TwitterStrategy = require('passport-twitter').Strategy;
const mongoose = require('mongoose');
const winston = require('winston');
const http = require('http');
const appconfig = require('./config/appconfig');
const MongoTransport = require('./app/logging/transports/mongoTransport');
const dbConnection = require('./app/services/dbConnection');
const errorLogger = require('./app/logging/handlers/errorLogger');
const { createLogger } = require('./app/logging/config/logConfig');

// Create a test app
const app = express();
const PORT = 3333;

// Test results storage
const testResults = {
  sessionTests: {},
  mongoDbTests: {},
  loggingTests: {},
  oauthTests: {}
};

async function runDiagnostics() {
  console.log('=== Starting Diagnostic Tests ===\n');
  
  // Test 1: Database Connection
  await testDatabaseConnection();
  
  // Test 2: MongoDB Transport
  await testMongoTransport();
  
  // Test 3: Session Configuration
  await testSessionConfiguration();
  
  // Test 4: Error Logging
  await testErrorLogging();
  
  // Test 5: Twitter OAuth
  await testTwitterOAuth();
  
  // Print results
  console.log('\n=== Diagnostic Test Results ===\n');
  console.log(JSON.stringify(testResults, null, 2));
  
  process.exit(0);
}

async function testDatabaseConnection() {
  console.log('Testing database connection...');
  try {
    const connection = await dbConnection.getConnection();
    testResults.mongoDbTests.connection = {
      success: true,
      state: connection.connection.readyState,
      database: connection.connection.name,
      host: connection.connection.host
    };
    
    // Test collections
    const collections = await connection.connection.db.listCollections().toArray();
    testResults.mongoDbTests.collections = collections.map(c => c.name);
    
    console.log('✓ Database connection test passed');
  } catch (error) {
    testResults.mongoDbTests.connection = {
      success: false,
      error: error.message,
      stack: error.stack
    };
    console.error('✗ Database connection test failed:', error.message);
  }
}

async function testMongoTransport() {
  console.log('\nTesting MongoDB transport...');
  try {
    // Create test transport
    const transport = new MongoTransport({ 
      collection: 'diagnostic_logs'
    });
    
    // Wait for connection
    await transport.connectionPromise;
    
    // Test logging
    const testLog = {
      level: 'info',
      message: 'Test log message',
      timestamp: new Date().toISOString()
    };
    
    // Log with promise to ensure completion
    await new Promise((resolve, reject) => {
      transport.log(testLog, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    testResults.mongoDbTests.transport = {
      success: true,
      isConnected: transport.isConnected,
      collection: transport.collection
    };
    
    console.log('✓ MongoDB transport test passed');
  } catch (error) {
    testResults.mongoDbTests.transport = {
      success: false,
      error: error.message,
      stack: error.stack
    };
    console.error('✗ MongoDB transport test failed:', error.message);
  }
}

async function testSessionConfiguration() {
  console.log('\nTesting session configuration...');
  
  // Create test server with session
  const testApp = express();
  
  // Configure session like in the main app
  testApp.use(
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
        path: '/api/V1/social',
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
      },
    })
  );
  
  // Test routes
  testApp.get('/set-session', (req, res) => {
    req.session.testData = { timestamp: Date.now() };
    res.json({ success: true, sessionID: req.sessionID });
  });
  
  testApp.get('/get-session', (req, res) => {
    res.json({ 
      success: true, 
      sessionID: req.sessionID,
      hasData: !!req.session.testData,
      data: req.session.testData
    });
  });
  
  testApp.get('/api/V1/social/get-session', (req, res) => {
    res.json({ 
      success: true, 
      sessionID: req.sessionID,
      hasData: !!req.session.testData,
      data: req.session.testData
    });
  });
  
  // Start server
  const server = testApp.listen(PORT);
  
  try {
    // Test 1: Set session
    const setResponse = await makeRequest('/set-session');
    const sessionID = setResponse.sessionID;
    
    // Test 2: Get session on regular path
    const getResponse = await makeRequest('/get-session', sessionID);
    
    // Test 3: Get session on social path
    const getSocialResponse = await makeRequest('/api/V1/social/get-session', sessionID);
    
    testResults.sessionTests = {
      success: getResponse.hasData && getSocialResponse.hasData,
      sessionID,
      regularPath: {
        success: getResponse.hasData,
        data: getResponse.data
      },
      socialPath: {
        success: getSocialResponse.hasData,
        data: getSocialResponse.data
      }
    };
    
    if (testResults.sessionTests.success) {
      console.log('✓ Session configuration test passed');
    } else {
      console.log('✗ Session configuration test failed - session data not preserved');
    }
  } catch (error) {
    testResults.sessionTests = {
      success: false,
      error: error.message,
      stack: error.stack
    };
    console.error('✗ Session configuration test failed:', error.message);
  } finally {
    server.close();
  }
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

async function testErrorLogging() {
  console.log('\nTesting error logging...');
  try {
    // Wait for logger initialization
    await errorLogger.initPromise;
    
    // Test 1: Log a regular error
    const testError = new Error('Test diagnostic error');
    await errorLogger.logError(testError, {
      context: 'diagnostic_test',
      timestamp: new Date().toISOString()
    });
    
    // Test 2: Log a Twitter OAuth specific error
    const oauthError = new Error('Failed to find request token in session');
    oauthError.code = 'OAUTH_SESSION_ERROR';
    await errorLogger.logError(oauthError, {
      context: 'twitter_oauth',
      path: '/api/V1/social/twitter/callback',
      timestamp: new Date().toISOString()
    });
    
    // Wait for logs to be written
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Check if logs were written to MongoDB
    const connection = await dbConnection.getConnection();
    const errorLogs = await connection.connection.db
      .collection('error_logs')
      .find({
        'message': { $in: ['Test diagnostic error', 'Failed to find request token in session'] }
      })
      .toArray();
    
    testResults.loggingTests = {
      success: errorLogs.length === 2,
      logsFound: errorLogs.length,
      expectedLogs: 2,
      logMessages: errorLogs.map(log => log.message)
    };
    
    if (testResults.loggingTests.success) {
      console.log('✓ Error logging test passed');
    } else {
      console.log('✗ Error logging test failed - not all logs were written to MongoDB');
    }
  } catch (error) {
    testResults.loggingTests = {
      success: false,
      error: error.message,
      stack: error.stack
    };
    console.error('✗ Error logging test failed:', error.message);
  }
}

async function testTwitterOAuth() {
  console.log('\nTesting Twitter OAuth flow...');
  
  // Create test server with Twitter OAuth
  const testApp = express();
  
  // Configure session
  testApp.use(
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
        // Test with both cookie paths to compare
        path: '/',  // Changed from '/api/V1/social'
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
      },
    })
  );
  
  // Configure passport
  testApp.use(passport.initialize());
  testApp.use(passport.session());
  
  // Mock Twitter strategy
  passport.use('twitter-test', new TwitterStrategy({
    consumerKey: 'test-key',
    consumerSecret: 'test-secret',
    callbackURL: 'http://localhost:3333/callback'
  }, (token, tokenSecret, profile, done) => {
    done(null, { token, tokenSecret, profile });
  }));
  
  passport.serializeUser((user, done) => {
    done(null, user);
  });
  
  passport.deserializeUser((obj, done) => {
    done(null, obj);
  });
  
  // Test routes
  testApp.get('/auth', (req, res, next) => {
    // Manually set request token in session to simulate Twitter OAuth
    req.session.oauth = {
      requestToken: 'test-request-token',
      requestTokenSecret: 'test-request-token-secret'
    };
    req.session.save((err) => {
      if (err) return next(err);
      res.json({ 
        success: true, 
        sessionID: req.sessionID,
        message: 'Session saved with OAuth request token'
      });
    });
  });
  
  testApp.get('/check-session', (req, res) => {
    res.json({
      success: true,
      sessionID: req.sessionID,
      hasOAuth: !!req.session.oauth,
      oauth: req.session.oauth
    });
  });
  
  testApp.get('/simulate-callback', (req, res) => {
    // Check if oauth token exists in session
    if (!req.session.oauth || !req.session.oauth.requestToken) {
      return res.status(500).json({
        success: false,
        error: 'Failed to find request token in session',
        sessionID: req.sessionID,
        session: req.session
      });
    }
    
    res.json({
      success: true,
      message: 'Found request token in session',
      requestToken: req.session.oauth.requestToken
    });
  });
  
  // Start server
  const server = testApp.listen(PORT);
  
  try {
    // Test 1: Set OAuth data in session
    const authResponse = await makeRequest('/auth');
    const sessionID = authResponse.sessionID;
    
    // Test 2: Check if session has OAuth data
    const checkResponse = await makeRequest('/check-session', sessionID);
    
    // Test 3: Simulate callback
    const callbackResponse = await makeRequest('/simulate-callback', sessionID);
    
    testResults.oauthTests = {
      success: checkResponse.hasOAuth && callbackResponse.success,
      sessionID,
      sessionCheck: {
        success: checkResponse.hasOAuth,
        oauth: checkResponse.oauth
      },
      callbackCheck: {
        success: callbackResponse.success,
        message: callbackResponse.message,
        requestToken: callbackResponse.requestToken
      }
    };
    
    if (testResults.oauthTests.success) {
      console.log('✓ Twitter OAuth test passed');
    } else {
      console.log('✗ Twitter OAuth test failed - session data not preserved');
    }
  } catch (error) {
    testResults.oauthTests = {
      success: false,
      error: error.message,
      stack: error.stack
    };
    console.error('✗ Twitter OAuth test failed:', error.message);
  } finally {
    server.close();
  }
}

// Run the diagnostics
runDiagnostics().catch(err => {
  console.error('Diagnostic test failed:', err);
  process.exit(1);
});
