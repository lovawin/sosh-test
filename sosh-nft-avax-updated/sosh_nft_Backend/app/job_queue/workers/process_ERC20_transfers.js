const logger = require('../../services/logger');
const { distributeERC20FromTreasury } = require('../../utils/contract_helper');

module.exports = async (job) => {
  const {
    receivers, amounts, account, ERC20,
  } = job.data;
  try {
    logger.info('transaction execution in progress.......');
    return await distributeERC20FromTreasury(receivers, amounts, account, ERC20);
  } catch (error) {
    logger.error(error);
    job.log(`Error occured ${error}`);
    throw error;
  }
};
