const express = require('express');
const router = express.Router();
const { createLogger } = require('../logging/config/logConfig');
const { marketplaceLogger } = require('../logging');

// Create a logger instance using our centralized configuration
const logger = createLogger('frontend-errors');

router.post('/error', async (req, res) => {
    try {
        const { message, type, metadata } = req.body;
        
        // Log the error
        logger.error(message, {
            type: type || 'INVALID_LINK',
            timestamp: new Date().toISOString(),
            source: 'frontend',
            ...metadata
        });

        res.status(200).json({ status: 'success', message: 'Error logged successfully' });
    } catch (error) {
        console.error('Error logging frontend error:', error);
        res.status(500).json({ status: 'error', message: 'Failed to log error' });
    }
});

/**
 * @route POST /api/v1/log/marketplace
 * @description Log marketplace events from frontend
 */
router.post('/marketplace', async (req, res) => {
  try {
    const logData = req.body;
    
    // Add request metadata
    logData.context = {
      ...logData.context,
      ip: req.ip,
      headers: {
        'user-agent': req.get('user-agent'),
        'x-forwarded-for': req.get('x-forwarded-for')
      },
      userId: req.user?.id
    };

    // Route to appropriate logger method based on event type
    switch (logData.type) {
      case 'LISTING_ATTEMPT':
        await marketplaceLogger.logListingAttempt(
          logData.context.userId,
          logData.tokenId,
          logData
        );
        break;
      
      case 'APPROVAL_ATTEMPT':
        await marketplaceLogger.logApprovalAttempt(
          logData.context.userId,
          logData.tokenId,
          logData.marketplaceAddress,
          logData
        );
        break;
      
      case 'APPROVAL_RESULT':
        await marketplaceLogger.logApprovalResult(
          logData.context.userId,
          logData.tokenId,
          logData.success,
          logData
        );
        break;
      
      case 'LISTING_RESULT':
        await marketplaceLogger.logListingResult(
          logData.context.userId,
          logData.tokenId,
          logData.saleId,
          logData.success,
          logData
        );
        break;
      
      case 'PURCHASE_ATTEMPT':
        await marketplaceLogger.logPurchaseAttempt(
          logData.context.userId,
          logData.saleId,
          logData.tokenId,
          logData
        );
        break;
      
      case 'PURCHASE_RESULT':
        await marketplaceLogger.logPurchaseResult(
          logData.context.userId,
          logData.saleId,
          logData.tokenId,
          logData.success,
          logData
        );
        break;
      
      case 'BID_ATTEMPT':
        await marketplaceLogger.logBidAttempt(
          logData.context.userId,
          logData.saleId,
          logData.tokenId,
          logData.amount,
          logData
        );
        break;
      
      case 'BID_RESULT':
        await marketplaceLogger.logBidResult(
          logData.context.userId,
          logData.saleId,
          logData.tokenId,
          logData.amount,
          logData.success,
          logData
        );
        break;
      
      default:
        // For unknown event types, log a generic event
        console.log(`Unknown marketplace event type: ${logData.type}`);
        await marketplaceLogger.logger.info({
          type: logData.type || 'UNKNOWN_MARKETPLACE_EVENT',
          ...logData
        });
    }

    res.status(200).json({ 
      status: 'success',
      message: 'Marketplace event logged successfully'
    });
  } catch (error) {
    console.error('Failed to log marketplace event:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to log marketplace event'
    });
  }
});

module.exports = router;
