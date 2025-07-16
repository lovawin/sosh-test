/**
 * Machine Learning API Routes Tests
 * =============================
 * 
 * Comprehensive test suite for the ML API endpoints. Tests request
 * handling, authentication, input validation, and response formatting
 * for all ML-powered analytics and prediction routes.
 * 
 * Test Architecture
 * ---------------
 * The test suite follows the API structure:
 * 
 * 1. Request Handling Tests
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
 * 2. Response Tests
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
const mlService = require('../services/mlService');
const { generateToken } = require('../middleware/auth');
const Redis = require('ioredis');

// Mock dependencies
jest.mock('../services/mlService');
jest.mock('ioredis');

describe('ML API Routes', () => {
  let authToken;
  
  /**
   * Test Data Setup
   * --------------
   * Comprehensive test data covering:
   * 1. Different content types
   * 2. Various metrics
   * 3. Multiple platforms
   * 4. Edge cases
   */
  const testUser = {
    id: 'test123',
    username: 'testuser',
    email: 'test@example.com'
  };

  const testContent = {
    text: 'Check out our new #product launch!',
    hasMedia: true,
    hashtags: ['#product', '#launch'],
    type: 'post'
  };

  const testHistoricalData = {
    '2023-01-01T00:00:00Z': {
      engagement: 100,
      growth: 5,
      reach: 1000
    }
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

    // Configure ML service mock
    mlService.predictTrends.mockResolvedValue({
      predictions: [],
      confidence: 0.8
    });

    mlService.optimizeContent.mockResolvedValue({
      recommendations: {},
      optimizationScore: 0.9
    });
  });

  describe('Trend Prediction', () => {
    /**
     * Trend Prediction Tests
     * -------------------
     * Test trend prediction endpoint
     */
    describe('POST /api/ml/predict/trends', () => {
      it('should require authentication', async () => {
        const response = await request(app)
          .post('/api/ml/predict/trends')
          .send({ historicalData: testHistoricalData });

        expect(response.status).toBe(401);
      });

      it('should validate input data', async () => {
        const response = await request(app)
          .post('/api/ml/predict/trends')
          .set('Authorization', `Bearer ${authToken}`)
          .send({ historicalData: {} });

        expect(response.status).toBe(400);
        expect(response.body.error).toBeDefined();
      });

      it('should return predictions', async () => {
        const response = await request(app)
          .post('/api/ml/predict/trends')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            historicalData: testHistoricalData,
            options: { timeframe: 'week' }
          });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeDefined();
        expect(response.body.metadata).toBeDefined();
      });
    });
  });

  describe('Content Optimization', () => {
    /**
     * Content Optimization Tests
     * ----------------------
     * Test content optimization endpoint
     */
    describe('POST /api/ml/optimize/content', () => {
      it('should validate content input', async () => {
        const response = await request(app)
          .post('/api/ml/optimize/content')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            content: { text: '' }
          });

        expect(response.status).toBe(400);
        expect(response.body.error).toBeDefined();
      });

      it('should return optimization recommendations', async () => {
        const response = await request(app)
          .post('/api/ml/optimize/content')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            content: testContent,
            options: { platform: 'twitter' }
          });

        expect(response.status).toBe(200);
        expect(response.body.data.recommendations).toBeDefined();
        expect(response.body.metadata.optimizationScore).toBeDefined();
      });
    });
  });

  describe('Engagement Prediction', () => {
    /**
     * Engagement Prediction Tests
     * -----------------------
     * Test engagement prediction endpoint
     */
    describe('POST /api/ml/predict/engagement', () => {
      it('should require content and context', async () => {
        const response = await request(app)
          .post('/api/ml/predict/engagement')
          .set('Authorization', `Bearer ${authToken}`)
          .send({ content: testContent });

        expect(response.status).toBe(400);
        expect(response.body.error).toBeDefined();
      });

      it('should return engagement predictions', async () => {
        const response = await request(app)
          .post('/api/ml/predict/engagement')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            content: testContent,
            context: {
              platform: 'twitter',
              audience: { size: 10000 }
            }
          });

        expect(response.status).toBe(200);
        expect(response.body.data).toBeDefined();
        expect(response.body.metadata.confidence).toBeDefined();
      });
    });
  });

  describe('Performance Analysis', () => {
    /**
     * Performance Analysis Tests
     * ----------------------
     * Test performance analysis endpoint
     */
    describe('POST /api/ml/analyze/performance', () => {
      it('should validate content array', async () => {
        const response = await request(app)
          .post('/api/ml/analyze/performance')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            content: [],
            metrics: {}
          });

        expect(response.status).toBe(400);
        expect(response.body.error).toBeDefined();
      });

      it('should return performance analysis', async () => {
        const response = await request(app)
          .post('/api/ml/analyze/performance')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            content: [testContent],
            metrics: { engagement: true },
            timeframe: 'week'
          });

        expect(response.status).toBe(200);
        expect(response.body.data).toBeDefined();
        expect(response.body.metadata.contentCount).toBe(1);
      });
    });
  });

  describe('Strategy Recommendations', () => {
    /**
     * Strategy Recommendation Tests
     * -------------------------
     * Test strategy recommendation endpoint
     */
    describe('GET /api/ml/recommendations', () => {
      it('should handle missing accounts', async () => {
        const response = await request(app)
          .get('/api/ml/recommendations')
          .set('Authorization', `Bearer ${authToken}`)
          .query({
            platform: 'twitter',
            goals: 'engagement'
          });

        expect(response.status).toBe(404);
        expect(response.body.error).toBeDefined();
      });

      it('should return strategy recommendations', async () => {
        // Mock account finding
        const SocialAccount = require('../models/SocialAccount');
        SocialAccount.find.mockResolvedValue([{ id: 'account123' }]);

        const response = await request(app)
          .get('/api/ml/recommendations')
          .set('Authorization', `Bearer ${authToken}`)
          .query({
            platform: 'twitter',
            goals: 'engagement',
            timeframe: 'month'
          });

        expect(response.status).toBe(200);
        expect(response.body.data).toBeDefined();
        expect(response.body.metadata.platform).toBe('twitter');
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
      mlService.predictTrends.mockRejectedValue(
        new Error('Prediction failed')
      );

      const response = await request(app)
        .post('/api/ml/predict/trends')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ historicalData: testHistoricalData });

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
          .post('/api/ml/predict/trends')
          .set('Authorization', `Bearer ${authToken}`)
          .send({ historicalData: testHistoricalData })
      );

      const responses = await Promise.all(requests);
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
    });

    it('should utilize caching', async () => {
      // First request
      await request(app)
        .post('/api/ml/predict/trends')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ historicalData: testHistoricalData });

      // Second request should use cache
      const response = await request(app)
        .post('/api/ml/predict/trends')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ historicalData: testHistoricalData });

      expect(response.status).toBe(200);
      expect(mlService.predictTrends).toHaveBeenCalledTimes(1);
    });
  });
});
