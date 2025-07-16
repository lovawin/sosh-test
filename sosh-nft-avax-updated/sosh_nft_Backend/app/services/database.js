const mongoose = require('mongoose');
const dbConnection = require('./dbConnection');
const logger = require('./logger');

module.exports = async function () {
  const maxRetries = 5;
  const retryDelay = 5000; // 5 seconds

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      logger.info(`Database initialization attempt ${attempt}/${maxRetries}`);
      
      // Get the shared connection
      await dbConnection.getConnection();
      
      logger.info('[DB] Database initialized successfully', {
        connectionId: mongoose.connection.id,
        host: mongoose.connection.host,
        port: mongoose.connection.port,
        name: mongoose.connection.name,
        readyState: mongoose.connection.readyState
      });

      // Additional connection event handlers specific to the main app
      mongoose.connection.on('connected', () => {
        logger.info('Main app database connection established', {
          connectionId: mongoose.connection.id,
          host: mongoose.connection.host,
          readyState: mongoose.connection.readyState
        });
      });

      mongoose.connection.on('error', (err) => {
        logger.error('Main app database connection error:', {
          error: err.message,
          stack: err.stack,
          code: err.code,
          name: err.name,
          connectionId: mongoose.connection.id,
          host: mongoose.connection.host,
          readyState: mongoose.connection.readyState
        });
      });

      mongoose.connection.on('disconnected', () => {
        logger.error('Main app database connection disconnected', {
          lastConnectionId: mongoose.connection.id,
          lastHost: mongoose.connection.host,
          lastReadyState: mongoose.connection.readyState,
          timestamp: new Date()
        });
      });

      // Handle graceful shutdown
      process.on('SIGINT', () => {
        mongoose.connection.close(() => {
          logger.error('Database connection closed due to application termination', {
            lastConnectionId: mongoose.connection.id,
            lastHost: mongoose.connection.host,
            lastReadyState: mongoose.connection.readyState,
            timestamp: new Date()
          });
          process.exit(0);
        });
      });

      break; // Connection successful, exit retry loop
      
    } catch (error) {
      logger.error(`Database initialization attempt ${attempt} failed:`, {
        error: error.message,
        stack: error.stack,
        code: error.code,
        name: error.name,
        attempt,
        maxRetries,
        connectionState: mongoose.connection?.readyState
      });
      
      if (attempt === maxRetries) {
        logger.error('Max retries reached, giving up database initialization', {
          totalAttempts: maxRetries,
          lastError: error.message,
          lastErrorStack: error.stack,
          lastErrorCode: error.code,
          lastErrorName: error.name,
          finalConnectionState: mongoose.connection?.readyState
        });
        throw error;
      }
      
      logger.info(`Waiting ${retryDelay}ms before retry attempt ${attempt + 1}/${maxRetries}...`);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }
};
