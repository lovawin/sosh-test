const logger = require('../services/logger');
// const { QUEUE_CONCURRENCY } = require('../../config/appconfig');
const fetchSaleTransactionsWorker = require('./workers/fetch_trasanctions_worker');
const fundsDistributionWorkers = require('./workers/funds_distribution_worker');
const erc20TransfersWorker = require('./workers/process_ERC20_transfers');
const etherTransfersWorker = require('./workers/process_Ether_transfers');
const { initializeQueues } = require('.');

const QUEUE_CONCURRENCY = 1;
module.exports = {
  startWorkers: async () => {
    logger.info('Job Queue workers is being started...');

    const queues = await initializeQueues();
    if (!queues) {
      throw new Error('Failed to initialize queues');
    }

    const {
      fetchSaleTransactionsQ,
      fundsDistributionQ,
      etherTransfersQ,
      erc20TransfersQ,
    } = queues;

    if (fetchSaleTransactionsQ) {
      fetchSaleTransactionsQ.process(
        QUEUE_CONCURRENCY,
        (job) => fetchSaleTransactionsWorker(job),
      );
    }

    if (fundsDistributionQ) {
      fundsDistributionQ.process(
        QUEUE_CONCURRENCY,
        (job) => fundsDistributionWorkers(job),
      );
    }

    if (etherTransfersQ) {
      etherTransfersQ.process(
        QUEUE_CONCURRENCY,
        (job) => etherTransfersWorker(job),
      );
    }

    if (erc20TransfersQ) {
      erc20TransfersQ.process(
        QUEUE_CONCURRENCY,
        (job) => erc20TransfersWorker(job),
      );
    }
  },
};
