const axios = require('axios');
const { NotFoundError } = require('../handler/error/not_found_error');
const { InvalidInputError } = require('../handler/error/invalid_input_error');
const { postScreenshot } = require('../services/puppetter');
const { uploadToS3 } = require('../utils/amazons3');
const logger = require('../services/logger');
const { GOOGLE_API_KEY, FRONTEND_URL, GOOGLE_API } = require('../../config/appconfig');

const Youtube = require('../models/Youtube');
const Users = require('../models/User');
const Assets = require('../models/Assets');

const authenticate = async (req, res) => {
  console.log("+++++++++++++++++++++++++++++>>>");
  const { passport, userid } = req.session;
  console.log("***********************passport");
  console.log(passport);
  console.log("^^^^^^^^^^^^^^^^^^^^^^^userid");
  console.log(userid);
  console.log("^^^^^^^^^^^^^################################,passport.user.profile.id", passport.user.profile.id);

  if (userid) {
    const youtubeRegistryCheck = await Youtube
      .findOne({ youtubeId: passport.user.profile.id })
      .lean();
    console.log("***************************", youtubeRegistryCheck);
    const youtubeObj = {
      accessToken: passport.user.accessToken,
      refreshToken: passport.user.refreshToken,
      youtubeUsername: passport.user.profile.displayName,
      youtubeId: passport.user.profile.id,
      userId: userid,
    };
    if (!youtubeRegistryCheck) {
      console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$$");
      try {
        const youtube = new Youtube(youtubeObj);
        await youtube.save();
        console.log("########################3", youtube);
        const user = await Users.findOne({ _id: userid });
        user.youtubeUsername = youtubeObj.youtubeUsername;
        await user.save();
        console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@2");
        // return res.json({ msg: 'youtube side' });
        return res.redirect(`${FRONTEND_URL}?platform=youtube`);
      } catch (e) {
        // return res.json({ msg: 'youtube error side' });
        return res.redirect(`${FRONTEND_URL}?platform=youtube`);
      }
    }

    console.log("#####################################################################00", userid);

    const data = await Youtube.findOneAndUpdate({ userId: userid }, { $set: youtubeObj }, { new: true });
    // return res.json({ msg: 'youtube side' });
    console.log("UUUUUUUUUUUUUUUUUUUUUUUUUUUUPPPPPPPPPPPPPPPPPPPPPP", data);
    return res.redirect(`${FRONTEND_URL}?platform=youtube`);
  }
  logger.debug('Youtube callback error, session id is missing for user');
  return res.redirect(
    `${FRONTEND_URL}?status=session expired.please try again `,
  );
};

const validateYoutubeLink = async (req, res) => {
  const { id } = req.user;
  const { link } = req.body;
  const youtubeURL = new URL(link);
  console.log("youtubeURL", youtubeURL);
  //   const videoId = youtubeURL.pathname.split('/')[1] !== 'watch'
  //     ? youtubeURL.pathname.split('/')[1]
  //     : youtubeURL.searchParams.get('v');
  //  console.log("videoID" , videoId);
  // let videoId = youtubeURL.pathname.split('/')[1];
  // if (videoId != 'watch') {
  //   if (videoId == 'shorts') {
  //     console.log("params", youtubeURL.pathname.split('/')[2]);
  //     videoId = youtubeURL.pathname.split('/')[2];
  //   } else {
  //     videoId = youtubeURL.pathname.split('/')[1];
  //   }
  // } else {
  //   videoId = youtubeURL.searchParams.get('v');
  // }
  const videoId = youtubeURL.pathname.split('/')[1] !== 'watch'
    ? youtubeURL.pathname.split('/')[1] === 'shorts'
      ? youtubeURL.pathname.split('/')[2]
      : youtubeURL.pathname.split('/')[1]
    : youtubeURL.searchParams.get('v');

  // console.log("videoId" , videoId);
  if (videoId === 'shorts') {
    if (!link) {
      throw new InvalidInputError('Youtube link is required');
    }
  }
  const asset = await Assets.findOne({ post_url: link.trim() }).lean();
  if (asset) {
    throw new InvalidInputError('Link Already used');
  }
  try {
    const response = await axios.get(
      `${GOOGLE_API}/youtube/v3/videos?part=id%2C+snippet&id=${videoId}&key=${GOOGLE_API_KEY}`,
    );

    const youtubeUser = await Youtube.findOne({ userId: id });
    if (!youtubeUser) {
      throw new NotFoundError('No youtube account linked');
    }
    if (
      response.data.items.find(
        (x) => x.snippet.channelId === youtubeUser.youtubeId,
      )
    ) {
      const screenshotbuffer = await postScreenshot(link, 'youtube');
      // upload image to s3 bucket
      const s3result = await uploadToS3(screenshotbuffer, 'youtube', '.png');
      return res.send(s3result);
    }
    throw new InvalidInputError(
      `Invalid link .Youtube linked account is ${youtubeUser.youtubeUsername}`,
    );
  } catch (error) {
    throw new InvalidInputError(error.message);
  }
};

module.exports = {
  authenticate,
  validateYoutubeLink,

};
