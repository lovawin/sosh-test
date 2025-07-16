/**
 * Marketplace Logger Handler
 * 
 * @description Handles logging for NFT marketplace operations
 * @module logging/handlers/marketplaceLogger
 */

const winston = require('winston');
require('winston-daily-rotate-file');
const { createLogger } = require('../config/logConfig');
const { formatMarketplaceLog } = require('../formatters/logFormatter');

class MarketplaceLogger {
  constructor() {
    console.log('Constructing MarketplaceLogger...');
    this.ready = false;
    this.initPromise = this.initialize();
  }

  async initialize() {
    console.log('Initializing marketplace logger...');
    try {
      this.logger = await createLogger('marketplace');
      this.ready = true;
      console.log('Marketplace logger initialized successfully');
    } catch (error) {
      console.error('Failed to initialize marketplace logger:', error);
      throw error;
    }
  }

  /**
   * Log a generic marketplace event
   * @param {string} type - Event type
   * @param {Object} data - Event data
   */
  async logEvent(type, data = {}) {
    await this.initPromise;
    const logData = {
      type,
      ...data,
      timestamp: data.timestamp || new Date().toISOString()
    };

    this.logger.info(formatMarketplaceLog(logData));
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[MARKETPLACE] ${type} event logged:`, JSON.stringify(data));
    }
  }

  async logListingAttempt(userId, tokenId, details = {}) {
    await this.initPromise;
    const logData = {
      type: 'LISTING_ATTEMPT',
      userId,
      tokenId,
      ...details,
      timestamp: new Date().toISOString()
    };

    this.logger.info(formatMarketplaceLog(logData));
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[MARKETPLACE] Listing attempt for token ${tokenId} by user ${userId}`);
    }
  }

  async logApprovalAttempt(userId, tokenId, marketplaceAddress, details = {}) {
    await this.initPromise;
    const logData = {
      type: 'APPROVAL_ATTEMPT',
      userId,
      tokenId,
      marketplaceAddress,
      ...details,
      timestamp: new Date().toISOString()
    };

    this.logger.info(formatMarketplaceLog(logData));
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[MARKETPLACE] Approval attempt for token ${tokenId} by user ${userId}`);
    }
  }

  async logApprovalResult(userId, tokenId, success, details = {}) {
    await this.initPromise;
    const logData = {
      type: 'APPROVAL_RESULT',
      userId,
      tokenId,
      success,
      ...details,
      timestamp: new Date().toISOString()
    };

    this.logger.info(formatMarketplaceLog(logData));
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[MARKETPLACE] Approval ${success ? 'succeeded' : 'failed'} for token ${tokenId} by user ${userId}`);
    }
  }

  async logListingResult(userId, tokenId, saleId, success, details = {}) {
    await this.initPromise;
    const logData = {
      type: 'LISTING_RESULT',
      userId,
      tokenId,
      saleId,
      success,
      ...details,
      timestamp: new Date().toISOString()
    };

    this.logger.info(formatMarketplaceLog(logData));
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[MARKETPLACE] Listing ${success ? 'succeeded' : 'failed'} for token ${tokenId} by user ${userId}`);
    }
  }

  async logSaleCreated(saleId, tokenId, saleType, details = {}) {
    await this.initPromise;
    const logData = {
      type: 'SALE_CREATED',
      saleId,
      tokenId,
      saleType,
      ...details,
      timestamp: new Date().toISOString()
    };

    this.logger.info(formatMarketplaceLog(logData));
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[MARKETPLACE] Sale created for token ${tokenId} with saleId ${saleId}`);
    }
  }

  async logPurchaseAttempt(userId, saleId, tokenId, details = {}) {
    await this.initPromise;
    const logData = {
      type: 'PURCHASE_ATTEMPT',
      userId,
      saleId,
      tokenId,
      ...details,
      timestamp: new Date().toISOString()
    };

    this.logger.info(formatMarketplaceLog(logData));
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[MARKETPLACE] Purchase attempt for sale ${saleId} (token ${tokenId}) by user ${userId}`);
    }
  }

  async logPurchaseResult(userId, saleId, tokenId, success, details = {}) {
    await this.initPromise;
    const logData = {
      type: 'PURCHASE_RESULT',
      userId,
      saleId,
      tokenId,
      success,
      ...details,
      timestamp: new Date().toISOString()
    };

    this.logger.info(formatMarketplaceLog(logData));
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[MARKETPLACE] Purchase ${success ? 'succeeded' : 'failed'} for sale ${saleId} (token ${tokenId}) by user ${userId}`);
    }
  }

  async logBidAttempt(userId, saleId, tokenId, amount, details = {}) {
    await this.initPromise;
    const logData = {
      type: 'BID_ATTEMPT',
      userId,
      saleId,
      tokenId,
      amount,
      ...details,
      timestamp: new Date().toISOString()
    };

    this.logger.info(formatMarketplaceLog(logData));
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[MARKETPLACE] Bid attempt for sale ${saleId} (token ${tokenId}) by user ${userId}`);
    }
  }

  async logBidResult(userId, saleId, tokenId, amount, success, details = {}) {
    await this.initPromise;
    const logData = {
      type: 'BID_RESULT',
      userId,
      saleId,
      tokenId,
      amount,
      success,
      ...details,
      timestamp: new Date().toISOString()
    };

    this.logger.info(formatMarketplaceLog(logData));
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[MARKETPLACE] Bid ${success ? 'succeeded' : 'failed'} for sale ${saleId} (token ${tokenId}) by user ${userId}`);
    }
  }

  async logTransactionError(userId, tokenId, error, operation, details = {}) {
    await this.initPromise;
    const logData = {
      type: 'TRANSACTION_ERROR',
      userId,
      tokenId,
      operation,
      error: {
        message: error.message,
        code: error.code,
        name: error.name
      },
      ...details,
      timestamp: new Date().toISOString()
    };

    this.logger.error(formatMarketplaceLog(logData));
    if (process.env.NODE_ENV !== 'production') {
      console.error(`[MARKETPLACE] Transaction error during ${operation} for token ${tokenId} by user ${userId}: ${error.message}`);
    }
  }

  async logRetrievalButtonVisibility(userId, tokenId, visibilityData = {}) {
    await this.initPromise;
    const logData = {
      type: 'RETRIEVAL_BUTTON_VISIBILITY',
      userId,
      tokenId,
      ...visibilityData,
      timestamp: new Date().toISOString()
    };

    this.logger.info(formatMarketplaceLog(logData));
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[MARKETPLACE] Retrieval button visibility for token ${tokenId}: ${JSON.stringify(visibilityData)}`);
    }
  }

  async logDataPropertyValidation(userId, tokenId, dataProperties = {}) {
    await this.initPromise;
    const logData = {
      type: 'DATA_PROPERTY_VALIDATION',
      userId,
      tokenId,
      ...dataProperties,
      timestamp: new Date().toISOString()
    };

    this.logger.info(formatMarketplaceLog(logData));
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[MARKETPLACE] Data property validation for token ${tokenId}: ${JSON.stringify(dataProperties)}`);
    }
  }

  async logOwnershipCheck(userId, tokenId, ownershipData = {}) {
    await this.initPromise;
    const logData = {
      type: 'OWNERSHIP_CHECK',
      userId,
      tokenId,
      ...ownershipData,
      timestamp: new Date().toISOString()
    };

    this.logger.info(formatMarketplaceLog(logData));
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[MARKETPLACE] Ownership check for token ${tokenId}: ${JSON.stringify(ownershipData)}`);
    }
  }

  /**
   * Log a retrieval attempt for an expired listing
   * @param {string} userId - User ID
   * @param {string} tokenId - Token ID
   * @param {string} saleId - Sale ID
   * @param {Object} details - Additional details
   */
  async logRetrievalAttempt(userId, tokenId, saleId, details = {}) {
    await this.initPromise;
    const logData = {
      type: 'RETRIEVAL_ATTEMPT',
      userId,
      tokenId,
      saleId,
      ...details,
      timestamp: new Date().toISOString()
    };

    this.logger.info(formatMarketplaceLog(logData));
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[MARKETPLACE] Retrieval attempt for token ${tokenId} (sale ${saleId}) by user ${userId}`);
    }
  }

  /**
   * Log the result of a retrieval operation
   * @param {string} userId - User ID
   * @param {string} tokenId - Token ID
   * @param {string} saleId - Sale ID
   * @param {boolean} success - Whether the retrieval was successful
   * @param {Object} details - Additional details
   */
  async logRetrievalResult(userId, tokenId, saleId, success, details = {}) {
    await this.initPromise;
    const logData = {
      type: 'RETRIEVAL_RESULT',
      userId,
      tokenId,
      saleId,
      success,
      ...details,
      timestamp: new Date().toISOString()
    };

    this.logger.info(formatMarketplaceLog(logData));
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[MARKETPLACE] Retrieval ${success ? 'succeeded' : 'failed'} for token ${tokenId} (sale ${saleId}) by user ${userId}`);
    }
  }

  /**
   * Log validation errors during retrieval process
   * @param {string} userId - User ID
   * @param {string} tokenId - Token ID
   * @param {string} saleId - Sale ID
   * @param {string} validationType - Type of validation that failed
   * @param {Object} details - Additional details
   */
  async logRetrievalValidationError(userId, tokenId, saleId, validationType, details = {}) {
    await this.initPromise;
    const logData = {
      type: 'RETRIEVAL_VALIDATION_ERROR',
      userId,
      tokenId,
      saleId,
      validationType,
      ...details,
      timestamp: new Date().toISOString()
    };

    this.logger.info(formatMarketplaceLog(logData));
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[MARKETPLACE] Retrieval validation error (${validationType}) for token ${tokenId} (sale ${saleId}) by user ${userId}`);
    }
  }

  /**
   * Log sale information during retrieval process
   * @param {string} userId - User ID
   * @param {string} tokenId - Token ID
   * @param {string} saleId - Sale ID
   * @param {Object} saleInfo - Sale information
   */
  async logRetrievalSaleInfo(userId, tokenId, saleId, saleInfo = {}) {
    await this.initPromise;
    const logData = {
      type: 'RETRIEVAL_SALE_INFO',
      userId,
      tokenId,
      saleId,
      saleInfo,
      timestamp: new Date().toISOString()
    };

    this.logger.info(formatMarketplaceLog(logData));
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[MARKETPLACE] Retrieval sale info for token ${tokenId} (sale ${saleId}): ${JSON.stringify(saleInfo)}`);
    }
  }
}

module.exports = new MarketplaceLogger();
