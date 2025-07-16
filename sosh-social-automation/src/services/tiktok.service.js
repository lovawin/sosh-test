const axios = require('axios');
const config = require('../config/config');
const User = require('../models/User');

class TikTokService {
  constructor() {
    this.baseUrl = 'https://open-api.tiktok.com/v2';
    this.maxChildAccounts = config.motherChild.maxChildAccounts || 100;
    this.interactionDelay = config.motherChild.interactionDelay || 300;
    this.maxInteractionsPerDay = config.motherChild.maxInteractionsPerDay || 100;
  }

  /**
   * Exchange authorization code for access token
   * @param {string} code - Authorization code from TikTok
   * @param {boolean} isChildAccount - Whether this is a child account
   * @param {string} motherAccountId - User ID of the mother account if this is a child
   * @returns {Promise<{access_token: string, refresh_token: string}>}
   */
  async getAccessToken(code, isChildAccount = false, motherAccountId = null) {
    try {
      // If this is a child account, verify mother account hasn't reached limit
      if (isChildAccount && motherAccountId) {
        const motherUser = await User.findById(motherAccountId);
        if (!motherUser) {
          throw new Error('Mother account not found');
        }

        const childCount = await User.countDocuments({
          'platformConnections.tiktok.motherAccountId': motherAccountId
        });

        if (childCount >= this.maxChildAccounts) {
          throw new Error(`Maximum child accounts (${this.maxChildAccounts}) reached`);
        }
      }

      const response = await axios.post(
        'https://open-api.tiktok.com/oauth/access_token/',
        {
          client_key: config.tiktok.clientKey,
          client_secret: config.tiktok.clientSecret,
          code,
          grant_type: 'authorization_code'
        }
      );

      return {
        access_token: response.data.data.access_token,
        refresh_token: response.data.data.refresh_token,
        is_child_account: isChildAccount,
        mother_account_id: motherAccountId,
        open_id: response.data.data.open_id
      };
    } catch (error) {
      console.error('TikTok token exchange error:', error.response?.data || error.message);
      throw new Error('Failed to exchange TikTok authorization code');
    }
  }

  /**
   * Get user's child accounts
   * @param {string} userId - User ID of mother account
   * @returns {Promise<Array>} List of child accounts
   */
  async getChildAccounts(userId) {
    try {
      const children = await User.find({
        'platformConnections.tiktok.motherAccountId': userId
      }).select('platformConnections.tiktok');

      return children.map(child => ({
        id: child._id,
        tiktok: child.platformConnections.tiktok
      }));
    } catch (error) {
      console.error('Get child accounts error:', error);
      throw new Error('Failed to get child accounts');
    }
  }

  /**
   * Execute mother-child engagement strategy
   * @param {string} motherUserId - User ID of mother account
   * @param {string} targetUsername - Username to engage with
   */
  async executeEngagementStrategy(motherUserId, targetUsername) {
    try {
      const motherUser = await User.findById(motherUserId);
      if (!motherUser?.platformConnections?.tiktok?.accessToken) {
        throw new Error('Mother account not properly connected');
      }

      // Get child accounts
      const childAccounts = await this.getChildAccounts(motherUserId);
      if (childAccounts.length === 0) {
        throw new Error('No child accounts found');
      }

      // Get target user's recent videos
      const targetVideos = await this.getUserVideos(
        motherUser.platformConnections.tiktok.accessToken,
        targetUsername
      );

      // Distribute engagement across child accounts
      for (const video of targetVideos) {
        // Randomly select child account for each interaction
        const childAccount = childAccounts[Math.floor(Math.random() * childAccounts.length)];
        
        // Check daily interaction limit
        const dailyInteractions = await this.getDailyInteractionCount(childAccount.id);
        if (dailyInteractions >= this.maxInteractionsPerDay) {
          continue;
        }

        // Perform engagement action (like or comment)
        await this.performEngagementAction(
          childAccount.tiktok.accessToken,
          video.id,
          ['like', 'comment'][Math.floor(Math.random() * 2)]
        );

        // Record interaction
        await this.recordInteraction(childAccount.id, video.id);

        // Delay between interactions to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, this.interactionDelay * 1000));
      }
    } catch (error) {
      console.error('TikTok engagement strategy error:', error);
      throw new Error('Failed to execute engagement strategy');
    }
  }

  /**
   * Get user's recent videos
   * @param {string} accessToken - TikTok access token
   * @param {string} username - Target username
   * @returns {Promise<Array>} List of recent videos
   */
  async getUserVideos(accessToken, username) {
    try {
      // First get user info from username
      const userResponse = await axios.get(
        `${this.baseUrl}/user/info/`,
        {
          params: {
            fields: 'open_id,union_id',
            username
          },
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );

      const openId = userResponse.data.data.user.open_id;

      // Then get recent videos
      const videosResponse = await axios.get(
        `${this.baseUrl}/video/list/`,
        {
          params: {
            open_id: openId,
            cursor: 0,
            max_count: 10,
            fields: 'id,create_time,share_url,title,video_description'
          },
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );

      return videosResponse.data.data.videos || [];
    } catch (error) {
      console.error('Get user videos error:', error.response?.data || error.message);
      throw new Error('Failed to get user videos');
    }
  }

  /**
   * Perform engagement action
   * @param {string} accessToken - TikTok access token
   * @param {string} videoId - Video ID to engage with
   * @param {string} action - Type of engagement (like, comment)
   */
  async performEngagementAction(accessToken, videoId, action) {
    try {
      switch (action) {
        case 'like':
          await axios.post(
            `${this.baseUrl}/video/like/`,
            {
              video_id: videoId,
              like_state: 1 // 1 for like, 0 for unlike
            },
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
              }
            }
          );
          break;

        case 'comment':
          const commentText = this.generateCommentText();
          await axios.post(
            `${this.baseUrl}/comment/post/`,
            {
              video_id: videoId,
              comment_text: commentText
            },
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
              }
            }
          );
          break;
      }
    } catch (error) {
      console.error('TikTok engagement action error:', error.response?.data || error.message);
      throw new Error(`Failed to perform ${action}`);
    }
  }

  /**
   * Generate comment text
   * @returns {string} Generated comment text
   */
  generateCommentText() {
    const comments = [
      'Love this! 💖',
      'So creative! 🎨',
      'Amazing vibes! ✨',
      'This is fire! 🔥',
      'Keep it up! 🚀'
    ];
    return comments[Math.floor(Math.random() * comments.length)];
  }

  /**
   * Get daily interaction count for an account
   * @param {string} userId - User ID
   * @returns {Promise<number>} Number of interactions today
   */
  async getDailyInteractionCount(userId) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const count = await User.countDocuments({
        _id: userId,
        'platformConnections.tiktok.interactions.timestamp': { $gte: today }
      });

      return count;
    } catch (error) {
      console.error('Get interaction count error:', error);
      return this.maxInteractionsPerDay; // Return limit to prevent further interactions
    }
  }

  /**
   * Record an interaction
   * @param {string} userId - User ID
   * @param {string} videoId - Video ID
   */
  async recordInteraction(userId, videoId) {
    try {
      await User.updateOne(
        { _id: userId },
        {
          $push: {
            'platformConnections.tiktok.interactions': {
              videoId,
              timestamp: new Date()
            }
          }
        }
      );
    } catch (error) {
      console.error('Record interaction error:', error);
    }
  }
}

module.exports = new TikTokService();
