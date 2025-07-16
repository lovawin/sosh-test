/**
 * Security Logger Handler
 * 
 * @description Handles logging for security-related events
 * @module logging/handlers/securityLogger
 */

const winston = require('winston');
require('winston-daily-rotate-file');
const { createLogger } = require('../config/logConfig');
const { formatSecurityLog } = require('../formatters/logFormatter');

class SecurityLogger {
  constructor() {
    console.log('Constructing SecurityLogger...');
    this.ready = false;
    this.initPromise = this.initialize();
  }

  async initialize() {
    console.log('Initializing security logger...');
    try {
      this.logger = await createLogger('security');
      this.ready = true;
      console.log('Security logger initialized successfully');
    } catch (error) {
      console.error('Failed to initialize security logger:', error);
      throw error;
    }
  }

  async logSecurityEvent(type, details = {}, severity = 'info') {
    await this.initPromise;
    const logData = {
      type,
      severity,
      ...details,
      timestamp: new Date().toISOString()
    };

    switch (severity.toLowerCase()) {
      case 'error':
        this.logger.error(logData);
        break;
      case 'warn':
        this.logger.warn(logData);
        break;
      default:
        this.logger.info(logData);
    }

    if (process.env.NODE_ENV !== 'production') {
      console.log(`[SECURITY] ${type} - Severity: ${severity}`);
      if (Object.keys(details).length > 0) {
        console.log('Details:', details);
      }
    }
  }

  async logAuthAttempt(userId, success, details = {}) {
    await this.initPromise;
    const logData = {
      type: 'AUTH_ATTEMPT',
      userId,
      success,
      ...details,
      timestamp: new Date().toISOString()
    };

    if (success) {
      this.logger.info(logData);
    } else {
      this.logger.warn(logData);
    }

    if (process.env.NODE_ENV !== 'production') {
      console.log(`[SECURITY] Auth attempt by ${userId} - ${success ? 'Success' : 'Failed'}`);
    }
  }

  async logAccessAttempt(userId, resource, allowed, details = {}) {
    await this.initPromise;
    const logData = {
      type: 'ACCESS_ATTEMPT',
      userId,
      resource,
      allowed,
      ...details,
      timestamp: new Date().toISOString()
    };

    if (allowed) {
      this.logger.info(logData);
    } else {
      this.logger.warn(logData);
    }

    if (process.env.NODE_ENV !== 'production') {
      console.log(`[SECURITY] Access attempt to ${resource} by ${userId} - ${allowed ? 'Allowed' : 'Denied'}`);
    }
  }

  async logSecurityAlert(message, severity = 'warn', details = {}) {
    await this.initPromise;
    const logData = {
      type: 'SECURITY_ALERT',
      message,
      severity,
      ...details,
      timestamp: new Date().toISOString()
    };

    switch (severity.toLowerCase()) {
      case 'error':
        this.logger.error(logData);
        break;
      case 'warn':
        this.logger.warn(logData);
        break;
      default:
        this.logger.info(logData);
    }

    if (process.env.NODE_ENV !== 'production') {
      console.log(`[SECURITY ALERT] ${message} - Severity: ${severity}`);
      if (Object.keys(details).length > 0) {
        console.log('Details:', details);
      }
    }
  }
}

module.exports = new SecurityLogger();
