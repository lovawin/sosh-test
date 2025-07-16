/**
 * Instagram API Routes
 * ==================
 * 
 * This module provides the API endpoints for Instagram automation features.
 * It handles all Instagram-specific operations while ensuring security and
 * proper error handling.
 * 
 * Route Structure
 * --------------
 * 1. Account Management
 *    - Profile retrieval
 *    - Analytics
 *    - Status monitoring
 * 
 * 2. Content Operations
 *    - Post management
 *    - Story operations
 *    - Reel handling
 * 
 * 3. Engagement Features
 *    - Like/Comment automation
 *    - Follow management
 *    - Direct messaging
 * 
 * 4. Strategy Execution
 *    - Mother-child coordination
 *    - Engagement automation
 *    - Performance tracking
 * 
 * Security Implementation
 * ---------------------
 * 1. Authentication
 *    - JWT validation
 *    - Account ownership verification
 *    - Session management
 * 
 * 2. Rate Limiting
 *    - Request throttling
 *    - Concurrent operation limits
 *    - IP-based restrictions
 * 
 * 3. Error Handling
 *    - Detailed error messages
 *    - Status code mapping
 *    - Error logging
 * 
 * Usage Notes
 * ----------
 * - All routes require authentication
 * - Rate limits apply to all endpoints
 * - Responses follow standard format
 * - Error handling is consistent
 */

const express = require('express');
const router = express.Router();
const instagramService = require('../../services/instagram.service');
const auth = require('../../middleware/auth');
const { validateRequest } = require('../../middleware/validation');
const rateLimit = require('express-rate-limit');

/**
 * Rate Limiting Configuration
 * -------------------------
 * Implements tiered rate limiting:
 * 1. Global limits for all Instagram operations
 * 2. Stricter limits for write operations
 * 3. Special limits for automated actions
 */

// Global Instagram API limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many Instagram API requests, please try again later'
});

// Stricter limit for engagement actions
const engagementLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // limit each IP to 50 engagement actions per hour
  message: 'Engagement rate limit exceeded, please try again later'
});

// Apply global rate limiting to all routes
router.use(apiLimiter);

/**
 * Get Instagram Profile and Analytics
 * ---------------------------------
 * Retrieves detailed profile information and engagement metrics
 * for a registered Instagram account.
 * 
 * Security:
 * - Requires authentication
 * - Verifies account ownership
 * - Rate limited
 * 
 * @route GET /api/social/instagram/account/:accountId/profile
 * @param {string} accountId - Social account ID from database
 * @returns {Object} Profile information and metrics
 */
router.get('/account/:accountId/profile', auth, async (req, res) => {
  try {
    // Verify account ownership
    const SocialAccount = require('../../models/SocialAccount');
    const account = await SocialAccount.findOne({
      _id: req.params.accountId,
      userId: req.user.id,
      platform: 'instagram'
    });

    if (!account) {
      return res.status(404).json({
        error: 'Instagram account not found',
        details: 'The requested account does not exist or belongs to another user',
        suggestions: [
          'Verify the account ID is correct',
          'Ensure the account is registered in your profile',
          'Check if the account has been removed'
        ]
      });
    }

    const profile = await instagramService.getUserProfile(req.params.accountId);
    res.json(profile);
  } catch (error) {
    console.error('Error in Instagram profile route:', error);
    res.status(500).json({
      error: 'Failed to fetch Instagram profile',
      details: error.message,
      suggestions: [
        'Check if Instagram is accessible',
        'Verify account credentials are valid',
        'Ensure no Instagram API restrictions'
      ]
    });
  }
});

/**
 * Start Mother-Child Strategy
 * -------------------------
 * Initiates the automated mother-child strategy for Instagram accounts.
 * Coordinates content and engagement between mother and child accounts.
 * 
 * Security:
 * - Requires authentication
 * - Verifies all account ownership
 * - Validates strategy parameters
 * - Rate limited
 * 
 * @route POST /api/social/instagram/strategy/start
 * @body {
 *   motherAccountId: string,
 *   childAccountIds: string[],
 *   strategy: {
 *     engagementLevel: 'low' | 'medium' | 'high',
 *     targetHashtags: string[],
 *     postingFrequency: string,
 *     contentTypes: string[]
 *   }
 * }
 * @returns {Object} Strategy execution results
 */
