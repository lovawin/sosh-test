/**
 * Blockchain Logger Handler
 * 
 * @description Handles logging for blockchain transactions and events
 * @module logging/handlers/blockchainLogger
 */

const winston = require('winston');
require('winston-daily-rotate-file');
const { createLogger } = require('../config/logConfig');
const { formatBlockchainLog } = require('../formatters/logFormatter');

class BlockchainLogger {
  constructor() {
    console.log('Constructing BlockchainLogger...');
    this.ready = false;
    this.initPromise = this.initialize();
  }

  async initialize() {
    console.log('Initializing blockchain logger...');
    try {
      this.logger = await createLogger('blockchain');
      this.ready = true;
      console.log('Blockchain logger initialized successfully');
    } catch (error) {
      console.error('Failed to initialize blockchain logger:', error);
      throw error;
    }
  }

  async logTransaction(txHash, type, details = {}) {
    await this.initPromise;
    const logData = {
      type: 'TRANSACTION',
      transactionHash: txHash,
      transactionType: type,
      ...details,
      timestamp: new Date().toISOString()
    };

    this.logger.info(logData);
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[BLOCKCHAIN] Transaction ${txHash} (${type})`);
    }
  }

  async logGasUsage(txHash, gasUsed, gasPrice, totalCost) {
    await this.initPromise;
    const logData = {
      type: 'GAS_USAGE',
      transactionHash: txHash,
      gasUsed,
      gasPrice,
      totalCost,
      timestamp: new Date().toISOString()
    };

    this.logger.info(logData);
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[BLOCKCHAIN] Gas usage for ${txHash}: ${gasUsed} @ ${gasPrice} = ${totalCost}`);
    }
  }

  async logContractEvent(contractAddress, eventName, eventData) {
    await this.initPromise;
    const logData = {
      type: 'CONTRACT_EVENT',
      contractAddress,
      eventName,
      eventData,
      timestamp: new Date().toISOString()
    };

    this.logger.info(logData);
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[BLOCKCHAIN] Contract event ${eventName} from ${contractAddress}`);
    }
  }

  async logContractError(contractAddress, method, error) {
    await this.initPromise;
    const logData = {
      type: 'CONTRACT_ERROR',
      contractAddress,
      method,
      error: {
        message: error.message,
        code: error.code,
        stack: error.stack
      },
      timestamp: new Date().toISOString()
    };

    this.logger.error(logData);
    if (process.env.NODE_ENV !== 'production') {
      console.error(`[BLOCKCHAIN] Contract error in ${method} at ${contractAddress}: ${error.message}`);
      if (error.stack) {
        console.error(error.stack);
      }
    }
  }

  async logNetworkStatus(networkId, status) {
    await this.initPromise;
    const logData = {
      type: 'NETWORK_STATUS',
      networkId,
      status,
      timestamp: new Date().toISOString()
    };

    this.logger.info(logData);
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[BLOCKCHAIN] Network ${networkId} status: ${status}`);
    }
  }
}

module.exports = new BlockchainLogger();
