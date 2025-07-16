/**
 * YouTube API Routes
 * ================
 * 
 * This module provides the API endpoints for YouTube automation features.
 * It handles OAuth authentication, channel operations, and mother-child
 * strategy execution.
 * 
 * YouTube-Specific Features
 * ----------------------
 * 1. OAuth Flow
 *    - Authorization code grant
 *    - Token refresh handling
 *    - Scope management
 * 
 * 2. Quota Management
 *    - Daily quota tracking
 *    - Operation cost calculation
 *    - Quota-aware rate limiting
 * 
 * 3. Content Types
 *    - Regular videos
 *    - Shorts
 *    - Live streams
 *    - Community posts
 * 
 * Security Implementation
 * ---------------------
 * 1. OAuth Security
 *    - State parameter validation
 *    - PKCE implementation
 *    - Token encryption
 * 
 * 2. Rate Limiting
 *    - Quota-based limits
 *    - Request frequency limits
 *    - Concurrent operation limits
 * 
 * 3. Error Handling
 *    - Quota exceeded handling
 *    - Token refresh logic
 *    - Error response mapping
 */

const express = require('express');
const router = express.Router();
const youtubeService = require('../../services/youtube.service');
const auth = require('../../middleware/auth');
const { validateRequest } = require('../../middleware/validation');
const rateLimit = require('express-rate-limit');
const quotaManager = require('../../utils/youtubeQuotaManager');

/**
 * Rate Limiting Configuration
 * -------------------------
 * Implements quota-aware rate limiting for YouTube API
 */

// Global YouTube API limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many YouTube API requests, please try again later'
});

// Quota-based limiter for write operations
const quotaLimiter = async (req, res, next) => {
  try {
    const operation = req.path.split('/').pop();
    const cost = quotaManager.getOperationCost(operation);
    
    if (await quotaManager.hasQuotaAvailable(cost)) {
      await quotaManager.deductQuota(cost);
      next();
    } else {
      res.status(429).json({
        error: 'YouTube API quota exceeded',
        details: 'Daily quota limit reached',
        resetTime: await quotaManager.getQuotaResetTime()
      });
    }
  } catch (error) {
    next(error);
  }
};

// Apply rate limiting to all routes
router.use(apiLimiter);

/**
 * OAuth Authorization Routes
 * -----------------------
 */

/**
 * Initiate OAuth flow for YouTube account
 * 
 * @route GET /api/social/youtube/auth/start
 * @query {string} accountType - 'mother' or 'child'
 */
router.get('/auth/start', auth, async (req, res) => {
  try {
    const { accountType } = req.query;
    
    if (!['mother', 'child'].includes(accountType)) {
      return res.status(400).json({
        error: 'Invalid account type',
        validTypes: ['mother', 'child']
      });
    }

    const authUrl = await youtubeService.generateAuthUrl(accountType);
    res.json({ authUrl });
  } catch (error) {
    console.error('Error starting YouTube OAuth:', error);
    res.status(500).json({
      error: 'Failed to start YouTube authentication',
      details: error.message
    });
  }
});

/**
 * Handle OAuth callback
 * 
 * @route GET /api/social/youtube/auth/callback
 * @query {string} code - Authorization code
 * @query {string} state - State parameter for validation
 */
router.get('/auth/callback', auth, async (req, res) => {
  try {
    const { code, state } = req.query;
    
    // Exchange code for tokens
    const tokens = await youtubeService.handleAuthCallback(code, state);
    
    // Store credentials securely
    const account = await youtubeService.registerChannel(
      req.user.id,
      tokens,
      JSON.parse(state).accountType
    );

    res.json({
      message: 'YouTube channel connected successfully',
      account: {
        id: account._id,
        channelTitle: account.channelTitle,
        accountType: account.accountType
      }
    });
  } catch (error) {
    console.error('Error handling YouTube OAuth callback:', error);
    res.status(500).json({
      error: 'Failed to complete YouTube authentication',
      details: error.message
    });
  }
});

/**
 * Channel Management Routes
 * ----------------------
 */

/**
 * Get YouTube channel profile and analytics
 * 
 * @route GET /api/social/youtube/channel/:accountId/profile
 * @param {string} accountId - Social account ID from database
 */
