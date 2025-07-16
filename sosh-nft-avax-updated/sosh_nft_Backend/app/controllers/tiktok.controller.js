const tiktokUtil = require('../utils/fetchTiktokMedia');

const logger = require('../services/logger');
const Tiktok = require('../models/Tiktok');
const Users = require('../models/User');
const Assets = require('../models/Assets');
const { postScreenshot } = require('../services/puppetter');
const { uploadToS3 } = require('../utils/amazons3');

const appconfig = require('../../config/appconfig');
const { NotFoundError } = require('../handler/error/not_found_error');
const { InvalidInputError } = require('../handler/error/invalid_input_error');

const { encrypt, decrypt } = require('../utils/crypto');

const tiktokLogin = async (req, res) => {
  const userName = encrypt(req.user.username);
  res.redirect(await tiktokUtil.tiktokLogin(userName));
};

const tiktokCodeReturn = async (req, res) => {
  const { query: { code, state } } = req;
  const userData = await Users.findOne({ username: decrypt(state) }).lean();
  if (!userData) {
    throw new NotFoundError('Username does not exists');
  }
  const userid = userData._id;
  const { access_token, open_id  } = await tiktokUtil.getUserTokenAndId(code);
  const userDetails = await tiktokUtil.getUserNameAndId({ access_token, open_id });
  const { data: { user: { union_id, display_name } } } = userDetails;
  console.log('userDetails', userDetails);
  const tiktokRegistryCheck = await Tiktok.findOne({ userId: userid }).lean();
  const tiktok = {
    tiktokId: union_id,
    tiktokUsername: display_name,
    accessToken: access_token,
    tiktokOpenId: open_id,
    userId: userid,
  };
  if (!tiktokRegistryCheck) {
    try {
      const tiktokDoc = new Tiktok(tiktok);
      console.log(tiktok);
      await tiktokDoc.save();
      const user = await Users.findOne({ _id: userid });
      user.tiktokUsername = display_name;
      await user.save();
      req.session.destroy();
      return res.redirect(`${appconfig.FRONTEND_URL}?status=tiktok`);
    } catch (e) {
      logger.warn(e);
      return res.send(req.session);
    }
  }
  await Tiktok.updateOne({ userId: userid }, { $set: tiktok });
  req.session.destroy();
  return res.redirect(`${appconfig.FRONTEND_URL}?status=tiktok`);
};

const validatateTiktokLink = async (req, res) => {
  const { user: { _id }, body: { link } } = req;
  if (!link) {
    throw new InvalidInputError('Tiktok link is required');
  }
  const asset = await Assets.findOne({ post_url: link.trim() }).lean();
  if (asset) {
    throw new InvalidInputError('Link Already used');
  }
  try {
    const videoId = link.split('/')[5].split('?')[0];
    const tiktokDetails = await Tiktok.findOne({ userId: _id }).lean();
    if (!tiktokDetails) {
      throw new NotFoundError('user token expired');
    }
    const userLinkTest = await tiktokUtil
      .getMediaDetails(tiktokDetails.accessToken, tiktokDetails.tiktokOpenId, [videoId]);
    const TiktokUser = await Tiktok.findOne({ userId: _id });
    if (!TiktokUser) {
      throw new NotFoundError('No Tiktok account linked');
    }
    if (userLinkTest.data.hasOwnProperty('videos') && userLinkTest.data.videos.length !== 0) {
      const screenshotbuffer = await postScreenshot(link, 'tiktok');
      // upload image to s3 bucket
      const s3result = await uploadToS3(screenshotbuffer, 'tiktok', '.png');
      return res.send(s3result);
    }
    throw new InvalidInputError(`Invalid link .tiktok linked account is ${TiktokUser.tiktokUsername}`);
  } catch (error) {
    throw new InvalidInputError(error.message);
  }
};

const getTiktokMedia = async (req, res) => {
  const { session: { userId } } = req;
  const tiktokDetails = await Tiktok.find({ userId: userId }).lean();
  if (tiktokDetails.length === 0) {
    throw new NotFoundError('Please register your instagram');
  }
  const tiktokMedia = await tiktokUtil.getUserMedia(tiktokDetails.access_token);
  return res.status(200).json({
    status: 'success',
    message: 'TiktokMedia Media',
    data: tiktokMedia,
  });
};

const getMediaInfo = async (req, res) => {
  const { body: { mediaId }, session: { userId } } = req;
  const tiktokDetails = await Tiktok.find({ userId: userId }).lean();
  if (tiktokDetails.length === 0) {
    throw new NotFoundError('Please register your instagram');
  }
  const tiktokMedia = await tiktokUtil.getMediaDetails(mediaId, tiktokDetails.access_token);
  return res.status(200).json({
    status: 'success',
    message: 'Tiktok Media Details',
    data: tiktokMedia,
  });
};

module.exports = {
  tiktokLogin,
  tiktokCodeReturn,
  getTiktokMedia,
  getMediaInfo,
  validatateTiktokLink,
};
