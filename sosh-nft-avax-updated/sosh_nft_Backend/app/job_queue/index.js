const Queue = require('bull');
const { createBullBoard } = require('@bull-board/api');
const { BullAdapter } = require('@bull-board/api/bullAdapter');
const { ExpressAdapter } = require('@bull-board/express');
const { REDIS_HOST, REDIS_PORT, REDIS_PASS } = require('../../config/appconfig');
const logger = require('../services/logger');

const serverAdapter = new ExpressAdapter();
let queues = null;

// Redis configuration
const redisConfig = {
    redis: {
        host: REDIS_HOST,
        port: REDIS_PORT,
        retryStrategy(times) {
            const delay = Math.min(times * 100, 5000);
            logger.debug(`Bull Redis retry attempt ${times}, delay: ${delay}ms`);
            return delay;
        }
    },
    defaultJobOptions: {
        removeOnComplete: true,
        removeOnFail: true,
        attempts: 3
    }
};

async function initializeQueues() {
    if (queues) return queues;

    try {
        logger.debug('Creating fetchSaleTransactionsQ...');
        const fetchSaleTransactionsQ = new Queue('fetchSaleTransactionsQ', {
            ...redisConfig,
            limiter: { max: 1, duration: 60000 }
        });

        logger.debug('Creating fundsDistributionQ...');
        const fundsDistributionQ = new Queue('fundsDistributionQ', {
            ...redisConfig,
            limiter: { max: 1, duration: 61000 }
        });

        logger.debug('Creating erc20TransfersQ...');
        const erc20TransfersQ = new Queue('erc20TransfersQ', redisConfig);

        logger.debug('Creating etherTransfersQ...');
        const etherTransfersQ = new Queue('etherTransfersQ', redisConfig);

        // Setup error handlers for all queues
        [fetchSaleTransactionsQ, fundsDistributionQ, erc20TransfersQ, etherTransfersQ].forEach(queue => {
            queue.on('failed', (job, err) => {
                logger.error(`Job ${job.id} failed:`, err);
            });

            queue.on('error', err => {
                logger.error('Queue error:', err);
            });

            queue.on('completed', job => {
                logger.debug(`Job ${job.id} completed successfully`);
            });

            queue.on('active', job => {
                logger.debug(`Job ${job.id} started processing`);
            });

            queue.on('stalled', job => {
                logger.warn(`Job ${job.id} has stalled`);
            });
        });

        logger.debug('Setting up bull-board...');
        createBullBoard({
            queues: [
                new BullAdapter(fetchSaleTransactionsQ),
                new BullAdapter(fundsDistributionQ),
                new BullAdapter(erc20TransfersQ),
                new BullAdapter(etherTransfersQ)
            ],
            serverAdapter
        });

        queues = {
            fetchSaleTransactionsQ,
            fundsDistributionQ,
            etherTransfersQ,
            erc20TransfersQ
        };

        logger.debug('Job queues initialized successfully');
        return queues;
    } catch (error) {
        logger.error('Failed to initialize job queues:', error);
        throw error;
    }
}

module.exports = {
    initializeQueues,
    serverAdapter,
    getQueues: () => queues
};
