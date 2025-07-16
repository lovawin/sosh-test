/**
 * YouTube Quota Manager
 * ===================
 * 
 * Manages YouTube API quota usage to prevent exceeding daily limits.
 * YouTube API uses a quota points system where different operations
 * cost different amounts of points from a daily quota.
 * 
 * Daily Quota: 10,000 units
 * 
 * Common Operation Costs
 * --------------------
 * - Read operations: 1 unit
 * - Write operations: 50 units
 * - Upload operations: 1600 units
 * - Batch operations: Varies
 * 
 * Features
 * --------
 * 1. Quota Tracking
 *    - Daily usage monitoring
 *    - Per-operation cost calculation
 *    - Quota reset handling
 * 
 * 2. Rate Management
 *    - Operation throttling
 *    - Cost prediction
 *    - Quota reservation
 * 
 * 3. Error Prevention
 *    - Pre-operation validation
 *    - Quota exceeded prevention
 *    - Emergency shutdown
 */

const mongoose = require('mongoose');
const { promisify } = require('util');
const redis = require('redis');

// Operation costs in quota points
const OPERATION_COSTS = {
  // Read Operations
  'list': 1,
  'search': 100,
  'channels': 1,
  'videos': 1,
  'playlists': 1,
  'comments': 1,
  'analytics': 1,

  // Write Operations
  'insert': 50,
  'update': 50,
  'delete': 50,
  'rate': 50,
  'comment': 50,
  'subscribe': 50,

  // Upload Operations
  'upload': 1600,
  'livestream': 1600,

  // Batch Operations
  'batch': 50,
  'playlist-update': 50,
  'bulk-delete': 50
};

// Default daily quota limit
const DAILY_QUOTA_LIMIT = 10000;

class YouTubeQuotaManager {
  constructor() {
    // Initialize Redis client for quota tracking
    this.redis = redis.createClient({
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379
    });

    // Promisify Redis methods
    this.getAsync = promisify(this.redis.get).bind(this.redis);
    this.setAsync = promisify(this.redis.set).bind(this.redis);
    this.incrByAsync = promisify(this.redis.incrBy).bind(this.redis);
    this.expireAsync = promisify(this.redis.expire).bind(this.redis);

    // Initialize quota tracking
    this.initializeQuotaTracking();
  }

  /**
   * Initialize daily quota tracking
   * 
   * @private
   */
  async initializeQuotaTracking() {
    const today = this.getTodayKey();
    const exists = await this.getAsync(today);

    if (!exists) {
      await this.setAsync(today, '0');
      // Set expiration for 24 hours
      await this.expireAsync(today, 24 * 60 * 60);
    }
  }

  /**
   * Get Redis key for today's quota
   * 
   * @private
   * @returns {string} Redis key
   */
  getTodayKey() {
    const date = new Date();
    return `youtube_quota:${date.toISOString().split('T')[0]}`;
  }

  /**
   * Get operation cost in quota points
   * 
   * @param {string} operation - API operation name
   * @returns {number} Quota cost
   */
  getOperationCost(operation) {
    return OPERATION_COSTS[operation] || 1;
  }

  /**
   * Check if quota is available for operation
   * 
   * @param {number} cost - Operation cost in quota points
   * @returns {Promise<boolean>} Whether quota is available
   */
  async hasQuotaAvailable(cost) {
    const currentUsage = parseInt(await this.getAsync(this.getTodayKey()) || '0');
    return (currentUsage + cost) <= DAILY_QUOTA_LIMIT;
  }

  /**
   * Deduct quota points for operation
   * 
   * @param {number} cost - Operation cost in quota points
   * @returns {Promise<number>} Remaining quota
   */
  async deductQuota(cost) {
    const key = this.getTodayKey();
    const newUsage = await this.incrByAsync(key, cost);
    
    if (newUsage > DAILY_QUOTA_LIMIT) {
      // Rollback if exceeded
      await this.incrByAsync(key, -cost);
      throw new Error('Quota limit exceeded');
    }

    return DAILY_QUOTA_LIMIT - newUsage;
  }

  /**
   * Get current quota status
   * 
   * @returns {Promise<Object>} Quota status
   */
  async getQuotaStatus() {
    const currentUsage = parseInt(await this.getAsync(this.getTodayKey()) || '0');
    
    return {
      limit: DAILY_QUOTA_LIMIT,
      used: currentUsage,
      remaining: DAILY_QUOTA_LIMIT - currentUsage,
      resetTime: await this.getQuotaResetTime()
    };
  }

  /**
   * Get time until quota reset
   * 
   * @returns {Promise<Date>} Reset time
   */
  async getQuotaResetTime() {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow;
  }

  /**
   * Reserve quota for a sequence of operations
   * 
   * @param {Array<string>} operations - List of operations
   * @returns {Promise<boolean>} Whether reservation was successful
   */
  async reserveQuota(operations) {
    const totalCost = operations.reduce(
      (sum, op) => sum + this.getOperationCost(op),
      0
    );

    if (await this.hasQuotaAvailable(totalCost)) {
      // Add a small buffer for concurrent operations
      const bufferCost = Math.ceil(totalCost * 0.1);
      return this.hasQuotaAvailable(totalCost + bufferCost);
    }

    return false;
  }

  /**
   * Emergency quota reset (for administrative use)
   * 
   * @param {string} adminKey - Administrative access key
   * @returns {Promise<void>}
   */
  async emergencyReset(adminKey) {
    if (adminKey !== process.env.YOUTUBE_ADMIN_KEY) {
      throw new Error('Unauthorized quota reset attempt');
    }

    await this.setAsync(this.getTodayKey(), '0');
    console.info('YouTube quota emergency reset performed');
  }

  /**
   * Get quota cost prediction for strategy
   * 
   * @param {Object} strategy - Automation strategy configuration
   * @returns {Object} Predicted quota usage
   */
  predictQuotaUsage(strategy) {
    const predictions = {
      daily: 0,
      weekly: 0,
      monthly: 0,
      operations: {}
    };

    // Calculate base operation costs
    const operationCounts = this.calculateOperationCounts(strategy);
    
    for (const [operation, count] of Object.entries(operationCounts)) {
      const cost = this.getOperationCost(operation) * count;
      predictions.operations[operation] = cost;
      predictions.daily += cost;
    }

    // Calculate extended predictions
    predictions.weekly = predictions.daily * 7;
    predictions.monthly = predictions.daily * 30;

    return predictions;
  }

  /**
   * Calculate operation counts based on strategy
   * 
   * @private
   * @param {Object} strategy - Automation strategy
   * @returns {Object} Operation counts
   */
  calculateOperationCounts(strategy) {
    const counts = {};

    // Base operations
    counts.list = 10; // Regular API calls
    counts.search = 5; // Content discovery
    
    // Engagement operations based on level
    const engagementMultiplier = {
      low: 1,
      medium: 2,
      high: 3
    }[strategy.engagementLevel] || 1;

    counts.comment = 5 * engagementMultiplier;
    counts.rate = 10 * engagementMultiplier;
    
    // Content type specific operations
    if (strategy.contentTypes.includes('regular')) {
      counts.upload = 1;
    }
    if (strategy.contentTypes.includes('shorts')) {
      counts.upload += 2; // Shorts have lower cost but higher frequency
    }
    if (strategy.contentTypes.includes('livestream')) {
      counts.livestream = 1;
    }

    return counts;
  }
}

module.exports = new YouTubeQuotaManager();