router.post('/strategy/start', auth, validateRequest, engagementLimiter, async (req, res) => {
  try {
    const { motherAccountId, childAccountIds, strategy } = req.body;
    
    // Validate request body
    if (!motherAccountId || !childAccountIds || !strategy) {
      return res.status(400).json({
        error: 'Missing required parameters',
        details: 'Strategy configuration is incomplete',
        required: {
          motherAccountId: 'ID of the main Instagram account',
          childAccountIds: 'Array of child account IDs',
          strategy: 'Engagement and posting configuration'
        }
      });
    }

    // Verify account ownership and type
    const SocialAccount = require('../../models/SocialAccount');
    
    // Verify mother account
    const motherAccount = await SocialAccount.findOne({
      _id: motherAccountId,
      userId: req.user.id,
      platform: 'instagram',
      accountType: 'mother'
    });

    if (!motherAccount) {
      return res.status(404).json({
        error: 'Mother account not found',
        details: 'The specified mother account does not exist or is invalid',
        suggestions: [
          'Verify the mother account ID',
          'Ensure the account is registered as a mother account',
          'Check account status is active'
        ]
      });
    }

    // Verify child accounts
    const childAccounts = await SocialAccount.find({
      _id: { $in: childAccountIds },
      userId: req.user.id,
      platform: 'instagram',
      accountType: 'child'
    });

    if (childAccounts.length !== childAccountIds.length) {
      return res.status(400).json({
        error: 'Invalid child accounts',
        details: 'One or more child accounts are invalid or inaccessible',
        suggestions: [
          'Verify all child account IDs',
          'Ensure accounts are registered as child accounts',
          'Check account statuses are active'
        ]
      });
    }

    // Validate strategy parameters
    if (!this.validateStrategy(strategy)) {
      return res.status(400).json({
        error: 'Invalid strategy configuration',
        details: 'Strategy parameters are invalid or missing',
        requirements: {
          engagementLevel: ['low', 'medium', 'high'],
          targetHashtags: 'Array of relevant hashtags',
          postingFrequency: ['daily', 'weekly', 'custom'],
          contentTypes: ['posts', 'stories', 'reels']
        }
      });
    }

    // Execute strategy with verified accounts
    const result = await instagramService.executeMotherChildStrategy(
      motherAccount,
      childAccounts,
      strategy
    );

    res.json({
      message: 'Instagram strategy started successfully',
      strategy: result,
      nextSteps: [
        'Monitor engagement metrics',
        'Review automated actions',
        'Adjust strategy as needed'
      ]
    });
  } catch (error) {
    console.error('Error in Instagram strategy route:', error);
    res.status(500).json({
      error: 'Failed to execute Instagram strategy',
      details: error.message,
      suggestions: [
        'Check account credentials',
        'Verify Instagram API status',
        'Ensure accounts are not restricted',
        'Review rate limits'
      ]
    });
  }
});

/**
 * Validate Strategy Configuration
 * -----------------------------
 * Validates the mother-child strategy parameters
 * 
 * @param {Object} strategy - Strategy configuration
 * @returns {boolean} Whether strategy is valid
 */
function validateStrategy(strategy) {
  const validEngagementLevels = ['low', 'medium', 'high'];
  const validFrequencies = ['daily', 'weekly', 'custom'];
  const validContentTypes = ['posts', 'stories', 'reels'];

  return (
    strategy &&
    validEngagementLevels.includes(strategy.engagementLevel) &&
    Array.isArray(strategy.targetHashtags) &&
    strategy.targetHashtags.length > 0 &&
    validFrequencies.includes(strategy.postingFrequency) &&
    Array.isArray(strategy.contentTypes) &&
    strategy.contentTypes.every(type => validContentTypes.includes(type))
  );
}

/**
 * Usage Examples
 * -------------
 * Complete flow for implementing Instagram automation:
 * 
 * 1. Register Instagram Accounts:
 *    POST /api/social-accounts/register
 *    {
 *      "platform": "instagram",
 *      "username": "your_instagram_username",
 *      "password": "your_instagram_password",
 *      "accountType": "mother"
 *    }
 * 
 * 2. Register Child Accounts:
 *    POST /api/social-accounts/register
 *    {
 *      "platform": "instagram",
 *      "username": "child_account_username",
 *      "password": "child_account_password",
 *      "accountType": "child"
 *    }
 * 
 * 3. Start Automation Strategy:
 *    POST /api/social/instagram/strategy/start
 *    {
 *      "motherAccountId": "mother_account_id",
 *      "childAccountIds": ["child_account_id_1", "child_account_id_2"],
 *      "strategy": {
 *        "engagementLevel": "medium",
 *        "targetHashtags": ["nft", "crypto", "web3"],
 *        "postingFrequency": "daily",
 *        "contentTypes": ["posts", "stories"]
 *      }
 *    }
 * 
 * Note: Account credentials are securely stored and managed.
 * You only need to provide them once during registration.
 */

module.exports = router;
