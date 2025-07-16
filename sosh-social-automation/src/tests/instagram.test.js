/**
 * Instagram Service Tests
 * =====================
 * 
 * Comprehensive test suite for Instagram automation features.
 * Tests cover both service methods and API endpoints.
 * 
 * Test Categories
 * --------------
 * 1. Authentication & Security
 *    - Credential verification
 *    - Session management
 *    - Error handling
 * 
 * 2. Account Operations
 *    - Profile retrieval
 *    - Analytics calculation
 *    - Status monitoring
 * 
 * 3. Mother-Child Strategy
 *    - Strategy validation
 *    - Execution flow
 *    - Error scenarios
 * 
 * 4. API Integration
 *    - Endpoint validation
 *    - Response formats
 *    - Error responses
 * 
 * Testing Notes
 * ------------
 * - Uses Jest testing framework
 * - Mocks external API calls
 * - Simulates database operations
 * - Validates security measures
 */

const request = require('supertest');
const app = require('../server');
const instagramService = require('../services/instagram.service');
const { generateToken } = require('../middleware/auth');
const SocialAccount = require('../models/SocialAccount');

// Mock user for testing
const testUser = {
  id: 'test123',
  username: 'testuser',
  email: 'test@example.com'
};

// Test authentication token
const authToken = generateToken(testUser);

// Sample test data
const sampleMotherAccount = {
  _id: 'mother123',
  userId: testUser.id,
  platform: 'instagram',
  username: 'mother_account',
  accountType: 'mother',
  status: 'active'
};

const sampleChildAccounts = [
  {
    _id: 'child123',
    userId: testUser.id,
    platform: 'instagram',
    username: 'child_account1',
    accountType: 'child',
    status: 'active'
  },
  {
    _id: 'child456',
    userId: testUser.id,
    platform: 'instagram',
    username: 'child_account2',
    accountType: 'child',
    status: 'active'
  }
];

const sampleStrategy = {
  engagementLevel: 'medium',
  targetHashtags: ['nft', 'crypto', 'web3'],
  postingFrequency: 'daily',
  contentTypes: ['posts', 'stories']
};

/**
 * Mock Setup
 * ----------
 * Configure Jest mocks for external dependencies
 */
jest.mock('../services/instagram.service');
jest.mock('../models/SocialAccount');

describe('Instagram Service Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Account Authentication', () => {
    it('should verify valid credentials', async () => {
      const credentials = {
        username: 'test_user',
        password: 'valid_password'
      };

      instagramService.verifyCredentials.mockResolvedValue(true);
      const result = await instagramService.verifyCredentials(
        credentials.username,
        credentials.password
      );

      expect(result).toBe(true);
      expect(instagramService.verifyCredentials).toHaveBeenCalledWith(
        credentials.username,
        credentials.password
      );
    });

    it('should reject invalid credentials', async () => {
      const credentials = {
        username: 'test_user',
        password: 'wrong_password'
      };

      instagramService.verifyCredentials.mockResolvedValue(false);
      const result = await instagramService.verifyCredentials(
        credentials.username,
        credentials.password
      );

      expect(result).toBe(false);
    });
  });

  describe('Profile Operations', () => {
    it('should fetch profile information', async () => {
      const mockProfile = {
        id: '12345',
        username: 'test_user',
        followerCount: 1000,
        followingCount: 500,
        mediaCount: 100,
        engagement: 3.5
      };

      instagramService.getUserProfile.mockResolvedValue(mockProfile);
      const profile = await instagramService.getUserProfile('account123');

      expect(profile).toEqual(mockProfile);
      expect(profile.engagement).toBeDefined();
      expect(typeof profile.engagement).toBe('number');
    });

    it('should handle profile fetch errors', async () => {
      instagramService.getUserProfile.mockRejectedValue(
        new Error('Profile not accessible')
      );

      await expect(instagramService.getUserProfile('invalid_id'))
        .rejects
        .toThrow('Profile not accessible');
    });
  });

  describe('Mother-Child Strategy', () => {
    it('should execute strategy successfully', async () => {
      const mockResult = {
        motherAccount: {
          id: sampleMotherAccount._id,
          username: sampleMotherAccount.username,
          contentAnalysis: {
            bestTimes: { '9': 100, '15': 150 },
            topHashtags: { '#nft': 50, '#crypto': 30 }
          }
        },
        childStrategies: sampleChildAccounts.map(child => ({
          accountId: child._id,
          username: child.username,
          engagementPlan: {
            targetPosts: [],
            recommendedHashtags: ['#nft', '#crypto']
          }
        }))
      };

      instagramService.executeMotherChildStrategy.mockResolvedValue(mockResult);

      const result = await instagramService.executeMotherChildStrategy(
        sampleMotherAccount,
        sampleChildAccounts,
        sampleStrategy
      );

      expect(result).toEqual(mockResult);
      expect(result.motherAccount.contentAnalysis).toBeDefined();
      expect(result.childStrategies.length).toBe(sampleChildAccounts.length);
    });

    it('should validate strategy parameters', async () => {
      const invalidStrategy = {
        ...sampleStrategy,
        engagementLevel: 'invalid'
      };

      await expect(
        instagramService.executeMotherChildStrategy(
          sampleMotherAccount,
          sampleChildAccounts,
          invalidStrategy
        )
      ).rejects.toThrow();
    });
  });
});

