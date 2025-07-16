const { web3Instance, getWeb3HTTPProvider } = require('../utils/web3');
const ResponseModal = require('../handler/http/responseModal');
const logger = require('../services/logger');
const Users = require('../models/User');
const { InvalidInputError } = require('../handler/error/invalid_input_error');
const { SignJwt, verifyJwt } = require('../utils/jsonwebtoken');
const { encrypt, decrypt } = require("../utils/crypto");

const Response = new ResponseModal();
/**
 * @class - User class containing all the controllers
 */

const FRONTEND_MESSAGE_TO_SIGN = 'Please sign this message to connect.';

const recoverAddress = async (message, signature) => {
  const web3_instance = await web3Instance(getWeb3HTTPProvider);
  return web3_instance.eth.accounts.recover(message, signature);
};

class Auth {
  async signMessage(req, res) {
    // TODO: make this message dynamic per session
    return res.status(200).json({
      status: 'success',
      message: 'Your Sign In Message',
      data: {
        signinmessage: FRONTEND_MESSAGE_TO_SIGN,
      },
    });
  }

  async login(req, res) {
    console.log("Inside login");
    const {
      message, signature, name, username, email, referral,
    } = req.body;

    logger.debug(
      `login is called with message: ${message}, signature: ${signature} }`,
    );

    if (!message || !signature || message !== FRONTEND_MESSAGE_TO_SIGN) {
      throw new InvalidInputError(`Login Failed with message :${message} and signature :${signature}`);
    }
    const publicAddress = await recoverAddress(message, signature);

    logger.debug(
      `login - publicAddress: ${publicAddress} recovered from ${message} and signature: ${signature}`,
    );
    let user;
    user = await Users.findOne({
      wallet_address: publicAddress.toLowerCase(),
    });
    let user_ref;
    if (!user) {
      if (!name) {
        throw new InvalidInputError('name is required');
      }
      if (!username) {
        throw new InvalidInputError('username is required');
      }
      if (!email) {
        throw new InvalidInputError("email is required");
      }

      const isuser = await Users.findOne({
        username: username,
      });
      const isreferral = await Users.findOne({
        ref_code: referral?.trim(),
      });
      // if (referral !== "" && !isreferral) {
      //   throw new InvalidInputError("Wrong User Referral");
      // }
      // check username
      if (isuser) {
        throw new InvalidInputError(`Username is already taken.Please choose another username!`);
      } else {
        if (referral !== "" && isreferral) {
          user_ref = await Users.findOneAndUpdate(
            {
              ref_code: referral,
            },

            {
              $push: { refCounter: username },
            },
          );
          // call smart contract method
        }

        logger.debug(`creating new user for wallet address :${publicAddress}`);
        user = new Users({
          wallet_address: publicAddress,
          name: name,
          username: username,
          email: email,
          last_login_date: new Date(),
          ref_by: isreferral?._id,
          ref_code: encrypt(username),
        });
        await user.save();
      }
    }

    logger.debug(`user: ${JSON.stringify(user)} returned from DB `);

    // update the last_login_date of an existing user
    user.set({
      last_login_date: new Date(),
    });
    await user.save();
    await user.populate('followers following userAsset', 'username profile_image_url');
    user = user.toJSON();
    console.log(user.id);
    const jwt_token = await SignJwt(user.id);
    const AssetLength = user.userAsset.length;
    user.userAsset = null;
    user.userAsset = AssetLength;
    return res.status(200).json({
      status: 'success',
      message: 'Wallet Connected Successfully!',
      data: {
        user,
        token: jwt_token,
      },
    });
  }

  async reference(req, res) {
    const user = await Users.findById(req.user.id);
  }

  async logout(req, res) {
    console.log(`logout is called for the user: ${req.user.id}`);
    logger.debug(`logout is called for the user: ${req.user.id}`);

    const user = await Users.findById(req.user.id);

    user.set({
      last_logout_date: new Date(),
    });
    await user.save();

    return res.send({
      success: true,
    });
  }
}

module.exports = Auth;
