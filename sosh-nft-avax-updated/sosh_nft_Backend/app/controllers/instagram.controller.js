const axios = require('axios');
const instaUtil = require('../utils/fetchInstaMedia');

const logger = require('../services/logger');
const Instagram = require('../models/Instagram');
const Users = require('../models/User');
const appconfig = require('../../config/appconfig');
const { NotFoundError } = require('../handler/error/not_found_error');
const { InvalidInputError } = require('../handler/error/invalid_input_error');
const { postScreenshot } = require('../services/puppetter');
const { uploadToS3 } = require('../utils/amazons3');
const Assets = require('../models/Assets');
const { encrypt, decrypt } = require('../utils/crypto');

const instaLogin = async (req, res) => {
  const userName = encrypt(req.user.username);
  res.redirect(await instaUtil.instalogin(userName));
};

const instaCodeReturn = async (req, res) => {
  console.log("insta API called---------------------------", req.query);
  const { query: { code, state } } = req;
  const userData = await Users.findOne({ username: decrypt(state) }).lean();
  if (!userData) {
    throw new NotFoundError('Username does not exists');
  }
  const userid = userData._id;
  const { access_token, user_id } = await instaUtil.getUserTokenAndId(code);
  const userDetails = await instaUtil.getUserNameAndId(access_token, user_id);
  const { id, username } = { ...userDetails };
  const instaRegistryCheck = await Instagram.findOne({ userId: userid }).lean();
  const instaObj = {
    instagramId: id,
    instagramUsername: username,
    access_token: access_token,
    userId: userid,
  };
  console.log("===========instaRegistryCheck================>>>");
  if (!instaRegistryCheck) {
    try {
      const instagram = new Instagram({
        userId: userid,
        instagramId: id,
        instagramUsername: username,
        access_token: access_token,
      });

      await instagram.save();
      const user = await Users.findOne({ _id: userid });
      user.instagramUsername = username;
      await user.save();

      req.session.destroy();
      return res.redirect(`${appconfig.FRONTEND_URL}?status=instagram`);
    } catch (e) {
      logger.warn(e);
      // req.session.destroy();
      return res.send(req.session);
    }
  }
  await Instagram.updateOne({ userId: userid }, { $set: instaObj });
  req.session.destroy();
  return res.redirect(`${appconfig.FRONTEND_URL}?status=instagram`);
};

const validateInstaLink = async (req, res) => {
  const { user: { _id }, body: { link } } = req;
  console.log("----------55555555555555555555-------->>>>", link);
  console.log("_id_id_id_id", _id);
  const cleanLink = link.split('?')[0];

  if (!link) {
    throw new InvalidInputError('Instagram link is required');
  }
  console.log('================>>>>', cleanLink);
  const asset = await Assets.findOne({ post_url: cleanLink.trim() }).lean();

  console.log("asssettttttttttttttt", asset);
  if (asset) {
    throw new InvalidInputError('Link Already used');
  }
  try {
    console.log('********************');
    const instaUser = await Instagram.findOne({ userId: _id });
    console.log('instaUser===========33333333333333333');
    console.log(instaUser);
    console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$", instaUser.access_token);

    const response = await axios.get(`https://api.instagram.com/oembed/?url=${cleanLink}`);
    // const response = await axios.get(`https://graph.facebook.com/v10.0/instagram_oembed`, {
    //   params: {
    //     url: cleanLink,
    //     access_token: instaUser.access_token,
    //   },
    // });
    console.log('77777777777777777777777777==>>response.data', response.data.author_name);
    console.log(response.data.author_name);
    // const instaUser = await Instagram.findOne({ userId: _id });

    if (!instaUser) {
      throw new NotFoundError('No Instagram account linked');
    }
    console.log("reponse-----------------");
    console.log(response);
    if (response.data.author_name === instaUser.instagramUsername) {
      const screenshotbuffer = await postScreenshot(link, 'instagram');
      // upload image to s3 bucket
      const s3result = await uploadToS3(screenshotbuffer, 'instagram', '.png');
      return res.send(s3result);
    }
    throw new InvalidInputError(`Invalid link .Instagram linked account is ${instaUser.instagramUsername}`);
  } catch (error) {
    throw new InvalidInputError(error.message);
  }
};

const getInstaMedia = async (req, res) => {
  const { session: { userid } } = req;
  const instaDetails = await Instagram.find({ userId: userid }).lean();
  if (instaDetails.length === 0) {
    throw new NotFoundError('Please register your instagram');
  }
  const instaMedia = await instaUtil.getUserMedia(instaDetails.access_token);
  return res.status(200).json({
    status: 'success',
    message: 'Instagram Media',
    data: instaMedia,
  });
};

const getMediaInfo = async (req, res) => {
  const { body: { mediaId }, session: { userid } } = req;
  const instaDetails = await Instagram.find({ userId: userid }).lean();
  if (instaDetails.length === 0) {
    throw new NotFoundError('Please register your instagram');
  }
  const instaMedia = await instaUtil.getMediaDetails(mediaId, instaDetails.access_token);
  return res.status(200).json({
    status: 'success',
    message: 'Instagram Media Details',
    data: instaMedia,
  });
};

module.exports = {
  instaCodeReturn,
  instaLogin,
  validateInstaLink,
  getInstaMedia,
  getMediaInfo,
};
