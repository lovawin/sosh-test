// eslint-disable-next-line import/no-extraneous-dependencies
const Redis = require('ioredis');
const logger = require('./logger');
const { REDIS_HOST, REDIS_PORT, REDIS_PASS } = require('../../config/appconfig');

class RedisService {
  constructor() {
    this.client = new Redis({
      host: REDIS_HOST,
      port: REDIS_PORT,
      username: 'default',
      maxRetriesPerRequest: null,
      enableOfflineQueue: true,
      enableReadyCheck: false,
      tls: false,
      retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
      }
    });

    this.client.on('ready', () => {
      logger.info('redis is ready');
    });

    this.client.on('connect', () => {
      logger.info('redis connection established');
    });

    this.client.on('reconnecting', () => {
      logger.info('redis reconnecting');
    });

    this.client.on('error', (error) => {
      logger.error('redis error occured', error);
    });

    this.client.on('end', () => {
      logger.error('redis connection ended');
    });
  }

  getClient() {
    return this.client;
  }
}

module.exports = new RedisService();
