/**
 * Logging Configuration
 * 
 * @description Configures Winston logger with MongoDB transport for direct database logging
 * Each logger type writes to its own collection for better organization and querying
 */

const winston = require('winston');
const MongoTransport = require('../transports/mongoTransport');

// Collection mapping for different log types
const LOG_COLLECTIONS = {
  error: 'error_logs',
  api: 'api_logs',
  auth: 'auth_logs',
  db: 'db_logs',
  job: 'job_logs',
  blockchain: 'blockchain_logs',
  security: 'security_logs',
  system: 'system_logs',
  oauth: 'auth_logs',
  marketplace: 'marketplace_logs'
};

// Log paths configuration
const LOG_PATHS = {
  development: {
    root: 'logs/dev',
    error: 'error.log',
    api: 'api.log',
    auth: 'auth.log',
    db: 'db.log'
  },
  production: {
    root: 'logs/prod',
    error: 'error.log',
    api: 'api.log',
    auth: 'auth.log',
    db: 'db.log'
  }
};

// Log rotation configuration
const ROTATION_CONFIG = {
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d'
};

// Environment-specific MongoDB Transport configurations
const getMongoConfig = (loggerName) => {
  const env = process.env.NODE_ENV || 'development';
  
  // Default to system_logs if no specific collection is mapped
  const collection = LOG_COLLECTIONS[loggerName] || 'system_logs';
  
  const configs = {
    development: {
      uri: 'mongodb://sosh_mongo_db:27017',
      database: 'soshnew1',
      collection
    },
    production: {
      uri: process.env.MONGODB_CONNECTION_STRING || 'mongodb://sosh_mongo_db:27017',
      database: 'sosh',
      collection
    }
  };

  return {
    ...configs[env],
    level: 'info',
    handleExceptions: true,
    handleRejections: true
  };
};

// Create MongoDB transport instance
const createMongoTransport = async (loggerName) => {
  const config = getMongoConfig(loggerName);
  
  try {
    const transport = new MongoTransport(config);
    await transport.connectionPromise;  // Wait for connection to be established
    console.log(`MongoDB transport initialized for ${config.collection}`);
    return transport;
  } catch (error) {
    console.error(`Failed to initialize MongoDB transport for ${config.collection}:`, error);
    return null;
  }
};

// Create Winston logger instance
const createLogger = async (name) => {
  const transports = [];
  const env = process.env.NODE_ENV || 'development';
  
  // Add MongoDB transport with specific collection
  const mongoTransport = await createMongoTransport(name);
  if (mongoTransport) {
    transports.push(mongoTransport);
  }
  
  // Add file transport for local logging
  transports.push(
    new winston.transports.File({
      filename: `${LOG_PATHS[env].root}/${name}.log`,
      ...ROTATION_CONFIG
    })
  );
  
  // Add console transport in development
  if (env === 'development') {
    transports.push(
      new winston.transports.Console({
        format: winston.format.simple()
      })
    );
  }
  
  return winston.createLogger({
    level: 'info',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
    defaultMeta: { 
      service: name,
      environment: env
    },
    transports
  });
};

module.exports = {
  LOG_PATHS,
  ROTATION_CONFIG,
  createLogger
};
