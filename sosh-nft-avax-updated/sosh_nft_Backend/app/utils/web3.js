const Web3 = require('web3');
const { INFURA_URL, INFURA_WSS } = require('../../config/appconfig');

const options = {
  // Enable auto reconnection
  clientConfig: {
    // Useful to keep a connection alive
    keepalive: true,
    keepaliveInterval: 60000, // ms
  },
  reconnect: {
    auto: true,
    delay: 5000, // ms
    maxAttempts: 5,
    onTimeout: false,
  },
};
exports.getWeb3HTTPProvider = () => new Web3.providers.HttpProvider(INFURA_URL);

exports.getWeb3WSProvider = () => new Web3.providers.WebsocketProvider(INFURA_WSS, options);

exports.web3Instance = (provider) => new Web3(provider);
