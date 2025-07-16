const express = require('express');
const router = express.Router();
const config = require('../../config/config');
const auth = require('../../middleware/auth');
const User = require('../../models/User');

// Import platform services
const twitterService = require('../../services/twitter.service');
const instagramService = require('../../services/instagram.service');
const youtubeService = require('../../services/youtube.service');
const tiktokService = require('../../services/tiktok.service');

// Service mapping
const platformServices = {
  twitter: twitterService,
  instagram: instagramService,
  youtube: youtubeService,
  tiktok: tiktokService
};

// Platform information
const platforms = [
  {
    type: 'twitter',
    name: 'Twitter',
    icon: '/assets/icons/twitter.svg',
    isConnected: false,
  },
  {
    type: 'instagram',
    name: 'Instagram',
    icon: '/assets/icons/instagram.svg',
    isConnected: false,
  },
  {
    type: 'tiktok',
    name: 'TikTok',
    icon: '/assets/icons/tiktok.svg',
    isConnected: false,
  },
  {
    type: 'youtube',
    name: 'YouTube',
    icon: '/assets/icons/youtube.svg',
    isConnected: false,
  },
];

// GET /api/platforms - Get all platforms
router.get('/', auth, (req, res) => {
  res.json(platforms);
});

// GET /api/platforms/:platform - Get specific platform info
router.get('/:platform', auth, (req, res) => {
  const { platform } = req.params;
  const platformInfo = platforms.find(p => p.type === platform);
  
  if (!platformInfo) {
    return res.status(404).json({ error: 'Platform not found' });
  }

  res.json(platformInfo);
});

// GET /api/platforms/:platform/stats - Get platform stats
router.get('/:platform/stats', auth, (req, res) => {
  const { platform } = req.params;
  const platformInfo = platforms.find(p => p.type === platform);
  
  if (!platformInfo) {
    return res.status(404).json({ error: 'Platform not found' });
  }

  // Return mock stats for now
  res.json({
    followers: Math.floor(Math.random() * 10000),
    following: Math.floor(Math.random() * 1000),
    posts: Math.floor(Math.random() * 500)
  });
});

// POST /api/platforms/:platform/sync - Sync platform data
router.post('/:platform/sync', auth, (req, res) => {
  const { platform } = req.params;
  const platformInfo = platforms.find(p => p.type === platform);
  
  if (!platformInfo) {
    return res.status(404).json({ error: 'Platform not found' });
  }

  // In a real implementation, this would sync data from the platform
  res.json({
    success: true,
    message: `${platform} data synced successfully`
  });
});

// POST /api/platforms/:platform/refresh - Refresh platform data
router.post('/:platform/refresh', auth, (req, res) => {
  const { platform } = req.params;
  const platformInfo = platforms.find(p => p.type === platform);
  
  if (!platformInfo) {
    return res.status(404).json({ error: 'Platform not found' });
  }

  // In a real implementation, this would refresh the platform's access token
  res.json({
    success: true,
    message: `${platform} connection refreshed successfully`
  });
});

