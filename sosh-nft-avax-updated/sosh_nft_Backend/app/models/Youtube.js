const mongoose = require('mongoose');

const { Schema } = mongoose;

const YoutubeSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Users',
  },
  youtubeId: {
    type: String,
    unique: true,
  },
  youtubeUsername: {
    type: String,
    required: true,
  },
  accessToken: {
    type: String,
    required: true,
  },
  refreshToken: {
    type: String,
    required: true,
  },
}, { timestamps: true });

const Youtube = mongoose.model('Youtube', YoutubeSchema);
module.exports = Youtube;
