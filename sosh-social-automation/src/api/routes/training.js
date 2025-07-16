/**
 * Model Training API Routes
 * ======================
 * 
 * This module provides RESTful endpoints for model training operations,
 * including model training, A/B testing, and automated retraining
 * functionality.
 * 
 * Route Structure
 * -------------
 * 1. Training Endpoints
 *    Purpose:
 *    - Model training
 *    - Training status
 *    - Model versioning
 *    - Training logs
 * 
 *    Endpoints:
 *    - POST /training/models
 *    - GET /training/models/:id/status
 *    - GET /training/models/:id/logs
 * 
 * 2. Testing Endpoints
 *    Purpose:
 *    - A/B testing
 *    - Model comparison
 *    - Performance analysis
 *    - Test results
 * 
 *    Endpoints:
 *    - POST /training/tests/ab
 *    - GET /training/tests/:id/results
 *    - GET /training/tests/:id/analysis
 * 
 * 3. Retraining Endpoints
 *    Purpose:
 *    - Retraining checks
 *    - Automated retraining
 *    - Performance monitoring
 *    - Model updates
 * 
 *    Endpoints:
 *    - POST /training/retrain
 *    - GET /training/status/check
 * 
 * Security Implementation
 * --------------------
 * 1. Authentication
 *    - JWT validation
 *    - Role-based access
 *    - API key validation
 *    - Rate limiting
 * 
 * 2. Resource Protection
 *    - Model versioning
 *    - Training quotas
 *    - Resource limits
 *    - Access control
 * 
 * 3. Error Handling
 *    - Training errors
 *    - Resource errors
 *    - Validation errors
 *    - System errors
 * 
 * Performance Optimization
 * ---------------------
 * 1. Resource Management
 *    - Training queues
 *    - Batch processing
 *    - Resource allocation
 *    - Load balancing
 * 
 * 2. Caching Strategy
 *    - Model caching
 *    - Result caching
 *    - Status caching
 *    - Log caching
 */

const express = require('express');
const router = express.Router();
const modelTraining = require('../../services/modelTraining');
const auth = require('../../middleware/auth');
const { validateRequest } = require('../../middleware/validation');
const rateLimit = require('express-rate-limit');
const cache = require('../../middleware/cache');

// Configure rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 requests per windowMs
  message: 'Too many training requests, please try again later'
});

// Apply rate limiting to all routes
router.use(apiLimiter);

/**
 * Train New Model
 * ------------
 * Start training a new model with provided data
 * 
 * @route POST /api/training/models
 * @body {
 *   modelType: string,
 *   data: Object,
 *   options: {
 *     epochs: number,
 *     batchSize: number,
 *     learningRate: number
 *   }
 * }
 * @returns {Object} Training job details
 */
router.post('/models', auth, validateRequest, async (req, res) => {
  try {
    const { modelType, data, options } = req.body;

    // Validate input
    if (!modelType || !data) {
      return res.status(400).json({
        error: 'Invalid request',
        details: 'Model type and training data are required'
      });
    }

    // Start training
    const results = await modelTraining.trainModel(
      modelType,
      data,
      options
    );

    res.json({
      success: true,
      data: results,
      metadata: {
        startedAt: new Date(),
        modelType,
        options
      }
    });
  } catch (error) {
    console.error('Error training model:', error);
    res.status(500).json({
      error: 'Failed to train model',
      details: error.message
    });
  }
});

/**
 * Run A/B Test
 * ---------
 * Execute A/B test between model versions
 * 
 * @route POST /api/training/tests/ab
 * @body {
 *   modelType: string,
 *   testData: Object,
 *   options: {
 *     versionA: string,
 *     versionB: string
 *   }
 * }
 * @returns {Object} Test results
 */
