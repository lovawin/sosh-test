/**
 * Social Account Model
 * 
 * This model stores user's social media account credentials securely.
 * Passwords are encrypted before storage.
 */

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const socialAccountSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  platform: {
    type: String,
    required: true,
    enum: ['tiktok', 'instagram', 'twitter', 'youtube']
  },
  username: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  accountType: {
    type: String,
    enum: ['mother', 'child'],
    required: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  lastVerified: {
    type: Date
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'error'],
    default: 'inactive'
  },
  errorMessage: String,
  metadata: {
    followerCount: Number,
    followingCount: Number,
    engagementRate: Number,
    lastUpdated: Date
  }
}, {
  timestamps: true
});

// Hash password before saving
socialAccountSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Add method to verify credentials
socialAccountSchema.methods.verifyCredentials = async function() {
  try {
    // Use platform-specific service to verify credentials
    const service = require(`../services/${this.platform}.service`);
    await service.verifyCredentials(this.username, this.password);
    
    this.isVerified = true;
    this.lastVerified = new Date();
    this.status = 'active';
    this.errorMessage = null;
    
    await this.save();
    return true;
  } catch (error) {
    this.isVerified = false;
    this.status = 'error';
    this.errorMessage = error.message;
    
    await this.save();
    return false;
  }
};

module.exports = mongoose.model('SocialAccount', socialAccountSchema);
