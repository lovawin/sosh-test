const Queue = require('bull');
const { REDIS_HOST, REDIS_PORT } = require('../../config/appconfig');

const options = {
  delay: 3000,
  attempts: 6,
};

class Bull {
  constructor(QueueName, option = options) {
    this.sendMailQueue = new Queue(QueueName, {
      redis: {
        host: REDIS_HOST,
        port: REDIS_PORT
      },
    });
    this.option = option;
  }

  addQueue(data) {
    this.sendMailQueue.add(data, this.option);
  }

  processQueue(cb) {
    this.sendMailQueue.process((job) => {
      cb(job.data);
    });
  }
}

module.exports = Bull;
