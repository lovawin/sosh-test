const mongoose = require('mongoose');

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    wallet_address: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
    },
    wallet_type: {
      type: String,
      required: true,
      default: 'METAMASK',
    },
    name: {
      type: String,
      required: true,
    },
    ref_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Users',
    },
    username: {
      type: String,
      required: true,
      unique: true,
      index: true,
      sparse: true,
    },
    email: {
      type: String,
      unique: true,
      index: true,
      sparse: true,
    },
    ref_code: {
      type: String,
      unique: true,
      index: true,
      sparse: true,
    },
    refId: {
      type: String,
      unique: true,
      index: true,
      sparse: true,
    },
    refCounter: {
      type: Array,
      // unique: true,
      // index: true,
      // sparse: true,
    },
    bio: {
      type: String,
    },
    profile_image_url: {
      type: String,
      default: null,
    },
    website: {
      type: String,
    },
    instagramUsername: {
      type: String,
    },
    twitterUsername: {
      type: String,
    },
    tiktokUsername: {
      type: String,
    },
    youtubeUsername: {
      type: String,
    },
    isVerified: {
      type: Boolean,
    },
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Users' }],
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Users' }],
    AuctionNotification: {
      type: Boolean,
      default: false,
    },
    privateSaleNotification: {
      type: Boolean,
      default: false,
    },
    profile_image_data: {
      type: {},
    },
    newNftListingNotification: {
      type: Boolean,
      default: false,
    },
    last_login_date: {
      type: Date,
    },
    last_logout_date: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

userSchema.virtual('userAsset', {
  ref: 'Assets',
  localField: '_id',
  foreignField: 'owner_id',
  justOne: false,
});

userSchema.virtual('likedAsset', {
  ref: 'Assets',
  localField: '_id',
  foreignField: 'likedBy',
  justOne: false,
});

userSchema.virtual('comments', {
  ref: 'Comments',
  localField: '_id',
  foreignField: 'creator',
  justOne: false,
});

userSchema.virtual('likedComment', {
  ref: 'Comments',
  localField: '_id',
  foreignField: 'likedBy',
  count: true,
});

userSchema.set('toObject', { virtuals: true });
userSchema.set('toJSON', { virtuals: true });

const Users = mongoose.model('Users', userSchema);
module.exports = Users;
