const winston = require('winston');
require('winston-daily-rotate-file');
const { createLogger } = require('../config/logConfig');
const { formatAuthLog, maskSensitiveData } = require('../formatters/logFormatter');

class DBLogger {
  constructor() {
    this.logger = null;
    this.initialized = false;
    this.initPromise = this.initialize();
  }

  async initialize() {
    try {
      this.logger = await createLogger('db');
      this.initialized = true;
      console.log('DB Logger initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize DB Logger:', error);
      // Create a fallback console logger
      this.logger = {
        info: (data) => console.log('[DB]', data),
        error: (data) => console.error('[DB ERROR]', data),
        warn: (data) => console.warn('[DB WARN]', data)
      };
      this.initialized = true;
      return false;
    }
  }

  async ensureInitialized() {
    if (!this.initialized) {
      await this.initPromise;
    }
    return this.initialized;
  }

  async logQuery(operation, collection, details, duration) {
    await this.ensureInitialized();
    
    // Handle the old format for backward compatibility
    if (arguments.length === 2) {
      const query = arguments[0];
      const queryDuration = arguments[1];
      const maskedQuery = maskSensitiveData(query);
      
      try {
        this.logger.info({
          type: 'QUERY',
          query: maskedQuery,
          duration: queryDuration
        });
      } catch (error) {
        console.error('Error logging query:', error);
        console.log(`[DB] Query (${queryDuration}ms): ${maskedQuery}`);
      }

      if (process.env.NODE_ENV !== 'production') {
        console.log(`[DB] Query (${queryDuration}ms): ${maskedQuery}`);
      }
      return;
    }

    // Handle the new format with more detailed logging
    const queryInfo = {
      operation,
      collection,
      details: maskSensitiveData(details),
      duration
    };

    try {
      this.logger.info({
        type: 'QUERY',
        ...queryInfo
      });
    } catch (error) {
      console.error('Error logging detailed query:', error);
      console.log(`[DB] ${operation} on ${collection} (${duration}ms): ${JSON.stringify(maskSensitiveData(details))}`);
    }

    if (process.env.NODE_ENV !== 'production') {
      console.log(`[DB] ${operation} on ${collection} (${duration}ms): ${JSON.stringify(maskSensitiveData(details))}`);
    }
  }

  async logError(error, query) {
    await this.ensureInitialized();
    
    const maskedQuery = query ? maskSensitiveData(query) : null;
    
    try {
      this.logger.error({
        type: 'DB_ERROR',
        error: {
          message: error.message,
          stack: error.stack,
          code: error.code
        },
        query: maskedQuery
      });
    } catch (logError) {
      console.error('Error logging DB error:', logError);
      console.error(`[DB ERROR] ${error.message}`);
    }

    if (process.env.NODE_ENV !== 'production') {
      console.error(`[DB ERROR] ${error.message}`);
      if (maskedQuery) {
        console.error(`Query: ${maskedQuery}`);
      }
      if (error.stack) {
        console.error(error.stack);
      }
    }
  }

  async logConnection(event) {
    await this.ensureInitialized();
    
    try {
      this.logger.info({
        type: 'DB_CONNECTION',
        event
      });
    } catch (error) {
      console.error('Error logging connection event:', error);
      console.log(`[DB] Connection ${event}`);
    }

    if (process.env.NODE_ENV !== 'production') {
      console.log(`[DB] Connection ${event}`);
    }
  }

  mongoosePlugin() {
    const logger = this;
    return function(schema) {
      // Log queries
      ['find', 'findOne', 'findOneAndUpdate', 'findOneAndDelete'].forEach(method => {
        schema.pre(method, function() {
          this._queryStartTime = Date.now();
        });

        schema.post(method, async function() {
          const duration = Date.now() - this._queryStartTime;
          try {
            await logger.logQuery(this.getQuery ? this.getQuery() : method, duration);
          } catch (error) {
            console.error(`Error logging mongoose ${method} query:`, error);
          }
        });
      });

      // Log document saves
      schema.pre('save', function() {
        this._saveStartTime = Date.now();
      });

      schema.post('save', async function() {
        const duration = Date.now() - this._saveStartTime;
        try {
          await logger.logQuery('Document save', duration);
        } catch (error) {
          console.error('Error logging document save:', error);
        }
      });

      // Log errors
      schema.on('error', async function(err) {
        try {
          await logger.logError(err);
        } catch (error) {
          console.error('Error logging schema error:', error);
        }
      });
    };
  }
}

// Create a singleton instance
const dbLogger = new DBLogger();

// Export the singleton
module.exports = dbLogger;
