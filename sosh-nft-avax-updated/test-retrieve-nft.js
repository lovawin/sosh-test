/**
 * Test script for the NFT retrieval functionality
 * This script tests the retrieval of an NFT after a listing has expired
 */

const Web3 = require('web3');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Load ABI files
const marketplaceABI = require('./sosh-smart-contract/artifacts/contracts/sosh_marketplace/SoshMarketplace.sol/SoshMarketplace.json').abi;
const nftABI = require('./sosh-smart-contract/artifacts/contracts/sosh_minting/SoshNFT.sol/SoshNFT.json').abi;

// Load configuration
const config = require('./frontend/src/common/config721MarketPlace');

// Connect to the blockchain
const web3 = new Web3(new Web3.providers.HttpProvider('https://api.avax-test.network/ext/bc/C/rpc'));

// Set up the account to use for transactions
const privateKey = process.env.PRIVATE_KEY || ''; // Set your private key as an environment variable
const account = privateKey ? web3.eth.accounts.privateKeyToAccount(privateKey) : null;
web3.eth.accounts.wallet.add(account);
const walletAddress = account ? account.address : null;

// Contract instances
const marketplaceContract = new web3.eth.Contract(
  marketplaceABI,
  config.MARKETPLACE_ADDRESS
);

const nftContract = new web3.eth.Contract(
  nftABI,
  config.NFT_ADDRESS
);

// Function to check if a listing is expired
async function isListingExpired(saleId) {
  try {
    const sale = await marketplaceContract.methods.reserveSale(saleId).call();
    const currentTime = Math.floor(Date.now() / 1000);
    
    // Check if the sale is still open and if the end time has passed
    return sale.status === '0' && parseInt(sale.endTime) < currentTime;
  } catch (error) {
    console.error('Error checking if listing is expired:', error);
    return false;
  }
}

// Function to retrieve an NFT from an expired listing
async function retrieveExpiredNFT(saleId) {
  try {
    console.log(`Attempting to retrieve NFT from sale #${saleId}...`);
    
    // Check if the listing is expired
    const isExpired = await isListingExpired(saleId);
    if (!isExpired) {
      console.error(`Sale #${saleId} is not expired or already closed.`);
      return false;
    }
    
    // Get sale details before retrieval
    const saleBefore = await marketplaceContract.methods.reserveSale(saleId).call();
    console.log('Sale details before retrieval:', saleBefore);
    
    // Check if the NFT is owned by the marketplace
    const tokenId = saleBefore.tokenId;
    const currentOwner = await nftContract.methods.ownerOf(tokenId).call();
    console.log(`Current owner of token #${tokenId}: ${currentOwner}`);
    
    if (currentOwner.toLowerCase() !== config.MARKETPLACE_ADDRESS.toLowerCase()) {
      console.error(`NFT #${tokenId} is not owned by the marketplace.`);
      return false;
    }
    
    // Check if the caller is the original seller
    if (saleBefore.seller.toLowerCase() !== walletAddress.toLowerCase()) {
      console.error(`You (${walletAddress}) are not the original seller (${saleBefore.seller}).`);
      return false;
    }
    
    console.log(`Calling finalizeExpiredSale for sale #${saleId}...`);
    
    // Call the finalizeExpiredSale function
    const result = await marketplaceContract.methods.finalizeExpiredSale(saleId).send({
      from: walletAddress,
      gas: 300000,
      gasPrice: web3.utils.toWei('50', 'gwei')
    });
    
    console.log('Transaction successful!');
    console.log('Transaction hash:', result.transactionHash);
    console.log('Gas used:', result.gasUsed);
    
    // Verify the NFT was transferred back to the seller
    const newOwner = await nftContract.methods.ownerOf(tokenId).call();
    console.log(`New owner of token #${tokenId}: ${newOwner}`);
    
    // Check if the sale status was updated
    const saleAfter = await marketplaceContract.methods.reserveSale(saleId).call();
    console.log('Sale details after retrieval:', saleAfter);
    
    // Verify the sale is now closed
    if (saleAfter.status === '2') { // 2 = Closed
      console.log(`Sale #${saleId} has been successfully closed.`);
      return true;
    } else {
      console.error(`Sale #${saleId} status was not updated correctly.`);
      return false;
    }
  } catch (error) {
    console.error('Error retrieving NFT:', error);
    return false;
  }
}

// Function to find expired listings for the current user
async function findExpiredListings() {
  try {
    console.log('Searching for expired listings...');
    
    // Get the total number of sales
    const saleCount = await marketplaceContract.methods.saleIdTracker().call();
    console.log(`Total number of sales: ${saleCount}`);
    
    const expiredSales = [];
    
    // Check each sale
    for (let i = 1; i <= saleCount; i++) {
      try {
        const sale = await marketplaceContract.methods.reserveSale(i).call();
        
        // Check if the sale is open, expired, and belongs to the current user
        if (sale.status === '0' && // Open
            parseInt(sale.endTime) < Math.floor(Date.now() / 1000) && // Expired
            sale.seller.toLowerCase() === walletAddress.toLowerCase()) { // Belongs to user
          
          console.log(`Found expired sale #${i} for token #${sale.tokenId}`);
          expiredSales.push({
            saleId: i,
            tokenId: sale.tokenId,
            endTime: new Date(sale.endTime * 1000).toLocaleString(),
            askPrice: web3.utils.fromWei(sale.askPrice, 'ether')
          });
        }
      } catch (error) {
        console.error(`Error checking sale #${i}:`, error.message);
      }
    }
    
    return expiredSales;
  } catch (error) {
    console.error('Error finding expired listings:', error);
    return [];
  }
}

// Main function
async function main() {
  console.log('=== NFT Retrieval Test ===');
  
  if (!privateKey) {
    console.error('Error: No private key provided. Set the PRIVATE_KEY environment variable.');
    process.exit(1);
  }
  
  console.log(`Connected to wallet: ${walletAddress}`);
  console.log(`NFT Contract: ${config.NFT_ADDRESS}`);
  console.log(`Marketplace Contract: ${config.MARKETPLACE_ADDRESS}`);
  
  // Find expired listings for the current user
  const expiredListings = await findExpiredListings();
  
  if (expiredListings.length === 0) {
    console.log('No expired listings found for your address.');
    process.exit(0);
  }
  
  console.log('\nExpired listings found:');
  console.table(expiredListings);
  
  // Ask which listing to retrieve
  const saleId = process.argv[2] || expiredListings[0].saleId;
  
  console.log(`\nTesting retrieval for sale #${saleId}...`);
  
  // Attempt to retrieve the NFT
  const success = await retrieveExpiredNFT(saleId);
  
  if (success) {
    console.log('\n✅ NFT retrieval test completed successfully!');
    console.log('The NFT has been returned to your wallet.');
  } else {
    console.log('\n❌ NFT retrieval test failed.');
    console.log('Please check the error messages above for details.');
  }
}

// Run the main function
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error in main function:', error);
    process.exit(1);
  });
