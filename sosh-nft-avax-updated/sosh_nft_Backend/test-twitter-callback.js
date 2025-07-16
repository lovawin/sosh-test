/**
 * Twitter OAuth Callback Test Script
 * 
 * This script specifically tests the Twitter OAuth callback route with different
 * session cookie configurations to identify if the cookie path restriction is causing
 * the "Failed to find request token in session" error.
 */

const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const TwitterStrategy = require('passport-twitter').Strategy;
const http = require('http');
const appconfig = require('./config/appconfig');
const errorLogger = require('./app/logging/handlers/errorLogger');

// Test ports
const DEFAULT_PORT = 3334;
const RESTRICTED_PORT = 3335;

// Test results
const testResults = {
  defaultPath: {},
  restrictedPath: {},
  comparison: {}
};

async function runTests() {
  console.log('=== Starting Twitter Callback Tests ===\n');
  
  // Initialize error logger
  await errorLogger.initPromise;
  
  // Test 1: Default cookie path (/)
  await testWithDefaultPath();
  
  // Test 2: Restricted cookie path (/api/V1/social)
  await testWithRestrictedPath();
  
  // Compare results
  compareResults();
  
  // Print results
  console.log('\n=== Twitter Callback Test Results ===\n');
  console.log(JSON.stringify(testResults, null, 2));
  
  process.exit(0);
}

async function testWithDefaultPath() {
  console.log('\nTesting with default cookie path (/)...');
  
  const app = createTestApp('/');
  const server = app.listen(DEFAULT_PORT);
  
  try {
    // Step 1: Initialize session with OAuth data
    const initResponse = await makeRequest(DEFAULT_PORT, '/init-oauth');
    const sessionID = initResponse.sessionID;
    
    console.log('Session initialized with ID:', sessionID);
    
    // Step 2: Verify session data is set
    const verifyResponse = await makeRequest(DEFAULT_PORT, '/verify-session', sessionID);
    
    // Step 3: Simulate callback
    const callbackResponse = await makeRequest(DEFAULT_PORT, '/simulate-callback', sessionID);
    
    // Step 4: Simulate callback with query parameters (like real OAuth)
    const callbackWithParamsResponse = await makeRequest(
      DEFAULT_PORT, 
      '/simulate-callback?oauth_token=test-token&oauth_verifier=test-verifier', 
      sessionID
    );
    
    testResults.defaultPath = {
      sessionID,
      initSuccess: initResponse.success,
      verifySuccess: verifyResponse.success && verifyResponse.hasOAuth,
      callbackSuccess: callbackResponse.success,
      callbackWithParamsSuccess: callbackWithParamsResponse.success,
      oauthData: verifyResponse.oauth
    };
    
    if (testResults.defaultPath.callbackSuccess) {
      console.log('✓ Default path test passed - session data preserved through callback');
    } else {
      console.log('✗ Default path test failed - session data lost');
    }
  } catch (error) {
    testResults.defaultPath.error = {
      message: error.message,
      stack: error.stack
    };
    console.error('✗ Default path test error:', error.message);
  } finally {
    server.close();
  }
}

async function testWithRestrictedPath() {
  console.log('\nTesting with restricted cookie path (/api/V1/social)...');
  
  const app = createTestApp('/api/V1/social');
  const server = app.listen(RESTRICTED_PORT);
  
  try {
    // Step 1: Initialize session with OAuth data
    const initResponse = await makeRequest(RESTRICTED_PORT, '/init-oauth');
    const sessionID = initResponse.sessionID;
    
    console.log('Session initialized with ID:', sessionID);
    
    // Step 2: Verify session data is set
    const verifyResponse = await makeRequest(RESTRICTED_PORT, '/verify-session', sessionID);
    
    // Step 3: Simulate callback
    const callbackResponse = await makeRequest(RESTRICTED_PORT, '/simulate-callback', sessionID);
    
    // Step 4: Simulate callback with query parameters (like real OAuth)
    const callbackWithParamsResponse = await makeRequest(
      RESTRICTED_PORT, 
      '/simulate-callback?oauth_token=test-token&oauth_verifier=test-verifier', 
      sessionID
    );
    
    testResults.restrictedPath = {
      sessionID,
      initSuccess: initResponse.success,
      verifySuccess: verifyResponse.success && verifyResponse.hasOAuth,
      callbackSuccess: callbackResponse.success,
      callbackWithParamsSuccess: callbackWithParamsResponse.success,
      oauthData: verifyResponse.oauth
    };
    
    if (testResults.restrictedPath.callbackSuccess) {
      console.log('✓ Restricted path test passed - session data preserved through callback');
    } else {
      console.log('✗ Restricted path test failed - session data lost');
    }
  } catch (error) {
    testResults.restrictedPath.error = {
      message: error.message,
      stack: error.stack
    };
    console.error('✗ Restricted path test error:', error.message);
  } finally {
    server.close();
  }
}

