// eslint-disable-next-line import/no-extraneous-dependencies
const pinataSDK = require('@pinata/sdk');
const { InvalidInputError } = require('../handler/error/invalid_input_error');
const {
  PINATA_API_KEY, PINATA_SECRET_KEY,
} = require('../../config/appconfig');

// eslint-disable-next-line new-cap
const pinata = new pinataSDK(PINATA_API_KEY, PINATA_SECRET_KEY);
const uploadmetadata = async (metadata) => {
  if (!metadata) {
    throw new InvalidInputError('Content required');
  }
  try {
    const options = {
      pinataMetadata: {
        name: 'MyCustomName',
        keyvalues: {
          customKey: 'customValue',
          customKey2: 'customValue2',
        },
      },
      pinataOptions: {
        cidVersion: 0,
      },
    };

    const res = await pinata.pinJSONToIPFS(metadata, options);

    return res;
  } catch (error) {
    throw new Error(error);
  }
};

module.exports = uploadmetadata;
