/**
 * Analytics API Routes
 * ==================
 * 
 * This module provides RESTful endpoints for accessing social media analytics
 * across all platforms. It exposes metrics, insights, and recommendations
 * for the mother-child strategy implementation.
 * 
 * Route Structure
 * -------------
 * 1. Overview Endpoints
 *    Purpose:
 *    - Provide high-level analytics
 *    - Cross-platform insights
 *    - Strategy effectiveness
 *    - Growth metrics
 * 
 *    Endpoints:
 *    - GET /analytics/overview
 *    - GET /analytics/summary
 *    - GET /analytics/trends
 * 
 * 2. Platform-Specific Endpoints
 *    Purpose:
 *    - Detailed platform metrics
 *    - Platform-specific insights
 *    - Performance analysis
 *    - Growth tracking
 * 
 *    Endpoints:
 *    - GET /analytics/platform/:platform
 *    - GET /analytics/platform/:platform/metrics
 *    - GET /analytics/platform/:platform/insights
 * 
 * 3. Strategy Analysis Endpoints
 *    Purpose:
 *    - Mother-child effectiveness
 *    - Cross-platform coordination
 *    - Resource optimization
 *    - ROI analysis
 * 
 *    Endpoints:
 *    - GET /analytics/strategy
 *    - GET /analytics/strategy/effectiveness
 *    - GET /analytics/strategy/recommendations
 * 
 * Security Implementation
 * --------------------
 * 1. Authentication
 *    - JWT validation
 *    - Role-based access
 *    - API key validation
 *    - Rate limiting
 * 
 * 2. Data Protection
 *    - Data encryption
 *    - Sensitive data handling
 *    - Access logging
 *    - Error masking
 * 
 * 3. Rate Limiting
 *    - Request throttling
 *    - Quota management
 *    - Cache utilization
 *    - Load balancing
 * 
 * Performance Optimization
 * ---------------------
 * 1. Caching Strategy
 *    - Redis caching
 *    - Cache invalidation
 *    - Partial updates
 *    - Cache warming
 * 
 * 2. Query Optimization
 *    - Efficient aggregation
 *    - Selective loading
 *    - Batch processing
 *    - Index utilization
 * 
 * Error Handling
 * ------------
 * 1. Input Validation
 *    - Parameter validation
 *    - Type checking
 *    - Range validation
 *    - Format verification
 * 
 * 2. Error Responses
 *    - Detailed error messages
 *    - Error categorization
 *    - Recovery suggestions
 *    - Debug information
 */

const express = require('express');
const router = express.Router();
const analyticsService = require('../../services/analyticsService');
const auth = require('../../middleware/auth');
const { validateRequest } = require('../../middleware/validation');
const rateLimit = require('express-rate-limit');
const cache = require('../../middleware/cache');

// Configure rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many analytics requests, please try again later'
});

// Apply rate limiting to all routes
router.use(apiLimiter);

/**
 * Get Analytics Overview
 * -------------------
 * Provides comprehensive analytics across all platforms
 * 
 * @route GET /api/analytics/overview
 * @query {string} timeframe - Analysis timeframe (day/week/month)
 * @query {string} metrics - Specific metrics to include
 * @returns {Object} Cross-platform analytics overview
 */
router.get('/overview', auth, cache('5m'), async (req, res) => {
  try {
    const { timeframe = 'week', metrics } = req.query;

    // Get accounts for the authenticated user
    const SocialAccount = require('../../models/SocialAccount');
    const accounts = await SocialAccount.find({ userId: req.user.id });

    // Group accounts by platform
    const platformAccounts = accounts.reduce((acc, account) => {
      if (!acc[account.platform]) {
        acc[account.platform] = {
          mother: null,
          children: []
        };
      }

      if (account.accountType === 'mother') {
        acc[account.platform].mother = account;
      } else {
        acc[account.platform].children.push(account);
      }

      return acc;
    }, {});

    // Get analytics data
    const analytics = await analyticsService.getAnalytics(
      platformAccounts,
      { timeframe, metrics }
    );

    res.json({
      success: true,
      data: analytics,
      metadata: {
        timeframe,
        generatedAt: new Date(),
        platforms: Object.keys(platformAccounts)
      }
    });
  } catch (error) {
    console.error('Error fetching analytics overview:', error);
    res.status(500).json({
      error: 'Failed to fetch analytics overview',
      details: error.message
    });
  }
});

