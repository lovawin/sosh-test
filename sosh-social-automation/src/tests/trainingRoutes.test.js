/**
 * Training API Routes Tests
 * ======================
 * 
 * Comprehensive test suite for the training API endpoints. Tests request
 * handling, authentication, input validation, and response formatting
 * for all model training operations.
 * 
 * Test Architecture
 * ---------------
 * The test suite follows the API structure:
 * 
 * 1. Request Layer Tests
 *    Purpose:
 *    - Input validation
 *    - Parameter processing
 *    - Authentication checks
 *    - Rate limiting
 * 
 *    Key Aspects:
 *    - Request validation
 *    - Auth middleware
 *    - Parameter parsing
 *    - Rate limit checks
 * 
 * 2. Response Layer Tests
 *    Purpose:
 *    - Response format
 *    - Status codes
 *    - Error handling
 *    - Cache behavior
 * 
 *    Key Aspects:
 *    - Response structure
 *    - Error formats
 *    - Cache headers
 *    - Response timing
 * 
 * 3. Integration Tests
 *    Purpose:
 *    - Service integration
 *    - Data flow
 *    - Error propagation
 *    - End-to-end testing
 * 
 *    Key Aspects:
 *    - Service calls
 *    - Data transformation
 *    - Error handling
 *    - Complete workflows
 * 
 * Test Categories
 * -------------
 * 1. Authentication Tests
 *    - Token validation
 *    - Permission checks
 *    - Invalid auth
 *    - Token expiry
 * 
 * 2. Input Tests
 *    - Parameter validation
 *    - Data formats
 *    - Edge cases
 *    - Invalid inputs
 * 
 * 3. Performance Tests
 *    - Response times
 *    - Cache efficiency
 *    - Rate limiting
 *    - Load handling
 */

const request = require('supertest');
const app = require('../server');
const modelTraining = require('../services/modelTraining');
const { generateToken } = require('../middleware/auth');

// Mock dependencies
jest.mock('../services/modelTraining');

