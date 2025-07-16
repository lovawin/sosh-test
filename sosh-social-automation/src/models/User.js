const mongoose = require('mongoose');

// Common platform connection schema
const platformConnectionSchema = {
  connected: { type: Boolean, default: false },
  accessToken: String,
  refreshToken: String,
  username: String,
  lastSync: Date,
  isChildAccount: { type: Boolean, default: false },
  motherAccountId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  motherAccounts: [{
    id: String,
    username: String,
    isAutomated: { type: Boolean, default: false }
  }],
  // Child account personality and relationship data
  childAccountProfile: {
    type: {
      personality: {
        type: String,
        trim: true,
        required: function() { return this.isChildAccount; }
      },
      relationshipToMother: {
        type: String,
        trim: true,
        required: function() { return this.isChildAccount; }
      }
    },
    required: function() { return this.isChildAccount; }
  },
  interactions: [{
    contentId: String, // tweetId, postId, videoId etc.
    type: String, // platform-specific interaction types
    timestamp: { type: Date, default: Date.now }
  }],
  engagementStats: {
    dailyInteractions: { type: Number, default: 0 },
    lastInteractionDate: Date
  }
};

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  avatar: {
    type: String
  },
  platformConnections: {
    twitter: {
      ...platformConnectionSchema,
      engagementStats: {
        ...platformConnectionSchema.engagementStats,
        totalLikes: { type: Number, default: 0 },
        totalRetweets: { type: Number, default: 0 },
        totalReplies: { type: Number, default: 0 }
      },
      interactions: [{
        ...platformConnectionSchema.interactions[0],
        type: { type: String, enum: ['like', 'retweet', 'reply'] }
      }]
    },
    instagram: {
      ...platformConnectionSchema,
      engagementStats: {
        ...platformConnectionSchema.engagementStats,
        totalLikes: { type: Number, default: 0 },
        totalComments: { type: Number, default: 0 },
        totalSaves: { type: Number, default: 0 }
      },
      interactions: [{
        ...platformConnectionSchema.interactions[0],
        type: { type: String, enum: ['like', 'comment', 'save'] }
      }]
    },
    youtube: {
      ...platformConnectionSchema,
      engagementStats: {
        ...platformConnectionSchema.engagementStats,
        totalLikes: { type: Number, default: 0 },
        totalComments: { type: Number, default: 0 },
        totalSubscribes: { type: Number, default: 0 }
      },
      interactions: [{
        ...platformConnectionSchema.interactions[0],
        type: { type: String, enum: ['like', 'comment', 'subscribe'] }
      }]
    },
    tiktok: {
      ...platformConnectionSchema,
      engagementStats: {
        ...platformConnectionSchema.engagementStats,
        totalLikes: { type: Number, default: 0 },
        totalComments: { type: Number, default: 0 },
        totalShares: { type: Number, default: 0 }
      },
      interactions: [{
        ...platformConnectionSchema.interactions[0],
        type: { type: String, enum: ['like', 'comment', 'share'] }
      }]
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Remove sensitive fields when converting to JSON
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  delete user.platformConnections;
  return user;
};

// Update platform connection status
userSchema.methods.updatePlatformConnection = async function(platform, connectionData) {
  if (!this.platformConnections[platform]) {
    throw new Error(`Unsupported platform: ${platform}`);
  }

  this.platformConnections[platform] = {
    ...this.platformConnections[platform],
    ...connectionData,
    connected: true,
    lastSync: new Date()
  };

  return this.save();
};

// Disconnect platform
userSchema.methods.disconnectPlatform = async function(platform) {
  if (!this.platformConnections[platform]) {
    throw new Error(`Unsupported platform: ${platform}`);
  }

  this.platformConnections[platform] = {
    connected: false,
    accessToken: null,
    refreshToken: null,
    username: null,
    lastSync: null,
    isChildAccount: false,
    motherAccountId: null,
    interactions: [],
    engagementStats: {
      dailyInteractions: 0,
      lastInteractionDate: null
    }
  };

  return this.save();
};

// Get connected platforms
userSchema.methods.getConnectedPlatforms = function() {
  const connected = {};
  Object.keys(this.platformConnections).forEach(platform => {
    connected[platform] = this.platformConnections[platform].connected;
  });
  return connected;
};

// Record platform interaction
userSchema.methods.recordInteraction = async function(platform, interaction) {
  if (!this.platformConnections[platform]) {
    throw new Error(`Unsupported platform: ${platform}`);
  }

  const platformConnection = this.platformConnections[platform];
  
  // Add interaction to history
  platformConnection.interactions.push({
    contentId: interaction.contentId,
    type: interaction.type,
    timestamp: new Date()
  });

  // Update engagement stats
  platformConnection.engagementStats.dailyInteractions++;
  platformConnection.engagementStats.lastInteractionDate = new Date();
  
  // Update platform-specific stats
  const statKey = `total${interaction.type.charAt(0).toUpperCase() + interaction.type.slice(1)}s`;
  if (platformConnection.engagementStats[statKey] !== undefined) {
    platformConnection.engagementStats[statKey]++;
  }

  // Reset daily interactions at midnight
  const lastDate = platformConnection.engagementStats.lastInteractionDate;
  if (lastDate && new Date().getDate() !== lastDate.getDate()) {
    platformConnection.engagementStats.dailyInteractions = 1;
  }

  return this.save();
};

// Get child accounts for a platform
userSchema.methods.getChildAccounts = async function(platform) {
  if (!this.platformConnections[platform]) {
    throw new Error(`Unsupported platform: ${platform}`);
  }

  return mongoose.model('User').find({
    [`platformConnections.${platform}.motherAccountId`]: this._id,
    [`platformConnections.${platform}.isChildAccount`]: true
  }).select(`platformConnections.${platform}`);
};

module.exports = mongoose.model('User', userSchema);
