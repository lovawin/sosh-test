const Redis = require('ioredis');
const logger = require('../services/logger');
const { REDIS_HOST, REDIS_PORT } = require('../../config/appconfig');

let client = null;

module.exports = {
  connected: false,
  getClient: async () => {
    if (!client) {
      logger.debug('Initializing Redis client with config:', {
        host: REDIS_HOST,
        port: REDIS_PORT
      });

      client = new Redis({
        host: REDIS_HOST,
        port: REDIS_PORT,
        retryStrategy(times) {
          const delay = Math.min(times * 100, 3000);
          logger.debug(`Redis retry attempt ${times}, delay: ${delay}ms`);
          return delay;
        },
        maxRetriesPerRequest: 5,
        enableReadyCheck: false,
        autoResubscribe: true,
        connectTimeout: 30000,
        commandTimeout: 15000,
        lazyConnect: false
      });

      // Connection state logging
      client.on('connect', () => {
        logger.debug('Redis client connecting...');
      });

      client.on('ready', () => {
        logger.debug('Redis client ready');
        module.exports.connected = true;
      });

      client.on('reconnecting', () => {
        logger.debug('Redis client reconnecting...');
        module.exports.connected = false;
      });

      client.on('close', () => {
        logger.debug('Redis connection closed');
        module.exports.connected = false;
      });

      client.on('end', () => {
        logger.debug('Redis connection ended');
        module.exports.connected = false;
      });

      client.on('error', (error) => {
        logger.error('Redis error occurred:', error);
        module.exports.connected = false;
      });

      // Monitor Redis commands in production for debugging
      if (process.env.NODE_ENV === 'production') {
        logger.debug('Enabling Redis command monitoring');
        client.monitor((err, monitor) => {
          if (err) {
            logger.error('Failed to enable Redis monitoring:', err);
            return;
          }
          monitor.on('monitor', (time, args, source) => {
            logger.debug('Redis command:', {
              time,
              command: args[0],
              args: args.slice(1),
              source
            });
          });
        });
      }

      // Wait for connection to be ready
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Redis connection timeout'));
        }, 30000);

        client.on('ready', () => {
          logger.debug('Redis connection ready');
          module.exports.connected = true;
          clearTimeout(timeout);
          resolve();
        });

        client.on('error', (error) => {
          logger.error('Redis error occurred:', error);
          module.exports.connected = false;
          clearTimeout(timeout);
          reject(error);
        });

        // If client is already ready, resolve immediately
        if (client.status === 'ready') {
          logger.debug('Redis already ready');
          module.exports.connected = true;
          clearTimeout(timeout);
          resolve();
        }
      });

      logger.debug('Redis client initialization complete');
    }
    return client;
  }
};
