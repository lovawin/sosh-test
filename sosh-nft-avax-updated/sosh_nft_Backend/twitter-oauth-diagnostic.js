/**
 * Twitter OAuth Diagnostic Script
 * 
 * This script is designed to diagnose the exact cause of the Twitter OAuth session issue.
 * It will:
 * 1. Trace the session through the entire OAuth flow
 * 2. Log detailed information about the session at each step
 * 3. Identify exactly where and why the session data is being lost
 */

const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const TwitterStrategy = require('passport-twitter').Strategy;
const appconfig = require('./config/appconfig');
const axios = require('axios');
const uuid = require('uuid').v4;
const oauthSignature = require('oauth-signature');

// Create Express app
const app = express();

// Configure session middleware
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

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

// Configure Twitter strategy
passport.use(new TwitterStrategy({
  consumerKey: appconfig.TWITTER_CONSUMER_API_KEY,
  consumerSecret: appconfig.TWITTER_CONSUMER_API_SECRET,
  callbackURL: 'http://localhost:3003/auth/twitter/callback',
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
  console.log('\n=== SESSION INSPECTION ===');
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
    console.log('\n=== MANUAL REQUEST TOKEN ===');
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
      oauth_callback: 'http://localhost:3003/manual-callback',
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
      `https://api.twitter.com/oauth/request_token?oauth_callback=${encodeURIComponent('http://localhost:3003/manual-callback')}`,
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
  } catch (error) {
    console.error('Error getting request token:', error);
    res.status(500).send('Error getting request token');
  }
});

// Manual callback route
app.get('/manual-callback', (req, res) => {
  console.log('\n=== MANUAL CALLBACK ===');
  console.log('Query parameters:', req.query);
  console.log('Session:', req.session);
  
  const oauth_token = req.query.oauth_token;
  const oauth_verifier = req.query.oauth_verifier;
  
  if (!req.session.oauth) {
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
  console.log('\n=== PASSPORT TWITTER LOGIN ===');
  console.log('Session before authentication:', req.session);
  
  passport.authenticate('twitter')(req, res, next);
});

app.get('/auth/twitter/callback', 
  (req, res, next) => {
    console.log('\n=== PASSPORT TWITTER CALLBACK ===');
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
    <h1>Twitter OAuth Diagnostic</h1>
    <p>Session ID: ${req.sessionID}</p>
    <p>User: ${req.user ? JSON.stringify(req.user) : 'Not logged in'}</p>
    <ul>
      <li><a href="/auth/twitter">Login with Twitter (Passport)</a></li>
      <li><a href="/manual-request-token">Login with Twitter (Manual)</a></li>
    </ul>
  `);
});

// Start the server
const PORT = 3003;
app.listen(PORT, () => {
  console.log(`Diagnostic server running on http://localhost:${PORT}`);
});
