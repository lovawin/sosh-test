const passport = require('passport');
const TwitterStrategy = require('passport-twitter').Strategy;

const appconfig = require('../../config/appconfig');

const twitterPassport = passport.use(new TwitterStrategy({
  consumerKey: appconfig.TWITTER_CONSUMER_API_KEY,
  consumerSecret: appconfig.TWITTER_CONSUMER_API_SECRET,
  callbackURL: `${appconfig.TWITTER_REDIRECT_CALLBACK}`,
}, (async (accesstokenid, accesstoken, profile, done) => {
  const twitter = {
    accesstoken,
    accesstokenid,
    profile,
  };
  done(null, twitter);
})));

twitterPassport.serializeUser((user, done) => {
  done(null, user);
});

twitterPassport.deserializeUser((user, done) => {
  done(null, user);
});

module.exports = twitterPassport;
