require("dotenv").config({ path: '../sosh_nft_Backend/config/prod/dev.env' });
require("@nomicfoundation/hardhat-verify");
require("@nomicfoundation/hardhat-toolbox");
require('@openzeppelin/hardhat-upgrades');

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.26",
        settings: {
          optimizer: {
            enabled:true,
            runs: 1000,
          }
        }
      }
    ]
  },
  networks: {
    avalanche: {
      url: process.env.INFURA_URL,
      accounts: [process.env.DEPLOYER_PRIVATE_KEY]
    },
    fuji: {
      url: "https://api.avax-test.network/ext/bc/C/rpc",
      chainId: 43113,
      accounts: [process.env.DEPLOYER_PRIVATE_KEY],
      gasPrice: 225000000000
    },
  },
  // The hardhat-verify plugin uses "etherscan" as the key name for all block explorers
  etherscan: {
    // This will be used to verify the contract on Snowtrace (Avalanche Explorer)
    apiKey: {
      avalanche: 'snowtrace',
      avalancheFujiTestnet: 'snowtrace'
    },
    customChains: [
      {
        network: "avalanche",
        chainId: 43114,
        urls: {
          apiURL: "https://api.snowtrace.io/api",
          browserURL: "https://snowtrace.io/"
        }
      },
      {
        network: "avalancheFujiTestnet",
        chainId: 43113,
        urls: {
          apiURL: "https://api-testnet.snowtrace.io/api",
          browserURL: "https://testnet.snowtrace.io/"
        }
      }
    ]
  },
  sourcify: {
    enabled: true
  }
};
