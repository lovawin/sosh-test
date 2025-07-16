/**
 * Error Logger Handler
 * 
 * @description Handles logging for all errors and exceptions
 * @module logging/handlers/errorLogger
 */

const winston = require('winston');
require('winston-daily-rotate-file');
const { createLogger } = require('../config/logConfig');
const { formatError } = require('../formatters/logFormatter');

class ErrorLogger {
  constructor() {
    console.log('Constructing ErrorLogger...');
    this.ready = false;
    this.initPromise = this.initialize();
    
    // Store errors that occur before initialization
    this.pendingErrors = [];
    
    // Bind process handlers
    process.on('uncaughtException', this.handleUncaughtException.bind(this));
    process.on('unhandledRejection', this.handleUnhandledRejection.bind(this));
  }

  async initialize() {
    console.log('Initializing error logger...');
    try {
      this.logger = await createLogger('error');
      this.ready = true;
      console.log('Error logger initialized successfully');
      
      // Process any pending errors
      while (this.pendingErrors.length > 0) {
        const { error, context } = this.pendingErrors.shift();
        await this.logError(error, context);
      }
    } catch (error) {
      console.error('Failed to initialize error logger:', error);
      throw error;
    }
  }

  async logError(error, context = {}) {
    // If logger isn't ready, store error for later
    if (!this.ready) {
      this.pendingErrors.push({ error, context });
      return;
    }

    try {
      await this.initPromise;
      const formattedError = formatError(error, context);
      this.logger.error(formattedError);

      if (process.env.NODE_ENV !== 'production') {
        console.error('[ERROR]', error.message);
        if (error.stack) {
          console.error(error.stack);
        }
      }
    } catch (loggingError) {
      console.error('Failed to log error:', loggingError);
      console.error('Original error:', error);
    }
  }

  async logWarning(message, context = {}) {
    try {
      await this.initPromise;
      const logData = {
        level: 'WARN',
        message,
        context,
        timestamp: new Date().toISOString()
      };

      this.logger.warn(logData);
      if (process.env.NODE_ENV !== 'production') {
        console.warn('[WARNING]', message);
      }
    } catch (error) {
      console.error('Failed to log warning:', error);
    }
  }

  async logFatalError(error, context = {}) {
    try {
      await this.initPromise;
      const formattedError = formatError(error, context);
      formattedError.fatal = true;
      
      this.logger.error(formattedError);
      if (process.env.NODE_ENV !== 'production') {
        console.error('[FATAL ERROR]', error.message);
        if (error.stack) {
          console.error(error.stack);
        }
      }
    } catch (loggingError) {
      console.error('Failed to log fatal error:', loggingError);
      console.error('Original error:', error);
    }
  }

  async handleUncaughtException(error) {
    try {
      await this.logFatalError(error, { type: 'UNCAUGHT_EXCEPTION' });
    } finally {
      process.exit(1);
    }
  }

  async handleUnhandledRejection(reason, promise) {
    const error = reason instanceof Error ? reason : new Error(String(reason));
    await this.logError(error, { 
      type: 'UNHANDLED_REJECTION',
      promise: promise.toString()
    });
  }
}

module.exports = new ErrorLogger();
