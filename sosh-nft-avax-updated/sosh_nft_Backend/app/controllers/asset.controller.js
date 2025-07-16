/* eslint-disable no-restricted-syntax */
const _ = require("lodash");
const axios = require("axios");

const Assets = require("../models/Assets");
const validate = require("../validators/asset.validator");
const isValidId = require("../validators/mongooseid.validator");
const { getPagination } = require("../utils/pagination_helper");
const { NotFoundError } = require("../handler/error/not_found_error");
const { InvalidInputError } = require("../handler/error/invalid_input_error");
const logger = require("../services/logger");
const Users = require("../models/User");
const Comments = require("../models/Comment");
const s3 = require("../utils/amazons3");
const txCheck = require("../jobs/schedulars");
const uploadmetadata = require("../utils/ipfs");
const { checkTxn } = require("../utils/contract_helper");
const { AssetSaleTransactions } = require("../models/assetSale");
const { AuctionSchema } = require("../models/auction");

const commentInstance = new Comments();

/**
 * @class - Asset class containing all the controllers
 */

class Asset {
  async getAllAssets(req, res) {
    // apply filtering based on social media
    const search = {};
    const { platform_type, sortBy, tags, upcoming, current, type } = req.query;
    const pagination = getPagination(req.query);
    if (platform_type) {
      // eslint-disable-next-line space-infix-ops
      search.platform_type = platform_type.toUpperCase();
    }
    if (tags) {
      search.hashtag = Array.isArray(tags)
        ? { $in: tags.map((x) => `#${x}`) }
        : `#${tags}`;
    }
    // search.type = "sale";
    if (upcoming) {
      const currentTime = Date.now();
      search.startTime = { $gt: currentTime };
    }
    if (current) {
      const currentTime = Date.now();
      search.startTime = { $lte: currentTime };
      search.endTime = { $gte: currentTime };
    }
    if (type) {
      search.subtype = type;
    }
    let assets = Assets.find(search)
      .populate("owner_id")
      .populate("likedBy")
      .limit(pagination.limit)
      .skip(pagination.offset);

    if (sortBy === "trending") {
      assets = await Assets.find(search)
        .populate("owner_id")
        .populate("likedBy")
        .lean();
      assets = _.orderBy(assets, (asset) => asset.likedBy.length, ["desc"]);
      assets = _.drop(assets, pagination.offset);
      assets = _.take(assets, pagination.limit);
    }
    if (sortBy === "following") {
      if (req.user) {
        search.creator_id = { $in: req.user.following };
      }

      assets = await Assets.find(search)
        .populate("owner_id")
        .populate("likedBy")
        .lean();
      assets = _.orderBy(assets, (asset) => asset.owner_id.following.length, [
        "desc",
      ]);
      assets = _.drop(assets, pagination.offset);
      assets = _.take(assets, pagination.limit);
    }
    if (sortBy === "latest") {
      assets = await assets.sort({ createdAt: -1 }).lean();
    }
    if (sortBy === "earliest") {
      assets = await assets.sort({ createdAt: 1 }).lean();
    }

    pagination.total = await Assets.countDocuments(search);
    let assetResponse =
      sortBy === undefined
        ? await assets.sort({ createdAt: -1 }).lean()
        : assets;
    assetResponse = assetResponse.map((x) => {
      const liked = x.likedBy.find(
        (likedUsers) => likedUsers._id.toString() === req?.user?._id.toString()
      );
      // eslint-disable-next-line no-param-reassign
      x.liked = !!liked;
      return x;
    });
    res.status(200).send({
      results: assetResponse,
      pagination,
    });
  }

  async getOneAsset(req, res) {
    const { user: { _id, id } = {} } = req;
    const assetId = req.params.id;

    const asset = await Assets.findById(assetId)
      .populate("owner_id likedBy")
      .lean();
    if (!asset) {
      throw new NotFoundError(`No Asset Found with assetId: ${assetId}`);
    }
    const pagination = getPagination(req.query);
    asset.comments = await commentInstance.updatedComments(
      { asset: asset._id },
      pagination,
      _id
    );
    const user = asset.likedBy.find((userId) => userId._id.toString() === id);

    asset.liked = !!id && user?._id.toString() === id;
    asset.loggedIn = asset.creator_id === _id;
    return res.status(200).send(asset);
  }

