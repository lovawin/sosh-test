const { boolean } = require('joi');
const mongoose = require('mongoose');

const { Schema } = mongoose;

const transectionSchema = new Schema({

  address: {
    type: String,
  },
  blockHash: {
    type: String,
  },
  blockNumber: {
    type: Number,
  },
  data: {
    type: String,
  },
  logIndex: {
    type: Number,
  },
  isChecked: {
    type: Boolean,
    default: false,
  },
  removed: {
    type: Boolean,
  },
  topics: [],

  type: {
    type: String,
  },
  transactionHash: {
    type: String,
  },
  transactionIndex: {
    type: Number,
  },
  id: {
    type: String,
  },
  createdDate: {
    type: Date,
    default: Date.now,
  },

});

const transection = mongoose.model('transection', transectionSchema);
module.exports = transection;
