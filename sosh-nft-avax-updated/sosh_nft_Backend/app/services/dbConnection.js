const mongoose = require('mongoose');
const { MONGODB_CONNECTION_STRING } = require('../../config/appconfig');
const logger = require('./logger');

class DatabaseConnection {
  constructor() {
    this.isConnected = false;
    this.connection = null;
    this.connectionPromise = null;
  }

  async getConnection() {
    if (this.isConnected && this.connection) {
      return this.connection;
    }

    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    this.connectionPromise = this._connect();
    return this.connectionPromise;
  }

  async _connect() {
    const maxRetries = 15;
    const retryDelay = 5000; // 5 seconds
    const initialDelay = 2000; // 2 seconds initial delay

    // Add initial delay to allow MongoDB container to fully initialize
    await new Promise(resolve => setTimeout(resolve, initialDelay));

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const maskedConnectionString = MONGODB_CONNECTION_STRING.replace(/\/\/[^:]+:[^@]+@/, '//***:***@');
        logger.info(`MongoDB connection attempt ${attempt}/${maxRetries}`, {
          connectionString: maskedConnectionString,
          attempt,
          maxRetries,
          connectionState: mongoose.connection.readyState,
          timestamp: new Date().toISOString()
        });

        if (!this.connection) {
          // Set mongoose options before connecting
          mongoose.set('strictQuery', true);
          
          // Enhanced connection options
          this.connection = await mongoose.connect(MONGODB_CONNECTION_STRING, {
            useUnifiedTopology: true,
            useNewUrlParser: true,
            serverSelectionTimeoutMS: 60000, // Increased from 30000
            connectTimeoutMS: 60000, // Increased from 30000
            socketTimeoutMS: 90000, // Increased from 45000
            maxPoolSize: 20, // Increased from 10
            minPoolSize: 5, // Increased from 1
            keepAlive: true,
            keepAliveInitialDelay: 300000,
            autoIndex: true,
            autoCreate: true,
            retryWrites: true,
            w: 'majority',
            heartbeatFrequencyMS: 10000,
            family: 4 // Use IPv4, skip trying IPv6
          });

          // Add connection ready handler
          mongoose.connection.once('ready', () => {
            logger.info('Mongoose connection is ready', {
              connectionId: mongoose.connection.id,
              host: mongoose.connection.host,
              port: mongoose.connection.port,
              name: mongoose.connection.name,
              timestamp: new Date().toISOString()
            });
          });
        }

        this.isConnected = true;
        logger.info('[DB] Database connected successfully', {
          connectionId: mongoose.connection.id,
          host: mongoose.connection.host,
          port: mongoose.connection.port,
          name: mongoose.connection.name,
          timestamp: new Date().toISOString(),
          readyState: mongoose.connection.readyState,
          modelNames: mongoose.modelNames()
        });
        
        // Set up connection event handlers
        mongoose.connection.on('disconnected', () => {
          const disconnectTime = new Date();
          logger.error('MongoDB disconnected', {
            lastConnectedAt: disconnectTime,
            connectionState: mongoose.connection.readyState,
            host: mongoose.connection.host,
            timestamp: disconnectTime.toISOString(),
            models: mongoose.modelNames(),
            pendingQueries: mongoose.connection.pendingQueries
          });
          this.isConnected = false;
          
          // Attempt to reconnect after disconnection
          setTimeout(() => {
            if (!this.isConnected) {
              logger.info('Attempting to reconnect after disconnection...');
              this._connect().catch(err => {
                logger.error('Reconnection attempt failed:', {
                  error: err.message,
                  stack: err.stack
                });
              });
            }
          }, retryDelay);
        });

        mongoose.connection.on('error', (err) => {
          logger.error('MongoDB connection error:', {
            error: err.message,
            stack: err.stack,
            code: err.code,
            name: err.name,
            connectionState: mongoose.connection.readyState,
            host: mongoose.connection.host,
            timestamp: new Date().toISOString(),
            models: mongoose.modelNames(),
            pendingQueries: mongoose.connection.pendingQueries
          });
          this.isConnected = false;

          // Force close connection on critical errors to trigger reconnect
          if (err.name === 'MongoNetworkError' || err.name === 'MongoServerSelectionError') {
            logger.info('Forcing connection close to trigger reconnect...');
            mongoose.connection.close(true).catch(closeErr => {
              logger.error('Error closing connection:', {
                error: closeErr.message
              });
            });
          }
        });

        mongoose.connection.on('reconnected', () => {
          logger.info('MongoDB reconnected', {
            connectionId: mongoose.connection.id,
            host: mongoose.connection.host,
            port: mongoose.connection.port,
            name: mongoose.connection.name
          });
          this.isConnected = true;
        });

        return this.connection;

      } catch (error) {
        logger.error(`MongoDB connection attempt ${attempt} failed:`, {
          error: error.message,
          stack: error.stack,
          code: error.code,
          name: error.name,
          attempt,
          maxRetries,
          connectionState: mongoose.connection?.readyState,
          host: mongoose.connection?.host
        });

        if (attempt === maxRetries) {
          logger.error('Max retries reached, giving up MongoDB connection', {
            totalAttempts: maxRetries,
            lastError: error.message,
            connectionString: MONGODB_CONNECTION_STRING.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'), // Hide credentials if any
            connectionState: mongoose.connection?.readyState
          });
          throw error;
        }

        logger.info(`Waiting ${retryDelay}ms before retry attempt ${attempt + 1}/${maxRetries}...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
  }
}

// Export a singleton instance
const dbConnection = new DatabaseConnection();
module.exports = dbConnection;