  async create(req, res) {
    const { error } = validate.validateAsset(req.body);
    if (error) {
      throw new InvalidInputError(
        error.details[0].message,
        req.user.id,
        req.params,
        req.body
      );
    }

    try {
      const dataipfs = await uploadmetadata({
        name: req.body.name,
        description: req.body.description,
        image: req.body.bucketUrl,
        external_url: req.body.post_url,
      });
      // req.body.metadata_url = `https://ipfs.io/ipfs/${dataipfs.cid.toString()}`;
      req.body.metadata_url = `https://pink-rare-giraffe-95.mypinata.cloud/ipfs/${dataipfs.IpfsHash}`;

      // const { data } = await axios.get(req.body.metadata_url);
      // if (data) {
      //   req.body.metadata_fields = data;
      // }
    } catch (err) {
      logger.error(err);
      throw new InvalidInputError(
        "Invalid Metadata URL",
        req.user.id,
        req.params,
        req.body
      );
    }
    const asset = new Assets({
      name: req.body.name,
      metadata_url: req.body.metadata_url,
      metadata_fields: req.body.metadata_fields,
      description: req.body.description,
      platform_type: req.body.platform_type.toUpperCase(),
      post_url: req.body.post_url,
      hashtag: req.body.hashtag,
      owner_id: req.user._id,
      creator_id: req.user._id,
      image: req.body.bucketUrl,
      awsObjectId: req.body.awsObjectId,
    });
    // creator_id: '659403508b359566067d68b5',
    // owner_id: '659403508b359566067d68b5',
    try {
      await asset.save();
      logger.debug(`A asset is created with id: ${asset.id}`);

      return res.send({ success: true, asset: asset });
    } catch (e) {
      const err = e.toString();
      const errResp = err.includes("metadata_url_1")
        ? "use different Metadata URL"
        : err.includes("post_url_1")
        ? "use different Post URL"
        : e;

      return res.send({ success: false, message: errResp });
    }
  }

  async getAllAssetOfOwner(req, res) {
    const { user: { id } = {} } = req;
    const { ownerid } = req.params;
    const search = {};
    const { sale, sold, owner, type } = req.query;
    if (!isValidId(ownerid)) {
      throw new InvalidInputError(`Invalid id ${ownerid}`);
    }
    const pagination = getPagination(req.query);
    if (sale) {
      search.type = "sale";
      search.owner_id = ownerid;
    }
    if (type) {
      search.subtype = type;
      search.owner_id = ownerid;
    }
    if (sold) {
      search.owner_id = { $ne: ownerid };
      search.creator_id = ownerid;
    }
    if (owner) {
      search.owner_id = ownerid;
      search.type = { $ne: "sale" };
    }
    let assets = await Assets.find(search)
      .populate("likedBy")
      .limit(pagination.limit)
      .skip(pagination.offset)
      .sort({ createdAt: -1 })
      .lean();
    pagination.total = await Assets.countDocuments(search);
    assets = assets.map((x) => {
      const user = x.likedBy.find((userId) => userId._id.toString() === id);
      // eslint-disable-next-line no-param-reassign
      x.liked = !!id && user?._id.toString() === id;
      return x;
    });
    res.status(200).send({
      results: assets,
      pagination,
    });
  }

  async getOneAssetAndUpdate(req, res) {
    logger.debug(
      `update asset called for asset id ${JSON.stringify(
        req.params.id
      )} and user is ${JSON.stringify(
        req.user
      )} with asset details ${JSON.stringify(req.body)}`
    );
    const asset = req.userAsset;

    const { error } = validate.validateUpdadateAsset(req.body);
    if (error) {
      throw new InvalidInputError(
        error.details[0].message,
        req.user._id,
        req.params,
        req.body
      );
    }

    if (
      !_.get(req.body, "tx_data.transactionHash") ||
      !_.get(req.body, "tx_data.events.Transfer.returnValues.tokenId")
    ) {
      console.log(!_.get(req.body, "tx_data.transactionHash"));
      asset.remove();
      throw new InvalidInputError(
        "You should provide a valid tx_data to update the asset.",
        req.user.id,
        req.params,
        req.body
      );
    }

    asset.set({
      mint_tx_hash: _.get(req.body, "tx_data.transactionHash"),
      token_id: _.get(req.body, "tx_data.events.Transfer.returnValues.tokenId"),
      mint_date: new Date(),
    });

    await asset.save();

    // await txCheck.addQueue(asset);

    return res.status(200).send({ success: true, asset: asset });
  }

