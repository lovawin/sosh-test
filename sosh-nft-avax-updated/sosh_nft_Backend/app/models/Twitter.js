const mongoose = require('mongoose');

const { Schema } = mongoose;

const twitterSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Users',
  },
  twitterId: {
    type: String,
    unique: true,
  },
  twitterUsername: {
    type: String,
    required: true,
  },
  displayName: {
    type: String,
  },
  access_token_id: {
    type: String,
    required: true,
  },
  access_token: {
    type: String,
    required: true,
  },
  last_update_date: {
    type: Date,
  },
}, { timestamps: true });

twitterSchema.set('toObject', { virtuals: true });
twitterSchema.set('toJSON', { virtuals: true });

const Twitter = mongoose.model('Twitter', twitterSchema);
module.exports = Twitter;
