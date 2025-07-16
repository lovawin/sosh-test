/**
 * Script to check if the NFT contract is properly configured on the server
 */

const axios = require('axios');
const Web3 = require('web3');

// Configuration
const NFT_CONTRACT_ADDRESS = '0x7CA1eA6d19A1df7d17fEaF0eA9a1dEFA0e37f894';
const MARKETPLACE_PROXY_ADDRESS = '0x25ad5b58a78c1cC1aF3C83607448D0D203158F06';
const INFURA_URL = 'https://api.avax-test.network/ext/bc/C/rpc';
const TOKEN_ID = 1;

// Initialize Web3
const web3 = new Web3(new Web3.providers.HttpProvider(INFURA_URL));

// Main function
async function checkNftContractConfig() {
  console.log('=== NFT Contract Configuration Check ===');
  console.log(`NFT Contract Address: ${NFT_CONTRACT_ADDRESS}`);
  console.log(`Marketplace Proxy Address: ${MARKETPLACE_PROXY_ADDRESS}`);
  console.log(`Checking token ID: ${TOKEN_ID}`);
  console.log('');

  try {
    // Load the NFT contract ABI
    const nftAbi = require('./sosh_nft_Backend/app/ABI/contract.nft.json');
    console.log('Successfully loaded NFT contract ABI');

    // Create NFT contract instance
    const nftContract = new web3.eth.Contract(nftAbi, NFT_CONTRACT_ADDRESS);
    console.log('Successfully created NFT contract instance');

    // Check if the contract has the ownerOf function
    if (typeof nftContract.methods.ownerOf === 'function') {
      console.log('NFT contract has ownerOf function ✓');
    } else {
      console.error('NFT contract does not have ownerOf function ✗');
    }

    // Try to get the owner of the token
    try {
      const owner = await nftContract.methods.ownerOf(TOKEN_ID).call();
      console.log(`Owner of token ${TOKEN_ID}: ${owner}`);
      
      // Check if the marketplace owns the token
      const isMarketplaceOwner = owner.toLowerCase() === MARKETPLACE_PROXY_ADDRESS.toLowerCase();
      console.log(`Is owned by marketplace: ${isMarketplaceOwner}`);
      
      if (isMarketplaceOwner) {
        console.log('The "Retrieve" button should be displayed if the listing has expired and the user is the seller');
      } else {
        console.log('The "Retrieve" button should not be displayed because the marketplace does not own the token');
      }
    } catch (error) {
      console.error(`Error getting owner of token ${TOKEN_ID}:`, error.message);
    }

    // Check if the tokenAddress is properly set in the environment
    console.log('\nChecking server configuration...');
    try {
      const response = await axios.get('https://www.soshnft.io/api/V1/config/check-nft-contract');
      console.log('Server configuration:', response.data);
    } catch (error) {
      console.error('Error checking server configuration:', error.message);
      console.log('This endpoint might not exist. You may need to check the server logs directly.');
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the check
checkNftContractConfig();
