const { boolean } = require('joi');
const mongoose = require('mongoose');

const { Schema } = mongoose;

const transactionSchema = new Schema({
  address: {
    type: String,
  },
  blockHash: {
    type: String,
  },
  tokenId: {
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
  marketplace: {
    type: String,
    enum: ['LOOKSRARE', 'OPENSEA'],
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
}, { timestamps: true });

const SaleTransactions = mongoose.model('NftSaleTransactions', transactionSchema);
module.exports = { SaleTransactions };
