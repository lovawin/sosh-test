/**
 * System Logger Handler
 * 
 * @description Handles logging for system health, metrics, and general application state
 * @module logging/handlers/systemLogger
 */

const winston = require('winston');
require('winston-daily-rotate-file');
const { createLogger } = require('../config/logConfig');
const { formatAppLog } = require('../formatters/logFormatter');

class SystemLogger {
  constructor() {
    console.log('Constructing SystemLogger...');
    this.ready = false;
    this.initPromise = this.initialize();
  }

  async initialize() {
    console.log('Initializing system logger...');
    try {
      this.logger = await createLogger('system');
      this.ready = true;
      console.log('System logger initialized successfully');
    } catch (error) {
      console.error('Failed to initialize system logger:', error);
      throw error;
    }
  }

  async logSystemStartup(details) {
    await this.initPromise;
    const logData = {
      type: 'SYSTEM_STARTUP',
      ...details,
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      env: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    };

    this.logger.info(logData);
    if (process.env.NODE_ENV !== 'production') {
      console.log('[SYSTEM] Application startup');
    }
  }

  async logSystemShutdown(reason, details = {}) {
    await this.initPromise;
    const logData = {
      type: 'SYSTEM_SHUTDOWN',
      reason,
      ...details,
      timestamp: new Date().toISOString()
    };

    this.logger.info(logData);
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[SYSTEM] Application shutdown - Reason: ${reason}`);
    }
  }

  async logResourceMetrics() {
    await this.initPromise;
    const metrics = {
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      uptime: process.uptime(),
      resourceUsage: process.resourceUsage()
    };

    const logData = {
      type: 'RESOURCE_METRICS',
      ...metrics,
      timestamp: new Date().toISOString()
    };

    this.logger.info(logData);
    if (process.env.NODE_ENV !== 'production') {
      console.log('[SYSTEM] Resource metrics logged');
    }
  }

  async logDatabaseMetrics(metrics) {
    await this.initPromise;
    const logData = {
      type: 'DATABASE_METRICS',
      ...metrics,
      timestamp: new Date().toISOString()
    };

    this.logger.info(logData);
    if (process.env.NODE_ENV !== 'production') {
      console.log('[SYSTEM] Database metrics logged');
    }
  }

  async logServiceStatus(serviceName, status, details = {}) {
    await this.initPromise;
    const logData = {
      type: 'SERVICE_STATUS',
      service: serviceName,
      status,
      ...details,
      timestamp: new Date().toISOString()
    };

    this.logger.info(logData);
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[SYSTEM] Service ${serviceName} status: ${status}`);
    }
  }

  async logConfigChange(component, changes, user = null) {
    await this.initPromise;
    const logData = {
      type: 'CONFIG_CHANGE',
      component,
      changes,
      user,
      timestamp: new Date().toISOString()
    };

    this.logger.info(logData);
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[SYSTEM] Configuration changed for ${component}`);
    }
  }

  async logSystemError(error, context = {}) {
    await this.initPromise;
    const logData = {
      type: 'SYSTEM_ERROR',
      error: {
        message: error.message,
        code: error.code,
        stack: error.stack
      },
      context,
      timestamp: new Date().toISOString()
    };

    this.logger.error(logData);
    if (process.env.NODE_ENV !== 'production') {
      console.error(`[SYSTEM ERROR] ${error.message}`);
      if (error.stack) {
        console.error(error.stack);
      }
    }
  }

  async logHealthCheck(checks) {
    await this.initPromise;
    const logData = {
      type: 'HEALTH_CHECK',
      checks,
      overallStatus: Object.values(checks).every(check => check.status === 'healthy') ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString()
    };

    this.logger.info(logData);
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[SYSTEM] Health check - Status: ${logData.overallStatus}`);
    }
  }

  async logCacheMetrics(metrics) {
    await this.initPromise;
    const logData = {
      type: 'CACHE_METRICS',
      ...metrics,
      timestamp: new Date().toISOString()
    };

    this.logger.info(logData);
    if (process.env.NODE_ENV !== 'production') {
      console.log('[SYSTEM] Cache metrics logged');
    }
  }
}

module.exports = new SystemLogger();
