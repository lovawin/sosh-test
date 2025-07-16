const passport = require('passport');
const Instastrategy = require('passport-instagram').Strategy;
const { INSTA_CLIENT_ID, INSTA_CLIENT_SECRET, SERVER_BASE_URL } = require('../../config/appconfig');

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

passport.use(new Instastrategy(
  {
    clientID: INSTA_CLIENT_ID,
    clientSecret: INSTA_CLIENT_SECRET,
    callbackURL: `https://soshnft.io/api/V1/social/instagram/authenticate`,
  },
  (async (accesstoken, refreshtoke, profile, callback) => {
    console.log('---------------------------accesstoken------------------------', accesstoken);
    console.log(JSON.stringify(profile._json.picture));

    //  await http.get('')
    return callback(null, profile);
  }
  ),
));

module.exports = passport;
