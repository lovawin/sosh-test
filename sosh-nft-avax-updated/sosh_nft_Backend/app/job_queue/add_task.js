const logger = require('../services/logger');
const { getQueues } = require('.');

module.exports = {
  distributeEthers: (receivers, amounts, account) => {
    logger.info(`distribute ether worker called for receivers: ${receivers}, amounts: ${amounts}, account: ${account}`);
    const { etherTransfersQ } = getQueues();
    etherTransfersQ.add({ receivers, amounts, account });
  },

  distributeErc20: (receivers, amounts, account, ERC20) => {
    logger.info(`distribute ERC20 worker called for 
    receivers: ${receivers}, amounts: ${amounts}, account: ${account}, ERC20: ${ERC20}`);
    const { erc20TransfersQ } = getQueues();
    erc20TransfersQ.add({
      receivers, amounts, account, ERC20,
    });
  },
  contractScheduler: async () => {
    // Wait for queues to be initialized
    const { fetchSaleTransactionsQ, fundsDistributionQ } = getQueues();
    if (!fetchSaleTransactionsQ || !fundsDistributionQ) {
      throw new Error('Queues not initialized');
    }

    logger.info('Scheduler for fetching transactions and distribution of funds started');

    await fetchSaleTransactionsQ.add(
      { event_name: 'Transfer' },
      {
        repeat: {
          every: 60000,
        },
      },
    );
    await fundsDistributionQ.add(
      { },
      {
        repeat: {
          every: 61000,
        },
      },
    );
  },
};
