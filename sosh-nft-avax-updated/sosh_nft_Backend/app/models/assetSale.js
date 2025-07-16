const { boolean } = require("joi");
const mongoose = require("mongoose");

const { Schema } = mongoose;

const AssetstransactionSchema = new Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    asset_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assets",
      required: true,
    },
    type: {
      type: String,
    },
    txnHash: {
      type: String,
    },
    saleId: {
      type: String,
    },
    saleIndex: {
      type: Number,
      default: 1,
    },
  },
  { timestamps: true }
);

const AssetSaleTransactions = mongoose.model(
  "AssetSaleTransactions",
  AssetstransactionSchema
);
module.exports = { AssetSaleTransactions };
