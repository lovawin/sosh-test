/* eslint-disable consistent-return */
const { create } = require('ipfs-http-client');
const {
  IPFS_PROJECT_ID,
  IPFS_PROJECT_SECRET_ID,
} = require('../../config/appconfig');
const { InvalidInputError } = require('../handler/error/invalid_input_error');

const auth = `Basic ${Buffer.from(
  `${IPFS_PROJECT_ID}:${IPFS_PROJECT_SECRET_ID}`,
).toString('base64')}`;

const client = create({
  protocol: 'https',
  host: 'ipfs.infura.io',
  port: '5001',
  path: 'api/v0',
  headers: {
    authorization: auth,
  },
});
/**
 * @class - Upload class containing all the controllers
 */

class IPFS {
  async uploadimage(req, res) {
    let content;
    if (req.files && req.files.image) {
      content = req.files.image.data;
    } else {
      throw new InvalidInputError('Content Required');
    }
    client
      .add({
        content: content,
      })
      .then((dataipfs) => res.send({
        message: 'Content uploaded on IPFS successfully',
        cid: dataipfs.cid.toString(),
      }))
      .catch((err) => res.status(400).json({
        message: err.message,
      }));
  }

  async uploadmetadata(req, res) {
    let content;
    if (req.body.metadata) {
      content = JSON.stringify(req.body.metadata);
    } else {
      throw new InvalidInputError('Content Required');
    }
    client
      .add({
        content: content,
        path: req.body.path,
      })
      .then((dataipfs) => res.send({
        message: 'Content uploaded on IPFS successfully',
        cid: dataipfs.cid.toString(),
      }))
      .catch((err) => res.status(400).json({
        message: err.message,
      }));
  }
}

module.exports = IPFS;
