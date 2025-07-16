const mongoose = require("mongoose");

const { Schema } = mongoose;

const assetsSchema = new Schema(
  {
    // relations
    creator_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    owner_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    likedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        required: true,
      },
    ],
    token_id: {
      // The token ID of the ERC721 asset
      type: String,
      unique: true,
      index: true,
      sparse: true,
    },
    name: {
      type: String,
    },
    description: {
      type: String,
    },
    image: {
      type: String,
    },
    post_url: {
      type: String,
      unique: true,
    },
    hashtag: {
      type: String,
    },
    metadata_url: {
      type: String,
      unique: true,
      index: true,
      sparse: true,
    },
    metadata_fields: {
      type: {},
    },
    mint_date: {
      type: Date,
    },
    mint_tx_hash: {
      type: String,
    },
    platform_type: {
      type: String,
      enum: ["INSTAGRAM", "TWITTER", "YOUTUBE", "TIKTOK"],
    },
    awsObjectId: {
      type: String,
      required: true,
    },
    txStatus: {
      type: String,
      enum: ["PENDING", "SUCCESS", "FAILED"],
      default: "PENDING",
    },
    saleId: {
      type: String,
    },
    type: {
      type: String,
    },
    subtype: {
      type: String,
    },
    startTime: {
      type: String,
    },
    endTime: {
      type: String,
    },
    askPrice: {
      type: String,
    },
    totalBids:{
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true,
  }
);

assetsSchema.methods.getAssets = async (condition) => {
  const asset = await mongoose
    .model("Assets")
    .find(condition)
    .populate("owner_id")
    .populate("likedBy")
    .lean();
  return asset;
};

const Assets = mongoose.model("Assets", assetsSchema);
module.exports = Assets;
