const Joi = require('joi');

function validateAsset(asset) {
  const schema = Joi.object({
    name: Joi.string().required(),
    description: Joi.string().required(),
    bucketUrl: Joi.string().uri().required(),
    // metadata_url: Joi.string().uri().required(),
    platform_type: Joi.string().valid('instagram', 'twitter', 'youtube', 'tiktok').required(),
    post_url: Joi.string().uri().required(),
    hashtag: Joi.string().pattern(/^#\w+$/).message('invalid hastag ,hastag should begin with #').required(),
    awsObjectId: Joi.string().required(),
  });
  const result = schema.validate(asset);
  return result;
}

function validateLikeAsset(asset) {
  const schema = Joi.object({
    like: Joi.boolean().required(),
  });
  const result = schema.validate(asset);
  return result;
}

function validatetxnHash(asset) {
  const schema = Joi.object({
    hash: Joi.string().required(),
  });
  const result = schema.validate(asset);
  return result;
}

function validateUpdadateAsset(asset) {
  const schema = Joi.object({
    tx_data: Joi.object().required(),
  });
  const result = schema.validate(asset);
  return result;
}

module.exports.validateAsset = validateAsset;
module.exports.validateUpdadateAsset = validateUpdadateAsset;
module.exports.validateLikeAsset = validateLikeAsset;
module.exports.validatetxnHash = validatetxnHash;
