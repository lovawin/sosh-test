/**
 * Twitter OAuth Diagnostic Script - Current Configuration
 * 
 * This script simulates the current app.js configuration with JWT middleware before session middleware.
 * It will help us identify if the middleware order is causing the Twitter OAuth session issue.
 */

const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const TwitterStrategy = require('passport-twitter').Strategy;
const { expressjwt: jwt } = require('express-jwt');
const appconfig = require('./config/appconfig');
const axios = require('axios');
const uuid = require('uuid').v4;
const oauthSignature = require('oauth-signature');

// Create Express app
const app = express();

// Initialize passport
app.use(passport.initialize());

// Add JWT middleware BEFORE session (current configuration)
app.use(jwt({ secret: 'diagnostic-secret', algorithms: ['HS256'] })
  .unless({
    path: [
      '/',
      '/auth/twitter',
      '/auth/twitter/callback',
      '/manual-request-token',
      '/manual-callback',
    ],
  }));

// Configure session middleware AFTER JWT
app.use(
  session({
    secret: 'diagnostic-secret',
    resave: true,
    saveUninitialized: true,
    cookie: { 
      maxAge: 5000000000, 
      path: '/',
      httpOnly: true,
    },
  })
);

// Initialize passport session after session middleware
app.use(passport.session());

// Configure Twitter strategy
passport.use(new TwitterStrategy({
  consumerKey: appconfig.TWITTER_CONSUMER_API_KEY,
  consumerSecret: appconfig.TWITTER_CONSUMER_API_SECRET,
  callbackURL: 'http://localhost:3004/auth/twitter/callback',
}, (accesstokenid, accesstoken, profile, done) => {
  done(null, { accesstoken, accesstokenid, profile });
}));

passport.serializeUser((user, done) => {
  console.log('Serializing user:', user);
  done(null, user);
});

passport.deserializeUser((user, done) => {
  console.log('Deserializing user:', user);
  done(null, user);
});

// Session inspection middleware
app.use((req, res, next) => {
  console.log('\n=== SESSION INSPECTION (CURRENT CONFIG) ===');
  console.log('Route:', req.path);
  console.log('Method:', req.method);
  console.log('Session ID:', req.sessionID);
  console.log('Session exists:', !!req.session);
  console.log('Session keys:', req.session ? Object.keys(req.session) : []);
  console.log('Has passport data:', !!req.session?.passport);
  console.log('Has OAuth data:', !!req.session?.oauth);
  console.log('Request headers:', req.headers);
  console.log('Cookies:', req.headers.cookie);
  next();
});

// Manual Twitter OAuth request token route
app.get('/manual-request-token', async (req, res) => {
  try {
    console.log('\n=== MANUAL REQUEST TOKEN (CURRENT CONFIG) ===');
    console.log('Session before request:', req.session);
    
    const oauth_timestamp = Math.floor(Date.now() / 1000);
    const oauth_nonce = uuid();
    
    const httpMethod = 'POST';
    const url = 'https://api.twitter.com/oauth/request_token';
    const parameters = {
      oauth_consumer_key: appconfig.TWITTER_CONSUMER_API_KEY,
      oauth_nonce: oauth_nonce,
      oauth_timestamp: oauth_timestamp,
      oauth_signature_method: 'HMAC-SHA1',
      oauth_version: '1.0',
      oauth_callback: 'http://localhost:3004/manual-callback',
    };

    const encodedSignature = oauthSignature.generate(
      httpMethod, 
      url, 
      parameters, 
      appconfig.TWITTER_CONSUMER_API_SECRET
    );
    
    console.log('OAuth parameters:', parameters);
    console.log('Encoded signature:', encodedSignature);

    const response = await axios.post(
      `https://api.twitter.com/oauth/request_token?oauth_callback=${encodeURIComponent('http://localhost:3004/manual-callback')}`,
      {},
      {
        headers: {
          Authorization: `OAuth oauth_consumer_key="${appconfig.TWITTER_CONSUMER_API_KEY}", oauth_nonce="${oauth_nonce}",`
          + ` oauth_signature="${encodedSignature}", oauth_signature_method="HMAC-SHA1",`
          + ` oauth_timestamp="${oauth_timestamp}", oauth_version="1.0"`,
        },
      },
    );
    
    console.log('Twitter API response:', response.data);
    
    // Parse the response
    const responseParams = new URLSearchParams(response.data);
    const oauth_token = responseParams.get('oauth_token');
    const oauth_token_secret = responseParams.get('oauth_token_secret');
    
    // Store the token in the session
    if (req.session) {
      req.session.oauth = {
        requestToken: oauth_token,
        requestTokenSecret: oauth_token_secret,
      };
      
      // Save the session explicitly
      req.session.save((err) => {
        if (err) {
          console.error('Error saving session:', err);
          return res.status(500).send('Error saving session');
        }
        
        console.log('Session after saving:', req.session);
        
        // Redirect to Twitter authorization page
        res.redirect(`https://api.twitter.com/oauth/authorize?oauth_token=${oauth_token}`);
      });
    } else {
      console.error('No session available');
      res.status(500).send('No session available');
    }
  } catch (error) {
    console.error('Error getting request token:', error);
    res.status(500).send('Error getting request token');
  }
});

// Manual callback route
app.get('/manual-callback', (req, res) => {
  console.log('\n=== MANUAL CALLBACK (CURRENT CONFIG) ===');
  console.log('Query parameters:', req.query);
  console.log('Session:', req.session);
  
  const oauth_token = req.query.oauth_token;
  const oauth_verifier = req.query.oauth_verifier;
  
  if (!req.session || !req.session.oauth) {
    console.error('No OAuth data in session');
    return res.status(500).send('No OAuth data in session');
  }
  
  if (req.session.oauth.requestToken !== oauth_token) {
    console.error('OAuth token mismatch');
    console.error('Session token:', req.session.oauth.requestToken);
    console.error('Query token:', oauth_token);
    return res.status(500).send('OAuth token mismatch');
  }
  
  res.send('OAuth flow completed successfully');
});

// Passport Twitter routes
app.get('/auth/twitter', (req, res, next) => {
  console.log('\n=== PASSPORT TWITTER LOGIN (CURRENT CONFIG) ===');
  console.log('Session before authentication:', req.session);
  
  passport.authenticate('twitter')(req, res, next);
});

app.get('/auth/twitter/callback', 
  (req, res, next) => {
    console.log('\n=== PASSPORT TWITTER CALLBACK (CURRENT CONFIG) ===');
    console.log('Query parameters:', req.query);
    console.log('Session before authentication:', req.session);
    next();
  },
  passport.authenticate('twitter', { failureRedirect: '/login' }),
  (req, res) => {
    console.log('Session after authentication:', req.session);
    res.redirect('/');
  }
);

// Home route
app.get('/', (req, res) => {
  res.send(`
    <h1>Twitter OAuth Diagnostic (Current Configuration)</h1>
    <p>This version simulates the current app.js configuration with JWT middleware before session middleware.</p>
    <p>Session ID: ${req.sessionID}</p>
    <p>User: ${req.user ? JSON.stringify(req.user) : 'Not logged in'}</p>
    <ul>
      <li><a href="/auth/twitter">Login with Twitter (Passport)</a></li>
      <li><a href="/manual-request-token">Login with Twitter (Manual)</a></li>
    </ul>
  `);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).send(`Error: ${err.message}`);
});

// Start the server
const PORT = 3004;
app.listen(PORT, () => {
  console.log(`Diagnostic server (current config) running on http://localhost:${PORT}`);
});
