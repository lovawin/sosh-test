const { NODE_ENV, BEARER_TOKEN } = require('../../config/appconfig');
const { NotFoundError } = require('../handler/error/not_found_error');
const User = require('../models/User');
const { verifyJwt, getToken, jwtDataVerify } = require('../utils/jsonwebtoken');
const logging = require('../logging');

const isLoggedIn = async function (req, res, next) {
  const requestId = req.oauthRequestId || `auth-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
  
  // Log middleware execution
  logging.oauthLogger.logMiddlewareExecution('isLoggedIn', req, {
    requestId,
    path: req.path,
    method: req.method
  });
  
  try {
    // Log token verification attempt
    logging.oauthLogger.logTokenOperation('verify_jwt', {
      path: req.path,
      hasAuthHeader: !!req.headers.authorization,
      hasCookies: !!req.headers.cookie
    }, {
      requestId,
      sessionID: req.sessionID
    });
    
    const token = await getToken(req);
    const decoded = await verifyJwt(token);
    
    // Log successful token verification
    logging.oauthLogger.logTokenOperation('jwt_verified', {
      userId: decoded.id,
      tokenType: 'jwt'
    }, {
      requestId,
      sessionID: req.sessionID
    });
    
    // Log database query
    logging.dbLogger.logQuery('findById', 'User', { 
      id: decoded.id,
      operation: 'auth_user_lookup'
    }, 0);
    
    const user = await User.findById(decoded.id);
    if (!user) {
      const error = new NotFoundError(`User not found with id: ${decoded.id}`);
      
      // Log user not found error
      logging.oauthLogger.logOAuthError(error, {
        requestId,
        operation: 'user_lookup',
        userId: decoded.id,
        path: req.path
      });
      
      next(error);
    } else {
      // Log successful user lookup
      logging.oauthLogger.logOAuthCallback('jwt', true, {
        action: 'user_found',
        userId: user.id,
        username: user.username || 'not_set'
      }, {
        requestId,
        sessionID: req.sessionID
      });
      
      req.user = user;
      next();
    }
  } catch (err) {
    // Log authentication error
    logging.oauthLogger.logOAuthError(err, {
      requestId,
      operation: 'jwt_authentication',
      path: req.path,
      method: req.method,
      hasAuthHeader: !!req.headers.authorization
    });
    
    console.log('error message', err.message);
    next(err);
  }
};

const isLoggedInquery = async function (req, res, next) {
  const requestId = req.oauthRequestId || `auth-query-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
  
  // Log middleware execution
  logging.oauthLogger.logMiddlewareExecution('isLoggedInquery', req, {
    requestId,
    path: req.path,
    method: req.method,
    hasAuthToken: !!req.query.auth_token
  });
  
  try {
    const token = req.query.auth_token;
    
    if (!token) {
      const error = new Error('No auth_token provided in query');
      
      // Log missing token error
      logging.oauthLogger.logOAuthError(error, {
        requestId,
        operation: 'query_token_validation',
        path: req.path,
        method: req.method
      });
      
      return next(error);
    }
    
    // Log token verification attempt
    logging.oauthLogger.logTokenOperation('verify_query_token', {
      path: req.path,
      tokenLength: token.length
    }, {
      requestId,
      sessionID: req.sessionID
    });
    
    const decoded = await verifyJwt(token);
    
    // Log successful token verification
    logging.oauthLogger.logTokenOperation('query_token_verified', {
      userId: decoded.id,
      tokenType: 'query_param'
    }, {
      requestId,
      sessionID: req.sessionID
    });
    
    // Log database query
    logging.dbLogger.logQuery('findById', 'User', { 
      id: decoded.id,
      operation: 'auth_query_user_lookup'
    }, 0);
    
    const user = await User.findById(decoded.id);
    if (!user) {
      const error = new NotFoundError(`User not found with id: ${decoded.id}`);
      
      // Log user not found error
      logging.oauthLogger.logOAuthError(error, {
        requestId,
        operation: 'query_user_lookup',
        userId: decoded.id,
        path: req.path
      });
      
      next(error);
    } else {
      // Log successful user lookup
      logging.oauthLogger.logOAuthCallback('query_auth', true, {
        action: 'user_found',
        userId: user.id,
        username: user.username || 'not_set'
      }, {
        requestId,
        sessionID: req.sessionID
      });
      
      req.user = user;
      req.oauthRequestId = requestId; // Store request ID for correlation
      next();
    }
  } catch (err) {
    // Log authentication error
    logging.oauthLogger.logOAuthError(err, {
      requestId,
      operation: 'query_authentication',
      path: req.path,
      method: req.method,
      hasAuthToken: !!req.query.auth_token
    });
    
    console.log('error message', err.message);
    next(err);
  }
};

