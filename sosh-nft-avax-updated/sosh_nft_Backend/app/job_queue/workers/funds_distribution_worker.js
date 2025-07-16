const logger = require('../../services/logger');
const { processFundsDistribution } = require('../../utils/contract_helper');

module.exports = async (job) => {
  const {
    data,
  } = job.data;
  try {
    logger.info('Funds Distribution is in progress.......');
    return await processFundsDistribution();
  } catch (error) {
    logger.error(error);
    job.log(`Error occured ${error}`);
    throw error;
  }
};
