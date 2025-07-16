/**
 * Frontend Error Logger Service
 * 
 * @description Handles error logging from frontend to backend logging system
 */

import getAxiosInst from "./axios";

const API_SUB_ENDPOINT = "/logging";

class ErrorLogger {
  constructor() {
    this.axios = getAxiosInst();
  }

  /**
   * Log an error to the backend logging system
   * @param {Error} error - The error object
   * @param {Object} context - Additional context about the error
   */
  async logError(error, context = {}) {
    try {
      const errorLog = {
        timestamp: new Date().toISOString(),
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack,
          code: error.code
        },
        type: context.type || 'FRONTEND_ERROR',
        subType: context.subType,
        source: 'frontend',
        context: {
          url: window.location.href,
          userAgent: navigator.userAgent,
          ...context.context
        }
      };

      // Clean up undefined values
      Object.keys(errorLog).forEach(key => 
        errorLog[key] === undefined && delete errorLog[key]
      );

      // Send to backend logging endpoint
      await this.axios.post(`${API_SUB_ENDPOINT}/error`, errorLog);
    } catch (loggingError) {
      // Fallback to console if logging fails
      console.error('Failed to log error:', loggingError);
      console.error('Original error:', error);
    }
  }

  /**
   * Log a warning to the backend logging system
   * @param {string} message - Warning message
   * @param {Object} context - Additional context
   */
  async logWarning(message, context = {}) {
    try {
      const warningLog = {
        timestamp: new Date().toISOString(),
        message,
        type: 'WARNING',
        source: 'frontend',
        context: {
          url: window.location.href,
          ...context
        }
      };

      await this.axios.post(`${API_SUB_ENDPOINT}/warning`, warningLog);
    } catch (error) {
      console.warn('Failed to log warning:', error);
      console.warn('Original warning:', message);
    }
  }
}

// Export singleton instance
export default new ErrorLogger();
