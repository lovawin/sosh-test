const axios = require("axios");
const {
  TIKTOK_LOGIN,
  TIKTOK_CLIENT_KEY,
  TiktokredirectURI,
  TIKTOK_USER,
  TIKTOK_USER_DATA,
  TIKTOK_CLIENT_SECRET,
} = require("../../config/appconfig");
const qs = require("qs");

const tiktokLogin = async (csrfState) => {
  const tiktokURL =
    `${TIKTOK_LOGIN}?client_key=${TIKTOK_CLIENT_KEY}&scope=user.info.basic,video.list&response_type=code` +
    `&redirect_uri=${TiktokredirectURI}&state=${csrfState}`;
  return tiktokURL;
};

const getUserTokenAndId = async (code) => {
  const { data } = await axios({
    method: "post",
    url: TIKTOK_USER,
    data: qs.stringify({
      client_key: TIKTOK_CLIENT_KEY,
      client_secret: TIKTOK_CLIENT_SECRET,
      code: code,
      grant_type: "authorization_code",
      redirect_uri: TiktokredirectURI,
    }),
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Cache-Control": "no-cache",
    },
  });
  console.log("data-------------------", data);
  return data;
};

const getUserNameAndId = async ({ access_token, open_id }) => {
  const { data } = await axios.get(`${TIKTOK_USER_DATA}v2/user/info/`, {
    params: {
      fields: "open_id,union_id,avatar_url,display_name",
    },
    headers: {
      Authorization: `Bearer ${access_token}`,
      "Content-Type": "application/json",
    },
  });
  console.log("data---------------", data);
  return data;
};

const getUserMedia = async (accessToken, openId) => {
  const { data } = await axios.get(`${TIKTOK_USER_DATA}v2/video/list/`, {
    params: {
      access_token: accessToken,
      open_id: openId,
      cursor: 0,
      max_count: 10,
      fields: 'title,video_description,duration,cover_image_url,embed_link'
    },
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });
  return data;
};

const getMediaDetails = async (accessToken, openId, videoIds) => {
  const { data } = await axios({
    method: 'post',
    url: `${TIKTOK_USER_DATA}v2/video/query/`,
    params: {
      fields: 'cover_image_url,embed_link' 
    },
    data: {
      filters: {
        video_ids: videoIds, 
      },
    },
    headers: {
      Authorization: `Bearer ${accessToken}`, 
      'Content-Type': 'application/json', 
    },
  });
  return data;
};

module.exports = {
  tiktokLogin,
  getUserTokenAndId,
  getUserNameAndId,
  getUserMedia,
  getMediaDetails,
};
