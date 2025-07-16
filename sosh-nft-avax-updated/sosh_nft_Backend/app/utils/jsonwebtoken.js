const jwt = require('jsonwebtoken');
const { TokenError } = require('../handler/error/TokenError');
const { JWT_EXPIRES_IN, JWT_SECRET } = require('../../config/appconfig');

const SignJwt = async function (id) {
  try {
    const token = await jwt.sign({ id: id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    console.log('token', token);
    return token;
  } catch (error) {
    throw new TokenError(error.message);
  }
};

const verifyJwt = async function (token) {
  try {
    console.log("^%%$%#$#@%@$@$@#@$@%$%$%$%#%");
    const decode = await jwt.verify(token, JWT_SECRET);
    console.log("sdfdsfdsdfd%%%%%%%%%%%%%%%    decoded  %%%%%%%%%%%%%%%%%%%%sf");
    console.log(decode);
    return decode;
  } catch (error) {
    throw new TokenError('Unauthorized User');
  }
};

const getToken = async function (req) {
  try {
    const token = req.headers.authorization.split(' ')[1];
    return token;
  } catch (error) {
    throw new TokenError('Unauthorized user');
  }
};

const jwtDataVerify = async function (req) {
  const token = req.headers?.authorization?.split(' ')[1];
  try {
    if (!token?.includes('null')) {
      const decode = jwt.verify(token, JWT_SECRET);
      return decode;
    }
    return false;
  } catch (e) {
    return false;
  }
};

module.exports = {
  SignJwt, verifyJwt, getToken, jwtDataVerify,
};
