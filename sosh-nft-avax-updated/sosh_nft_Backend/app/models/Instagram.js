const mongoose = require('mongoose');

const { Schema } = mongoose;

const InstagramSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Users',
  },
  instagramId: {
    type: String,
    unique: true,
  },
  instagramUsername: {
    type: String,
    required: true,
  },
  // access_token_id: {
  //   type: String,
  //   required: true,
  // },
  access_token: {
    type: String,
    required: true,
  },
}, { timestamps: true });

const Instagram = mongoose.model('Instagram', InstagramSchema);
module.exports = Instagram;
