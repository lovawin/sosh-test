/**
 * Authentication Logger Handler
 * 
 * @description Handles logging for authentication events
 * @module logging/handlers/authLogger
 */

const winston = require('winston');
require('winston-daily-rotate-file');
const { createLogger } = require('../config/logConfig');
const { formatAuthLog } = require('../formatters/logFormatter');

class AuthLogger {
  constructor() {
    console.log('Constructing AuthLogger...');
    this.ready = false;
    this.initPromise = this.initialize();
  }

  async initialize() {
    console.log('Initializing auth logger...');
    try {
      this.logger = await createLogger('auth');
      this.ready = true;
      console.log('Auth logger initialized successfully');
    } catch (error) {
      console.error('Failed to initialize auth logger:', error);
      throw error;
    }
  }

  /**
   * Log an authentication attempt
   * @param {string} action - The authentication action (login, register, etc.)
   * @param {object} user - The user object or null if no user
   * @param {boolean} success - Whether the authentication was successful
   * @param {object} metadata - Additional metadata about the authentication
   */
  async logAuthAttempt(action, user, success, metadata = {}) {
    await this.initPromise;
    const logData = {
      type: 'AUTH_ATTEMPT',
      action,
      userId: user ? user.id : null,
      success,
      metadata,
      timestamp: new Date().toISOString()
    };

    if (success) {
      this.logger.info(logData);
    } else {
      this.logger.warn(logData);
    }

    if (process.env.NODE_ENV !== 'production') {
      console.log(`[AUTH] ${action} attempt by ${user ? user.id : 'unknown'} - ${success ? 'Success' : 'Failed'}`);
    }
  }

  /**
   * Log a social authentication event
   * @param {string} provider - The social provider (twitter, facebook, etc.)
   * @param {string} action - The action performed (token_create, info_received, etc.)
   * @param {object} user - The user object
   * @param {boolean} success - Whether the operation was successful
   * @param {object} metadata - Additional metadata about the operation
   */
  async logSocialAuth(provider, action, user, success, metadata = {}) {
    await this.initPromise;
    const logData = {
      type: 'SOCIAL_AUTH',
      provider,
      action,
      userId: user ? user.id : null,
      success,
      metadata,
      timestamp: new Date().toISOString()
    };

    if (success) {
      this.logger.info(logData);
    } else {
      this.logger.warn(logData);
    }

    if (process.env.NODE_ENV !== 'production') {
      console.log(`[AUTH] ${provider} ${action} for ${user ? user.id : 'unknown'} - ${success ? 'Success' : 'Failed'}`);
    }
  }

  /**
   * Log a session event
   * @param {string} action - The session action (create, destroy, etc.)
   * @param {string} sessionId - The session ID
   * @param {object} user - The user object
   * @param {object} metadata - Additional metadata about the session
   */
  async logSession(action, sessionId, user, metadata = {}) {
    await this.initPromise;
    const logData = {
      type: 'SESSION',
      action,
      sessionId,
      userId: user ? user.id : null,
      metadata,
      timestamp: new Date().toISOString()
    };

    this.logger.info(logData);

    if (process.env.NODE_ENV !== 'production') {
      console.log(`[AUTH] Session ${action} - ID: ${sessionId}, User: ${user ? user.id : 'unknown'}`);
    }
  }

  async logLogin(user, success, error = null) {
    await this.initPromise;
    const logData = {
      type: 'LOGIN',
      userId: user.id,
      email: user.email,
      success,
      error: error ? {
        message: error.message,
        code: error.code
      } : null,
      timestamp: new Date().toISOString()
    };

    if (success) {
      this.logger.info(logData);
    } else {
      this.logger.warn(logData);
    }

    if (process.env.NODE_ENV !== 'production') {
      console.log(`[AUTH] Login attempt by ${user.id} - ${success ? 'Success' : 'Failed'}`);
      if (error) {
        console.error('[AUTH] Login error:', error.message);
      }
    }
  }

  async logLogout(user) {
    await this.initPromise;
    const logData = {
      type: 'LOGOUT',
      userId: user.id,
      email: user.email,
      timestamp: new Date().toISOString()
    };

    this.logger.info(logData);
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[AUTH] Logout - User: ${user.id}`);
    }
  }

  async logPasswordReset(user, success, error = null) {
    await this.initPromise;
    const logData = {
      type: 'PASSWORD_RESET',
      userId: user.id,
      email: user.email,
      success,
      error: error ? {
        message: error.message,
        code: error.code
      } : null,
      timestamp: new Date().toISOString()
    };

    if (success) {
      this.logger.info(logData);
    } else {
      this.logger.warn(logData);
    }

    if (process.env.NODE_ENV !== 'production') {
      console.log(`[AUTH] Password reset for ${user.id} - ${success ? 'Success' : 'Failed'}`);
      if (error) {
        console.error('[AUTH] Password reset error:', error.message);
      }
    }
  }

  async logTokenRefresh(user, success, error = null) {
    await this.initPromise;
    const logData = {
      type: 'TOKEN_REFRESH',
      userId: user.id,
      success,
      error: error ? {
        message: error.message,
        code: error.code
      } : null,
      timestamp: new Date().toISOString()
    };

    if (success) {
      this.logger.info(logData);
    } else {
      this.logger.warn(logData);
    }

    if (process.env.NODE_ENV !== 'production') {
      console.log(`[AUTH] Token refresh for ${user.id} - ${success ? 'Success' : 'Failed'}`);
      if (error) {
        console.error('[AUTH] Token refresh error:', error.message);
      }
    }
  }
}

module.exports = new AuthLogger();
