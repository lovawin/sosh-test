/**
 * Logging System Entry Point
 * 
 * @description Main entry point for the logging system that exports all logging components
 * @module logging
 * 
 * Developer Notes:
 * - Import this file to access all logging functionality
 * - Each logger writes to its own MongoDB collection
 * - Use appropriate logger for different types of events
 * - Configure logging through logConfig
 * - Log rotation handled by TTL indexes in MongoDB
 */

// Core loggers
const errorLogger = require('./handlers/errorLogger');
const apiLogger = require('./handlers/apiLogger');
const dbLogger = require('./handlers/dbLogger');
const authLogger = require('./handlers/authLogger');

// Specialized loggers
const jobLogger = require('./handlers/jobLogger');
const blockchainLogger = require('./handlers/blockchainLogger');
const securityLogger = require('./handlers/securityLogger');
const systemLogger = require('./handlers/systemLogger');
const oauthLogger = require('./handlers/oauthLogger');
const marketplaceLogger = require('./handlers/marketplaceLogger');

// Configuration
const { LOG_PATHS, ROTATION_CONFIG } = require('./config/logConfig');

/**
 * Initialize all loggers and ensure log directories exist
 */
const initializeLogging = async () => {
  const fs = require('fs');
  const path = require('path');
  const env = process.env.NODE_ENV || 'development';
  
  // Create log directories if they don't exist
  const logsDir = LOG_PATHS[env].root;
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }

  // Log system startup
  await systemLogger.logSystemStartup({
    logsDir,
    environment: env,
    loggers: [
      'error', 'api', 'db', 'auth',
      'job', 'blockchain', 'security', 'system',
      'oauth', 'marketplace'
    ]
  });

  console.log('Logging system initialized');
  console.log(`Environment: ${env}`);
  console.log(`Log directory: ${logsDir}`);
};

/**
 * Express middleware that combines all logging middleware
 */
const loggingMiddleware = () => {
  return (req, res, next) => {
    // Add request timestamp
    req._startTime = Date.now();

    // Add request ID
    req.id = Math.random().toString(36).substring(7);

    // Log request
    console.log(`[${req.method}] ${req.path}`);

    next();
  };
};

/**
 * Mongoose plugin that adds logging to all schemas
 */
const mongooseLoggingPlugin = dbLogger.mongoosePlugin();

// Export all logging components
module.exports = {
  // Core loggers
  errorLogger,
  apiLogger,
  dbLogger,
  authLogger,

  // Specialized loggers
  jobLogger,
  blockchainLogger,
  securityLogger,
  systemLogger,
  oauthLogger,
  marketplaceLogger,

  // Configuration
  LOG_PATHS,
  ROTATION_CONFIG,

  // Setup functions
  initializeLogging,
  loggingMiddleware,
  mongooseLoggingPlugin,

  // Database logging methods
  logQuery: dbLogger.logQuery.bind(dbLogger),
  logError: dbLogger.logError.bind(dbLogger),
  logConnection: dbLogger.logConnection.bind(dbLogger),
  
  // Auth logging methods
  logLogin: authLogger.logLogin.bind(authLogger),
  logLogout: authLogger.logLogout.bind(authLogger),
  logTokenRefresh: authLogger.logTokenRefresh.bind(authLogger),

  // Job logging methods
  logJobStart: jobLogger.logJobStart.bind(jobLogger),
  logJobComplete: jobLogger.logJobComplete.bind(jobLogger),
  logJobFailed: jobLogger.logJobFailed.bind(jobLogger),

  // Blockchain logging methods
  logTransaction: blockchainLogger.logTransaction.bind(blockchainLogger),
  logContractEvent: blockchainLogger.logContractEvent.bind(blockchainLogger),
  logGasUsage: blockchainLogger.logGasUsage.bind(blockchainLogger),

  // Security logging methods
  logSecurityEvent: securityLogger.logSecurityEvent.bind(securityLogger),
  logAuthAttempt: securityLogger.logAuthAttempt.bind(securityLogger),
  logAccessControl: securityLogger.logAccessAttempt.bind(securityLogger),

  // System logging methods
  logMetrics: systemLogger.logResourceMetrics.bind(systemLogger),
  logHealthCheck: systemLogger.logHealthCheck.bind(systemLogger),
  logServiceStatus: systemLogger.logServiceStatus.bind(systemLogger),
  
  // OAuth logging methods
  logOAuthRequest: oauthLogger.logOAuthRequest.bind(oauthLogger),
  logOAuthCallback: oauthLogger.logOAuthCallback.bind(oauthLogger),
  logSessionState: oauthLogger.logSessionState.bind(oauthLogger),
  logTokenOperation: oauthLogger.logTokenOperation.bind(oauthLogger),
  logMiddlewareExecution: oauthLogger.logMiddlewareExecution.bind(oauthLogger),
  logOAuthError: oauthLogger.logOAuthError.bind(oauthLogger),
  
  // Marketplace logging methods
  logListingAttempt: marketplaceLogger.logListingAttempt.bind(marketplaceLogger),
  logApprovalAttempt: marketplaceLogger.logApprovalAttempt.bind(marketplaceLogger),
  logApprovalResult: marketplaceLogger.logApprovalResult.bind(marketplaceLogger),
  logListingResult: marketplaceLogger.logListingResult.bind(marketplaceLogger),
  logSaleCreated: marketplaceLogger.logSaleCreated.bind(marketplaceLogger),
  logPurchaseAttempt: marketplaceLogger.logPurchaseAttempt.bind(marketplaceLogger),
  logPurchaseResult: marketplaceLogger.logPurchaseResult.bind(marketplaceLogger),
  logBidAttempt: marketplaceLogger.logBidAttempt.bind(marketplaceLogger),
  logBidResult: marketplaceLogger.logBidResult.bind(marketplaceLogger)
};

/**
 * Example Usage:
 * 
 * const logging = require('./logging');
 * 
 * // Initialize logging system
 * logging.initializeLogging();
 * 
 * // Add logging middleware to Express app
 * app.use(logging.loggingMiddleware());
 * 
 * // Add logging plugin to Mongoose
 * mongoose.plugin(logging.mongooseLoggingPlugin);
 * 
 * // Log events
 * logging.logError(new Error('Something went wrong'));
 * logging.logAuthAttempt('login', user, success, { ip: req.ip });
 * logging.logQuery('find', 'users', query, duration);
 * 
 * // Access specific loggers for more control
 * logging.errorLogger.logValidationError('User', errors);
 * logging.dbLogger.logMigration('v1.0.0', 'complete');
 * logging.authLogger.logSecurityEvent('bruteforce_detected');
 */