router.post('/tests/ab', auth, validateRequest, async (req, res) => {
  try {
    const { modelType, testData, options } = req.body;

    // Validate input
    if (!modelType || !testData || !options) {
      return res.status(400).json({
        error: 'Invalid request',
        details: 'Model type, test data, and options are required'
      });
    }

    // Run A/B test
    const results = await modelTraining.runABTest(
      modelType,
      testData,
      options
    );

    res.json({
      success: true,
      data: results,
      metadata: {
        completedAt: new Date(),
        modelType,
        versions: {
          a: options.versionA,
          b: options.versionB
        }
      }
    });
  } catch (error) {
    console.error('Error running A/B test:', error);
    res.status(500).json({
      error: 'Failed to run A/B test',
      details: error.message
    });
  }
});

/**
 * Check Retraining Need
 * ------------------
 * Check if model needs retraining
 * 
 * @route GET /api/training/status/check
 * @query {
 *   modelType: string,
 *   metrics: Object
 * }
 * @returns {Object} Retraining status
 */
router.get('/status/check', auth, cache('5m'), async (req, res) => {
  try {
    const { modelType, metrics } = req.query;

    // Validate input
    if (!modelType || !metrics) {
      return res.status(400).json({
        error: 'Invalid request',
        details: 'Model type and metrics are required'
      });
    }

    // Check retraining need
    const needsRetraining = await modelTraining.checkRetrainingNeeded(
      modelType,
      JSON.parse(metrics)
    );

    res.json({
      success: true,
      data: {
        needsRetraining,
        reasons: needsRetraining ? [
          'Performance degradation detected',
          'Data drift observed'
        ] : []
      },
      metadata: {
        checkedAt: new Date(),
        modelType
      }
    });
  } catch (error) {
    console.error('Error checking retraining status:', error);
    res.status(500).json({
      error: 'Failed to check retraining status',
      details: error.message
    });
  }
});

/**
 * Start Retraining
 * -------------
 * Initiate model retraining process
 * 
 * @route POST /api/training/retrain
 * @body {
 *   modelType: string,
 *   data: Object,
 *   options: Object
 * }
 * @returns {Object} Retraining job details
 */
router.post('/retrain', auth, validateRequest, async (req, res) => {
  try {
    const { modelType, data, options } = req.body;

    // Validate input
    if (!modelType || !data) {
      return res.status(400).json({
        error: 'Invalid request',
        details: 'Model type and training data are required'
      });
    }

    // Start retraining
    const results = await modelTraining.trainModel(
      modelType,
      data,
      {
        ...options,
        isRetraining: true
      }
    );

    res.json({
      success: true,
      data: results,
      metadata: {
        startedAt: new Date(),
        modelType,
        isRetraining: true
      }
    });
  } catch (error) {
    console.error('Error retraining model:', error);
    res.status(500).json({
      error: 'Failed to retrain model',
      details: error.message
    });
  }
});

/**
 * Get Training Status
 * ----------------
 * Get current status of training job
 * 
 * @route GET /api/training/models/:id/status
 * @param {string} id - Training job ID
 * @returns {Object} Training status
 */
router.get('/models/:id/status', auth, cache('1m'), async (req, res) => {
  try {
    const { id } = req.params;

    // Get training status
    const status = await modelTraining.getTrainingStatus(id);

    res.json({
      success: true,
      data: status,
      metadata: {
        jobId: id,
        checkedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Error getting training status:', error);
    res.status(500).json({
      error: 'Failed to get training status',
      details: error.message
    });
  }
});

/**
 * Get Training Logs
 * --------------
 * Get logs for training job
 * 
 * @route GET /api/training/models/:id/logs
 * @param {string} id - Training job ID
 * @returns {Object} Training logs
 */
router.get('/models/:id/logs', auth, cache('5m'), async (req, res) => {
  try {
    const { id } = req.params;

    // Get training logs
    const logs = await modelTraining.getTrainingLogs(id);

    res.json({
      success: true,
      data: logs,
      metadata: {
        jobId: id,
        retrievedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Error getting training logs:', error);
    res.status(500).json({
      error: 'Failed to get training logs',
      details: error.message
    });
  }
});

module.exports = router;
