/**
 * Log Formatter
 * 
 * @description Standardizes log format across all loggers
 * @module logging/formatters/logFormatter
 * 
 * Developer Notes:
 * - Add new formatters for specific log types
 * - Ensure sensitive data is masked
 * - Consider adding correlation IDs for request tracking
 * - Use consistent date format across all logs
 */

const maskSensitiveData = (obj) => {
  const maskedFields = ['password', 'token', 'apiKey', 'secret', 'authorization'];
  const masked = { ...obj };

  for (const key in masked) {
    if (maskedFields.includes(key.toLowerCase())) {
      masked[key] = '********';
    } else if (typeof masked[key] === 'object' && masked[key] !== null) {
      masked[key] = maskSensitiveData(masked[key]);
    }
  }

  return masked;
};

/**
 * Format error logs with stack trace and context
 * @param {Error} error - Error object
 * @param {Object} context - Additional context information
 */
const formatError = (error, context = {}) => {
  // Process context to remove large fields and limit sizes
  const processedContext = {};
  for (const [key, value] of Object.entries(context)) {
    // Skip known large fields
    if (['response', 'request', 'body', 'headers', 'error'].includes(key)) continue;
    
    // Process value based on type
    if (typeof value === 'string') {
      processedContext[key] = value.substring(0, 500);
    } else if (Array.isArray(value)) {
      processedContext[key] = value.slice(0, 5);
    } else if (value instanceof Error) {
      processedContext[key] = {
        message: value.message,
        type: value.constructor.name
      };
    } else if (typeof value === 'object' && value !== null) {
      processedContext[key] = Object.fromEntries(
        Object.entries(value)
          .slice(0, 10)
          .map(([k, v]) => [k, typeof v === 'string' ? v.substring(0, 100) : v])
      );
    } else {
      processedContext[key] = value;
    }
  }

  return {
    timestamp: new Date().toISOString(),
    level: 'ERROR',
    message: error.message?.substring(0, 1000),
    stack: error.stack?.split('\n').slice(0, 3).join('\n'),
    code: error.code,
    type: error.constructor.name,
    ...maskSensitiveData(processedContext)
  };
};

/**
 * Format API request/response logs
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {number} duration - Request duration in milliseconds
 */
const formatAPILog = (req, res, duration) => {
  const formatted = {
    timestamp: new Date().toISOString(),
    level: 'INFO',
    type: 'API_REQUEST',
    method: req.method,
    url: req.originalUrl || req.url,
    duration: duration || 0,
    userAgent: req.headers?.['user-agent'],
    ip: req.ip,
    userId: req.user?.id,
    context: req.context || {},
    headers: maskSensitiveData(req.headers || {})
  };

  if (res) {
    formatted.status = res.statusCode;
    formatted.responseTime = duration;
  }

  return JSON.stringify(formatted);
};

/**
 * Format database operation logs
 * @param {string} operation - Database operation type
 * @param {string} collection - Collection/table name
 * @param {Object} details - Operation details
 */
const formatDBLog = (operation, collection, details, duration) => {
  const formatted = {
    timestamp: new Date().toISOString(),
    level: 'DEBUG',
    type: 'DB_OPERATION',
    operation,
    collection,
    duration: duration || 0,
    ...maskSensitiveData(details || {})
  };

  return JSON.stringify(formatted);
};

/**
 * Format authentication logs
 * @param {string} event - Auth event type (login, logout, etc.)
 * @param {Object} details - Event details
 */
const formatAuthLog = (event, details) => {
  const formatted = {
    timestamp: new Date().toISOString(),
    level: 'INFO',
    type: 'AUTH_EVENT',
    event,
    ...maskSensitiveData(details || {})
  };

  return JSON.stringify(formatted);
};

/**
 * Format marketplace logs
 * @param {Object} data - Marketplace event data
 * @param {Object} context - Additional context information
 */
const formatMarketplaceLog = (data, context = {}) => {
  // Process data to avoid circular references and limit size
  const formatted = {
    timestamp: new Date().toISOString(),
    level: data.level || 'INFO',
    type: data.type || 'MARKETPLACE_EVENT',
    ...maskSensitiveData(data),
    ...maskSensitiveData(context)
  };

  // Remove undefined fields
  Object.keys(formatted).forEach(key => 
    formatted[key] === undefined && delete formatted[key]
  );

  return formatted;
};

/**
 * Format OAuth-related logs
 * @param {Object} data - OAuth event data
 * @param {Object} context - Additional context information
 */
const formatOAuthLog = (data, context = {}) => {
  // Process session data to avoid circular references and limit size
  let sessionData = {};
  if (data.sessionData) {
    try {
      // Extract key session properties
      const { id, cookie, passport, oauth, userid } = data.sessionData;
      sessionData = {
        id,
        cookie: cookie ? { 
          originalMaxAge: cookie.originalMaxAge,
          expires: cookie.expires,
          secure: cookie.secure,
          httpOnly: cookie.httpOnly,
          path: cookie.path,
          sameSite: cookie.sameSite
        } : undefined,
        hasPassport: !!passport,
        hasOAuth: !!oauth,
        userid
      };
    } catch (error) {
      sessionData = { error: 'Failed to process session data' };
    }
  }

  const formatted = {
    timestamp: new Date().toISOString(),
    level: data.level || 'INFO',
    type: data.type || 'OAUTH_EVENT',
    provider: data.provider,
    action: data.action,
    success: data.success,
    sessionID: data.sessionID,
    requestID: context.requestID || data.requestID,
    path: context.path || data.path,
    method: context.method || data.method,
    sessionData: sessionData,
    ...maskSensitiveData(context)
  };

  // Remove undefined fields
  Object.keys(formatted).forEach(key => 
    formatted[key] === undefined && delete formatted[key]
  );

  return formatted;
};

/**
 * Format general application logs
 * @param {string} level - Log level
 * @param {string} message - Log message
 * @param {Object} details - Additional details
 */
const formatAppLog = (level, message, details = {}) => {
  const formatted = {
    timestamp: new Date().toISOString(),
    level,
    type: 'APP_LOG',
    message,
    ...maskSensitiveData(details)
  };

  return JSON.stringify(formatted);
};

module.exports = {
  formatError,
  formatAPILog,
  formatDBLog,
  formatAuthLog,
  formatAppLog,
  formatOAuthLog,
  formatMarketplaceLog,
  maskSensitiveData
};
