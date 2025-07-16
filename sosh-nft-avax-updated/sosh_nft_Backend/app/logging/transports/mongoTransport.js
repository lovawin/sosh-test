/**
 * MongoDB Transport for Winston
 *
 * @description Custom Winston transport that writes logs directly to MongoDB
 */

const Transport = require('winston-transport');
const dbConnection = require('../../services/dbConnection');
const logger = require('../../services/logger');

class MongoTransport extends Transport {
  constructor(opts) {
    super(opts);

    // Set transport name
    this.name = 'MongoTransport';

    // Get configuration
    this.database = 'sosh';  // Match the database name from connection string
    this.collection = opts.collection;

    if (!this.collection) {
      throw new Error('MongoDB Transport requires collection configuration');
    }

    this.isConnected = false;
    this.db = null;

    // Initialize connection
    this.connectionPromise = this.connect().catch(error => {
      logger.error('Failed to initialize MongoDB transport:', {
        error: error.message,
        stack: error.stack,
        code: error.code,
        name: error.name,
        database: this.database,
        collection: this.collection
      });
      throw error;
    });
  }

  async connect() {
    try {
      logger.info('Initializing MongoDB transport connection...');

      // Get the shared mongoose connection
      const connection = await dbConnection.getConnection();
      this.db = connection.connection.db;
      
      // Immediately mark as connected since we're using an existing connection
      this.isConnected = true;
      this.connectionPromise = Promise.resolve();

      logger.info('MongoDB transport initialized successfully', {
        database: this.database,
        collection: this.collection
      });

    } catch (error) {
      logger.error('MongoDB transport initialization error:', {
        error: error.message,
        stack: error.stack,
        code: error.code,
        name: error.name,
        database: this.database,
        collection: this.collection
      });
      throw error;
    }
  }

  async log(info, callback) {
    try {
      // Wait for initial connection
      if (!this.isConnected) {
        await this.connectionPromise;
      }

      // Format document
      const document = {
        timestamp: new Date(),
        level: info.level,
        message: info.message,
        type: info.type || 'GENERAL',
        source: info.source || 'backend',
        metadata: {
          ...info,
          level: undefined,
          message: undefined,
          type: undefined,
          source: undefined
        }
      };

      // Clean up metadata
      if (Object.keys(document.metadata).length === 0) {
        delete document.metadata;
      }

      // Insert document with retry logic
      let attempts = 0;
      const maxAttempts = 3;

      while (attempts < maxAttempts) {
        try {
          const result = await this.db.collection(this.collection).insertOne(document);
          logger.info('Log written to MongoDB', {
            collection: this.collection,
            documentId: result.insertedId,
            logLevel: info.level,
            logType: info.type
          });

          // Success - emit logged event and call callback
          this.emit('logged', info);
          callback();
          return;
        } catch (error) {
          attempts++;
          logger.error('Failed to write log', {
            attempt: attempts,
            maxAttempts,
            error: error.message,
            stack: error.stack,
            code: error.code,
            collection: this.collection
          });

          if (attempts === maxAttempts) {
            throw error;
          }

          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
        }
      }
    } catch (error) {
      logger.error('Error in MongoDB transport:', {
        error: error.message,
        stack: error.stack,
        code: error.code,
        name: error.name,
        collection: this.collection
      });
      callback(error);
    }
  }
}

module.exports = MongoTransport;
