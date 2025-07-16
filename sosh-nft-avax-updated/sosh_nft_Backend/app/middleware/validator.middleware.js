const Users = require('../models/User');
const { UnauthorizedUserError } = require('../handler/error/unauthorized_user_error');
const { NotFoundError } = require('../handler/error/not_found_error');
const Assets = require('../models/Assets');
const Comments = require('../models/Comment');

module.exports = {
  requesterShouldMatchUserFromParam: async (req, res, next) => {
    // save the user loaded from params.id into the request object
    // not to load it again in the actual controller
    req.userFromParam = await Users.findById(req.params.id);

    if (
      !req.user
      || !req.userFromParam
      || req.userFromParam._id.toString() !== req.user._id.toString()) {
      return next(new UnauthorizedUserError('Users can only update their own data.', req.user, req.params));
    }

    return next();
  },

  requesterShouldBeOwnerOfTheAsset: async (req, res, next) => {
    const asset = await Assets.findById(req.params.id);
    req.userAsset = asset;

    if (!asset) {
      return next(new NotFoundError('Asset not found', req.user, req.params, req.body));
    }

    if (!req.user || asset.owner_id.toString() !== req.user._id.toString()) {
      return next(
        new UnauthorizedUserError(
          "Only the asset owner can update this asset.",
          req.user,
          req.params,
          req.body,
        ),
      );
    }

    return next();
  },

  requesterShouldBeOwnerOfTheComment: async (req, res, next) => {
    const asset = await Assets.findById(req.params.id);
    req.userAsset = asset;

    if (!asset) {
      return next(
        new NotFoundError("Asset not found", req.user, req.params, req.body),
      );
    }

    if (!req.user || asset.owner_id.toString() !== req.user._id.toString()) {
      return next(
        new UnauthorizedUserError(
          "Only the asset owner can update this asset.",
          req.user,
          req.params,
          req.body,
        ),
      );
    }

    const comment = await Comments.findById(req.params.id);
    req.comment = comment;

    if (!comment) {
      return next(new NotFoundError('Comment not found', req.user, req.params, req.body));
    }

    if (comment.asset.toString() !== req.userAsset._id.toString()) {
      return next(
        new UnauthorizedUserError(
          "Comment does not belong to the provided asset",
          req.user,
          req.params,
          req.body,
        ),
      );
    }

    if (!req.user || comment.creator.toString() !== req.user._id.toString()) {
      return next(
        new UnauthorizedUserError(
          "Only the comment's creator can update this comment.",
          req.user,
          req.params,
          req.body,
        ),
      );
    }

    return next();
  },

};
