const router = require('express').Router();
const Comment = require('../controllers/comment.controller');

// middleware
const { requesterShouldBeOwnerOfTheComment } = require('../middleware/validator.middleware');

// instance of the controllers
const comment = new Comment();

// routes;
router.get('/:id/comments', comment.getAllCommentsOfAsset);
router.get('/:id/comments/:commentId', comment.getOneCommentOfAsset);
router.put('/:id/comment/:commentId', [requesterShouldBeOwnerOfTheComment], comment.getOneCommentAndUpdate);
router.post('/:id/comments/like', comment.likeComment);
router.post('/:id/comments', comment.create);
router.delete('/deleteComment/:commentId', comment.deleteComment);

module.exports = router;
