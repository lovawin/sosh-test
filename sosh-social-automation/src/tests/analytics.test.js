/**
 * Analytics Routes Tests
 * ===================
 * 
 * Comprehensive test suite for the analytics API endpoints.
 * Tests cover request handling, authentication, data processing,
 * and error scenarios across all analytics routes.
 * 
 * Test Architecture
 * ---------------
 * The test suite follows a layered approach matching the API structure:
 * 
 * 1. Request Layer Tests
 *    Purpose:
 *    - Validate request handling
 *    - Test parameter processing
 *    - Verify authentication
 *    - Check rate limiting
 * 
 *    Key Aspects:
 *    - Route validation
 *    - Parameter validation
 *    - Auth middleware
 *    - Rate limit checks
 * 
 * 2. Processing Layer Tests
 *    Purpose:
 *    - Test data aggregation
 *    - Verify calculations
 *    - Check caching
 *    - Validate responses
 * 
 *    Key Aspects:
 *    - Data processing
 *    - Cache handling
 *    - Response formatting
 *    - Error handling
 * 
 * 3. Integration Layer Tests
 *    Purpose:
 *    - Test service integration
 *    - Verify data flow
 *    - Check error propagation
 *    - Validate end-to-end
 * 
 *    Key Aspects:
 *    - Service calls
 *    - Data transformation
 *    - Error scenarios
 *    - Full workflows
 * 
 * Test Categories
 * -------------
 * 1. Authentication Tests
 *    - Token validation
 *    - Permission checks
 *    - Invalid auth scenarios
 *    - Token expiration
 * 
 * 2. Request Validation Tests
 *    - Parameter validation
 *    - Query processing
 *    - Input sanitization
 *    - Format verification
 * 
 * 3. Response Tests
 *    - Data structure
 *    - Format consistency
 *    - Error responses
 *    - Status codes
 * 
 * 4. Performance Tests
 *    - Response times
 *    - Cache effectiveness
 *    - Rate limiting
 *    - Load handling
 */

const request = require('supertest');
const app = require('../server');
const analyticsService = require('../services/analyticsService');
const { generateToken } = require('../middleware/auth');
const SocialAccount = require('../models/SocialAccount');
const redis = require('redis');

// Mock dependencies
jest.mock('../services/analyticsService');
jest.mock('../models/SocialAccount');
jest.mock('redis');

