const axios = require('axios');
const uuid = require('uuid').v4;
const oauthSignature = require('oauth-signature');
const appconfig = require('../../config/appconfig');

// generates a RFC 3986 encoded, BASE64 encoded HMAC-SHA1 hash

const twitterrequest = async function (req, res) {
  const oauth_timestamp = Math.floor(Date.now() / 1000);

  const httpMethod = 'POST';
  const url = 'https://api.twitter.com/oauth/request_token';
  const parameters = {
    oauth_consumer_key: appconfig.TWITTER_CONSUMER_API_KEY,
    oauth_nonce: uuid(),
    oauth_timestamp: oauth_timestamp,
    oauth_signature_method: 'HMAC-SHA1',
    oauth_version: '1.0',
    oauth_callback: `${appconfig.SERVER_BASE_URL}/api/V1/social/twitter/callback`,
  };

  const encodedSignature = oauthSignature.generate(httpMethod, url, parameters);
  console.log(encodedSignature);

    const tweetresponse = await axios.post(
      `https://api.twitter.com/oauth/request_token?oauth_callback=https%3A%2F%2Fwww.soshnft.io%2Fapi%2FV1%2Fsocial%2Ftwitter%2Fcallback`,
      {},

      {
        headers: {
        Authorization: `OAuth oauth_consumer_key=${appconfig.TWITTER_CONSUMER_API_KEY}, oauth_nonce=${uuid()},`
        + ` oauth_signature=${encodedSignature}, oauth_signature_method="HMAC-SHA1",`
        + ` oauth_timestamp=${oauth_timestamp}, oauth_version="1.0"`,
        },
      },
    );
    
    return res.json(tweetresponse);
};

module.exports = { twitterrequest };
