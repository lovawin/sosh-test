/**
 * TikTok API Routes
 * 
 * These routes expose TikTok-specific functionality for the mother-child strategy.
 * All routes require authentication and include rate limiting.
 * 
 * Important Note:
 * Users do NOT need to provide TikTok API credentials.
 * The service uses our platform's verified API credentials for all operations.
 * Users only need to:
 * 1. Register/login to our platform
 * 2. Provide their TikTok account usernames
 * 3. Configure their automation strategy
 * 
 * Example Usage:
 * 1. Register user:
 *    POST /api/auth/register
 *    {
 *      "username": "platform_user",
 *      "password": "secure_password",
 *      "email": "user@example.com"
 *    }
 * 
 * 2. Start TikTok automation:
 *    POST /api/social/tiktok/strategy/start
 *    {
 *      "motherAccount": {
 *        "username": "tiktok_main_account"
 *      },
 *      "childAccounts": [
 *        { "username": "tiktok_child1" },
 *        { "username": "tiktok_child2" }
 *      ],
 *      "strategy": {
 *        "engagementLevel": "medium",
 *        "targetHashtags": ["nft", "crypto", "web3"]
 *      }
 *    }
 */

const express = require('express');
const router = express.Router();
const tiktokService = require('../../services/tiktok.service');
const auth = require('../../middleware/auth');
const { validateRequest } = require('../../middleware/validation');
const rateLimit = require('express-rate-limit');

// Rate limiting configuration
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

// Apply rate limiting to all routes
router.use(apiLimiter);

/**
 * Get TikTok user profile and analytics
 * 
 * @route GET /api/social/tiktok/account/:accountId/profile
 * @param {string} accountId - Social account ID from database
 * @returns {Object} User profile and engagement metrics
 */
router.get('/account/:accountId/profile', auth, async (req, res) => {
  try {
    // Verify account ownership
    const SocialAccount = require('../../models/SocialAccount');
    const account = await SocialAccount.findOne({
      _id: req.params.accountId,
      userId: req.user.id,
      platform: 'tiktok'
    });

    if (!account) {
      return res.status(404).json({
        error: 'TikTok account not found',
        details: 'The requested account does not exist or belongs to another user'
      });
    }

    const profile = await tiktokService.getUserProfile(req.params.accountId);
    res.json(profile);
  } catch (error) {
    console.error('Error in TikTok user profile route:', error);
    res.status(500).json({ error: 'Failed to fetch TikTok profile' });
  }
});

/**
 * Get user's TikTok videos with analytics
 * 
 * @route GET /api/social/tiktok/videos/:userId
 * @param {string} userId - TikTok user ID
 * @query {number} limit - Maximum number of videos to retrieve
 * @returns {Array} List of videos with metrics
 */
router.get('/videos/:userId', auth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 30;
    const videos = await tiktokService.getUserVideos(req.params.userId, limit);
    res.json(videos);
  } catch (error) {
    console.error('Error in TikTok videos route:', error);
    res.status(500).json({ error: 'Failed to fetch TikTok videos' });
  }
});

/**
 * Search TikTok videos by hashtag
 * 
 * @route GET /api/social/tiktok/search/:hashtag
 * @param {string} hashtag - Hashtag to search (without #)
 * @query {number} limit - Maximum number of videos to retrieve
 * @returns {Array} List of matching videos
 */
router.get('/search/:hashtag', auth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const videos = await tiktokService.searchByHashtag(req.params.hashtag, limit);
    res.json(videos);
  } catch (error) {
    console.error('Error in TikTok hashtag search route:', error);
    res.status(500).json({ error: 'Failed to search TikTok hashtag' });
  }
});

/**
 * Get trending sounds analysis
 * 
 * @route GET /api/social/tiktok/trends/sounds
 * @query {string} category - Content category to analyze
 * @returns {Array} List of trending sounds with metrics
 */
router.get('/trends/sounds', auth, async (req, res) => {
  try {
    const trends = await tiktokService.analyzeTrendingSounds(req.query.category);
    res.json(trends);
  } catch (error) {
    console.error('Error in TikTok trends route:', error);
    res.status(500).json({ error: 'Failed to fetch TikTok trends' });
  }
});

/**
 * Start mother-child strategy for TikTok
 * 
 * @route POST /api/social/tiktok/strategy/start
 * @body {
 *   motherAccountId: string,
 *   childAccountIds: string[],
 *   strategy: {
 *     engagementLevel: 'low' | 'medium' | 'high',
 *     targetHashtags: string[],
 *     postingFrequency: string
 *   }
 * }
 * @returns {Object} Strategy execution results
 */
router.post('/strategy/start', auth, validateRequest, async (req, res) => {
  try {
    const { motherAccountId, childAccountIds, strategy } = req.body;
    
    // Validate request body
    if (!motherAccountId || !childAccountIds || !strategy) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    // Verify account ownership and type
    const SocialAccount = require('../../models/SocialAccount');
    
    // Verify mother account
    const motherAccount = await SocialAccount.findOne({
      _id: motherAccountId,
      userId: req.user.id,
      platform: 'tiktok',
      accountType: 'mother'
    });

    if (!motherAccount) {
      return res.status(404).json({
        error: 'Mother account not found',
        details: 'The specified mother account does not exist or is invalid'
      });
    }

    // Verify child accounts
    const childAccounts = await SocialAccount.find({
      _id: { $in: childAccountIds },
      userId: req.user.id,
      platform: 'tiktok',
      accountType: 'child'
    });

    if (childAccounts.length !== childAccountIds.length) {
      return res.status(400).json({
        error: 'Invalid child accounts',
        details: 'One or more child accounts are invalid or inaccessible'
      });
    }

    // Execute strategy with verified accounts
    const result = await tiktokService.executeMotherChildStrategy(
      motherAccount,
      childAccounts,
      strategy
    );

    res.json(result);
  } catch (error) {
    console.error('Error in TikTok strategy route:', error);
    res.status(500).json({ error: 'Failed to execute TikTok strategy' });
  }
});

/**
 * Complete Usage Flow Example:
 * 
 * 1. Register TikTok Accounts:
 *    POST /api/social-accounts/register
 *    {
 *      "platform": "tiktok",
 *      "username": "your_tiktok_username",
 *      "password": "your_tiktok_password",
 *      "accountType": "mother"
 *    }
 * 
 *    // Register child accounts similarly
 *    POST /api/social-accounts/register
 *    {
 *      "platform": "tiktok",
 *      "username": "child_account_username",
 *      "password": "child_account_password",
 *      "accountType": "child"
 *    }
 * 
 * 2. List Registered Accounts:
 *    GET /api/social-accounts
 *    Response will include account IDs needed for strategy
 * 
 * 3. Start Mother-Child Strategy:
 *    POST /api/social/tiktok/strategy/start
 *    {
 *      "motherAccountId": "mother_account_id_from_step_2",
 *      "childAccountIds": [
 *        "child_account_id_1",
 *        "child_account_id_2"
 *      ],
 *      "strategy": {
 *        "engagementLevel": "medium",
 *        "targetHashtags": ["nft", "crypto", "web3"],
 *        "postingFrequency": "daily"
 *      }
 *    }
 * 
 * Note: Account credentials are securely stored and managed by our platform.
 * You only need to provide them once during registration.
 */

module.exports = router;
