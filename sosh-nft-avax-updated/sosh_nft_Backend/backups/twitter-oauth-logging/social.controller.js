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
    if (req.session && req.session.userid) {
      logging.authLogger.logAuthAttempt('twitter_callback', { id: req.session.userid }, true, {
        ip: req.ip,
        userAgent: req.headers['user-agent']
      });

      const { passport } = req.session;
      
      const id = req.session.userid;

        const user = await Users.findOne({ _id: id });
        
        logging.authLogger.logSocialAuth('twitter', 'info_received', { id }, true, {
        twitterInfo: passport.user
        });

        user.twitterUsername = passport.user.profile.username;
        await user.save();
        const twitterAccount = await Twitter.findOne({ userId: id });
        if (twitterAccount) {
          // delete previous token and update new one
          await Twitter.findOneAndDelete({ userId: id });
          logging.authLogger.logSocialAuth('twitter', 'token_refresh', { id }, true, {
          twitterId: passport.user.profile.id
          });
        }
        logging.authLogger.logSocialAuth('twitter', 'token_create', { id }, true, {
        twitterId: passport.user.profile.id
        });
        try {
          const newtwittertoken = new Twitter({
            userId: user.id,
            twitterUsername: passport.user.profile.username,
            twitterId: passport.user.profile.id,
            displayName: passport.user.profile.displayName,
            access_token_id: passport.user.accesstokenid,
            access_token: passport.user.accesstoken,
            last_update_date: new Date(),
          });
          await newtwittertoken.save();
          logging.authLogger.logSession('destroy', req.sessionID, { id }, {
          reason: 'twitter_callback_complete'
          });
          req.session.destroy();
          return res.redirect(`${appconfig.FRONTEND_URL}?platform=twitter`);
          // return res.json({ msg: "successfully" });
        } catch (error) {
        //  return res.json({ msg: "failed" });
        return res.redirect(
          `${appconfig.FRONTEND_URL}?platform=${error.message} `,
        );
      }
    }
    logging.authLogger.logAuthAttempt('twitter_callback', null, false, {
      error: 'session_missing',
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });
    return res.redirect(
      `${appconfig.FRONTEND_URL}?status=session expired.please try again `,
    );
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

    if (!link) {
      const error = new InvalidInputError('Twitter link is required');
      logging.errorLogger.logValidationError('TwitterLink', { link }, {
        requestId,
        userId: id,
        error: error.message,
        step: 'initial_validation'
      });
      throw error;
    }

    // Basic URL validation
    try {
      new URL(link);
    } catch (error) {
      const validationError = new InvalidInputError('Invalid URL format. Please provide a valid URL');
      logging.errorLogger.logValidationError('TwitterLink', { link }, {
        requestId,
        userId: id,
        error: validationError.message,
        step: 'url_format_validation',
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

    // Extract URL components
    const urlParts = normalizedLink.split('/').filter(part => part.length > 0);
    const isValidFormat = urlParts.length >= 4 && 
                         urlParts.includes('status') && 
                         (urlParts.includes('twitter.com') || urlParts.includes('x.com'));

    if (!isValidFormat) {
      const error = new InvalidInputError(
        'Invalid Twitter link format. Expected format: https://twitter.com/username/status/123456 or https://x.com/username/status/123456'
      );
      logging.errorLogger.logValidationError('TwitterLink', { 
        link: normalizedLink, 
        urlParts,
        isValidFormat
      }, {
        requestId,
        userId: id,
        error: error.message,
        step: 'url_structure_validation'
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
      logging.errorLogger.logValidationError('TwitterLink', { 
        link, 
        extractedTweetId: tweetid,
        urlParts
      }, {
        requestId,
        userId: id,
        error: error.message,
        step: 'tweet_id_validation'
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

      const response = await axios(requestConfig);
      const duration = Date.now() - startTime;

      // Log successful API response
      logging.apiLogger.logResponse({
        method: req.method,
        url: req.url,
        duration,
        context: {
          operation: 'fetch_tweet',
          tweetId: tweetid,
          authorId: response.data.data.author_id
        }
      }, {
        status: response.status,
        statusText: response.statusText,
        data: {
          author_id: response.data.data.author_id
        }
      });
      const twitteruser = await Twitter.findOne({ userId: id });
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
      if (response.data.data.author_id === twitteruser.twitterId) {
        logging.apiLogger.logRequest({
          ...req,
          context: {
            operation: 'screenshot_tweet',
            tweetId: tweetid,
            userId: id
          }
        });

        const screenshotbuffer = await postScreenshot(normalizedLink, 'twitter');
        
        logging.apiLogger.logRequest({
          ...req,
          context: {
            operation: 'upload_to_s3',
            tweetId: tweetid,
            userId: id
          }
        });

        // upload image to s3 bucket
        const s3result = await uploadToS3(screenshotbuffer, 'twitter', '.png');

        logging.apiLogger.logResponse({
          ...req,
          context: {
            operation: 'validate_twitter_link',
            status: 'success',
            tweetId: tweetid,
            userId: id
          }
        }, { statusCode: 200 });

        return res.send(s3result);
      }

      const error = new InvalidInputError(
        `This tweet was not posted by your linked Twitter account (${twitteruser.twitterUsername}). Please provide a tweet from your own account.`
      );
      logging.errorLogger.logValidationError('TwitterLink', { 
        link, 
        tweetId: tweetid,
        normalizedLink 
      }, {
        requestId,
        userId: id,
        error: error.message,
        step: 'author_validation',
        expectedAuthor: twitteruser.twitterId,
        actualAuthor: response.data.data.author_id,
        twitterUsername: twitteruser.twitterUsername
      });
      throw error;
    } catch (error) {
      // Enhanced error logging with full context
      logging.errorLogger.logAPIError(error, {
        method: req.method,
        url: req.url,
        body: {
          link: req.body.link,
          normalizedLink
        }
      }, {
        requestId,
        tweetId: tweetid,
        operation: 'validate_twitter_link',
        step: 'twitter_api_request',
        errorDetails: error.response?.data || error.message,
        errorStatus: error.response?.status,
        errorStatusText: error.response?.statusText
      });

      // Provide specific error messages based on the error type
      let userMessage;
      if (error.response?.status === 401) {
        userMessage = 'Unable to verify the tweet. Please try again later or contact support if the issue persists.';
      } else if (error.response?.status === 404) {
        userMessage = 'Tweet not found. Please check if the tweet exists and is publicly accessible.';
      } else if (error.response?.status === 403) {
        userMessage = 'Access to this tweet is restricted. Please ensure the tweet is public.';
      } else if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
        userMessage = 'Network error. Please check your internet connection and try again.';
      } else {
        userMessage = 'Failed to validate the Twitter link. Please try again or use a different tweet.';
      }
      
      throw new InvalidInputError(userMessage);
    }
  }

  async socialList(req, res) {
    res.send(appconfig.SOCIAL_LIST);
  }
}

module.exports = Social;
