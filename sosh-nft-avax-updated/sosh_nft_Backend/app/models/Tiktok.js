const mongoose = require('mongoose');

const { Schema } = mongoose;

const TiktokSchema = new Schema({
  userId: {
    type: String,
    required: true,
    ref: 'Users',
  },
  tiktokId: {
    type: String,
    unique: true,
  },
  tiktokUsername: {
    type: String,
    required: true,
  },
  // access_token_id: {
  //   type: String,
  //   required: true,
  // },
  tiktokOpenId: {
    type: String,
    required: true,
  },
  accessToken: {
    type: String,
    required: true,
  },
}, { timestamps: true });

TiktokSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });

const Tiktok = mongoose.model('Tiktok', TiktokSchema);
module.exports = Tiktok;