  async likeAsset(req, res) {
    const { error } = validate.validateLikeAsset(req.body);
    if (error) {
      throw new InvalidInputError(
        error.details[0].message,
        req.user.id,
        req.params,
        req.body
      );
    }
    const pagination = getPagination(req.query);

    const assetId = req.params.id;
    const asset = await Assets.findById(assetId).populate("owner_id");
    if (!asset) {
      throw new NotFoundError(`No Asset Found with assetId: ${assetId}`);
    }
    asset._doc.comments = await commentInstance.updatedComments(
      { asset: asset._id },
      pagination,
      req?.user?._id
    );

    const user = asset.likedBy.find(
      (userId) => userId.toString() === req.user._id.toString()
    );
    const { like } = req.body;

    asset._doc.liked = like;
    if (user) {
      if (!like) {
        asset.likedBy.pull(req.user._id);
        await asset.save();
        return res.json({ message: "asset disliked", asset });
      }
      return res.json({ message: "asset is already liked", asset });
    }
    if (!like) return res.json({ message: "the given asset wasn't liked" });

    asset.likedBy.push(req.user._id);
    await asset.save();
    return res.json({ message: "asset is liked", asset });
  }

  async deleteAsset(req, res) {
    const {
      params: { assetId },
      user: { _id },
    } = req;
    const asset = await Assets.findOne({ _id: assetId, owner_id: _id });
    if (!asset) {
      throw new InvalidInputError(`Invalid id ${assetId}`);
    }
    await s3.deleteFromS3(asset.awsObjectId);
    await Assets.remove({ _id: assetId });
    return res.json({ message: `asset is removed with id${assetId}` });
  }

  async searchAssets(req, res) {
    const { searchType, search, platform } = req.query;

    // const searchObj = {
    //   $and: [
    //     {
    //       $or: [
    //         {
    //           name: {
    //             $regex: new RegExp(search),
    //           },
    //         },
    //       ],
    //     },
    //   ],
    // };
    // if (tags === "twitter") {
    //   searchObj.$and[1] = { platform_type: "TWITTER" };
    // } else if (tags === "instagram") {
    //   searchObj.$and[1] = { platform_type: "INSTAGRAM" };
    // }

    // let reqSearch = await Assets.find(searchObj).populate({
    //   path: "owner_id",
    //   match: {
    //     $or: [{ name: { $regex: new RegExp(search) } }],
    //   },
    // });

    let reqSearch;
    if (searchType === "user") {
      const userSearch = {
        name: { $regex: new RegExp(search), $options: "i" },
      };
      if (req.user) {
        userSearch._id = { $ne: req.user._id };
      }
      reqSearch = await Users.find(userSearch).lean();
    }
    if (searchType === "asset") {
      const Assetserach = {
        // $or: [
        // { name: { $regex: new RegExp(search), $options: 'i' } },
        hashtag: { $regex: new RegExp(search), $options: "i" },
        // ],
      };
      if (platform === "twitter") {
        Assetserach.platform_type = "TWITTER";
      } else if (platform === "instagram") {
        Assetserach.platform_type = "INSTAGRAM";
      }
      reqSearch = await Assets.find(Assetserach).lean();
      const groupReqSearch = _.groupBy(reqSearch, "hashtag");
      reqSearch = Object.keys(groupReqSearch).map((x) => {
        const returnData = {};
        returnData.hashtag = x;
        returnData.postCount = groupReqSearch[x].length;
        return returnData;
      });
    }

    return res.status(200).send({ result: reqSearch });
  }