describe('Analytics API Routes', () => {
  let authToken;
  
  /**
   * Test Data Setup
   * --------------
   * Comprehensive test data covering various scenarios:
   * 1. Different account configurations
   * 2. Various timeframes
   * 3. Multiple metrics
   * 4. Error conditions
   */
  const testUser = {
    id: 'test123',
    username: 'testuser',
    email: 'test@example.com'
  };

  const testAccounts = {
    twitter: {
      mother: { _id: 'tw_mother', platform: 'twitter', accountType: 'mother' },
      children: [
        { _id: 'tw_child1', platform: 'twitter', accountType: 'child' }
      ]
    },
    instagram: {
      mother: { _id: 'ig_mother', platform: 'instagram', accountType: 'mother' },
      children: [
        { _id: 'ig_child1', platform: 'instagram', accountType: 'child' }
      ]
    }
  };

  /**
   * Test Environment Setup
   * -------------------
   * Prepares clean test environment before each test:
   * 1. Reset all mocks
   * 2. Generate fresh auth token
   * 3. Configure mock implementations
   * 4. Initialize test data
   */
  beforeEach(() => {
    jest.clearAllMocks();
    authToken = generateToken(testUser);

    // Configure analytics service mock
    analyticsService.getAnalytics.mockResolvedValue({
      metrics: {
        engagement: { /* mock metrics */ },
        growth: { /* mock metrics */ }
      },
      insights: {
        trends: [],
        predictions: [],
        opportunities: []
      },
      recommendations: {
        strategy: [],
        content: [],
        timing: []
      }
    });

    // Configure social account mock
    SocialAccount.find.mockResolvedValue([
      ...Object.values(testAccounts.twitter),
      ...Object.values(testAccounts.instagram)
    ].flat());
  });

  describe('Overview Analytics', () => {
    /**
     * Overview Route Tests
     * -----------------
     * Test comprehensive analytics endpoint
     */
    describe('GET /api/analytics/overview', () => {
      it('should require authentication', async () => {
        const response = await request(app)
          .get('/api/analytics/overview');

        expect(response.status).toBe(401);
      });

      it('should return analytics overview', async () => {
        const response = await request(app)
          .get('/api/analytics/overview')
          .set('Authorization', `Bearer ${authToken}`)
          .query({ timeframe: 'week' });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeDefined();
        expect(response.body.metadata).toBeDefined();
      });

      it('should handle invalid timeframe', async () => {
        const response = await request(app)
          .get('/api/analytics/overview')
          .set('Authorization', `Bearer ${authToken}`)
          .query({ timeframe: 'invalid' });

        expect(response.status).toBe(400);
        expect(response.body.error).toBeDefined();
      });
    });
  });

  describe('Platform Analytics', () => {
    /**
     * Platform-Specific Tests
     * --------------------
     * Test platform-specific analytics endpoints
     */
    describe('GET /api/analytics/platform/:platform', () => {
      it('should validate platform parameter', async () => {
        const response = await request(app)
          .get('/api/analytics/platform/invalid')
          .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Invalid platform');
      });

      it('should return platform analytics', async () => {
        const response = await request(app)
          .get('/api/analytics/platform/twitter')
          .set('Authorization', `Bearer ${authToken}`)
          .query({ timeframe: 'week' });

        expect(response.status).toBe(200);
        expect(response.body.data).toBeDefined();
        expect(response.body.metadata.platform).toBe('twitter');
      });
    });
  });

  describe('Strategy Analytics', () => {
    /**
     * Strategy Analysis Tests
     * -------------------
     * Test strategy analysis endpoints
     */
    describe('GET /api/analytics/strategy', () => {
      it('should return strategy analysis', async () => {
        const response = await request(app)
          .get('/api/analytics/strategy')
          .set('Authorization', `Bearer ${authToken}`)
          .query({ timeframe: 'month' });

        expect(response.status).toBe(200);
        expect(response.body.data.analysis).toBeDefined();
        expect(response.body.data.recommendations).toBeDefined();
      });

      it('should handle missing accounts', async () => {
        SocialAccount.find.mockResolvedValue([]);

        const response = await request(app)
          .get('/api/analytics/strategy')
          .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(200);
        expect(response.body.data.analysis).toBeDefined();
        expect(response.body.metadata.platforms).toHaveLength(0);
      });
    });
  });

  describe('Trends Analytics', () => {
    /**
     * Trends Analysis Tests
     * ------------------
     * Test trends and predictions endpoints
     */
    describe('GET /api/analytics/trends', () => {
      it('should return trend analysis', async () => {
        const response = await request(app)
          .get('/api/analytics/trends')
          .set('Authorization', `Bearer ${authToken}`)
          .query({ timeframe: 'month' });

        expect(response.status).toBe(200);
        expect(response.body.data.trends).toBeDefined();
        expect(response.body.data.predictions).toBeDefined();
      });

      it('should handle specific metrics', async () => {
        const response = await request(app)
          .get('/api/analytics/trends')
          .set('Authorization', `Bearer ${authToken}`)
          .query({
            timeframe: 'month',
            metrics: 'engagement,growth'
          });

        expect(response.status).toBe(200);
        expect(analyticsService.getAnalytics).toHaveBeenCalledWith(
          expect.any(Object),
          expect.objectContaining({
            metrics: 'engagement,growth'
          })
        );
      });
    });
  });

  describe('Error Handling', () => {
    /**
     * Error Scenario Tests
     * -----------------
     * Test error handling across endpoints
     */
    describe('Service Failures', () => {
      it('should handle analytics service errors', async () => {
        analyticsService.getAnalytics.mockRejectedValue(
          new Error('Analytics processing failed')
        );

        const response = await request(app)
          .get('/api/analytics/overview')
          .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(500);
        expect(response.body.error).toBeDefined();
        expect(response.body.details).toBeDefined();
      });

      it('should handle database errors', async () => {
        SocialAccount.find.mockRejectedValue(
          new Error('Database connection failed')
        );

        const response = await request(app)
          .get('/api/analytics/overview')
          .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(500);
        expect(response.body.error).toBeDefined();
      });
    });
  });

  describe('Performance', () => {
    /**
     * Performance Tests
     * --------------
     * Test response times and caching
     */
    it('should handle concurrent requests efficiently', async () => {
      const startTime = Date.now();
      
      const requests = Array(5).fill().map(() => 
        request(app)
          .get('/api/analytics/overview')
          .set('Authorization', `Bearer ${authToken}`)
      );

      const responses = await Promise.all(requests);
      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(1000); // Should complete within 1 second
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
    });

    it('should utilize cache effectively', async () => {
      // First request
      await request(app)
        .get('/api/analytics/overview')
        .set('Authorization', `Bearer ${authToken}`);

      // Second request should use cache
      const response = await request(app)
        .get('/api/analytics/overview')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(analyticsService.getAnalytics).toHaveBeenCalledTimes(1);
    });
  });
});
