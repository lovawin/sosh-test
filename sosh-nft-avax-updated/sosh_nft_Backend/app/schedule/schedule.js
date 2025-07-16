const schedule = require('node-schedule');
const transection = require('../services/transection');

const scheduleFunction = function () {
  // schedule.scheduleJob(' */1 * * * *', function () {
  //   logger.info('Scheduler for fetching sale transactions....')
  //   saveAllSaleTransaction();
  // });

  // schedule.scheduleJob(' */1 * * * *', () => {
  //   logger.info('Scheduler for Distribution of funds....');
  //   distributeFunds();
  // });
};

module.exports.scheduleFunction = scheduleFunction;