const bearerUserFetch = async function (req, res, next) {
  const requestId = req.oauthRequestId || `bearer-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
  
  // Log middleware execution
  logging.oauthLogger.logMiddlewareExecution('bearerUserFetch', req, {
    requestId,
    path: req.path,
    method: req.method,
    hasAuthHeader: !!req.headers.authorization
  });
  
  try {
    // Log JWT verification attempt
    logging.oauthLogger.logTokenOperation('verify_bearer', {
      path: req.path,
      hasAuthHeader: !!req.headers.authorization
    }, {
      requestId,
      sessionID: req.sessionID
    });
    
    const decoded = await jwtDataVerify(req);
    if (!decoded) {
      // Log no token or invalid token
      logging.oauthLogger.logTokenOperation('bearer_verification_skipped', {
        path: req.path,
        reason: 'no_token_or_invalid'
      }, {
        requestId,
        sessionID: req.sessionID
      });
      
      next();
    } else {
      // Log successful token verification
      logging.oauthLogger.logTokenOperation('bearer_verified', {
        userId: decoded.id,
        tokenType: 'bearer'
      }, {
        requestId,
        sessionID: req.sessionID
      });
      
      // Log database query
      logging.dbLogger.logQuery('findById', 'User', { 
        id: decoded.id,
        operation: 'bearer_user_lookup'
      }, 0);
      
      const user = await User.findById(decoded.id);
      
      if (user) {
        // Log successful user lookup
        logging.oauthLogger.logOAuthCallback('bearer', true, {
          action: 'user_found',
          userId: user.id,
          username: user.username || 'not_set'
        }, {
          requestId,
          sessionID: req.sessionID
        });
      } else {
        // Log user not found but continuing
        logging.oauthLogger.logOAuthCallback('bearer', false, {
          action: 'user_not_found',
          userId: decoded.id
        }, {
          requestId,
          sessionID: req.sessionID
        });
      }
      
      req.user = user;
      next();
    }
  } catch (err) {
    // Log authentication error
    logging.oauthLogger.logOAuthError(err, {
      requestId,
      operation: 'bearer_authentication',
      path: req.path,
      method: req.method,
      hasAuthHeader: !!req.headers.authorization
    });
    
    console.log('error message', err.message);
    next(err);
  }
};

const setSession = async function (req, res, next) {
  const requestId = req.oauthRequestId || `session-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
  
  // Log middleware execution
  logging.oauthLogger.logMiddlewareExecution('setSession', req, {
    requestId,
    path: req.path,
    method: req.method,
    hasUser: !!req.user,
    hasSession: !!req.session
  });
  
  console.log("^^^^^^^^^^^^^^^^^^^^^^^^^^");
  
  if (!req.session) {
    // Log missing session error
    logging.oauthLogger.logOAuthError(new Error('No session available to store user ID'), {
      requestId,
      operation: 'set_session',
      path: req.path,
      hasUser: !!req.user
    });
    
    return next();
  }
  
  if (!req.user) {
    // Log missing user error
    logging.oauthLogger.logOAuthError(new Error('No user available to store in session'), {
      requestId,
      operation: 'set_session',
      path: req.path,
      sessionID: req.sessionID
    });
    
    return next();
  }
  
  // Log session before setting user ID
  logging.oauthLogger.logSessionState(req.sessionID, 'before_set_userid', req.session, {
    requestId,
    userId: req.user.id
  });
  
  req.session.userid = req.user.id;
  
  // Store request ID in session for correlation
  req.session.oauthRequestId = requestId;
  
  console.log("############req.session",req.session.userid);
  
  // Save session explicitly
  req.session.save((err) => {
    if (err) {
      // Log session save error
      logging.oauthLogger.logOAuthError(err, {
        requestId,
        operation: 'save_session',
        sessionID: req.sessionID,
        userId: req.user.id
      });
    } else {
      // Log session after saving user ID
      logging.oauthLogger.logSessionState(req.sessionID, 'after_set_userid', req.session, {
        requestId,
        userId: req.user.id
      });
    }
    
    next();
  });
};

module.exports = {
  isLoggedIn, isLoggedInquery, setSession, bearerUserFetch,
};
