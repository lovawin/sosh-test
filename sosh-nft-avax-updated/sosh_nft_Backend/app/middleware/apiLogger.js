/**
 * API Logger Middleware
 * 
 * @description Express middleware for logging API requests and responses using the error logger factory
 */

const errorLoggerFactory = require('../logging/handlers/errorLogger');

/**
 * Create API logging middleware
 */
const createApiLoggerMiddleware = () => {
  return async (req, res, next) => {
    const startTime = Date.now();
    req.id = Math.random().toString(36).substring(7);

    try {
      // Get logger instance
      const logger = await errorLoggerFactory.getInstance();

      // Log request
      await logger.logInfo(`${req.method} ${req.originalUrl || req.url}`, {
        type: 'API_REQUEST',
        requestId: req.id,
        method: req.method,
        url: req.originalUrl || req.url,
        query: req.query,
        body: req.body,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        userId: req.user?.id
      });

      // Capture response
      const originalJson = res.json;
      res.json = async function(body) {
        const duration = Date.now() - startTime;
        res.body = body;

        try {
          await logger.logInfo(`${req.method} ${req.originalUrl || req.url} completed`, {
            type: 'API_RESPONSE',
            requestId: req.id,
            method: req.method,
            url: req.originalUrl || req.url,
            statusCode: res.statusCode,
            duration,
            userId: req.user?.id
          });
        } catch (err) {
          console.log(`${req.method} ${req.originalUrl || req.url} - ${res.statusCode} (${duration}ms)`);
        }

        return originalJson.call(this, body);
      };

      // Handle errors
      const errorHandler = async (err) => {
        const duration = Date.now() - startTime;
        try {
          await logger.logError(err, {
            type: 'API_ERROR',
            requestId: req.id,
            method: req.method,
            url: req.originalUrl || req.url,
            statusCode: res.statusCode,
            duration,
            userId: req.user?.id
          });
        } catch (logErr) {
          console.error(`[API ERROR] ${req.method} ${req.originalUrl || req.url} - ${err.message}`);
        }
      };

      res.on('error', errorHandler);
      res.on('close', async () => {
        if (!res.body) {
          const duration = Date.now() - startTime;
          try {
            await logger.logInfo(`${req.method} ${req.originalUrl || req.url} closed`, {
              type: 'API_CLOSE',
              requestId: req.id,
              method: req.method,
              url: req.originalUrl || req.url,
              statusCode: res.statusCode,
              duration,
              userId: req.user?.id
            });
          } catch (err) {
            console.log(`${req.method} ${req.originalUrl || req.url} closed - ${res.statusCode} (${duration}ms)`);
          }
        }
      });

    } catch (err) {
      // Fallback to console if logger isn't available
      console.log(`${req.method} ${req.originalUrl || req.url}`);
    }

    next();
  };
};

module.exports = createApiLoggerMiddleware;
