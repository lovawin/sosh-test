const axios = require('axios');
const { stringify } = require('qs');
const {
  INSTA_LOGIN, INSTA_CLIENT_ID, InstaRedirectURI, INSTA_USER, INSTA_USER_DATA,
} = require('../../config/appconfig');

const instalogin = async (username) => {
  const instaURL = `${INSTA_LOGIN}?client_id=${INSTA_CLIENT_ID}&scope=user_profile,user_media&response_type=code&redirect_uri=${InstaRedirectURI}&state=${username}`;
  return instaURL;
};

const getUserTokenAndId = async (code) => {
  try {
    const response = await axios.post(
      INSTA_USER,
      stringify({
        client_id: INSTA_CLIENT_ID,
        client_secret: process.env.INSTA_CLIENT_SECRET,
        grant_type: 'authorization_code',
        redirect_uri: InstaRedirectURI,
        code,
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching user token:', error.response ? error.response.data : error.message);
    throw error;
  }
};

const getUserNameAndId = async (access_token, user_id) => {
  try {
    const { data } = await axios.get(`https://graph.instagram.com/me`, {
      params: {
        fields: 'id,username',
        access_token: access_token,
      },
    });
    return data;
  } catch (error) {
    console.error('Error fetching username:', error.response ? error.response.data : error.message);
    throw error;
  }
};


const getUserMedia = async (accessToken) => {
  const { data } = await axios.get(`${INSTA_USER_DATA}me/media`, {
    params: {
      fields: 'id,caption',
      access_token: accessToken,
    },
  });
  return data;
};

const getMediaDetails = async (mediaId, accessToken) => {
  const { data } = await axios.get(`${INSTA_USER_DATA}${mediaId}`, {
    params: {
      fields: 'id,media_type,media_url,username,timestamp',
      access_token: accessToken,
    },
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  return data;
};

module.exports = {
  getUserTokenAndId,
  getUserNameAndId,
  getUserMedia,
  getMediaDetails,
  instalogin,
};