  async saleCreated(req, res) {
    const { error } = validate.validatetxnHash(req.body);
    if (error) {
      throw new InvalidInputError(
        error.details[0].message,
        req.user.id,
        req.params,
        req.body
      );
    }
    const data = await checkTxn(req.body.hash, "saleCreated");
    console.log("---------raw data----------", data);
    const { saleId, tokenId, saleType, startTime, endTime, askPrice } = data[0];
    console.log(
      "---------data----------",
      saleId,
      tokenId,
      saleType,
      startTime,
      endTime,
      askPrice
    );
    await Assets.updateOne(
      { token_id: tokenId },
      {
        $set: {
          saleId,
          type: "sale",
          subtype: saleType === "1" ? "fixed" : "auction",
          startTime,
          endTime,
          askPrice,
        },
      }
    );
    return res.json({ status: true });
  }

  async placeBid(req, res) {
    const { error } = validate.validatetxnHash(req.body);
    if (error) {
      throw new InvalidInputError(
        error.details[0].message,
        req.user.id,
        req.params,
        req.body
      );
    }
    const data = await checkTxn(req.body.hash, "auction");
    const asset = await Assets.findOne({ token_id: data[0].tokenId });
    if (!asset) {
      return res.json({ status: false, message: "asset not found" });
    }
    console.log("data[0].buyer.toLowerCase()", data[0].buyer.toLowerCase());
    const user = await Users.findOne({
      wallet_address: data[0].buyer.toLowerCase(),
    });
    if (!user) {
      return res.json({ status: false, message: "user not found" });
    }
    asset.endTime = data[0].assetEndTime;
    asset.askPrice = data[0].amount;
    asset.totalBids = asset.totalBids + 1;
    await asset.save();
    const newTransaction = new AuctionSchema({
      user_id: user.id,
      asset_id: asset.id,
      txnHash: req.body.hash,
      saleId: data[0].saleId,
      amount: data[0].amount,
      endtime: data[0].assetEndTime,
    });
    await newTransaction.save();
    return res.json({ status: true });
  }

  async purchaseNFT(req, res) {
    const { error } = validate.validatetxnHash(req.body);
    if (error) {
      throw new InvalidInputError(
        error.details[0].message,
        req.user.id,
        req.params,
        req.body
      );
    }
    const data = await checkTxn(req.body.hash, "purchase");
    const asset = await Assets.findOne({ token_id: data[0].tokenId });
    if (!asset) {
      return res.json({ status: false, message: "asset not found" });
    }
    const existingTransaction = await AssetSaleTransactions.findOne({
      asset_id: asset.id,
    }).sort({ saleIndex: -1 });
    let saleIndex = 1;
    if (existingTransaction) {
      saleIndex = existingTransaction.saleIndex + 1;
    }
    if(data[0].buyer.toLowerCase() === "0x0000000000000000000000000000000000000000"){
      const user = await Users.findOne({
        wallet_address: data[0].seller.toLowerCase(),
      });
      asset.type = "owned";
      asset.saleId = null;
      asset.subtype = null;
      asset.startTime = null;
      asset.endTime = null;
      asset.askPrice = null;
      asset.totalBids = 0;
      const newTransaction = new AssetSaleTransactions({
        user_id: user.id,
        asset_id: asset.id,
        type: "retrieve",
        txnHash: req.body.hash,
        saleId: data[0].saleId,
        saleIndex: saleIndex,
      });
      await newTransaction.save();
      await asset.save();
      return res.json({ status: true });
    }
    const user = await Users.findOne({
      wallet_address: data[0].buyer.toLowerCase(),
    });
    if (!user) {
      return res.json({ status: false, message: "user not found" });
    }
    const newTransaction = new AssetSaleTransactions({
      user_id: user.id,
      asset_id: asset.id,
      type: data[0].saleType == "1" ? "fixed" : "auction",
      txnHash: req.body.hash,
      saleId: data[0].saleId,
      saleIndex: saleIndex,
    });

    await newTransaction.save();
    asset.owner_id = user.id;
    asset.type = "purchased";
    asset.saleId = null;
    asset.subtype = null;
    asset.startTime = null;
    asset.endTime = null;
    asset.askPrice = null;
    asset.totalBids = 0;
    await asset.save();
    return res.json({ status: true });
  }

  async getNftBid(req, res) {
    const { asset_id, saleId } = req.query;
    const bidData = await AuctionSchema.find({ asset_id, saleId })
      .populate("user_id")
      .populate("asset_id");
    return res.status(200).send({
      results: bidData,
    });
  }
}

module.exports = Asset;
