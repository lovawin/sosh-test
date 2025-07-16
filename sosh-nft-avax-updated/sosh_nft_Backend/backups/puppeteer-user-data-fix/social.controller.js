const axios = require('axios');
const logging = require('../logging');
const Users = require('../models/User');
const Twitter = require('../models/Twitter');
const appconfig = require('../../config/appconfig');
const { InvalidInputError } = require('../handler/error/invalid_input_error');
const { NotFoundError } = require('../handler/error/not_found_error');
const { postScreenshot } = require('../services/puppetter');
const { uploadToS3 } = require('../utils/amazons3');
const Assets = require('../models/Assets');

class Social {
  async twittercallback(req, res) {
    console.log("+++++++++++++++++++$$######$$$$$#++++++++")
    
    // Get request ID from request object or generate a new one
    const requestId = req.oauthRequestId || `callback-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
    
    // Log detailed session information at the start of the callback
    logging.oauthLogger.logSessionState(req.sessionID, 'twitter_callback_start', req.session, {
      requestId,
      path: req.path,
      method: req.method,
      query: req.query,
      cookies: req.cookies,
      headers: {
        'user-agent': req.headers['user-agent'],
        'cookie': req.headers.cookie ? 'present' : 'absent'
      }
    });
    
    if (req.session && req.session.userid) {
      // Log successful session presence
      logging.oauthLogger.logOAuthCallback('twitter', true, {
        action: 'session_found',
        sessionID: req.sessionID,
        userId: req.session.userid,
        hasPassport: !!req.session.passport
      }, {
        requestId,
        ip: req.ip,
        userAgent: req.headers['user-agent']
      });
      
      logging.authLogger.logAuthAttempt('twitter_callback', { id: req.session.userid }, true, {
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        requestId
      });

      const { passport } = req.session;
      
      const id = req.session.userid;

      try {
        // Log database query
        logging.dbLogger.logQuery('findOne', 'Users', { 
          _id: id,
          operation: 'twitter_callback_user_lookup'
        }, 0);
        
        const user = await Users.findOne({ _id: id });
        
        if (!user) {
          // Log user not found error
          const error = new Error(`User not found with id: ${id}`);
          logging.oauthLogger.logOAuthError(error, {
            requestId,
            operation: 'user_lookup',
            userId: id
          });
          
          return res.redirect(
            `${appconfig.FRONTEND_URL}?status=user not found.please try again`
          );
        }
        
        // Log successful user lookup
        logging.oauthLogger.logOAuthCallback('twitter', true, {
          action: 'user_found',
          userId: id,
          username: user.username || 'not_set'
        }, {
          requestId
        });
        
        logging.authLogger.logSocialAuth('twitter', 'info_received', { id }, true, {
          twitterInfo: passport.user,
          requestId
        });

        // Update user with Twitter username
        user.twitterUsername = passport.user.profile.username;
        await user.save();
        
        // Log user update
        logging.oauthLogger.logOAuthCallback('twitter', true, {
          action: 'user_updated',
          userId: id,
          twitterUsername: passport.user.profile.username
        }, {
          requestId
        });
        
        // Check for existing Twitter account
        logging.dbLogger.logQuery('findOne', 'Twitter', { 
          userId: id,
          operation: 'twitter_account_check'
        }, 0);
        
        const twitterAccount = await Twitter.findOne({ userId: id });
        if (twitterAccount) {
          // Log token refresh
          logging.oauthLogger.logTokenOperation('refresh', {
            userId: id,
            twitterId: passport.user.profile.id,
            previousTokenId: twitterAccount.access_token_id
          }, {
            requestId
          });
          
          // Delete previous token and update new one
          await Twitter.findOneAndDelete({ userId: id });
          logging.authLogger.logSocialAuth('twitter', 'token_refresh', { id }, true, {
            twitterId: passport.user.profile.id,
            requestId
          });
        } else {
          // Log new token creation
          logging.oauthLogger.logTokenOperation('create_new', {
            userId: id,
            twitterId: passport.user.profile.id
          }, {
            requestId
          });
        }
        
        logging.authLogger.logSocialAuth('twitter', 'token_create', { id }, true, {
          twitterId: passport.user.profile.id,
          requestId
        });
        
        try {
          // Create new Twitter token
          const newtwittertoken = new Twitter({
            userId: user.id,
            twitterUsername: passport.user.profile.username,
            twitterId: passport.user.profile.id,
            displayName: passport.user.profile.displayName,
            access_token_id: passport.user.accesstokenid,
            access_token: passport.user.accesstoken,
            last_update_date: new Date(),
          });
          
          // Log token save attempt
          logging.dbLogger.logQuery('save', 'Twitter', { 
            userId: id,
            operation: 'twitter_token_save'
          }, 0);
          
          await newtwittertoken.save();
          
          // Log successful token save
          logging.oauthLogger.logOAuthCallback('twitter', true, {
            action: 'token_saved',
            userId: id,
            twitterId: passport.user.profile.id
          }, {
            requestId
          });
          
          // Log session before destruction
          logging.oauthLogger.logSessionState(req.sessionID, 'before_destroy', req.session, {
            requestId,
            userId: id
          });
          
          logging.authLogger.logSession('destroy', req.sessionID, { id }, {
            reason: 'twitter_callback_complete',
            requestId
          });
          
          // Destroy session
          req.session.destroy((err) => {
            if (err) {
              // Log session destruction error
              logging.oauthLogger.logOAuthError(err, {
                requestId,
                operation: 'session_destroy',
                sessionID: req.sessionID
              });
            } else {
              // Log successful session destruction
              logging.oauthLogger.logOAuthCallback('twitter', true, {
                action: 'session_destroyed',
                sessionID: req.sessionID
              }, {
                requestId
              });
            }
            
            // Redirect to frontend
            return res.redirect(`${appconfig.FRONTEND_URL}?platform=twitter`);
          });
        } catch (error) {
          // Log token save error
          logging.oauthLogger.logOAuthError(error, {
            requestId,
            operation: 'save_twitter_token',
            userId: id,
            twitterId: passport.user.profile.id
          });
          
          return res.redirect(
            `${appconfig.FRONTEND_URL}?platform=${error.message} `,
          );
        }
      } catch (error) {
        // Log general error
        logging.oauthLogger.logOAuthError(error, {
          requestId,
          operation: 'twitter_callback_processing',
          sessionID: req.sessionID,
          userId: id
        });
        
        return res.redirect(
          `${appconfig.FRONTEND_URL}?status=error&message=${error.message}`
        );
      }
    } else {
      // Log missing session error
      logging.oauthLogger.logOAuthError(new Error('Session missing or userid not found in session'), {
        requestId,
        operation: 'twitter_callback',
        sessionID: req.sessionID,
        sessionExists: !!req.session,
        hasUserId: !!(req.session && req.session.userid)
      });
      
      logging.authLogger.logAuthAttempt('twitter_callback', null, false, {
        error: 'session_missing',
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        requestId
      });
      
      return res.redirect(
        `${appconfig.FRONTEND_URL}?status=session expired.please try again `,
      );
    }
  }

  async twitterFailed() {
    throw new InvalidInputError("Invalid credentials");
  }

  async validateTwitterLink(req, res) {
    const { id } = req.user;
    const { link } = req.body;
    const requestId = Date.now().toString();

    // Log validation start with request ID
    logging.apiLogger.logRequest({
      ...req,
      context: {
        requestId,
        operation: 'validate_twitter_link',
        userId: id,
        link
      }
    });

    try {
      if (!link) {
        const error = new InvalidInputError('Twitter link is required');
        // Log to error_logs collection
        logging.errorLogger.logError(error, {
          context: 'twitter_validation',
          requestId,
          userId: id,
          operation: 'validate_twitter_link',
          step: 'initial_validation',
          link: link || 'undefined',
          errorType: 'missing_link'
        });
        throw error;
      }

      // Basic URL validation
      try {
        new URL(link);
      } catch (error) {
        const validationError = new InvalidInputError('Invalid URL format. Please provide a valid URL');
        // Log to error_logs collection
        logging.errorLogger.logError(validationError, {
          context: 'twitter_validation',
          requestId,
          userId: id,
          operation: 'validate_twitter_link',
          step: 'url_format_validation',
          link,
          errorType: 'invalid_url_format',
          originalError: error.message
        });
        throw validationError;
      }

      // Transform x.com URLs to twitter.com format
      let normalizedLink = link;
      if (link.includes('x.com')) {
        normalizedLink = link.replace('x.com', 'twitter.com');
        logging.apiLogger.logRequest({
          ...req,
          context: {
            requestId,
            operation: 'normalize_twitter_link',
            userId: id,
            originalLink: link,
            normalizedLink
          }
        });
      }

      // Enhanced logging for URL details using MongoDB-based logging
      logging.apiLogger.logRequest({
        ...req,
        context: {
          requestId,
          operation: 'link_validation_diagnostic',
          userId: id,
          originalLink: link,
          normalizedLink,
          linkType: link.includes('x.com') ? 'x.com' : 'twitter.com',
          linkLength: link.length,
          normalizedLinkLength: normalizedLink.length,
          diagnostic: true
        }
      });

      // Extract URL components
      const urlParts = normalizedLink.split('/').filter(part => part.length > 0);
      const isValidFormat = urlParts.length >= 4 && 
                           urlParts.includes('status') && 
                           (urlParts.includes('twitter.com') || urlParts.includes('x.com'));

      if (!isValidFormat) {
        const error = new InvalidInputError(
          'Invalid Twitter link format. Expected format: https://twitter.com/username/status/123456 or https://x.com/username/status/123456'
        );
        // Log to error_logs collection
        logging.errorLogger.logError(error, {
          context: 'twitter_validation',
          requestId,
          userId: id,
          operation: 'validate_twitter_link',
          step: 'url_structure_validation',
          link: normalizedLink,
          urlParts: JSON.stringify(urlParts),
          isValidFormat,
          errorType: 'invalid_url_structure'
        });
        throw error;
      }
      // Extract tweet ID from URL
      const statusIndex = urlParts.indexOf('status');
      const tweetid = statusIndex !== -1 && urlParts[statusIndex + 1] ? urlParts[statusIndex + 1].split('?')[0] : null;

      if (!tweetid || !/^\d+$/.test(tweetid)) {
        const error = new InvalidInputError(
          'Invalid or missing Tweet ID in the URL. Please provide a valid Twitter post URL'
        );
        // Log to error_logs collection
        logging.errorLogger.logError(error, {
          context: 'twitter_validation',
          requestId,
          userId: id,
          operation: 'validate_twitter_link',
          step: 'tweet_id_validation',
          link,
          extractedTweetId: tweetid,
          urlParts: JSON.stringify(urlParts),
          errorType: 'invalid_tweet_id'
        });
        throw error;
      }

    // Log database query attempt
    logging.dbLogger.logQuery('find', 'Twitter', { 
      userId: id,
      requestId,
      operation: 'validate_twitter_link'
    }, 0);
    try {
      // Log Twitter API request with detailed context
      logging.apiLogger.logRequest({
        method: 'GET',
        url: `${appconfig.GET_TWEET_ENDPOINT}/${tweetid}`,
        context: {
          requestId,
          operation: 'fetch_tweet',
          tweetId: tweetid,
          userId: id,
          normalizedLink,
          originalLink: link
        }
      });

      const startTime = Date.now();
      
      // Log Twitter API configuration details
      logging.apiLogger.logRequest({
        ...req,
        context: {
          requestId,
          operation: 'twitter_api_config',
          tweetId: tweetid,
          tokenPresent: !!appconfig.TWITTER_BEARER_TOKEN,
          tokenLength: appconfig.TWITTER_BEARER_TOKEN?.length,
          tokenPrefix: appconfig.TWITTER_BEARER_TOKEN?.substring(0, 20) + '...',
          endpoint: appconfig.GET_TWEET_ENDPOINT
        }
      });

      // Format the Authorization header with Bearer prefix
      const token = appconfig.TWITTER_BEARER_TOKEN;
      const authHeader = token.startsWith('Bearer ') ? token : `Bearer ${token}`;

      // Prepare request configuration
      const requestConfig = {
        method: 'GET',
        url: `${appconfig.GET_TWEET_ENDPOINT}/${tweetid}`,
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
        },
        params: {
          expansions: 'author_id',
        },
      };

      // Log token format details
      logging.apiLogger.logRequest({
        ...req,
        context: {
          requestId,
          operation: 'token_format_check',
          rawTokenPrefix: token ? token.substring(0, 7) : null,
          finalHeaderPrefix: authHeader.substring(0, 13), // Will show "Bearer AAAAA"
          tokenFormat: 'Ensuring Bearer prefix is present'
        }
      });

      logging.apiLogger.logRequest({
        ...req,
        context: {
          requestId,
          operation: 'fetch_tweet_request_details',
          tweetId: tweetid,
          config: {
            ...requestConfig,
            headers: {
              ...requestConfig.headers,
              Authorization: 'Bearer [REDACTED]' // Don't log the actual token
            }
          }
        }
      });

      // Enhanced logging before API call using MongoDB-based logging
      logging.apiLogger.logRequest({
        method: 'GET',
        url: `${appconfig.GET_TWEET_ENDPOINT}/${tweetid}`,
        context: {
          requestId,
          operation: 'twitter_api_request_diagnostic',
          tweetId: tweetid,
          userId: id,
          requestConfig: {
            method: requestConfig.method,
            url: requestConfig.url,
            headers: {
              ...requestConfig.headers,
              Authorization: 'Bearer [REDACTED]'
            },
            params: requestConfig.params
          },
          diagnostic: true
        }
      });

      const response = await axios(requestConfig);
      const duration = Date.now() - startTime;

      // Enhanced logging for successful response using MongoDB-based logging
      logging.apiLogger.logResponse({
        method: 'GET',
        url: `${appconfig.GET_TWEET_ENDPOINT}/${tweetid}`,
        duration,
        context: {
          requestId,
          operation: 'twitter_api_response_diagnostic',
          tweetId: tweetid,
          userId: id,
          responseStatus: response.status,
          diagnostic: true
        }
      }, {
        status: response.status,
        statusText: response.statusText,
        data: response.data
      });

      // Log successful API response
      logging.apiLogger.logResponse({
        method: req.method,
        url: req.url,
        duration,
        context: {
          operation: 'fetch_tweet',
          tweetId: tweetid,
          authorId: response.data.data.author_id,
          responseData: response.data
        }
      }, {
        status: response.status,
        statusText: response.statusText,
        data: {
          author_id: response.data.data.author_id,
          full_response: response.data
        }
      });
      // Log database query for Twitter account
      logging.dbLogger.logQuery('findOne', 'Twitter', { 
        userId: id,
        requestId,
        operation: 'find_linked_twitter_account'
      }, 0);
      
      const twitteruser = await Twitter.findOne({ userId: id });
      
      // Log Twitter account details
      logging.apiLogger.logRequest({
        ...req,
        context: {
          requestId,
          operation: 'twitter_account_check_diagnostic',
          tweetId: tweetid,
          userId: id,
          twitterAccountFound: !!twitteruser,
          twitterUserId: twitteruser?.twitterId,
          twitterUsername: twitteruser?.twitterUsername,
          diagnostic: true
        }
      });
      
      if (!twitteruser) {
        const error = new NotFoundError('No twitter account linked');
        logging.errorLogger.logError(error, {
          context: 'twitter_validation',
          userId: id,
          tweetId: tweetid,
          reason: 'no_linked_account'
        });
        throw error;
      }
      
      // Log author comparison details
      logging.apiLogger.logRequest({
        ...req,
        context: {
          requestId,
          operation: 'twitter_author_comparison_diagnostic',
          tweetId: tweetid,
          userId: id,
          tweetAuthorId: response.data.data.author_id,
          linkedTwitterId: twitteruser.twitterId,
          isMatch: response.data.data.author_id === twitteruser.twitterId,
          diagnostic: true
        }
      });
      
      if (response.data.data.author_id === twitteruser.twitterId) {
        // Enhanced logging for screenshot process
        logging.apiLogger.logRequest({
          ...req,
          context: {
            requestId,
            operation: 'screenshot_tweet',
            tweetId: tweetid,
            userId: id,
            normalizedLink,
            diagnostic: true
          }
        });

        try {
          // Log screenshot attempt with detailed context
          logging.apiLogger.logRequest({
            ...req,
            context: {
              requestId,
              operation: 'screenshot_attempt',
              tweetId: tweetid,
              userId: id,
              normalizedLink,
              platform: 'twitter',
              diagnostic: true
            }
          });
          
          let screenshotbuffer;
          try {
            screenshotbuffer = await postScreenshot(normalizedLink, 'twitter');
            
            // Log successful screenshot with buffer details
            logging.apiLogger.logRequest({
              ...req,
              context: {
                requestId,
                operation: 'screenshot_success',
                tweetId: tweetid,
                userId: id,
                screenshotSize: screenshotbuffer?.length,
                hasValidBuffer: !!screenshotbuffer && screenshotbuffer.length > 0,
                diagnostic: true
              }
            });
          } catch (screenshotError) {
            // Enhanced screenshot error logging
            logging.errorLogger.logError(screenshotError, {
              context: 'twitter_screenshot_failure',
              requestId,
              userId: id,
              tweetId: tweetid,
              normalizedLink,
              errorType: screenshotError.name,
              errorMessage: screenshotError.message,
              errorStack: screenshotError.stack,
              operation: 'screenshot',
              diagnostic: true
            });
            
            // Rethrow with more specific message
            const enhancedError = new Error(`Failed to capture screenshot of tweet: ${screenshotError.message}`);
            enhancedError.originalError = screenshotError;
            enhancedError.code = 'SCREENSHOT_FAILURE';
            throw enhancedError;
          }
          
          // Validate screenshot buffer before S3 upload
          if (!screenshotbuffer || screenshotbuffer.length === 0) {
            const bufferError = new Error('Screenshot buffer is empty or invalid');
            
            // Log buffer validation error
            logging.errorLogger.logError(bufferError, {
              context: 'twitter_screenshot_buffer_validation',
              requestId,
              userId: id,
              tweetId: tweetid,
              normalizedLink,
              bufferSize: screenshotbuffer?.length || 0,
              operation: 'buffer_validation',
              diagnostic: true
            });
            
            throw bufferError;
          }
          
          // Enhanced logging for S3 upload process
          logging.apiLogger.logRequest({
            ...req,
            context: {
              requestId,
              operation: 'upload_to_s3_attempt',
              tweetId: tweetid,
              userId: id,
              fileType: '.png',
              bufferSize: screenshotbuffer.length,
              diagnostic: true
            }
          });

          let s3result;
          try {
            // upload image to s3 bucket
            s3result = await uploadToS3(screenshotbuffer, 'twitter', '.png');
            
            // Log successful S3 upload with detailed result
            logging.apiLogger.logRequest({
              ...req,
              context: {
                requestId,
                operation: 's3_upload_success',
                tweetId: tweetid,
                userId: id,
                s3Result: {
                  location: s3result.Location,
                  bucket: s3result.Bucket,
                  key: s3result.Key,
                  etag: s3result.ETag
                },
                diagnostic: true
              }
            });
          } catch (s3Error) {
            // Enhanced S3 error logging
            logging.errorLogger.logError(s3Error, {
              context: 'twitter_s3_upload_failure',
              requestId,
              userId: id,
              tweetId: tweetid,
              normalizedLink,
              errorType: s3Error.name,
              errorMessage: s3Error.message,
              errorStack: s3Error.stack,
              operation: 's3_upload',
              diagnostic: true
            });
            
            // Rethrow with more specific message
            const enhancedError = new Error(`Failed to upload screenshot to S3: ${s3Error.message}`);
            enhancedError.originalError = s3Error;
            enhancedError.code = 'S3_UPLOAD_FAILURE';
            throw enhancedError;
          }
          
          // Log final success response
          logging.apiLogger.logResponse({
            ...req,
            context: {
              operation: 'validate_twitter_link',
              status: 'success',
              tweetId: tweetid,
              userId: id,
              s3Location: s3result.Location
            }
          }, { statusCode: 200 });

          return res.send(s3result);
        } catch (error) {
          // Determine error type with more specific categorization
          let errorType = 'twitter_validation_general';
          let userMessage = 'Failed to validate the Twitter link. Please try again or use a different tweet.';
          
          if (error.code === 'SCREENSHOT_FAILURE') {
            errorType = 'twitter_validation_screenshot';
            userMessage = 'Failed to capture screenshot of the tweet. Please try again or use a different tweet.';
          } else if (error.code === 'S3_UPLOAD_FAILURE') {
            errorType = 'twitter_validation_s3_upload';
            userMessage = 'Failed to process the tweet screenshot. Please try again later.';
          } else if (error.message?.includes('screenshot') || error.message?.includes('puppeteer')) {
            errorType = 'twitter_validation_screenshot';
            userMessage = 'Failed to capture screenshot of the tweet. Please try again or use a different tweet.';
          } else if (error.message?.includes('S3') || error.message?.includes('upload') || error.message?.includes('buffer')) {
            errorType = 'twitter_validation_s3_upload';
            userMessage = 'Failed to process the tweet screenshot. Please try again later.';
          }
          
          // Enhanced error logging with detailed context
          logging.errorLogger.logError(error, {
            context: errorType,
            requestId,
            userId: id,
            tweetId: tweetid,
            normalizedLink,
            errorType: error.name,
            errorMessage: error.message,
            errorStack: error.stack,
            errorCode: error.code,
            originalError: error.originalError ? {
              name: error.originalError.name,
              message: error.originalError.message,
              code: error.originalError.code
            } : undefined,
            diagnostic: true
          });
          
          // Throw a user-friendly error
          throw new InvalidInputError(userMessage);
        }
      }

      const error = new InvalidInputError(
        `This tweet was not posted by your linked Twitter account (${twitteruser.twitterUsername}). Please provide a tweet from your own account.`
      );
      // Log to error_logs collection
      logging.errorLogger.logError(error, {
        context: 'twitter_validation',
        requestId,
        userId: id,
        operation: 'validate_twitter_link',
        step: 'author_validation',
        link,
        tweetId: tweetid,
        normalizedLink,
        expectedAuthor: twitteruser.twitterId,
        actualAuthor: response.data.data.author_id,
        twitterUsername: twitteruser.twitterUsername,
        errorType: 'author_mismatch'
      });
      throw error;
    } catch (error) {
      // Enhanced diagnostic logging for errors using MongoDB-based logging
      logging.errorLogger.logError(error, {
        context: 'twitter_validation_diagnostic',
        requestId,
        userId: id,
        tweetId: tweetid,
        link: req.body.link,
        normalizedLink,
        errorCode: error.code,
        errorStatus: error.response?.status,
        errorData: error.response?.data,
        diagnostic: true
      });
      
      // Enhanced error logging with full context
      logging.apiLogger.logError(req, {
        status: error.response?.status || 500,
        statusText: error.response?.statusText || 'Internal Server Error',
        error: {
          message: error.message,
          stack: error.stack,
          code: error.code,
          response: error.response?.data
        }
      }, {
        requestId,
        tweetId: tweetid,
        operation: 'validate_twitter_link',
        step: 'twitter_api_request',
        link: req.body.link,
        normalizedLink,
        errorDetails: error.response?.data || error.message,
        errorStatus: error.response?.status,
        errorStatusText: error.response?.statusText,
        twitterEndpoint: appconfig.GET_TWEET_ENDPOINT,
        twitterTokenPresent: !!appconfig.TWITTER_BEARER_TOKEN,
        twitterTokenLength: appconfig.TWITTER_BEARER_TOKEN?.length
      });

      // Provide specific error messages based on the error type
      let userMessage;
      let errorType = 'general_validation_error';
      
      if (error.response?.status === 401) {
        userMessage = 'Unable to verify the tweet. Please try again later or contact support if the issue persists.';
        errorType = 'twitter_api_unauthorized';
      } else if (error.response?.status === 404) {
        userMessage = 'Tweet not found. Please check if the tweet exists and is publicly accessible.';
        errorType = 'tweet_not_found';
      } else if (error.response?.status === 403) {
        userMessage = 'Access to this tweet is restricted. Please ensure the tweet is public.';
        errorType = 'tweet_access_restricted';
      } else if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
        userMessage = 'Network error. Please check your internet connection and try again.';
        errorType = 'network_error';
      } else if (error.code === 'SCREENSHOT_FAILURE') {
        userMessage = 'Failed to capture screenshot of the tweet. Please try again or use a different tweet.';
        errorType = 'screenshot_failure';
      } else if (error.code === 'S3_UPLOAD_FAILURE') {
        userMessage = 'Failed to process the tweet screenshot. Please try again later.';
        errorType = 's3_upload_failure';
      } else if (error.message?.includes('Invalid social media link')) {
        userMessage = 'Invalid social media link. Please check the URL and try again.';
        errorType = 'invalid_social_media_link';
      } else {
        userMessage = 'Failed to validate the Twitter link. Please try again or use a different tweet.';
      }
      
      // Create a new error with the user-friendly message
      const userError = new InvalidInputError(userMessage);
      
      // Log the user-facing error to error_logs collection
      logging.errorLogger.logError(userError, {
        context: 'twitter_validation',
        requestId,
        userId: id,
        operation: 'validate_twitter_link',
        step: 'final_error_handling',
        link: req.body.link,
        normalizedLink,
        originalError: {
          message: error.message,
          code: error.code,
          status: error.response?.status
        },
        errorType,
        userMessage
      });
      
      throw userError;
    }
    } catch (outerError) {
      // Catch-all error handler to ensure all errors are logged to error_logs
      if (!(outerError instanceof InvalidInputError)) {
        // If it's not already an InvalidInputError, log it and convert it
        logging.errorLogger.logError(outerError, {
          context: 'twitter_validation_outer_catch',
          requestId,
          userId: id,
          operation: 'validate_twitter_link',
          errorType: 'uncaught_error',
          errorMessage: outerError.message,
          errorStack: outerError.stack
        });
        
        const userError = new InvalidInputError('An unexpected error occurred. Please try again later.');
        throw userError;
      }
      
      // Re-throw the original error
      throw outerError;
    }
  }

  async socialList(req, res) {
    res.send(appconfig.SOCIAL_LIST);
  }
}

module.exports = Social;
