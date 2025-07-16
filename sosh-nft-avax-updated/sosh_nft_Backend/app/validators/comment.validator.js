const Joi = require('joi');

function validateComment(asset) {
  const schema = Joi.object({
    text: Joi.string().min(1).max(255).required(),
  });
  const result = schema.validate(asset);
  return result;
}

function validateLikeComment(asset) {
  const schema = Joi.object({
    like: Joi.boolean().required(),
  });
  const result = schema.validate(asset);
  return result;
}

function validateUpdadateComment(asset) {
  const schema = Joi.object({
    text: Joi.string().min(1).max(255).required(),
  });
  const result = schema.validate(asset);
  return result;
}

module.exports.validateComment = validateComment;
module.exports.validateUpdadateComment = validateUpdadateComment;
module.exports.validateLikeComment = validateLikeComment;