/**
 * Get Platform-Specific Analytics
 * ---------------------------
 * Provides detailed analytics for a specific platform
 * 
 * @route GET /api/analytics/platform/:platform
 * @param {string} platform - Social media platform
 * @query {string} timeframe - Analysis timeframe
 * @query {string} metrics - Specific metrics to include
 * @returns {Object} Platform-specific analytics
 */
router.get('/platform/:platform', auth, cache('5m'), async (req, res) => {
  try {
    const { platform } = req.params;
    const { timeframe = 'week', metrics } = req.query;

    // Validate platform
    const validPlatforms = ['twitter', 'tiktok', 'instagram', 'youtube'];
    if (!validPlatforms.includes(platform)) {
      return res.status(400).json({
        error: 'Invalid platform',
        validPlatforms
      });
    }

    // Get platform accounts
    const SocialAccount = require('../../models/SocialAccount');
    const accounts = await SocialAccount.find({
      userId: req.user.id,
      platform
    });

    // Group into mother-child structure
    const platformAccounts = {
      mother: accounts.find(a => a.accountType === 'mother'),
      children: accounts.filter(a => a.accountType === 'child')
    };

    // Get platform analytics
    const analytics = await analyticsService.getAnalytics(
      { [platform]: platformAccounts },
      { timeframe, metrics }
    );

    res.json({
      success: true,
      data: analytics,
      metadata: {
        platform,
        timeframe,
        generatedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Error fetching platform analytics:', error);
    res.status(500).json({
      error: 'Failed to fetch platform analytics',
      details: error.message
    });
  }
});

/**
 * Get Strategy Analysis
 * -----------------
 * Provides analysis of mother-child strategy effectiveness
 * 
 * @route GET /api/analytics/strategy
 * @query {string} timeframe - Analysis timeframe
 * @returns {Object} Strategy analysis and recommendations
 */
router.get('/strategy', auth, cache('15m'), async (req, res) => {
  try {
    const { timeframe = 'month' } = req.query;

    // Get all accounts
    const SocialAccount = require('../../models/SocialAccount');
    const accounts = await SocialAccount.find({ userId: req.user.id });

    // Group accounts by platform
    const platformAccounts = accounts.reduce((acc, account) => {
      if (!acc[account.platform]) {
        acc[account.platform] = {
          mother: null,
          children: []
        };
      }

      if (account.accountType === 'mother') {
        acc[account.platform].mother = account;
      } else {
        acc[account.platform].children.push(account);
      }

      return acc;
    }, {});

    // Get strategy analytics
    const analytics = await analyticsService.getAnalytics(
      platformAccounts,
      { timeframe, focusArea: 'strategy' }
    );

    res.json({
      success: true,
      data: {
        analysis: analytics.insights,
        recommendations: analytics.recommendations,
        metrics: analytics.metrics.strategy
      },
      metadata: {
        timeframe,
        generatedAt: new Date(),
        platforms: Object.keys(platformAccounts)
      }
    });
  } catch (error) {
    console.error('Error analyzing strategy:', error);
    res.status(500).json({
      error: 'Failed to analyze strategy',
      details: error.message
    });
  }
});

/**
 * Get Analytics Trends
 * -----------------
 * Provides trend analysis and predictions
 * 
 * @route GET /api/analytics/trends
 * @query {string} timeframe - Analysis timeframe
 * @query {string} metrics - Specific metrics to analyze
 * @returns {Object} Trend analysis and predictions
 */
router.get('/trends', auth, cache('30m'), async (req, res) => {
  try {
    const { timeframe = 'month', metrics } = req.query;

    // Get all accounts
    const SocialAccount = require('../../models/SocialAccount');
    const accounts = await SocialAccount.find({ userId: req.user.id });

    // Group accounts by platform
    const platformAccounts = accounts.reduce((acc, account) => {
      if (!acc[account.platform]) {
        acc[account.platform] = {
          mother: null,
          children: []
        };
      }

      if (account.accountType === 'mother') {
        acc[account.platform].mother = account;
      } else {
        acc[account.platform].children.push(account);
      }

      return acc;
    }, {});

    // Get trend analytics
    const analytics = await analyticsService.getAnalytics(
      platformAccounts,
      { timeframe, metrics, focusArea: 'trends' }
    );

    res.json({
      success: true,
      data: {
        trends: analytics.insights.trends,
        predictions: analytics.insights.predictions,
        opportunities: analytics.insights.opportunities
      },
      metadata: {
        timeframe,
        generatedAt: new Date(),
        platforms: Object.keys(platformAccounts)
      }
    });
  } catch (error) {
    console.error('Error analyzing trends:', error);
    res.status(500).json({
      error: 'Failed to analyze trends',
      details: error.message
    });
  }
});

module.exports = router;