router.get('/channel/:accountId/profile', auth, quotaLimiter, async (req, res) => {
  try {
    // Verify account ownership
    const SocialAccount = require('../../models/SocialAccount');
    const account = await SocialAccount.findOne({
      _id: req.params.accountId,
      userId: req.user.id,
      platform: 'youtube'
    });

    if (!account) {
      return res.status(404).json({
        error: 'YouTube channel not found',
        details: 'The requested channel does not exist or belongs to another user'
      });
    }

    const profile = await youtubeService.getChannelProfile(req.params.accountId);
    res.json(profile);
  } catch (error) {
    console.error('Error getting YouTube profile:', error);
    res.status(500).json({
      error: 'Failed to fetch YouTube profile',
      details: error.message
    });
  }
});

/**
 * Strategy Management Routes
 * -----------------------
 */

/**
 * Start mother-child strategy for YouTube
 * 
 * @route POST /api/social/youtube/strategy/start
 * @body {
 *   motherAccountId: string,
 *   childAccountIds: string[],
 *   strategy: {
 *     engagementLevel: 'low' | 'medium' | 'high',
 *     contentTypes: string[],
 *     postingFrequency: string
 *   }
 * }
 */
router.post('/strategy/start', auth, validateRequest, quotaLimiter, async (req, res) => {
  try {
    const { motherAccountId, childAccountIds, strategy } = req.body;
    
    // Validate request body
    if (!motherAccountId || !childAccountIds || !strategy) {
      return res.status(400).json({
        error: 'Missing required parameters',
        required: {
          motherAccountId: 'ID of the main YouTube channel',
          childAccountIds: 'Array of child channel IDs',
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
      platform: 'youtube',
      accountType: 'mother'
    });

    if (!motherAccount) {
      return res.status(404).json({
        error: 'Mother channel not found',
        details: 'The specified mother channel does not exist or is invalid'
      });
    }

    // Verify child accounts
    const childAccounts = await SocialAccount.find({
      _id: { $in: childAccountIds },
      userId: req.user.id,
      platform: 'youtube',
      accountType: 'child'
    });

    if (childAccounts.length !== childAccountIds.length) {
      return res.status(404).json({
        error: 'Invalid child channels',
        details: 'One or more child channels are invalid or inaccessible'
      });
    }

    // Execute strategy
    const result = await youtubeService.executeMotherChildStrategy(
      motherAccount,
      childAccounts,
      strategy
    );

    res.json({
      message: 'YouTube strategy started successfully',
      strategy: result,
      quotaUsage: await quotaManager.getQuotaStatus()
    });
  } catch (error) {
    console.error('Error executing YouTube strategy:', error);
    res.status(500).json({
      error: 'Failed to execute YouTube strategy',
      details: error.message
    });
  }
});

/**
 * Usage Examples
 * ------------
 * Complete flow for implementing YouTube automation:
 * 
 * 1. Start OAuth Flow:
 *    GET /api/social/youtube/auth/start?accountType=mother
 *    
 *    Response:
 *    {
 *      "authUrl": "https://accounts.google.com/o/oauth2/..."
 *    }
 * 
 * 2. Handle OAuth Callback:
 *    GET /api/social/youtube/auth/callback?code=...&state=...
 *    
 *    Response:
 *    {
 *      "message": "YouTube channel connected successfully",
 *      "account": {
 *        "id": "account_id",
 *        "channelTitle": "Channel Name",
 *        "accountType": "mother"
 *      }
 *    }
 * 
 * 3. Start Automation:
 *    POST /api/social/youtube/strategy/start
 *    {
 *      "motherAccountId": "mother_account_id",
 *      "childAccountIds": ["child_account_id_1", "child_account_id_2"],
 *      "strategy": {
 *        "engagementLevel": "medium",
 *        "contentTypes": ["regular", "shorts"],
 *        "postingFrequency": "daily"
 *      }
 *    }
 * 
 * Note: YouTube API quotas are tracked and managed automatically.
 * The system will prevent operations that would exceed daily quota limits.
 */

module.exports = router;
