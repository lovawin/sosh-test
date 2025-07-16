const { NODE_ENV, BEARER_TOKEN } = require('../../config/appconfig');
const { NotFoundError } = require('../handler/error/not_found_error');
const User = require('../models/User');
const { verifyJwt, getToken, jwtDataVerify } = require('../utils/jsonwebtoken');

const isLoggedIn = async function (req, res, next) {
  try {
    const token = await getToken(req);
    const decoded = await verifyJwt(token);
    const user = await User.findById(decoded.id);
    if (!user) {
      next(new NotFoundError(`User not found with id: ${decoded.id}`));
    } else {
      req.user = user;
      next();
    }
  } catch (err) {
    console.log('error message', err.message);
    next(err);
  }
};

const isLoggedInquery = async function (req, res, next) {
  try {

    const token = req.query.auth_token;
    
    const decoded = await verifyJwt(token);
    
    const user = await User.findById(decoded.id);
    if (!user) {
      next(new NotFoundError(`User not found with id: ${decoded.id}`));
    } else {
      req.user = user;
      next();
    }
  } catch (err) {
    console.log('error message', err.message);
    next(err);
  }
};

const bearerUserFetch = async function (req, res, next) {
  try {
    const decoded = await jwtDataVerify(req);
    if (!decoded) {
      next();
    } else {
      const user = await User.findById(decoded.id);
      req.user = user;
      next();
    }
  } catch (err) {
    console.log('error message', err.message);
    next(err);
  }
};

const setSession = async function (req, res, next) {
  console.log("^^^^^^^^^^^^^^^^^^^^^^^^^^");
  req.session.userid = req.user.id;
  console.log("############req.session",req.session.userid);
    next();
};

module.exports = {
  isLoggedIn, isLoggedInquery, setSession, bearerUserFetch,
};
