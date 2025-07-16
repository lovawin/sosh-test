/* eslint-disable space-before-blocks */
const _ = require('lodash');
const ResponseModal = require('../handler/http/responseModal');
const Logger = require('../services/logger');
const Users = require('../models/User');
// const Assets = require('../models/Assets');
const validate = require('../validators/user.validator');
const { InvalidInputError } = require('../handler/error/invalid_input_error');
const { NotFoundError } = require('../handler/error/not_found_error');
const isValidId = require('../validators/mongooseid.validator');
const { deleteFromS3, uploadToS3 } = require('../utils/amazons3');
const { AWS_BUCKET_NAME } = require('../../config/appconfig');
const Youtube = require('../models/Youtube');
const Tiktok = require('../models/Tiktok');
const Twitter = require('../models/Twitter');
const Instagram = require('../models/Instagram');
const { getConfig } = require('../utils/contract_helper');

const Response = new ResponseModal();

class User {
  async getUserByAccount(req, res) {
    // lowercases
    console.log("+++++++++++++++++++++++++>");
    console.log(req.params);
    const wallet_address = (req.params.wallet_address).toLowerCase();

    Logger.debug(`Get details api called with id ${wallet_address}`);
    const user = await Users.findOne({ wallet_address: wallet_address })
      .populate('followers following userAsset', 'username profile_image_url name').lean();
    if (!user) {
      return res.status(200).json({ status: 'error', message: 'User is not Registered', data: null });
    }
    const tiktokCheck = await Tiktok.findOne({ userId: user._id }).lean();
    if (!tiktokCheck){
      await Users.updateOne({ _id: user._id }, { $unset: { tiktokUsername: 1 } });
    }
    const youtube = await Youtube
      .findOne({ userId: user._id }, { youtubeId: 1, youtubeUsername: 1 }).lean();
    if (youtube){
      user.youtubeChannelId = youtube.youtubeId;
    }
    const AssetLength = user.userAsset.length;
    user.userAsset = null;
    user.userAsset = AssetLength;
    console.log("+++++++++++++++++++++++++++++++++++++++>", user);
    return res.status(200).json({ status: 'success', message: `User details for ${wallet_address}`, data: user });
  }

  async checkUsername(req, res) {
    Logger.debug(`getUserByusername  api called with username ${req.query.username}`);
    const user = await Users.findOne({ username: req.query.username });
    if (!user) {
      return res.status(200).json({ message: 'Username is available', registered: true, data: user });
    }
    return res.status(400)
      .json({ message: 'Username is already taken.Please choose another username', registered: true, data: user });
  }

  async getUserById(req, res){
    const { params: { userId }, user: { id } = {} } = req;
    const userData = userId || id;
    // check id is momgoose object id or not
    if (isValidId(userData)) {
      const user = await Users.findById(userData)
        .populate('followers following userAsset').lean();
      const tiktokCheck = await Tiktok.findOne({ userId: userData }).lean();
      if (!tiktokCheck){
        await Users.updateOne({ _id: userData }, { $unset: { tiktokUsername: 1 } });
      }
      const youtube = await Youtube
        .findOne({ userId: userId }, { youtubeId: 1, youtubeUsername: 1 }).lean();
      if (youtube){
        user.youtubeChannelId = youtube.youtubeId;
      }
      if (!user) {
        throw new NotFoundError(`User not found with id ${userData}`);
      }
      const AssetLength = user.userAsset.length;
      user.userAsset = null;
      user.userAsset = AssetLength;
      return res.send(user);
    }

    throw new InvalidInputError(`Invalid id ${userData}`, null, userData);
  }

  async updateUser(req, res) {
    const { error } = validate.validateUpdateUser(req.body);
    if (error) {
      res.send({ message: error.details[0].message });
    }
    let { user } = req;
    user.set(req.body);
    await user.save();
    await user.populate('followers following userAsset', 'username profile_image_url');
    user = user.toJSON();
    const AssetLength = user.userAsset.length;
    user.userAsset = null;
    user.userAsset = AssetLength;
    return res.status(200).send(user);
  }

  async updateProfileImage(req, res) {
    let { user } = req;
    console.log("====================>");
    console.log(req.file);
    if (!req.file) {
      throw new NotFoundError('file is missing');
    }
    try {
      const result = await uploadToS3(req.file.buffer, 'profile', '.png');
      // after upload do somethigs
      user.profile_image_data = result;
      user.profile_image_url = result.Location;
      await user.save();
      await user.populate('followers following userAsset', 'username profile_image_url');
      user = user.toJSON();
      const AssetLength = user.userAsset.length;
      user.userAsset = null;
      user.userAsset = AssetLength;

      return res.json({
        status: true,
        data: user,
      });
    } catch (error) {
      console.log(error);
      return res.status(400).json({
        status: false,
        error: 'Failed to update profile image',
      });
    }
  }

  async removeProfileImage(req, res) {
    console.log("$$$$$$$$$$$$$$$$$$$$$$$$$", req);
    let { user } = req;
    const { key } = user.profile_image_data;
    console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
    user.profile_image_data = {};
    user.profile_image_url = undefined;
    console.log("^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^");
    await user.save();
    await user.populate('followers following userAsset', 'username profile_image_url');

    console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%");
    user = user.toJSON();
    const AssetLength = user.userAsset.length;
    user.userAsset = null;
    user.userAsset = AssetLength;

    res.json({
      status: true,
      data: user,
    });
    // remove from s3 account as well
    try {
      if (key) {
        await deleteFromS3(key, AWS_BUCKET_NAME);
        Logger.debug(`deleted image from s3 with key :${key} for userid ${user.id}`);
      }
    } catch (error) {
      console.log(error);
      Logger.debug(`failed deleting image from s3 with key :${key} for userid : ${user.id}`);
    }
  }

