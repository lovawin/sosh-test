const passport = require('passport');
const YoutubeV3Strategy = require('passport-youtube-v3').Strategy;

const {
  GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_callbackURL, GOOGLE_API,
} = require('../../config/appconfig');

const youtubeStrategy = passport.use(new YoutubeV3Strategy(
  {
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: GOOGLE_callbackURL,
    // scope: `${GOOGLE_API}/auth/youtube.readonly`,
    scope: ['https://www.googleapis.com/auth/youtube.readonly'],
  },
  (
    async (accessToken, refreshToken, profile, done) => {
      const youtube = {
        accessToken,
        refreshToken,
        profile,
      };

      done(null, youtube);
    }
  ),
));

youtubeStrategy.serializeUser((user, done) => {
  done(null, user);
});

youtubeStrategy.deserializeUser((user, done) => {
  done(null, user);
});

module.exports = youtubeStrategy;
