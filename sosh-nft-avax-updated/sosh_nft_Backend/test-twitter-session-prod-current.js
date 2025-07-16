/**
 * Test script to verify session handling with different middleware orders
 * This script is designed to be run on the production server
 * This version simulates the CURRENT configuration (JWT before session)
 */

// Import required modules
const express = require('express');
const session = require('express-session');
const { expressjwt: jwt } = require('express-jwt');
const appconfig = require('./config/appconfig');

// Create a simple Express app for testing
const app = express();

// Log the test configuration
console.log('=== TEST CONFIGURATION ===');
console.log('Testing JWT middleware BEFORE session middleware');
console.log('This simulates the current configuration that may be causing the Twitter OAuth issue');

// Add JWT middleware FIRST (current configuration)
app.use(jwt({ secret: 'test-secret', algorithms: ['HS256'] })
  .unless({
    path: [
      '/test-login',
      '/test-callback',
    ],
  }));

// Initialize session middleware AFTER JWT (current configuration)
app.use(
  session({
    secret: 'test-secret',
    resave: true,
    saveUninitialized: true,
    cookie: { 
      maxAge: 5000000000, 
      path: '/',
    },
  })
);

// Test routes
app.get('/test-login', (req, res, next) => {
  // Log session state before authentication
  console.log('Test login - Before setting session data:', {
    hasSession: !!req.session,
    sessionID: req.sessionID,
    sessionKeys: req.session ? Object.keys(req.session) : [],
  });
  
  // Store a test value in the session
  if (req.session) {
    req.session.testValue = 'This is a test value';
    req.session.oauth = { requestToken: 'test-request-token', requestTokenSecret: 'test-secret' };
    
    // Save the session explicitly
    req.session.save((err) => {
      if (err) {
        console.error('Error saving session:', err);
        return next(err);
      }
      
      // Log session state after saving
      console.log('Test login - After saving session:', {
        hasSession: !!req.session,
        sessionID: req.sessionID,
        sessionKeys: req.session ? Object.keys(req.session) : [],
        testValue: req.session.testValue,
        oauth: req.session.oauth,
      });
      
      // Redirect to the test callback
      res.redirect('/test-callback?oauth_token=test-token&oauth_verifier=test-verifier');
    });
  } else {
    console.log('No session available in test-login route');
    res.status(500).json({ error: 'No session available' });
  }
});

app.get('/test-callback', (req, res) => {
  // Log session state in the callback
  console.log('Test callback - Session state:', {
    hasSession: !!req.session,
    sessionID: req.sessionID,
    sessionKeys: req.session ? Object.keys(req.session) : [],
    testValue: req.session ? req.session.testValue : null,
    oauth: req.session ? req.session.oauth : null,
    query: req.query,
    cookies: req.headers.cookie,
  });
  
  if (req.session) {
    res.json({
      success: true,
      sessionID: req.sessionID,
      hasTestValue: !!req.session.testValue,
      testValue: req.session.testValue,
      hasOauth: !!req.session.oauth,
      oauth: req.session.oauth,
    });
  } else {
    res.status(500).json({
      success: false,
      error: 'No session available in callback',
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: err.message });
});

// Start the server
const PORT = 3002;
app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT}/test-login to start the test`);
});
