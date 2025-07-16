const mongoose = require('mongoose');
const moment = require('moment');

const { Schema } = mongoose;

const commentSchema = new Schema({

  // relations
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
    required: true,
  },
  asset: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assets',
    required: true,
  },

  text: {
    type: String,
  },

  likedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
    required: true,
  }],

}, {
  timestamps: true,
});

commentSchema.methods.updatedComments = async (condition, pagination, loggedInUser) => {
  const commentDetails = { };
  commentDetails.result = await mongoose.model('Comments').find(condition)
    .populate('creator likedBy')
    .limit(pagination.limit)
    .skip(pagination.offset)
    .sort({ createdAt: -1 })
    .lean();
  commentDetails.result = commentDetails.result.map((x) => {
    // eslint-disable-next-line no-param-reassign
    x.createdBefore = moment().diff(moment(x.createdAt), 'days');
    const likedBy = x.likedBy.find(
      (commLikedBy) => commLikedBy._id.toString() === loggedInUser?.toString(),
    );
    // eslint-disable-next-line no-param-reassign
    x.liked = !!likedBy; x.delete = x.creator._id.toString() === loggedInUser?.toString();
    return x;
  });
  commentDetails.pagination = pagination;
  commentDetails.pagination.total = await mongoose.model('Comments').countDocuments(condition);

  return commentDetails;
};

const Comments = mongoose.model('Comments', commentSchema);
module.exports = Comments;
