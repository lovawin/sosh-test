const mongoose = require('mongoose');

const childAccountProfileSchema = new mongoose.Schema({
  // Reference to the user and platform connection
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  platform: {
    type: String,
    enum: ['twitter', 'instagram', 'youtube', 'tiktok'],
    required: true
  },
  motherAccountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Personality and relationship data
  personality: {
    type: String,
    required: true,
    trim: true
  },
  relationshipToMother: {
    type: String,
    required: true,
    trim: true
  },

  // Engagement preferences
  engagementStyle: {
    type: String,
    enum: ['supportive', 'critical', 'neutral', 'humorous'],
    required: true
  },
  
  // Engagement rules
  engagementRules: {
    likeFrequency: {
      type: Number, // Percentage of mother's posts to like (0-100)
      min: 0,
      max: 100,
      required: true
    },
    commentFrequency: {
      type: Number, // Percentage of mother's posts to comment on (0-100)
      min: 0,
      max: 100,
      required: true
    },
    shareFrequency: {
      type: Number, // Percentage of mother's posts to share/retweet (0-100)
      min: 0,
      max: 100,
      required: true
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

// Index for efficient lookups
childAccountProfileSchema.index({ userId: 1, platform: 1, motherAccountId: 1 });

// Method to determine if should engage with content
childAccountProfileSchema.methods.shouldEngageWith = function(contentType) {
  const rand = Math.random() * 100;
  switch (contentType) {
    case 'like':
      return rand <= this.engagementRules.likeFrequency;
    case 'comment':
      return rand <= this.engagementRules.commentFrequency;
    case 'share':
      return rand <= this.engagementRules.shareFrequency;
    default:
      return false;
  }
};

module.exports = mongoose.model('ChildAccountProfile', childAccountProfileSchema);
