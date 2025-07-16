/**
 * OAuth Logger Handler
 * 
 * @description Handles logging for OAuth-related events, particularly Twitter OAuth
 * @module logging/handlers/oauthLogger
 */

const winston = require('winston');
require('winston-daily-rotate-file');
const { createLogger } = require('../config/logConfig');
const { formatOAuthLog } = require('../formatters/logFormatter');

class OAuthLogger {
  constructor() {
    console.log('Constructing OAuthLogger...');
    this.ready = false;
    this.initPromise = this.initialize();
    
    // Store logs that occur before initialization
    this.pendingLogs = [];
  }

  async initialize() {
    console.log('Initializing OAuth logger...');
    try {
      this.logger = await createLogger('oauth');
      this.ready = true;
      console.log('OAuth logger initialized successfully');
      
      // Process any pending logs
      while (this.pendingLogs.length > 0) {
        const { level, data } = this.pendingLogs.shift();
        this._log(level, data);
      }
    } catch (error) {
      console.error('Failed to initialize OAuth logger:', error);
      throw error;
    }
  }

  _log(level, data) {
    if (!this.ready) {
      this.pendingLogs.push({ level, data });
      return;
    }

    this.logger[level](data);
    
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[OAUTH] ${data.type || 'Log'} - ${data.message || JSON.stringify(data)}`);
    }
  }

  async logOAuthRequest(provider, requestData, context = {}) {
    await this.initPromise;
    const logData = {
      type: 'OAUTH_REQUEST',
      provider,
      timestamp: new Date().toISOString(),
      requestData,
      ...context
    };
    
    this._log('info', logData);
  }

  async logOAuthCallback(provider, success, callbackData, context = {}) {
    await this.initPromise;
    const logData = {
      type: 'OAUTH_CALLBACK',
      provider,
      success,
      timestamp: new Date().toISOString(),
      callbackData,
      ...context
    };
    
    if (success) {
      this._log('info', logData);
    } else {
      this._log('warn', logData);
    }
  }

  async logSessionState(sessionID, action, sessionData, context = {}) {
    await this.initPromise;
    const logData = {
      type: 'SESSION_STATE',
      sessionID,
      action,
      timestamp: new Date().toISOString(),
      sessionData,
      ...context
    };
    
    this._log('info', logData);
  }

  async logTokenOperation(operation, tokenData, context = {}) {
    await this.initPromise;
    const logData = {
      type: 'TOKEN_OPERATION',
      operation,
      timestamp: new Date().toISOString(),
      tokenData,
      ...context
    };
    
    this._log('info', logData);
  }

  async logMiddlewareExecution(middleware, req, context = {}) {
    await this.initPromise;
    const logData = {
      type: 'MIDDLEWARE_EXECUTION',
      middleware,
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method,
      sessionID: req.sessionID,
      hasSession: !!req.session,
      cookies: req.cookies,
      ...context
    };
    
    this._log('debug', logData);
  }

  async logOAuthError(error, context = {}) {
    await this.initPromise;
    const logData = {
      type: 'OAUTH_ERROR',
      timestamp: new Date().toISOString(),
      error: {
        message: error.message,
        stack: error.stack,
        code: error.code
      },
      ...context
    };
    
    this._log('error', logData);
    
    if (process.env.NODE_ENV !== 'production') {
      console.error('[OAUTH ERROR]', error.message);
      if (error.stack) {
        console.error(error.stack);
      }
    }
  }
}

module.exports = new OAuthLogger();
