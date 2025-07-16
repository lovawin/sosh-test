/**
 * Job Queue Logger Handler
 * 
 * @description Handles logging for job queue operations
 * @module logging/handlers/jobLogger
 */

const winston = require('winston');
require('winston-daily-rotate-file');
const { createLogger } = require('../config/logConfig');
const { formatJobLog } = require('../formatters/logFormatter');

class JobLogger {
  constructor() {
    console.log('Constructing JobLogger...');
    this.ready = false;
    this.initPromise = this.initialize();
  }

  async initialize() {
    console.log('Initializing job logger...');
    try {
      this.logger = await createLogger('job');
      this.ready = true;
      console.log('Job logger initialized successfully');
    } catch (error) {
      console.error('Failed to initialize job logger:', error);
      throw error;
    }
  }

  async logJobStart(jobId, jobType, metadata = {}) {
    await this.initPromise;
    const logData = {
      type: 'JOB_START',
      jobId,
      jobType,
      status: 'started',
      metadata,
      timestamp: new Date().toISOString()
    };

    this.logger.info(logData);
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[JOB] Started ${jobType} job ${jobId}`);
    }
  }

  async logJobComplete(jobId, jobType, result = {}) {
    await this.initPromise;
    const logData = {
      type: 'JOB_COMPLETE',
      jobId,
      jobType,
      status: 'completed',
      result,
      timestamp: new Date().toISOString()
    };

    this.logger.info(logData);
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[JOB] Completed ${jobType} job ${jobId}`);
    }
  }

  async logJobFailed(jobId, jobType, error) {
    await this.initPromise;
    const logData = {
      type: 'JOB_FAILED',
      jobId,
      jobType,
      status: 'failed',
      error: {
        message: error.message,
        code: error.code,
        stack: error.stack
      },
      timestamp: new Date().toISOString()
    };

    this.logger.error(logData);
    if (process.env.NODE_ENV !== 'production') {
      console.error(`[JOB] Failed ${jobType} job ${jobId}: ${error.message}`);
      if (error.stack) {
        console.error(error.stack);
      }
    }
  }

  async logQueueMetrics(queueName, metrics) {
    await this.initPromise;
    const logData = {
      type: 'QUEUE_METRICS',
      queue: queueName,
      metrics,
      timestamp: new Date().toISOString()
    };

    this.logger.info(logData);
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[JOB] Queue metrics for ${queueName}:`, metrics);
    }
  }

  async logJobProgress(jobId, jobType, progress) {
    await this.initPromise;
    const logData = {
      type: 'JOB_PROGRESS',
      jobId,
      jobType,
      progress,
      timestamp: new Date().toISOString()
    };

    this.logger.info(logData);
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[JOB] Progress ${progress}% for ${jobType} job ${jobId}`);
    }
  }
}

module.exports = new JobLogger();
