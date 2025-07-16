const mongoose = require('mongoose');

const { Schema } = mongoose;

const blockNumberSchema = new Schema({
  blockNumber: {
    type: Number,
  },

}, { timestamps: true });

const blockNumber = mongoose.model('blockNumber', blockNumberSchema);
module.exports = blockNumber;