  async follow(req, res) {
    const { followerid } = req.params;
    const { user } = req;
    const follower = await Users.findById(followerid);
    if (!follower) {
      throw new NotFoundError('User not found');
    }
    if (followerid === user.id) {
      return res.status(400).json({
        status: false,
        error: 'You can not follow yourself',
      });
    }
    const isalreadyfollowing = await Users
      .findOne({ _id: user.id, following: { $in: [followerid] } });
    if (isalreadyfollowing) {
      Logger.debug(`user with id ${user.id} already following ${followerid}`);
      return res.status(200).json({
        status: true,
        message: `Started following ${follower.username}`,
      });
    }
    Logger.debug(`user with id ${user.id} started following ${followerid}`);
    await user.following.push(follower._id);
    // await follower.save();
    await user.save();
    await user.populate('followers following userAsset', 'username profile_image_url');
    const AssetLength = user.userAsset.length;
    user.userAsset = null;
    user.userAsset = AssetLength;

    await follower.followers.push(user._id);
    await follower.save();
    return res.status(200).json({
      status: true,
      message: `Started following ${follower.username}`,
      data: user,
    });
  }

  async unfollow(req, res) {
    const { followerid } = req.params;
    let { user } = req;
    const follower = await Users.findById(followerid);
    if (!follower) {
      throw new NotFoundError('user not found');
    }
    if (followerid === user.id) {
      return res.status(400).json({
        status: false,
        error: 'You can not unfollow yourself',
      });
    }
    await user.following.pull(follower._id);
    await user.save();
    await user.populate('followers following userAsset', 'username profile_image_url');
    user = user.toJSON();
    const AssetLength = user.userAsset.length;
    user.userAsset = null;
    user.userAsset = AssetLength;

    await follower.followers.pull(user._id);
    await follower.save();
    return res.status(200).json({
      status: true,
      message: `Unfollowed ${follower.username}`,
      data: user,
    });
  }

  // eslint-disable-next-line space-before-blocks
  async getFollower(req, res){
    const { userId } = req.params;
    console.log(userId);
    const totaluser = await Users.find({ following: userId }, 'id username profile_image_url');
    res.send(totaluser);
  }

  async getFollowing(req, res){
    const { userId } = req.params;
    console.log(userId);
    const totaluser = await Users.find({ following: userId }, 'id username profile_image_url');
    res.send(totaluser);
  }

  async suggestedUser(req, res){
    const { _id, followers, following } = req.user;
    if (followers.length === 0 && following.length === 0){
      const suggestedAccount = await Users.aggregate([
        { $match: { _id: { $ne: _id } } },
        {
          $lookup: {
            from: 'Assets',
            localField: '_id',
            foreignField: 'likedBy',
            as: 'LikedAsset',
          },
        },
        {
          $sort: { LikedAsset: 1 },
        },
        { $project: { LikedAsset: 0 } },

      ]);
      return res.send(suggestedAccount);
    }
    const populateUsersQuery = [
      { path: 'followers', match: { _id: { $ne: _id, $nin: [...followers, ...following] } } },
      { path: 'following', match: { _id: { $ne: _id, $nin: [...followers, ...following] } } },
    ];
    const suggesteduser = await Users
      .find({
        _id: { $ne: _id, $nin: [...following] },
      })
      .populate(populateUsersQuery)
      .populate(populateUsersQuery)
      .lean();
    // console.log(req.user);
    // const updateUserSuggested = suggesteduser.flatMap((users) => {
    //   let followersiterated = [];
    //   let followingiterated = [];
    //   console.log(users);
    //   if (users.followers.length !== 0){
    //     followersiterated = users.followers.flatMap(( followersIterator) => {
    //       if(followersIterator.followers.length!==0){}
    //       return [
    //         followersIterator.followers.toString(),
    //         followersIterator.following.toString()];
    //     });
    //   }
    //   console.log(followersiterated);
    //   if (users.following.length !== 0){
    //     followingiterated = users.following.flatMap((followersIterator) => [
    //       followersIterator.followers.toString(),
    //       followersIterator.following.toString()]);
    //   }

    //   return [...followersiterated, ...followingiterated];
    // });

    // const findQuerydataUsers = [...new Set(updateUserSuggested)];
    // const suggestedUserResponse = await Users
    //   .find(
    //     {
    //       _id:
    //     {
    //       $in: findQuerydataUsers, $ne: _id, $nin: [...followers, ...following],
    //     },
    //     },
    //   ).lean();

    return res.send(suggesteduser);
  }

  async deleteUser(req, res){
    try {
      const { _id } = req.user;
      const userData = await Users.findOne({ _id: _id }).lean();
      if (!userData){
        throw new NotFoundError('user not found');
      }

      const {
        instagramUsername,
        twitterUsername,
        tiktokUsername,
        youtubeUsername,
      } = userData;

      await Twitter.findOneAndDelete({ twitterUsername });

      await Instagram.findOneAndDelete({ instagramUsername });
      await Tiktok.findOneAndDelete({ tiktokUsername });
      await Youtube.findOneAndDelete({ youtubeUsername });

      if (!_.isNull(userData.profile_image_url)){
        await deleteFromS3(userData.profile_image_data?.ETag, AWS_BUCKET_NAME);
      }

      await Users.findOneAndDelete({ _id: _id });

      return res.status(200).json({
        message: 'User Deleted',
      });
    } catch (e){
      console.log(e);
      return res.status(400).json({
        message: 'Please try later ',
      });
    }
  }

  async getConfig(req, res){
    const data = await getConfig();
    return res.status(200).json({
      ...data,
    });
  }
}

module.exports = User;
