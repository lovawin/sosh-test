const Joi = require('joi');

function validateLogin(user) {
  const schema = Joi.object({
    message: Joi.string().max(255).required(),
    signature: Joi.string().max(255).required(),
  });
  const result = schema.validate(user);
  console.log(result);
  return result;
}

function validateUpdateUser(user) {
  const schema = Joi.object({
    name: Joi.string(),
    username: Joi.string(),
    bio: Joi.string().allow(''),
    email: Joi.string().email().allow(''),
    website: Joi.string().allow(''),
    instagramUsername: Joi.string().allow(''),
    twitterUsername: Joi.string().allow(''),
    tiktokUsername: Joi.string().allow(''),
    youtubeUsername: Joi.string().allow(''),
    AuctionNotification: Joi.boolean(),
    privateSaleNotification: Joi.boolean(),
    newNftListingNotification: Joi.boolean(),
  });
  const result = schema.validate(user);
  console.log(result);
  return result;
}

module.exports.validateLogin = validateLogin;
module.exports.validateUpdateUser = validateUpdateUser;
