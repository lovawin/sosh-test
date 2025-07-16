/**
 * Production Logging Configuration
 * 
 * @description Configuration settings specific to production environment
 * @module logging/config/prod.config
 * 
 * Developer Notes:
 * - More restrictive logging levels in production
 * - Disable console output
 * - Enable all security features
 * - Configure backup and retention
 */

const path = require('path');

const PROD_LOG_CONFIG = {
  // Log directory structure
  LOG_PATHS: {
    root: path.join(__dirname, '../../../logs/prod'),
    error: 'error.log',
    api: 'api.log',
    db: 'db.log',
    auth: 'auth.log'
  },

  // Log rotation settings
  ROTATION_CONFIG: {
    maxSize: '10m',
    maxFiles: '14d',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    // Ensure old logs are properly compressed
    compress: true,
    // Keep logs for 2 weeks
    maxRetentionDays: 14
  },

  // Log levels for production
  LOG_LEVELS: {
    error: 0,    // System errors, crashes
    warn: 1,     // Important warnings
    info: 2,     // Significant events
    http: 3,     // HTTP requests (limited)
    verbose: 4   // Detailed info (disabled in prod)
  },

  // Security settings
  SECURITY: {
    // Mask sensitive data in logs
    maskFields: [
      'password',
      'token',
      'apiKey',
      'secret',
      'authorization',
      'accessToken',
      'refreshToken',
      'creditCard',
      'ssn'
    ],
    // Only show partial values
    maskChar: '*',
    // Number of characters to show at start/end
    maskShowChars: 4
  },

  // Performance settings
  PERFORMANCE: {
    // Buffer log writes
    bufferLogs: true,
    // Flush interval in ms
    flushInterval: 5000,
    // Maximum buffer size
    maxBufferSize: 1000,
    // Slow query threshold (ms)
    slowQueryThreshold: 1000
  },

  // Monitoring settings
  MONITORING: {
    // Alert on errors
    errorAlert: true,
    // Alert thresholds
    thresholds: {
      diskSpace: 80,    // Alert at 80% disk usage
      fileSize: 8,      // Alert at 8MB (before rotation)
      errorRate: 10     // Alert if >10 errors/minute
    }
  },

  // Backup settings
  BACKUP: {
    // Enable automatic backups
    enabled: true,
    // Backup frequency
    frequency: '0 0 * * *',  // Daily at midnight
    // Backup retention
    retention: '30d',
    // Backup compression
    compress: true
  }
};

module.exports = PROD_LOG_CONFIG;
