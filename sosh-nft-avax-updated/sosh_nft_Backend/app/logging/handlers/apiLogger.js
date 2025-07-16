/**
 * API Logger Handler
 * 
 * @description Handles logging for all API requests and responses
 * @module logging/handlers/apiLogger
 */

const winston = require('winston');
require('winston-daily-rotate-file');
const { createLogger } = require('../config/logConfig');
const { formatAPILog } = require('../formatters/logFormatter');

class APILogger {
  constructor() {
    console.log('Constructing APILogger...');
    this.ready = false;
    this.initPromise = this.initialize();
  }

  async initialize() {
    console.log('Initializing API logger...');
    try {
      this.logger = await createLogger('api');
      this.ready = true;
      console.log('API logger initialized successfully');
    } catch (error) {
      console.error('Failed to initialize API logger:', error);
      throw error;
    }
  }

  middleware() {
    return async (req, res, next) => {
      await this.initPromise;
      const startTime = Date.now();
      req.id = Math.random().toString(36).substring(7);
      await this.logRequest(req);

      const originalJson = res.json;
      res.json = async function(body) {
        const duration = Date.now() - startTime;
        res.body = body;
        await this.logResponse(req, res, duration);
        originalJson.call(this, body);
      };

      const errorHandler = async (err) => {
        const duration = Date.now() - startTime;
        await this.logError(req, res, err, duration);
      };

      res.on('error', errorHandler);
      res.on('close', async () => {
        if (!res.body) {
          const duration = Date.now() - startTime;
          await this.logResponse(req, res, duration);
        }
      });

      next();
    };
  }

  async logRequest(req) {
    await this.initPromise;
    const formattedLog = formatAPILog(req);
    this.logger.info(formattedLog);
    
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[API] ${req.method} ${req.originalUrl || req.url}`);
    }
  }

  async logResponse(req, res, duration) {
    await this.initPromise;
    const formattedLog = formatAPILog(req, res, duration);
    this.logger.info(formattedLog);
    
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[API] ${req.method} ${req.originalUrl || req.url} - ${res.statusCode} (${duration}ms)`);
    }
  }

  async logError(req, res, error, duration) {
    await this.initPromise;
    const formattedLog = formatAPILog(req, res, duration);
    const errorDetails = {
      ...JSON.parse(formattedLog),
      error: {
        message: error.message,
        stack: error.stack,
        code: error.code
      }
    };
    
    this.logger.error(JSON.stringify(errorDetails));
    
    if (process.env.NODE_ENV !== 'production') {
      console.error(`[API ERROR] ${req.method} ${req.originalUrl || req.url} - ${error.message}`);
      if (error.stack) {
        console.error(error.stack);
      }
    }
  }

  async logRateLimit(req) {
    await this.initPromise;
    this.logger.warn({
      type: 'RATE_LIMIT',
      requestId: req.id,
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      userId: req.user?.id
    });
  }
}

module.exports = new APILogger();
