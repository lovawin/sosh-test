const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const TwitterStrategy = require('passport-twitter').Strategy;
const { expressjwt: jwt } = require('express-jwt');
const appconfig = require('./config/appconfig');
const logging = require('./app/logging');

const app = express();

// Initialize passport first (simulating current app.js order)
app.use(passport.initialize());
app.use(passport.session());

// Add JWT middleware before session (simulating current app.js order)
app.use(jwt({ secret: appconfig.JWT_SECRET, algorithms: ['HS256'] })
  .unless({
    path: [
      '/test-login',
      '/test-callback',
    ],
  }));

// Initialize session middleware AFTER JWT (simulating current app.js order)
app.use(
  session({
    store: new MongoStore({
      mongoUrl: appconfig.MONGODB_CONNECTION_STRING,
      autoRemove: 'native',
      ttl: 4 * 24 * 60 * 60,
    }),
    secret: appconfig.EXPRESS_SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    cookie: { 
      maxAge: 5000000000, 
      path: '/',
    },
  })
);

// Configure Twitter strategy
passport.use(new TwitterStrategy({
  consumerKey: appconfig.TWITTER_CONSUMER_API_KEY,
  consumerSecret: appconfig.TWITTER_CONSUMER_API_SECRET,
  callbackURL: `${appconfig.TWITTER_REDIRECT_CALLBACK}`,
}, (accesstokenid, accesstoken, profile, done) => {
  done(null, { accesstoken, accesstokenid, profile });
}));

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

// Test routes
app.get('/test-login', (req, res, next) => {
  // Log session state before authentication
  console.log('Test login - Before authentication:', {
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
