const express = require('express');

const router = express.Router();
const functionHandler = require('../handler/http/requesthandler');
const SocialController = require('../controllers/social.controller');
const logging = require('../logging');
const twitter = require('../services/passport_twitter');
const { isLoggedIn, setSession, isLoggedInquery } = require('../middleware/user');
const { twitterrequest } = require('../utils/twitter');

const Social = new SocialController();

// Generate a unique request ID for each OAuth flow
const generateRequestId = () => {
  return `twitter-oauth-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
};

// Enhanced session inspection middleware
const sessionInspector = (req, res, next) => {
  const requestId = req.oauthRequestId || generateRequestId();
  req.oauthRequestId = requestId;
  
  // Log detailed request information
  logging.oauthLogger.logSessionState(req.sessionID, 'detailed_inspect', {
    session: req.session,
    cookies: {
      raw: req.headers.cookie,
      parsed: req.cookies
    },
    headers: {
      all: req.headers,
      host: req.headers.host,
      origin: req.headers.origin,
      referer: req.headers.referer,
      userAgent: req.headers['user-agent']
    },
    request: {
      path: req.path,
      method: req.method,
      protocol: req.protocol,
      secure: req.secure,
      originalUrl: req.originalUrl,
      ip: req.ip,
      ips: req.ips
    }
  }, {
    requestId,
    path: req.path
  });
  
  // Capture response headers
  const originalEnd = res.end;
  res.end = function(...args) {
    logging.oauthLogger.logSessionState(req.sessionID, 'response_headers', {
      headers: res.getHeaders ? res.getHeaders() : res._headers,
      statusCode: res.statusCode
    }, {
      requestId,
      path: req.path
    });
    originalEnd.apply(res, args);
  };
  
  next();
};

// Apply session inspection to all routes
router.use(sessionInspector);

router.use(twitter.initialize());
router.use(twitter.session());

// Log middleware execution
router.use((req, res, next) => {
  logging.oauthLogger.logMiddlewareExecution('twitter_router', req, {
    requestId: req.oauthRequestId,
    hasPassport: !!req.session?.passport
  });
  next();
});

router.get('/login', 
  (req, res, next) => {
    const requestId = req.oauthRequestId || generateRequestId();
    req.oauthRequestId = requestId;
    
    logging.oauthLogger.logOAuthRequest('twitter', {
      action: 'login_initiate',
      ip: req.ip,
      userAgent: req.headers['user-agent']
    }, {
      requestId,
      sessionID: req.sessionID
    });
    
    next();
  },
  isLoggedInquery, 
  (req, res, next) => {
    logging.oauthLogger.logSessionState(req.sessionID, 'after_isLoggedInquery', req.session, {
      requestId: req.oauthRequestId,
      userId: req.user?.id
    });
    next();
  },
  setSession, 
  (req, res, next) => {
    logging.oauthLogger.logSessionState(req.sessionID, 'after_setSession', req.session, {
      requestId: req.oauthRequestId,
      userId: req.user?.id
    });
    next();
  },
  (req, res, next) => {
    // Store request ID in session for correlation with callback
    if (req.session) {
      req.session.oauthRequestId = req.oauthRequestId;
      req.session.save((err) => {
        if (err) {
          logging.oauthLogger.logOAuthError(err, {
            requestId: req.oauthRequestId,
            operation: 'save_request_id',
            sessionID: req.sessionID
          });
        }
        next();
      });
    } else {
      logging.oauthLogger.logOAuthError(new Error('No session available'), {
        requestId: req.oauthRequestId,
        operation: 'save_request_id',
        sessionID: req.sessionID
      });
      next();
    }
  },
  twitter.authenticate('twitter', { scope: 'offline.access' })
);

router.get(
  '/callback',
  (req, res, next) => {
    // Enhanced logging for callback request
    // Ensure we have a valid request ID
    if (!req.oauthRequestId) {
      req.oauthRequestId = `callback-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
    }
    
    logging.oauthLogger.logOAuthCallback('twitter', true, {
      query: req.query,
      sessionPresent: !!req.session,
      sessionID: req.sessionID,
      hasOAuthToken: !!req.query.oauth_token,
      hasOAuthVerifier: !!req.query.oauth_verifier,
      cookies: {
        raw: req.headers.cookie,
        parsed: req.cookies,
        names: req.cookies ? Object.keys(req.cookies) : []
      },
      headers: {
        all: req.headers,
        host: req.headers.host,
        origin: req.headers.origin,
        referer: req.headers.referer,
        userAgent: req.headers['user-agent'],
        cookie: req.headers.cookie
      },
      request: {
        path: req.path,
        method: req.method,
        protocol: req.protocol,
        secure: req.secure,
        originalUrl: req.originalUrl,
        ip: req.ip,
        ips: req.ips
      },
      sessionData: req.session ? {
        id: req.sessionID,
        cookie: req.session.cookie,
        cookieSettings: {
          domain: req.session.cookie.domain,
          path: req.session.cookie.path,
          secure: req.session.cookie.secure,
          httpOnly: req.session.cookie.httpOnly,
          sameSite: req.session.cookie.sameSite,
          maxAge: req.session.cookie.maxAge
        },
        oauth: req.session.oauth,
        oauthDetails: req.session.oauth ? {
          requestToken: req.session.oauth.requestToken,
          timestamp: req.session.oauth.timestamp
        } : null,
        userid: req.session.userid,
        oauthRequestId: req.session.oauthRequestId,
        passport: req.session.passport,
        allKeys: Object.keys(req.session)
      } : null,
      timestamp: new Date().toISOString()
    }, {
      requestId: req.oauthRequestId,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      timestamp: new Date().toISOString()
    });
    
    // Check if we have a session with oauth data (in either location)
    if (req.session && (req.session.oauth || req.session['oauth:twitter'])) {
      // Use whichever OAuth data is available
      const oauthData = req.session.oauth || req.session['oauth:twitter'];
      
      // Log which OAuth data source we're using
      logging.oauthLogger.logSessionState(req.sessionID, 'oauth_data_source', {
        usingOauth: !!req.session.oauth,
        usingOauthTwitter: !!req.session['oauth:twitter'],
        oauthDataKeys: oauthData ? Object.keys(oauthData) : null
      }, {
        requestId: req.oauthRequestId,
        timestamp: new Date().toISOString()
      });
      
      // Extract the token from the appropriate location
      const sessionToken = oauthData.requestToken || oauthData.oauth_token;
      const tokenTimestamp = oauthData.timestamp || new Date().toISOString();
      
      // Log token verification details
      logging.oauthLogger.logTokenOperation('verify', {
        sessionToken: sessionToken,
        queryToken: req.query.oauth_token,
        match: sessionToken === req.query.oauth_token,
        tokenTimestamp: tokenTimestamp,
        timeSinceTokenCreation: tokenTimestamp ? 
          `${(new Date() - new Date(tokenTimestamp))/1000} seconds` : 'unknown'
      }, {
        requestId: req.oauthRequestId,
        sessionID: req.sessionID,
        timestamp: new Date().toISOString()
      });
      
      // Log session state for debugging
      logging.oauthLogger.logSessionState(req.sessionID, 'callback_with_token', {
        sessionKeys: Object.keys(req.session),
        oauthKeys: oauthData ? Object.keys(oauthData) : [],
        cookieSettings: {
          domain: req.session.cookie.domain,
          path: req.session.cookie.path,
          secure: req.session.cookie.secure,
          httpOnly: req.session.cookie.httpOnly,
          sameSite: req.session.cookie.sameSite
        }
      }, {
        requestId: req.oauthRequestId,
        timestamp: new Date().toISOString()
      });
    } else {
      // Enhanced error logging when token is missing
      logging.oauthLogger.logOAuthError(new Error('Failed to find request token in session'), {
        requestId: req.oauthRequestId,
        sessionID: req.sessionID,
        operation: 'token_verification',
        sessionExists: !!req.session,
        hasOAuth: !!(req.session && req.session.oauth),
        sessionKeys: req.session ? Object.keys(req.session) : null,
        cookieHeader: req.headers.cookie,
        timestamp: new Date().toISOString()
      });
      
      // Log additional diagnostic information
      logging.oauthLogger.logOAuthError(new Error('Session diagnostic information'), {
        requestId: req.oauthRequestId,
        operation: 'session_diagnostics',
        cookies: {
          raw: req.headers.cookie,
          parsed: req.cookies,
          names: req.cookies ? Object.keys(req.cookies) : []
        },
        headers: {
          all: req.headers,
          cookie: req.headers.cookie,
          host: req.headers.host,
          origin: req.headers.origin,
          referer: req.headers.referer
        },
        sessionID: req.sessionID,
        sessionExists: !!req.session,
        sessionKeys: req.session ? Object.keys(req.session) : null,
        cookieSettings: req.session?.cookie ? {
          domain: req.session.cookie.domain,
          path: req.session.cookie.path,
          secure: req.session.cookie.secure,
          httpOnly: req.session.cookie.httpOnly,
          sameSite: req.session.cookie.sameSite
        } : null,
        timestamp: new Date().toISOString()
      });
      
      // Return error response for debugging
      return res.status(500).json({
        status: 'server_error',
        message: 'Failed to find request token in session',
        debug: {
          sessionID: req.sessionID,
          hasSession: !!req.session,
          sessionKeys: req.session ? Object.keys(req.session) : null,
          requestId: req.oauthRequestId,
          timestamp: new Date().toISOString()
        }
      });
    }
    
    next();
  },
  twitter.authenticate('twitter', {
    failureRedirect: '/failed',
  }),
  Social.twittercallback,
);

router.post('/validatelink', isLoggedIn, Social.validateTwitterLink);

router.use('/failed', async (req, res, next) => {
  // Ensure we have a valid request ID
  if (!req.oauthRequestId) {
    req.oauthRequestId = `failed-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
  }
  
  logging.oauthLogger.logOAuthError(new Error('Twitter authentication failed'), {
    requestId: req.oauthRequestId,
    sessionID: req.sessionID,
    operation: 'authentication',
    path: req.path,
    query: req.query
  });
  
  console.log("FFFFFFFFFFFFFFFFFFFFFFFFFFF");
  await functionHandler.requestHandler(req, res.destroy, Social.twitterFailed);
  next();
});

router.get('/request_token', 
  (req, res, next) => {
    const requestId = req.oauthRequestId || generateRequestId();
    req.oauthRequestId = requestId;
    
    logging.oauthLogger.logOAuthRequest('twitter', {
      action: 'request_token',
      ip: req.ip,
      userAgent: req.headers['user-agent']
    }, {
      requestId,
      sessionID: req.sessionID
    });
    
    next();
  },
  twitterrequest
);

module.exports = router;
