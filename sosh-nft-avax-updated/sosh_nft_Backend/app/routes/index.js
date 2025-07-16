const express = require('express');
require('express-async-errors');

const router = express.Router();
const errorhandler = require('../middleware/error');

const userRouter = require('./User');
const twitterRouter = require('./twitter');
const authRouter = require('./auth');
const assetRouter = require('./asset');
const commentRouter = require('./comment');
const ipfsRouter = require('./ipfs');
const socialRouter = require('./social');
const instagramRouter = require('./instagram');
const tiktokRouter = require('./tiktok');
const youtubeRouter = require('./youtubeIcon');
const loggingRouter = require('./logging');
const marketplaceRouter = require('./marketplace');

router.use('/user', userRouter);
router.use('/log', loggingRouter);
router.use('/auth', authRouter);
router.use('/assets', assetRouter);
router.use('/assets', commentRouter);
router.use('/social/twitter', twitterRouter);
router.use('/social/instagram', instagramRouter);
router.use('/social/youtube', youtubeRouter);
router.use('/social/tiktok', tiktokRouter);
router.use('/social', socialRouter);
router.use('/ipfs', ipfsRouter);
router.use('/marketplace', marketplaceRouter);

// unhaldled error
router.use(errorhandler);

module.exports = router;
