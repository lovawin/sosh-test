/**
 * a function to get instagram profile link
 * @param {string} username
 * @returns {string}
 */

export const getInstagramProfileLink = (username) => {
  return `https://www.instagram.com/${username}`;
};

/**
 * a function to get twitter profile link
 * @param {string} username
 * @returns {string}
 */

export const getTwitterProfileLink = (username) => {
  return `https://twitter.com/${username}`;
};

/**
 * a function to get tiktok profile link
 * @param {string} username
 * @returns {string}
 */

export const getTiktokProfileLink = (username) => {
  return `https://www.tiktok.com/${username}`;
};

/**
 * a function to get youtube channel link
 * @param {string} channelId
 * @returns {string}
 */

export const getYoutubeChannelLink = (channelId) => {
  return `https://www.youtube.com/channel/${channelId}`;
};
