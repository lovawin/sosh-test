const logger = require('../../services/logger');
const blockNumber = require('../../models/blockNumber');
const { processPastEvents } = require('../../utils/contract_helper');
const { tokenAddress } = require('../../../config/appconfig');

module.exports = async (job) => {
  const {
    event_name,
  } = job.data;
  try {
    logger.info('Fetch transaction worker starting....................');
    const maxBlockNumberInDB = await blockNumber.findOne();
    const startingBlockNum = parseInt(maxBlockNumberInDB?.blockNumber || '10242105', 10) + 1;
    // Maximum block range is 2048 blocks per request
    const endBlockNum = startingBlockNum + 2000; // Using 2000 to stay safely under the 2048 limit

    return await processPastEvents(
      event_name,
      tokenAddress,
      startingBlockNum,
      endBlockNum,
    );
    // return await processPastEvents(
    //   event_name,
    //   tokenAddress,
    //   '16066242', // '16023024',
    //   '16066357', // "16023026",
    // );
    // return true;
  } catch (error) {
    job.log(error);
    logger.error(error);
    return Promise.reject(error.message);
  }
};
