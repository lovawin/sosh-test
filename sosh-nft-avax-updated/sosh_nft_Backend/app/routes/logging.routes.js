/**
 * Logging Routes
 * 
 * @description Routes for handling frontend logging requests
 */

const express = require('express');
const router = express.Router();
const errorLogger = require('../logging/handlers/errorLogger');

/**
 * @route POST /api/v1/logging/error
 * @description Log error from frontend
 */
router.post('/error', async (req, res) => {
  try {
    const errorLog = req.body;
    
    // Add request metadata
    errorLog.context = {
      ...errorLog.context,
      ip: req.ip,
      headers: {
        'user-agent': req.get('user-agent'),
        'x-forwarded-for': req.get('x-forwarded-for')
      }
    };

    // Log through our MongoDB transport
    await errorLogger.logError(new Error(errorLog.error.message), {
      type: errorLog.type,
      subType: errorLog.subType,
      source: errorLog.source,
      context: {
        ...errorLog.context,
        originalError: errorLog.error
      }
    });

    res.status(200).json({ 
      status: 'success',
      message: 'Error logged successfully'
    });
  } catch (error) {
    console.error('Failed to log frontend error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to log error'
    });
  }
});

/**
 * @route POST /api/v1/logging/warning
 * @description Log warning from frontend
 */
router.post('/warning', async (req, res) => {
  try {
    const warningLog = req.body;
    
    // Add request metadata
    warningLog.context = {
      ...warningLog.context,
      ip: req.ip,
      headers: {
        'user-agent': req.get('user-agent'),
        'x-forwarded-for': req.get('x-forwarded-for')
      }
    };

    // Log through our MongoDB transport
    await errorLogger.logWarning(warningLog.message, warningLog.context);

    res.status(200).json({
      status: 'success',
      message: 'Warning logged successfully'
    });
  } catch (error) {
    console.error('Failed to log frontend warning:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to log warning'
    });
  }
});

module.exports = router;
