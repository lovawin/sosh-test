const axios = require('axios');
const config = require('../config/config');
const User = require('../models/User');

class TwitterService {
  constructor() {
    this.baseUrl = 'https://api.twitter.com/2';
    this.authUrl = 'https://api.twitter.com/2/oauth2';
    this.maxChildAccounts = config.motherChild.maxChildAccounts || 5;
    this.interactionDelay = config.motherChild.interactionDelay || 300; // seconds
    this.maxInteractionsPerDay = config.motherChild.maxInteractionsPerDay || 100;
  }

  /**
   * Exchange authorization code for access token
   * @param {string} code - Authorization code from Twitter
   * @param {boolean} isChildAccount - Whether this is a child account
   * @param {string} motherAccountId - User ID of the mother account if this is a child
   * @returns {Promise<{access_token: string, refresh_token: string}>}
   */
  async getAccessToken(code, isChildAccount = false, motherAccountId = null) {
    const basicAuth = Buffer.from(
      `${config.twitter.apiKey}:${config.twitter.apiSecret}`
    ).toString('base64');

    try {
      // If this is a child account, verify mother account hasn't reached limit
      if (isChildAccount && motherAccountId) {
        const motherUser = await User.findById(motherAccountId);
        if (!motherUser) {
          throw new Error('Mother account not found');
        }

        const childCount = await User.countDocuments({
          'platformConnections.twitter.motherAccountId': motherAccountId
        });

        if (childCount >= this.maxChildAccounts) {
          throw new Error(`Maximum child accounts (${this.maxChildAccounts}) reached`);
        }
      }

      const response = await axios.post(
        'https://api.twitter.com/2/oauth2/token',
        new URLSearchParams({
          code,
          grant_type: 'authorization_code',
          client_id: config.twitter.apiKey,
          redirect_uri: config.twitter.callbackURL,
          code_verifier: 'challenge',
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${basicAuth}`,
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
      console.error('Twitter token exchange error:', error.response?.data || error.message);
      throw new Error('Failed to exchange Twitter authorization code');
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
        'platformConnections.twitter.motherAccountId': userId
      }).select('platformConnections.twitter');

      return children.map(child => ({
        id: child._id,
        twitter: child.platformConnections.twitter
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
      if (!motherUser?.platformConnections?.twitter?.accessToken) {
        throw new Error('Mother account not properly connected');
      }

      // Get child accounts
      const childAccounts = await this.getChildAccounts(motherUserId);
      if (childAccounts.length === 0) {
        throw new Error('No child accounts found');
      }

      // Get target user's recent tweets
      const targetTweets = await this.getUserTweets(
        motherUser.platformConnections.twitter.accessToken,
        targetUsername
      );

      // Distribute engagement across child accounts
      for (const tweet of targetTweets) {
        // Randomly select child account for each interaction
        const childAccount = childAccounts[Math.floor(Math.random() * childAccounts.length)];
        
        // Check daily interaction limit
        const dailyInteractions = await this.getDailyInteractionCount(childAccount.id);
        if (dailyInteractions >= this.maxInteractionsPerDay) {
          continue;
        }

        // Perform engagement action (like, retweet, or reply)
        await this.performEngagementAction(
          childAccount.twitter.accessToken,
          tweet.id,
          ['like', 'retweet', 'reply'][Math.floor(Math.random() * 3)]
        );

        // Record interaction
        await this.recordInteraction(childAccount.id, tweet.id);

        // Delay between interactions to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, this.interactionDelay * 1000));
      }
    } catch (error) {
      console.error('Engagement strategy error:', error);
      throw new Error('Failed to execute engagement strategy');
    }
  }

  /**
   * Get user's recent tweets
   * @param {string} accessToken - Twitter access token
   * @param {string} username - Target username
   * @returns {Promise<Array>} List of recent tweets
   */
  async getUserTweets(accessToken, username) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/users/by/username/${username}/tweets?max_results=10`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      return response.data.data || [];
    } catch (error) {
      console.error('Get user tweets error:', error.response?.data || error.message);
      throw new Error('Failed to get user tweets');
    }
  }

  /**
   * Perform engagement action
   * @param {string} accessToken - Twitter access token
   * @param {string} tweetId - Tweet ID to engage with
   * @param {string} action - Type of engagement (like, retweet, reply)
   */
  async performEngagementAction(accessToken, tweetId, action) {
    try {
      switch (action) {
        case 'like':
          await axios.post(
            `${this.baseUrl}/users/me/likes`,
            { tweet_id: tweetId },
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
              },
            }
          );
          break;

        case 'retweet':
          await axios.post(
            `${this.baseUrl}/users/me/retweets`,
            { tweet_id: tweetId },
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
              },
            }
          );
          break;

        case 'reply':
          const replyText = this.generateReplyText();
          await this.createTweet(accessToken, replyText, [], tweetId);
          break;
      }
    } catch (error) {
      console.error('Engagement action error:', error.response?.data || error.message);
      throw new Error(`Failed to perform ${action}`);
    }
  }

  /**
   * Generate reply text
   * @returns {string} Generated reply text
   */
  generateReplyText() {
    const replies = [
      'Great point! 👏',
      'Interesting perspective 🤔',
      'Thanks for sharing! 🙌',
      'Totally agree! 💯',
      'This is awesome! 🔥'
    ];
    return replies[Math.floor(Math.random() * replies.length)];
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
        'platformConnections.twitter.interactions.timestamp': { $gte: today }
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
   * @param {string} tweetId - Tweet ID
   */
  async recordInteraction(userId, tweetId) {
    try {
      await User.updateOne(
        { _id: userId },
        {
          $push: {
            'platformConnections.twitter.interactions': {
              tweetId,
              timestamp: new Date()
            }
          }
        }
      );
    } catch (error) {
      console.error('Record interaction error:', error);
    }
  }

  // ... (previous methods for token refresh, user profile, etc.)
}

module.exports = new TwitterService();
