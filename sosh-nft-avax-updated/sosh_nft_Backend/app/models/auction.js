const { boolean } = require("joi");
const mongoose = require("mongoose");

const { Schema } = mongoose;

const bidSchema = new Schema(
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
    txnHash: {
      type: String,
    },
    saleId: {
      type: String,
    },
    amount:{
        type: String, 
    },
    endtime:{
        type: String, 
    }
  },
  { timestamps: true }
);

const AuctionSchema = mongoose.model(
  "AuctionSchema",
  bidSchema
);
module.exports = { AuctionSchema };
