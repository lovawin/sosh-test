const crypto = require('crypto');
const { CRYPTO_ALGO, CRYPTO_SECURITY_KEY, CRYPTO_INIT_VECTOR } = require('../../config/appconfig');

const algorithm = CRYPTO_ALGO;
const Securitykey = Buffer.from(CRYPTO_SECURITY_KEY);
const initVector = Buffer.from(CRYPTO_INIT_VECTOR);

const decrypt = (hash) => {
  const decipher = crypto.createDecipheriv(algorithm, Securitykey, initVector);
  let decryptedData = decipher.update(hash, 'hex', 'utf-8');
  decryptedData += decipher.final('utf8');
  return decryptedData;
};

const encrypt = function (message) {
  const cipher = crypto.createCipheriv(algorithm, Securitykey, initVector);
  let encryptedData = cipher.update(message, 'utf-8', 'hex');
  encryptedData += cipher.final('hex');
  return encryptedData;
};

module.exports = {
  decrypt,
  encrypt,
};
