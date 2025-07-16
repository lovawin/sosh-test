/**
 * Diagnostic script to check the ownership of an NFT directly from the blockchain
 * 
 * This script uses Web3 to query the blockchain directly and check the owner of a specific NFT
 */

const Web3 = require('web3');
const fs = require('fs');

// Configuration
const TOKEN_ID = 1;
const NFT_CONTRACT_ADDRESS = '0x7CA1eA6d19A1df7d17fEaF0eA9a1dEFA0e37f894';
const MARKETPLACE_PROXY_ADDRESS = '0x25ad5b58a78c1cC1aF3C83607448D0D203158F06';
const INFURA_URL = 'https://api.avax-test.network/ext/bc/C/rpc';

// Load NFT ABI
const nftABI = require('./sosh_nft_Backend/app/ABI/contract.nft.json');

async function checkNFTOwnership() {
  try {
    console.log('=== NFT Ownership Diagnostic ===');
    console.log('NFT Contract Address:', NFT_CONTRACT_ADDRESS);
    console.log('Marketplace Proxy Address:', MARKETPLACE_PROXY_ADDRESS);
    console.log('Token ID:', TOKEN_ID);
    console.log('Infura URL:', INFURA_URL);
    
    // Initialize Web3
    const web3 = new Web3(INFURA_URL);
    
    // Create NFT contract instance
    const nftContract = new web3.eth.Contract(nftABI, NFT_CONTRACT_ADDRESS);
    
    // Get the owner of the token
    const owner = await nftContract.methods.ownerOf(TOKEN_ID).call();
    console.log(`Owner of token ${TOKEN_ID}:`, owner);
    
    // Check if the marketplace owns the token
    const isMarketplaceOwner = owner.toLowerCase() === MARKETPLACE_PROXY_ADDRESS.toLowerCase();
    console.log(`Is owned by marketplace: ${isMarketplaceOwner}`);
    
    // Get the token URI
    try {
      const tokenURI = await nftContract.methods.tokenURI(TOKEN_ID).call();
      console.log(`Token URI: ${tokenURI}`);
    } catch (error) {
      console.error('Error getting token URI:', error.message);
    }
    
    // Save the results to a file
    const results = {
      tokenId: TOKEN_ID,
      nftContractAddress: NFT_CONTRACT_ADDRESS,
      marketplaceProxyAddress: MARKETPLACE_PROXY_ADDRESS,
      owner: owner,
      isOwnedByMarketplace: isMarketplaceOwner
    };
    
    fs.writeFileSync('nft-ownership-check.json', JSON.stringify(results, null, 2));
    console.log('\nResults saved to nft-ownership-check.json');
    
  } catch (error) {
    console.error('Error checking NFT ownership:', error);
  }
}

// Run the check
checkNFTOwnership();
