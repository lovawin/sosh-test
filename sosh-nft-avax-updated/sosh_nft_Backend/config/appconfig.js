require('./env');

module.exports = {
  NODE_ENV: process.env.NODE_ENV || 'development',

  PORT: parseInt(process.env.PORT, 10) || 5000,

  BEARER_TOKEN: process.env.BEARER_TOKEN,

  MONGODB_CONNECTION_STRING: process.env.MONGODB_CONNECTION_STRING,

  logsConfig: {
    dirname: `logs/${process.env.NODE_ENV === 'development' ? 'dev' : 'prod'}`,
    dailyRotateFileEnable: true,
  },

  INFURA_URL: process.env.INFURA_URL,
  endpoint: process.env.endpoint,
  region: process.env.region,
  tokenAddress: process.env.tokenAddress,
  secretName: process.env.secretName,
  adminAddress: process.env.adminAddress,
  MARKETPLACE_PROXY_ADDRESS: process.env.MARKETPLACE_PROXY_ADDRESS,
  NewINFURA_URL: process.env.NewINFURA_URL,
  ERC20tokenAddress: process.env.ERC20tokenAddress,
  INFURA_WSS: process.env.INFURA_WSS,
  TakerBid: process.env.TakerBid,
  TreasuryAddress: process.env.TreasuryAddress,
  privateKey: process.env.privateKey,
  OPENSEA_SEAPORT_ADDRESS: process.env.OPENSEA_SEAPORT_ADDRESS,
  ORDER_FULLFILLED_HASH: process.env.ORDER_FULLFILLED_HASH,
  SERVER_BASE_URL: process.env.SERVER_BASE_URL || 'https://www.soshnft.io',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
  JWT_SECRET: process.env.JWT_SECRET,
  LOOKSRARE_ADDRESS: process.env.LOOKSRARE_ADDRESS,
  MAINNET_TREASURY: process.env.MAINNET_TREASURY,

  TWITTER_CONSUMER_API_KEY: process.env.TWITTER_CONSUMER_API_KEY,
  TWITTER_CONSUMER_API_SECRET: process.env.TWITTER_CONSUMER_API_SECRET,
  TWITTER_ACCESS_TOKEN: process.env.TWITTER_ACCESS_TOKEN,
  TWITTER_ACCESS_TOKEN_SECRET: process.env.TWITTER_ACCESS_TOKEN_SECRET,
  TWITTER_BEARER_TOKEN: process.env.TWITTER_BEARER_TOKEN,
  TWITTER_REDIRECT_CALLBACK: process.env.TWITTER_REDIRECT_CALLBACK,
  TWITTER_URL: process.env.TWITTER_URL,
  GET_TWEET_ENDPOINT: process.env.GET_TWEET_ENDPOINT,

  IPFS_PROJECT_ID: process.env.IPFS_PROJECT_ID,
  IPFS_PROJECT_SECRET_ID: process.env.IPFS_PROJECT_SECRET_ID,

  SOCIAL_LIST: process.env.SOCIAL_LIST,
  FRONTEND_URL: process.env.FRONTEND_URL,

  TIKTOK_USER: process.env.TIKTOK_USER,
  TiktokredirectURI: process.env.TiktokredirectURI,
  TIKTOK_USER_DATA: process.env.TIKTOK_USER_DATA,
  TIKTOK_LOGIN: process.env.TIKTOK_LOGIN,
  TIKTOK_CLIENT_KEY: process.env.TIKTOK_CLIENT_KEY,
  TIKTOK_CLIENT_SECRET: process.env.TIKTOK_CLIENT_SECRET,

  INSTA_USER: process.env.INSTA_USER,
  InstaRedirectURI: process.env.InstaRedirectURI,
  INSTA_USER_DATA: process.env.INSTA_USER_DATA,
  INSTA_LOGIN: process.env.INSTA_LOGIN,
  INSTA_CLIENT_ID: process.env.INSTA_CLIENT_ID,
  INSTA_CLIENT_SECRET: process.env.INSTA_CLIENT_SECRET,
  AWS_ACCESS_KEY: process.env.AWS_ACCESS_KEY,
  AWS_SECRET_KEY: process.env.AWS_SECRET_KEY,
  AWS_REGION: process.env.AWS_REGION,
  AWS_BUCKET_NAME: process.env.AWS_BUCKET_NAME,

  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  GOOGLE_callbackURL: process.env.GOOGLE_callbackURL,
  GOOGLE_API: process.env.GOOGLE_API,
  GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,

  CRYPTO_ALGO: process.env.CRYPTO_ALGO,
  CRYPTO_SECURITY_KEY: process.env.CRYPTO_SECURITY_KEY,
  CRYPTO_INIT_VECTOR: process.env.CRYPTO_INIT_VECTOR,

  REDIS_HOST: process.env.REDIS_HOST,
  REDIS_PORT: process.env.REDIS_PORT,

  EXPRESS_SESSION_SECRET: process.env.EXPRESS_SESSION_SECRET,
  PINATA_API_KEY: process.env.PINATA_API_KEY,
  PINATA_SECRET_KEY: process.env.PINATA_SECRET_KEY,
};