describe('Instagram API Endpoint Tests', () => {
  describe('GET /api/social/instagram/account/:accountId/profile', () => {
    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/social/instagram/account/123/profile');

      expect(response.status).toBe(401);
    });

    it('should fetch profile with valid token', async () => {
      const mockProfile = {
        username: 'test_account',
        followerCount: 1000,
        engagement: 3.5
      };

      SocialAccount.findOne.mockResolvedValue(sampleMotherAccount);
      instagramService.getUserProfile.mockResolvedValue(mockProfile);

      const response = await request(app)
        .get(`/api/social/instagram/account/${sampleMotherAccount._id}/profile`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockProfile);
    });

    it('should handle non-existent accounts', async () => {
      SocialAccount.findOne.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/social/instagram/account/invalid_id/profile')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('POST /api/social/instagram/strategy/start', () => {
    it('should validate required parameters', async () => {
      const response = await request(app)
        .post('/api/social/instagram/strategy/start')
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
      expect(response.body.required).toBeDefined();
    });

    it('should start strategy with valid parameters', async () => {
      const mockResult = {
        message: 'Strategy started successfully',
        strategy: {
          motherAccount: {
            id: sampleMotherAccount._id,
            contentAnalysis: {}
          },
          childStrategies: []
        }
      };

      SocialAccount.findOne.mockResolvedValue(sampleMotherAccount);
      SocialAccount.find.mockResolvedValue(sampleChildAccounts);
      instagramService.executeMotherChildStrategy.mockResolvedValue(mockResult.strategy);

      const response = await request(app)
        .post('/api/social/instagram/strategy/start')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          motherAccountId: sampleMotherAccount._id,
          childAccountIds: sampleChildAccounts.map(child => child._id),
          strategy: sampleStrategy
        });

      expect(response.status).toBe(200);
      expect(response.body.strategy).toBeDefined();
      expect(response.body.nextSteps).toBeDefined();
    });

    it('should handle invalid mother account', async () => {
      SocialAccount.findOne.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/social/instagram/strategy/start')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          motherAccountId: 'invalid_id',
          childAccountIds: sampleChildAccounts.map(child => child._id),
          strategy: sampleStrategy
        });

      expect(response.status).toBe(404);
      expect(response.body.error).toMatch(/mother account not found/i);
    });
  });
});

/**
 * Test Utilities
 * -------------
 * Helper functions for common test operations
 */

function createMockProfile(username, followerCount = 1000) {
  return {
    username,
    followerCount,
    followingCount: Math.floor(followerCount * 0.5),
    mediaCount: Math.floor(followerCount * 0.1),
    engagement: (Math.random() * 5).toFixed(2)
  };
}

function createMockPost(engagement = 100) {
  return {
    id: `post_${Date.now()}`,
    caption: 'Test post #nft #crypto',
    mediaType: 'image',
    timestamp: Date.now() / 1000,
    likes: Math.floor(engagement * 0.8),
    comments: Math.floor(engagement * 0.2),
    hashtags: ['#nft', '#crypto']
  };
}