describe('Training API Routes', () => {
  let authToken;
  
  /**
   * Test Data Setup
   * --------------
   * Comprehensive test data covering:
   * 1. Different model types
   * 2. Various data formats
   * 3. Training scenarios
   * 4. Edge cases
   */
  const testUser = {
    id: 'test123',
    username: 'testuser',
    email: 'test@example.com'
  };

  const testTrainingData = {
    trend: {
      timestamps: Array.from({ length: 100 }, (_, i) => 
        new Date(2023, 0, i + 1).toISOString()
      ),
      values: Array.from({ length: 100 }, () => 
        Math.random() * 100
      )
    }
  };

  const testOptions = {
    epochs: 100,
    batchSize: 32,
    learningRate: 0.001
  };

  /**
   * Test Environment Setup
   * -------------------
   * Prepares clean test environment:
   * 1. Reset mocks
   * 2. Generate auth token
   * 3. Configure service mocks
   * 4. Set up test data
   */
  beforeEach(() => {
    jest.clearAllMocks();
    authToken = generateToken(testUser);

    // Configure model training mock
    modelTraining.trainModel.mockResolvedValue({
      modelInfo: {
        type: 'trend',
        version: '1.0.0'
      },
      evaluation: {
        metrics: {
          accuracy: 0.95,
          loss: 0.1
        }
      }
    });

    modelTraining.runABTest.mockResolvedValue({
      winner: 'B',
      improvement: 15,
      confidence: 0.95
    });
  });

  describe('Model Training', () => {
    /**
     * Training Endpoint Tests
     * -------------------
     * Test model training endpoints
     */
    describe('POST /api/training/models', () => {
      it('should require authentication', async () => {
        const response = await request(app)
          .post('/api/training/models')
          .send({
            modelType: 'trend',
            data: testTrainingData.trend
          });

        expect(response.status).toBe(401);
      });

      it('should validate input data', async () => {
        const response = await request(app)
          .post('/api/training/models')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            modelType: 'trend'
            // Missing data
          });

        expect(response.status).toBe(400);
        expect(response.body.error).toBeDefined();
      });

      it('should start model training', async () => {
        const response = await request(app)
          .post('/api/training/models')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            modelType: 'trend',
            data: testTrainingData.trend,
            options: testOptions
          });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeDefined();
        expect(response.body.metadata).toBeDefined();
      });
    });
  });

  describe('A/B Testing', () => {
    /**
     * A/B Testing Endpoint Tests
     * ----------------------
     * Test A/B testing endpoints
     */
    describe('POST /api/training/tests/ab', () => {
      it('should validate test options', async () => {
        const response = await request(app)
          .post('/api/training/tests/ab')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            modelType: 'trend',
            testData: testTrainingData.trend
            // Missing options
          });

        expect(response.status).toBe(400);
        expect(response.body.error).toBeDefined();
      });

      it('should run A/B test', async () => {
        const response = await request(app)
          .post('/api/training/tests/ab')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            modelType: 'trend',
            testData: testTrainingData.trend,
            options: {
              versionA: '1.0.0',
              versionB: '1.1.0'
            }
          });

        expect(response.status).toBe(200);
        expect(response.body.data.winner).toBeDefined();
        expect(response.body.data.improvement).toBeDefined();
      });
    });
  });

  describe('Retraining', () => {
    /**
     * Retraining Endpoint Tests
     * ---------------------
     * Test retraining endpoints
     */
    describe('GET /api/training/status/check', () => {
      it('should check retraining need', async () => {
        modelTraining.checkRetrainingNeeded.mockResolvedValue(true);

        const response = await request(app)
          .get('/api/training/status/check')
          .set('Authorization', `Bearer ${authToken}`)
          .query({
            modelType: 'trend',
            metrics: JSON.stringify({
              accuracy: 0.8,
              loss: 0.3
            })
          });

        expect(response.status).toBe(200);
        expect(response.body.data.needsRetraining).toBe(true);
        expect(response.body.data.reasons).toBeDefined();
      });

      it('should handle invalid metrics', async () => {
        const response = await request(app)
          .get('/api/training/status/check')
          .set('Authorization', `Bearer ${authToken}`)
          .query({
            modelType: 'trend',
            metrics: 'invalid-json'
          });

        expect(response.status).toBe(500);
        expect(response.body.error).toBeDefined();
      });
    });

    describe('POST /api/training/retrain', () => {
      it('should start retraining', async () => {
        const response = await request(app)
          .post('/api/training/retrain')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            modelType: 'trend',
            data: testTrainingData.trend,
            options: testOptions
          });

        expect(response.status).toBe(200);
        expect(response.body.metadata.isRetraining).toBe(true);
      });
    });
  });

  describe('Training Status', () => {
    /**
     * Status Endpoint Tests
     * -----------------
     * Test status endpoints
     */
    describe('GET /api/training/models/:id/status', () => {
      it('should get training status', async () => {
        modelTraining.getTrainingStatus.mockResolvedValue({
          status: 'running',
          progress: 0.5,
          metrics: {
            currentEpoch: 50,
            loss: 0.2
          }
        });

        const response = await request(app)
          .get('/api/training/models/job123/status')
          .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(200);
        expect(response.body.data.status).toBe('running');
        expect(response.body.data.progress).toBeDefined();
      });
    });

    describe('GET /api/training/models/:id/logs', () => {
      it('should get training logs', async () => {
        modelTraining.getTrainingLogs.mockResolvedValue([
          {
            timestamp: new Date().toISOString(),
            level: 'info',
            message: 'Training started'
          }
        ]);

        const response = await request(app)
          .get('/api/training/models/job123/logs')
          .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(200);
        expect(response.body.data).toBeInstanceOf(Array);
      });
    });
  });

  describe('Error Handling', () => {
    /**
     * Error Handling Tests
     * -----------------
     * Test error scenarios
     */
    it('should handle service errors', async () => {
      modelTraining.trainModel.mockRejectedValue(
        new Error('Training failed')
      );

      const response = await request(app)
        .post('/api/training/models')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          modelType: 'trend',
          data: testTrainingData.trend
        });

      expect(response.status).toBe(500);
      expect(response.body.error).toBeDefined();
      expect(response.body.details).toBeDefined();
    });
  });

  describe('Performance', () => {
    /**
     * Performance Tests
     * --------------
     * Test response times and caching
     */
    it('should handle concurrent requests', async () => {
      const requests = Array(5).fill().map(() => 
        request(app)
          .post('/api/training/models')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            modelType: 'trend',
            data: testTrainingData.trend
          })
      );

      const responses = await Promise.all(requests);
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
    });

    it('should utilize caching', async () => {
      // First request
      await request(app)
        .get('/api/training/models/job123/status')
        .set('Authorization', `Bearer ${authToken}`);

      // Second request should use cache
      const response = await request(app)
        .get('/api/training/models/job123/status')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(modelTraining.getTrainingStatus)
        .toHaveBeenCalledTimes(1);
    });
  });
});
