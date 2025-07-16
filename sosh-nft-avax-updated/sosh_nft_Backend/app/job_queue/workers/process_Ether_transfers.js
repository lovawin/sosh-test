const logger = require('../../services/logger');
const { distributeEtherFromTreasury } = require('../../utils/contract_helper');

module.exports = async (job) => {
  const {
    receivers, amounts, account,
  } = job.data;
  try {
    logger.info('transaction execution in progress.......');
    return await distributeEtherFromTreasury(receivers, amounts, account);
  } catch (error) {
    logger.error(error);
    job.log(`Error occured ${error}`);
    throw error;
  }
};