// POST /api/platforms/:platform/test-connect - Update platform connection (for testing)
router.post('/:platform/test-connect', auth, async (req, res) => {
  try {
    const { platform } = req.params;
    const service = platformServices[platform];

    if (!service) {
      return res.status(400).json({ error: 'Unsupported platform' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await user.updatePlatformConnection(platform, {
      accessToken: 'mock_access_token',
      refreshToken: 'mock_refresh_token',
      username: `mock_${platform}_user`,
      connected: true,
      engagementStats: {
        dailyInteractions: 0,
        lastInteractionDate: new Date(),
        totalLikes: 0,
        totalComments: 0,
        totalSaves: 0
      },
      interactions: []
    });

    res.json({
      success: true,
      message: `${platform} connection updated successfully`
    });
  } catch (error) {
    console.error('Update platform connection error:', error);
    res.status(500).json({ error: 'Failed to update platform connection' });
  }
});

// Mother account endpoints
router.get('/:platform/mother-accounts', auth, async (req, res) => {
  try {
    const { platform } = req.params;
    const service = platformServices[platform];

    if (!service) {
      return res.status(400).json({ error: 'Unsupported platform' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Return mother accounts for this platform
    const motherAccounts = user.platformConnections?.[platform]?.motherAccounts || [];
    res.json(motherAccounts);
  } catch (error) {
    console.error('Get mother accounts error:', error);
    res.status(500).json({ error: 'Failed to get mother accounts' });
  }
});

// Delete mother account
router.delete('/:platform/mother-accounts/:accountId', auth, async (req, res) => {
  try {
    const { platform, accountId } = req.params;
    const service = platformServices[platform];

    if (!service) {
      return res.status(400).json({ error: 'Unsupported platform' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Remove mother account
    if (!user.platformConnections[platform]?.motherAccounts) {
      return res.status(404).json({ error: 'No mother accounts found' });
    }

    user.platformConnections[platform].motherAccounts = user.platformConnections[platform].motherAccounts.filter(
      account => account.id !== accountId
    );

    await user.save();
    res.json({ success: true });
  } catch (error) {
    console.error('Remove mother account error:', error);
    res.status(500).json({ error: 'Failed to remove mother account' });
  }
});

// Enable mother account automation
router.post('/:platform/mother-accounts/:accountId/enable-automation', auth, async (req, res) => {
  try {
    const { platform, accountId } = req.params;
    const service = platformServices[platform];
    const platformConfig = platformConfigs[platform];

    if (!service || !platformConfig) {
      return res.status(400).json({ error: 'Unsupported platform' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Find the mother account
    const motherAccount = user.platformConnections[platform]?.motherAccounts?.find(
      account => account.id === accountId
    );

    if (!motherAccount) {
      return res.status(404).json({ error: 'Mother account not found' });
    }

    // Generate OAuth URL for automation
    const state = Buffer.from(JSON.stringify({
      userId: req.userId,
      platform,
      accountId,
      timestamp: Date.now()
    })).toString('base64');

    const authUrl = platformConfig.getAuthUrl(state);

    res.json({
      success: true,
      data: { authUrl }
    });
  } catch (error) {
    console.error('Enable automation error:', error);
    res.status(500).json({ error: 'Failed to enable automation' });
  }
});

router.post('/:platform/mother-accounts', auth, async (req, res) => {
  try {
    const { platform } = req.params;
    const { username } = req.body;
    const service = platformServices[platform];

    if (!service) {
      return res.status(400).json({ error: 'Unsupported platform' });
    }

    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Add mother account
    const motherAccount = {
      id: Date.now().toString(), // Use timestamp as temporary ID
      username,
      isAutomated: false
    };

    if (!user.platformConnections) {
      user.platformConnections = {};
    }
    if (!user.platformConnections[platform]) {
      user.platformConnections[platform] = {};
    }
    if (!user.platformConnections[platform].motherAccounts) {
      user.platformConnections[platform].motherAccounts = [];
    }

    user.platformConnections[platform].motherAccounts.push(motherAccount);
    await user.save();

    res.json({ success: true, data: motherAccount });
  } catch (error) {
    console.error('Add mother account error:', error);
    res.status(500).json({ error: 'Failed to add mother account' });
  }
});

// Mother-child strategy endpoints
router.post('/:platform/child-accounts', auth, async (req, res) => {
  try {
    const { platform } = req.params;
    const service = platformServices[platform];
    const platformConfig = platformConfigs[platform];

    if (!service || !platformConfig) {
      return res.status(400).json({ error: 'Unsupported platform' });
    }

    // Verify mother account is connected
    const user = await User.findById(req.userId);
    if (!user?.platformConnections?.[platform]?.connected) {
      return res.status(400).json({ error: `Mother account not connected to ${platform}` });
    }

    // Get auth URL for child account
    const state = Buffer.from(JSON.stringify({
      userId: req.userId,
      platform,
      isChild: true,
      timestamp: Date.now()
    })).toString('base64');

    const authUrl = platformConfig.getAuthUrl(state);

    res.json({
      success: true,
      data: { authUrl }
    });
  } catch (error) {
    console.error('Add child account error:', error);
    res.status(500).json({ error: 'Failed to add child account' });
  }
});

router.get('/:platform/child-accounts', auth, async (req, res) => {
  try {
    const { platform } = req.params;
    const service = platformServices[platform];

    if (!service) {
      return res.status(400).json({ error: 'Unsupported platform' });
    }

    const childAccounts = await service.getChildAccounts(req.userId);
    res.json(childAccounts);
  } catch (error) {
    console.error('Get child accounts error:', error);
    res.status(500).json({ error: 'Failed to get child accounts' });
  }
});

router.post('/:platform/engage', auth, async (req, res) => {
  try {
    const { platform } = req.params;
    const { targetUsername } = req.body;
    const service = platformServices[platform];

    if (!service) {
      return res.status(400).json({ error: 'Unsupported platform' });
    }

    if (!targetUsername) {
      return res.status(400).json({ error: 'Target username is required' });
    }

    // Execute engagement strategy
    await service.executeEngagementStrategy(req.userId, targetUsername);

    res.json({
      success: true,
      message: 'Engagement strategy executed successfully'
    });
  } catch (error) {
    console.error('Engagement strategy error:', error);
    res.status(500).json({ error: 'Failed to execute engagement strategy' });
  }
});

router.get('/:platform/engagement-stats', auth, async (req, res) => {
  try {
    const { platform } = req.params;
    const service = platformServices[platform];

    if (!service) {
      return res.status(400).json({ error: 'Unsupported platform' });
    }

    const user = await User.findById(req.userId).select(`platformConnections.${platform}`);
    if (!user?.platformConnections?.[platform]?.connected) {
      return res.status(400).json({ error: `${platform} account not connected` });
    }

    // Get child accounts' engagement stats
    const childAccounts = await service.getChildAccounts(req.userId);
    const stats = {
      totalChildAccounts: childAccounts.length,
      totalInteractions: 0,
      interactionsByType: {},
      childAccountStats: childAccounts.map(child => ({
        username: child[platform].username,
        dailyInteractions: child[platform].engagementStats.dailyInteractions,
        totalInteractions: Object.values(child[platform].engagementStats)
          .filter(val => typeof val === 'number')
          .reduce((sum, val) => sum + val, 0)
      }))
    };

    // Calculate totals
    childAccounts.forEach(child => {
      stats.totalInteractions += child[platform].engagementStats.dailyInteractions;
      Object.entries(child[platform].engagementStats).forEach(([type, count]) => {
        if (typeof count === 'number' && type !== 'dailyInteractions') {
          stats.interactionsByType[type] = (stats.interactionsByType[type] || 0) + count;
        }
      });
    });

    res.json(stats);
  } catch (error) {
    console.error('Get engagement stats error:', error);
    res.status(500).json({ error: 'Failed to get engagement stats' });
  }
});

// OAuth configuration for each platform
const platformConfigs = {
  twitter: {
    getAuthUrl: (state) => {
      const params = new URLSearchParams({
        client_id: config.twitter.apiKey,
        redirect_uri: config.twitter.callbackURL,
        response_type: 'code',
        scope: 'tweet.read tweet.write users.read follows.read follows.write',
        state
      });
      return `https://twitter.com/i/oauth2/authorize?${params.toString()}`;
    }
  },
  instagram: {
    getAuthUrl: (state) => {
      const params = new URLSearchParams({
        client_id: config.instagram.clientId,
        redirect_uri: `http://localhost:3002/api/platforms/callback/instagram`,
        response_type: 'code',
        scope: 'basic public_content',
        state
      });
      return `https://api.instagram.com/oauth/authorize?${params.toString()}`;
    }
  },
  youtube: {
    getAuthUrl: (state) => {
      const params = new URLSearchParams({
        client_id: config.youtube.clientId,
        redirect_uri: config.youtube.callbackURL,
        response_type: 'code',
        scope: 'https://www.googleapis.com/auth/youtube',
        state,
        access_type: 'offline'
      });
      return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    }
  },
  tiktok: {
    getAuthUrl: (state) => {
      const params = new URLSearchParams({
        client_key: config.tiktok.clientKey,
        redirect_uri: config.tiktok.callbackURL,
        response_type: 'code',
        scope: 'user.info.basic video.list',
        state
      });
      return `https://www.tiktok.com/auth/authorize?${params.toString()}`;
    }
  }
};

/**
 * @route   POST /api/platforms/:platform/connect
 * @desc    Get OAuth URL for platform connection
 * @access  Private
 */
router.post('/:platform/connect', auth, async (req, res) => {
  try {
    const { platform } = req.params;
    const platformConfig = platformConfigs[platform];

    if (!platformConfig) {
      return res.status(400).json({ error: 'Unsupported platform' });
    }

    // Generate state parameter to prevent CSRF
    const state = Buffer.from(JSON.stringify({
      userId: req.userId,
      platform,
      timestamp: Date.now()
    })).toString('base64');

    const authUrl = platformConfig.getAuthUrl(state);

    res.json({
      success: true,
      data: { authUrl }
    });
  } catch (error) {
    console.error(`Platform connection error for ${req.params.platform}:`, error);
    res.status(500).json({ error: 'Failed to generate auth URL' });
  }
});

/**
 * @route   GET /api/platforms/callback/:platform
 * @desc    Handle OAuth callback from platforms
 * @access  Public
 */
router.get('/callback/:platform', async (req, res) => {
  try {
    const { platform } = req.params;
    const { code, state, error } = req.query;
    const service = platformServices[platform];

    if (error) {
      return res.redirect(`/auth/callback?platform=${platform}&error=${error}`);
    }

    if (!code || !state) {
      return res.redirect(`/auth/callback?platform=${platform}&error=missing_params`);
    }

    if (!service) {
      return res.redirect(`/auth/callback?platform=${platform}&error=unsupported_platform`);
    }

    // Decode and validate state parameter
    let stateData;
    try {
      stateData = JSON.parse(Buffer.from(state, 'base64').toString());
      
      // Validate timestamp to prevent replay attacks
      const MAX_STATE_AGE = 5 * 60 * 1000; // 5 minutes
      if (Date.now() - stateData.timestamp > MAX_STATE_AGE) {
        throw new Error('State expired');
      }
    } catch (error) {
      return res.redirect(`/auth/callback?platform=${platform}&error=invalid_state`);
    }

    try {
      // Exchange code for tokens
      const tokens = await service.getAccessToken(
        code,
        stateData.isChild,
        stateData.isChild ? stateData.userId : null
      );

      // Get user profile
      const profile = await service.getUserProfile(tokens.access_token);

      // Find or update user
      const user = await User.findById(stateData.userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Update platform connection
      await user.updatePlatformConnection(platform, {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        username: profile.username,
        isChildAccount: stateData.isChild,
        motherAccountId: stateData.isChild ? stateData.userId : null
      });

      // Update platform status
      const platformInfo = platforms.find(p => p.type === platform);
      if (platformInfo) {
        platformInfo.isConnected = true;
      }

      // Redirect back to frontend with success
      res.redirect(`/auth/callback?platform=${platform}&code=${code}`);
    } catch (error) {
      console.error(`${platform} connection error:`, error);
      res.redirect(`/auth/callback?platform=${platform}&error=connection_failed`);
    }
  } catch (error) {
    console.error(`OAuth callback error for ${req.params.platform}:`, error);
    res.redirect(`/auth/callback?platform=${req.params.platform}&error=server_error`);
  }
});

module.exports = router;
