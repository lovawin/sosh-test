const express = require('express');

const app = express();
app.use(express.json());
const passport = require('passport');
const InstagramStrategy = require('passport-instagram').Strategy;

const logger = require('./logger');
const { SERVER_BASE_URL } = require('../../config/appconfig');

passport.use(new InstagramStrategy(
  {
    clientID: process.env.INSTA_CLIENT_ID,
    clientSecret: process.env.INSTA_CLIENT_SECRET,
    callbackURL: `${SERVER_BASE_URL}/api/V1/social/instagram/authenticate`,
  },
  ((accessToken, refreshToken, profile, done) => {
    const instagram = {
      accessToken,
      refreshToken,
      profile,
    };
    console.log(instagram);
    return done(null, instagram);
  }),
));

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

module.exports = passport;
