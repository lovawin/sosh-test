const Assets = require('../models/Assets');
const Comments = require('../models/Comment');
const validate = require('../validators/comment.validator');
const { NotFoundError } = require('../handler/error/not_found_error');
const { InvalidInputError } = require('../handler/error/invalid_input_error');
const logger = require('../services/logger');
const { getPagination } = require('../utils/pagination_helper');

const assetInstance = new Assets();
const commentInstance = new Comments();

/**
 * @class - Comment class containing all the controllers
 */

class Comment {
  async getAllCommentsOfAsset(req, res) {
    const assetId = req.params.id;
    const asset = await Assets.findById(assetId).populate('owner_id').lean();
    if (!asset) {
      throw new NotFoundError(`No Asset Found with assetId: ${assetId}`);
    }
    const pagination = getPagination(req.query);

    asset.comments = await commentInstance
      .updatedComments({ asset: asset._id }, pagination, req.user._id);

    res.status(200).send({
      results: asset,
      pagination,
    });
  }

  async getOneCommentOfAsset(req, res) {
    const assetId = req.params.id;
    const asset = await Assets.findById(assetId);
    if (!asset) {
      throw new NotFoundError(`No Asset Found with assetId: ${assetId}`);
    }

    const { commentId } = req.params;
    const comment = await Comments.findById(commentId)
      .populate('likedBy')
      .lean();
    if (!comment) {
      throw new NotFoundError(`No Comment Found with commentId: ${commentId}`);
    }
    if (!comment.asset.toString() === asset._id.toString()) {
      throw new NotFoundError(`the provided comment doesnt belong to the asset with commentId: ${commentId}`);
    }

    return res.status(200).send(asset);
  }

  async create(req, res) {
    const { error } = validate.validateComment(req.body);
    if (error) {
      throw new InvalidInputError(error.details[0].message, req.user.id, req.params, req.body);
    }
    const assetId = req.params.id;

    const asset = await Assets.findById(assetId).lean();
    if (!asset) {
      throw new NotFoundError(`No Asset Found with assetId: ${assetId}`);
    }
    const user = asset.likedBy.find(
      (userId) => userId.toString() === req.user._id.toString(),
    );
    asset.liked = !!user;
    await Comments.create({
      creator: req.user._id,
      asset: asset._id,
      text: req.body.text,
    });

    logger.debug(`A comment is created with id: ${asset.id}`);

    const pagination = getPagination(req.query);

    asset.comments = await commentInstance.updatedComments(
      { asset: asset._id },
      pagination,
      req.user._id,
    );

    return res.send({ message: 'comment is created', details: asset });
  }

  async getOneCommentAndUpdate(req, res) {
    const { comment } = req;

    const { error } = validate.validateUpdadateComment(req.body);
    if (error) {
      throw new InvalidInputError(error.details[0].message, req.user._id, req.params, req.body);
    }

    comment.set({
      text: req.body.text,
    });

    await comment.save();

    return res.status(200).send({ message: 'comment updated', comment });
  }

  async likeComment(req, res) {
    const { error } = validate.validateLikeComment(req.body);
    if (error) {
      throw new InvalidInputError(error.details[0].message, req.user.id, req.params, req.body);
    }

    const commentId = req.params.id;
    const comment = await Comments.findById(commentId);
    if (!comment) {
      throw new NotFoundError(`No Comment Found with commentId: ${commentId}`);
    }

    const user = comment.likedBy.find((userId) => userId.toString() === req.user._id.toString());
    const { like } = req.body;

    if (user) {
      if (!like) {
        comment.likedBy.pull(req.user._id);
        await comment.save();
        const [asset] = await assetInstance.getAssets({ _id: comment.asset });
        const pagination = getPagination(req.query);
        asset.comments = await commentInstance
          .updatedComments({ asset: asset._id }, pagination, req.user._id);
        const assetLiked = asset.likedBy.find(
          (userId) => userId._id.toString() === req.user._id.toString(),
        );
        asset.liked = !!assetLiked;
        return res.json({ message: 'comment disliked', results: asset });
      }
      return res.json({ message: 'comment is already liked' });
    }
    if (!like) return res.json({ message: 'the given comment wasn\'t liked' });

    comment.likedBy.push(req.user._id);
    await comment.save();

    const [asset] = await assetInstance.getAssets({ _id: comment.asset });
    const pagination = getPagination(req.query);
    asset.comments = await commentInstance
      .updatedComments({ asset: asset._id }, pagination, req.user._id);
    const assetLiked = asset.likedBy.find(
      (userId) => userId._id.toString() === req.user._id.toString(),
    );
    asset.liked = !!assetLiked;
    return res.json({ message: 'comment is liked', results: asset });
  }

  async deleteComment(req, res) {
    const { commentId } = req.params;
    const { _id } = req.user;
    const commenData = await Comments.findById({ _id: commentId });
    if (commenData.creator.toString() === _id.toString()) {
      await Comments.remove({ _id: commentId });
      const [asset] = await assetInstance.getAssets({ _id: commenData.asset });
      const pagination = getPagination(req.query);
      asset.comments = await commentInstance
        .updatedComments({ asset: asset._id }, pagination, req.user._id);
      const user = asset.likedBy.find(
        (userId) => userId._id.toString() === req.user._id.toString(),
      );
      asset.liked = !!user;
      return res.json({ message: 'Comment Deleted Successfully', details: asset });
    }
    return res.status(400).json({ message: 'You are not the comment owner' });
  }
}

module.exports = Comment;
