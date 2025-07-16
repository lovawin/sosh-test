const axios = require('axios');
const uuid = require('uuid').v4;
const oauthSignature = require('oauth-signature');
const appconfig = require('../../config/appconfig');
const logging = require('../logging');

// generates a RFC 3986 encoded, BASE64 encoded HMAC-SHA1 hash

const twitterrequest = async function (req, res) {
  const requestId = req.oauthRequestId || `request-token-${Date.now()}`;
  
  // Log the request token request
  logging.oauthLogger.logOAuthRequest('twitter', {
    action: 'generate_request_token',
    ip: req.ip,
    userAgent: req.headers['user-agent']
  }, {
    requestId,
    sessionID: req.sessionID
  });
  
  // Log detailed session state before request
  logging.oauthLogger.logSessionState(req.sessionID, 'before_request_token', {
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
    path: req.path,
    method: req.method
  });
  try {
    const oauth_timestamp = Math.floor(Date.now() / 1000);
    const oauth_nonce = uuid();

    // Use a simple callback URL without session ID
    const callbackUrl = `${appconfig.SERVER_BASE_URL}/api/V1/social/twitter/callback`;
    
    const httpMethod = 'POST';
    const url = 'https://api.twitter.com/oauth/request_token';
    const parameters = {
      oauth_consumer_key: appconfig.TWITTER_CONSUMER_API_KEY,
      oauth_nonce: oauth_nonce,
      oauth_timestamp: oauth_timestamp,
      oauth_signature_method: 'HMAC-SHA1',
      oauth_version: '1.0',
      oauth_callback: callbackUrl,
    };

    // Log OAuth parameters
    logging.oauthLogger.logTokenOperation('generate_parameters', {
      oauth_consumer_key: appconfig.TWITTER_CONSUMER_API_KEY,
      oauth_nonce: oauth_nonce,
      oauth_timestamp: oauth_timestamp,
      oauth_callback: `${appconfig.SERVER_BASE_URL}/api/V1/social/twitter/callback`
    }, {
      requestId,
      sessionID: req.sessionID
    });

    const encodedSignature = oauthSignature.generate(httpMethod, url, parameters);
    console.log(encodedSignature);

    // Log request details
    logging.oauthLogger.logOAuthRequest('twitter', {
      action: 'api_request',
      url: 'https://api.twitter.com/oauth/request_token',
      method: 'POST'
    }, {
      requestId,
      sessionID: req.sessionID
    });

    const startTime = Date.now();
    // Log the callback URL with session ID for debugging
    logging.oauthLogger.logTokenOperation('callback_url_with_session', {
      callbackUrl,
      sessionID: req.sessionID,
      timestamp: new Date().toISOString()
    }, {
      requestId,
      timestamp: new Date().toISOString()
    });
    
    // Encode the callback URL for the request
    const encodedCallbackUrl = encodeURIComponent(callbackUrl);
    
    const tweetresponse = await axios.post(
      `https://api.twitter.com/oauth/request_token?oauth_callback=${encodedCallbackUrl}`,
      {},
      {
        headers: {
          Authorization: `OAuth oauth_consumer_key=${appconfig.TWITTER_CONSUMER_API_KEY}, oauth_nonce=${oauth_nonce},`
          + ` oauth_signature=${encodedSignature}, oauth_signature_method="HMAC-SHA1",`
          + ` oauth_timestamp=${oauth_timestamp}, oauth_version="1.0"`,
        },
      },
    );
    const duration = Date.now() - startTime;

    // Parse the response data
    const responseData = tweetresponse.data;
    const parsedData = {};
    
    if (typeof responseData === 'string') {
      responseData.split('&').forEach(pair => {
        const [key, value] = pair.split('=');
        parsedData[key] = value;
      });
    }

    // Log successful response
    logging.oauthLogger.logOAuthCallback('twitter', true, {
      responseTime: duration,
      status: tweetresponse.status,
      oauth_token: parsedData.oauth_token,
      oauth_token_secret: '[REDACTED]',
      oauth_callback_confirmed: parsedData.oauth_callback_confirmed
    }, {
      requestId,
      sessionID: req.sessionID
    });

    // Store token in session with enhanced logging
    if (req.session) {
      // Log session before modification with more details
      logging.oauthLogger.logSessionState(req.sessionID, 'before_token_store', {
        session: req.session,
        sessionID: req.sessionID,
        sessionKeys: Object.keys(req.session),
        cookie: req.session.cookie,
        cookieSettings: {
          domain: req.session.cookie.domain,
          path: req.session.cookie.path,
          secure: req.session.cookie.secure,
          httpOnly: req.session.cookie.httpOnly,
          sameSite: req.session.cookie.sameSite,
          maxAge: req.session.cookie.maxAge
        },
        requestHeaders: {
          cookie: req.headers.cookie,
          host: req.headers.host,
          origin: req.headers.origin,
          referer: req.headers.referer
        }
      }, {
        requestId,
        timestamp: new Date().toISOString()
      });
      
      // Log the token we're about to store
      logging.oauthLogger.logTokenOperation('token_to_store', {
        requestToken: parsedData.oauth_token,
        requestTokenSecret: '[REDACTED]',
        sessionID: req.sessionID
      }, {
        requestId,
        timestamp: new Date().toISOString()
      });
      
      // Store the token in the session
      req.session.oauth = {
        requestToken: parsedData.oauth_token,
        requestTokenSecret: parsedData.oauth_token_secret,
        timestamp: new Date().toISOString() // Add timestamp for debugging
      };
      
      // Log session immediately after modification but before save
      logging.oauthLogger.logSessionState(req.sessionID, 'after_token_assign', {
        sessionKeys: Object.keys(req.session),
        hasOauth: !!req.session.oauth,
        oauthKeys: req.session.oauth ? Object.keys(req.session.oauth) : null,
        requestToken: req.session.oauth?.requestToken
      }, {
        requestId,
        timestamp: new Date().toISOString()
      });
      
      // Save session explicitly with promise-based approach for better error handling
      try {
        // Save session and wait for completion
        await new Promise((resolve, reject) => {
          req.session.save((err) => {
            if (err) {
              logging.oauthLogger.logOAuthError(err, {
                requestId,
                operation: 'save_request_token',
                sessionID: req.sessionID,
                error: {
                  message: err.message,
                  stack: err.stack,
                  code: err.code
                },
                timestamp: new Date().toISOString()
              });
              reject(err);
            } else {
              resolve();
            }
          });
        });
        
        // Verify the session was saved correctly by re-fetching it
        logging.oauthLogger.logSessionState(req.sessionID, 'after_request_token_save', {
          session: req.session,
          sessionID: req.sessionID,
          sessionKeys: Object.keys(req.session),
          cookie: req.session.cookie,
          oauth: req.session.oauth,
          hasToken: !!req.session.oauth?.requestToken,
          tokenValue: req.session.oauth?.requestToken
        }, {
          requestId,
          timestamp: new Date().toISOString()
        });
        
        // Log response headers that will be sent
        logging.oauthLogger.logSessionState(req.sessionID, 'response_headers_after_token', {
          headers: res.getHeaders ? res.getHeaders() : res._headers,
          statusCode: res.statusCode,
          setCookieHeader: res.getHeader ? res.getHeader('Set-Cookie') : res._headers?.['set-cookie']
        }, {
          requestId,
          timestamp: new Date().toISOString()
        });
        
        // Log the Twitter response data for debugging
        logging.oauthLogger.logTokenOperation('twitter_response_data', {
          responseData: tweetresponse.data,
          parsedData: parsedData
        }, {
          requestId,
          timestamp: new Date().toISOString()
        });
      } catch (sessionError) {
        logging.oauthLogger.logOAuthError(sessionError, {
          requestId,
          operation: 'save_request_token_promise',
          sessionID: req.sessionID,
          timestamp: new Date().toISOString()
        });
      }
    } else {
      logging.oauthLogger.logOAuthError(new Error('No session available to store token'), {
        requestId,
        operation: 'save_request_token',
        sessionID: req.sessionID,
        cookies: {
          raw: req.headers.cookie,
          parsed: req.cookies
        },
        headers: req.headers,
        timestamp: new Date().toISOString()
      });
    }
    
    // Return the Twitter response with additional debugging info
    return res.json({
      ...tweetresponse.data,
      _debug: {
        sessionID: req.sessionID,
        hasSession: !!req.session,
        hasOauth: !!(req.session && req.session.oauth),
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    // Log error
    logging.oauthLogger.logOAuthError(error, {
      requestId,
      operation: 'request_token',
      sessionID: req.sessionID,
      errorStatus: error.response?.status,
      errorData: error.response?.data
    });
    
    // Return error response
    return res.status(500).json({
      status: 'error',
      message: 'Failed to get request token from Twitter',
      error: error.message
    });
  }
};

module.exports = { twitterrequest };
