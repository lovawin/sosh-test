const axios = require('axios');
const config = require('../config/config');
const User = require('../models/User');

class InstagramService {
  constructor() {
    this.baseUrl = 'https://graph.instagram.com';
    this.maxChildAccounts = config.motherChild.maxChildAccounts || 100;
    this.interactionDelay = config.motherChild.interactionDelay || 300;
    this.maxInteractionsPerDay = config.motherChild.maxInteractionsPerDay || 100;
  }

  /**
   * Exchange authorization code for access token
   * @param {string} code - Authorization code from Instagram
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
          'platformConnections.instagram.motherAccountId': motherAccountId
        });

        if (childCount >= this.maxChildAccounts) {
          throw new Error(`Maximum child accounts (${this.maxChildAccounts}) reached`);
        }
      }

      // For testing/development, return mock tokens
      if (code === 'mock_code') {
        return {
          access_token: 'mock_access_token',
          refresh_token: 'mock_refresh_token',
          is_child_account: isChildAccount,
          mother_account_id: motherAccountId
        };
      }

      const response = await axios.post(
        'https://api.instagram.com/oauth/access_token',
        new URLSearchParams({
          client_id: config.instagram.clientId,
          client_secret: config.instagram.clientSecret,
          grant_type: 'authorization_code',
          redirect_uri: config.instagram.callbackURL,
          code,
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      return {
        access_token: response.data.access_token,
        refresh_token: response.data.refresh_token,
        is_child_account: isChildAccount,
        mother_account_id: motherAccountId
      };
    } catch (error) {
      console.error('Instagram token exchange error:', error.response?.data || error.message);
      throw new Error('Failed to exchange Instagram authorization code');
    }
  }

  /**
   * Get user profile information
   * @param {string} accessToken - Instagram access token
   * @returns {Promise<Object>} User profile data
   */
  async getUserProfile(accessToken) {
    try {
      // For testing/development, return mock profile
      if (accessToken === 'mock_access_token') {
        return {
          username: 'mock_instagram_user',
          id: 'mock_user_id'
        };
      }

      const response = await axios.get(
        `${this.baseUrl}/users/self`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );

      return {
        username: response.data.username,
        id: response.data.id
      };
    } catch (error) {
      console.error('Get Instagram profile error:', error.response?.data || error.message);
      throw new Error('Failed to get Instagram profile');
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
        'platformConnections.instagram.motherAccountId': userId
      }).select('platformConnections.instagram');

      return children.map(child => ({
        id: child._id,
        instagram: child.platformConnections.instagram
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
      if (!motherUser?.platformConnections?.instagram?.accessToken) {
        throw new Error('Mother account not properly connected');
      }

      // Get child accounts
      const childAccounts = await this.getChildAccounts(motherUserId);
      if (childAccounts.length === 0) {
        throw new Error('No child accounts found');
      }

      // Get target user's recent media
      const targetMedia = await this.getUserMedia(
        motherUser.platformConnections.instagram.accessToken,
        targetUsername
      );

      // Distribute engagement across child accounts
      for (const media of targetMedia) {
        // Randomly select child account for each interaction
        const childAccount = childAccounts[Math.floor(Math.random() * childAccounts.length)];
        
        // Check daily interaction limit
        const dailyInteractions = await this.getDailyInteractionCount(childAccount.id);
        if (dailyInteractions >= this.maxInteractionsPerDay) {
          continue;
        }

        // Perform engagement action (like or comment)
        await this.performEngagementAction(
          childAccount.instagram.accessToken,
          media.id,
          ['like', 'comment'][Math.floor(Math.random() * 2)]
        );

        // Record interaction
        await this.recordInteraction(childAccount.id, media.id);

        // Delay between interactions to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, this.interactionDelay * 1000));
      }
    } catch (error) {
      console.error('Instagram engagement strategy error:', error);
      throw new Error('Failed to execute engagement strategy');
    }
  }

  /**
   * Get user's recent media
   * @param {string} accessToken - Instagram access token
   * @param {string} username - Target username
   * @returns {Promise<Array>} List of recent media
   */
  async getUserMedia(accessToken, username) {
    try {
      // First get user ID from username
      const userResponse = await axios.get(
        `${this.baseUrl}/users/${username}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const userId = userResponse.data.id;

      // Then get recent media
      const mediaResponse = await axios.get(
        `${this.baseUrl}/${userId}/media?fields=id,caption,media_type`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      return mediaResponse.data.data || [];
    } catch (error) {
      console.error('Get user media error:', error.response?.data || error.message);
      throw new Error('Failed to get user media');
    }
  }

  /**
   * Perform engagement action
   * @param {string} accessToken - Instagram access token
   * @param {string} mediaId - Media ID to engage with
   * @param {string} action - Type of engagement (like, comment)
   */
  async performEngagementAction(accessToken, mediaId, action) {
    try {
      switch (action) {
        case 'like':
          await axios.post(
            `${this.baseUrl}/media/${mediaId}/likes`,
            {},
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );
          break;

        case 'comment':
          const commentText = this.generateCommentText();
          await axios.post(
            `${this.baseUrl}/media/${mediaId}/comments`,
            { text: commentText },
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
              },
            }
          );
          break;
      }
    } catch (error) {
      console.error('Instagram engagement action error:', error.response?.data || error.message);
      throw new Error(`Failed to perform ${action}`);
    }
  }

  /**
   * Generate comment text
   * @returns {string} Generated comment text
   */
  generateCommentText() {
    const comments = [
      'Amazing! 🔥',
      'Love this! 💖',
      'Great content! 👏',
      'Fantastic shot! 📸',
      'This is awesome! ✨'
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
        'platformConnections.instagram.interactions.timestamp': { $gte: today }
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
   * @param {string} mediaId - Media ID
   */
  async recordInteraction(userId, mediaId) {
    try {
      await User.updateOne(
        { _id: userId },
        {
          $push: {
            'platformConnections.instagram.interactions': {
              mediaId,
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

module.exports = new InstagramService();