function compareResults() {
  testResults.comparison = {
    defaultPathWorking: testResults.defaultPath.callbackSuccess === true,
    restrictedPathWorking: testResults.restrictedPath.callbackSuccess === true,
    conclusion: ''
  };
  
  if (testResults.defaultPath.callbackSuccess && !testResults.restrictedPath.callbackSuccess) {
    testResults.comparison.conclusion = 'The restricted cookie path (/api/V1/social) is likely causing the session data loss. Changing the cookie path to "/" should fix the issue.';
  } else if (!testResults.defaultPath.callbackSuccess && !testResults.restrictedPath.callbackSuccess) {
    testResults.comparison.conclusion = 'Both configurations failed. The issue might be related to session storage or OAuth flow implementation rather than cookie path.';
  } else if (testResults.defaultPath.callbackSuccess && testResults.restrictedPath.callbackSuccess) {
    testResults.comparison.conclusion = 'Both configurations work in the test environment. The issue might be specific to the production environment or related to how the callback URL is handled.';
  }
  
  console.log('\nTest comparison conclusion:');
  console.log(testResults.comparison.conclusion);
}

function createTestApp(cookiePath) {
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
        path: cookiePath,
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
    errorLogger.logError(new Error('Test: OAuth session initialized'), {
      context: 'test_oauth',
      sessionID: req.sessionID,
      cookiePath,
      oauth: req.session.oauth
    });
    
    req.session.save((err) => {
      if (err) {
        errorLogger.logError(err, {
          context: 'test_oauth_save_error',
          sessionID: req.sessionID,
          cookiePath
        });
        return next(err);
      }
      
      res.json({ 
        success: true, 
        sessionID: req.sessionID,
        message: 'Session saved with OAuth request token',
        cookiePath
      });
    });
  });
  
  app.get('/verify-session', (req, res) => {
    // Log the session state
    errorLogger.logError(new Error('Test: Session verification'), {
      context: 'test_oauth',
      sessionID: req.sessionID,
      cookiePath,
      hasSession: !!req.session,
      hasOAuth: !!req.session.oauth,
      oauth: req.session.oauth
    });
    
    res.json({
      success: true,
      sessionID: req.sessionID,
      hasOAuth: !!req.session.oauth,
      oauth: req.session.oauth,
      cookiePath
    });
  });
  
  app.get('/simulate-callback', (req, res) => {
    // Log the callback attempt
    errorLogger.logError(new Error('Test: Callback simulation'), {
      context: 'test_oauth',
      sessionID: req.sessionID,
      cookiePath,
      hasSession: !!req.session,
      hasOAuth: !!req.session.oauth,
      oauth: req.session.oauth,
      query: req.query
    });
    
    // Check if oauth token exists in session
    if (!req.session.oauth || !req.session.oauth.requestToken) {
      const error = new Error('Failed to find request token in session');
      
      // Log the error
      errorLogger.logError(error, {
        context: 'test_oauth_error',
        sessionID: req.sessionID,
        cookiePath,
        hasSession: !!req.session,
        sessionData: req.session,
        query: req.query
      });
      
      return res.status(500).json({
        success: false,
        error: error.message,
        sessionID: req.sessionID,
        session: req.session,
        cookiePath
      });
    }
    
    // Success case
    res.json({
      success: true,
      message: 'Found request token in session',
      requestToken: req.session.oauth.requestToken,
      sessionID: req.sessionID,
      cookiePath,
      query: req.query
    });
  });
  
  return app;
}

// Helper function for HTTP requests
function makeRequest(port, path, sessionID = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port,
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
