/**
 * Test script for the NFT retrieval button fix
 * 
 * This script helps verify that the "Retrieve" button only appears for the original seller of an NFT.
 * It logs information about the current user, the NFT seller, and whether the button should be visible.
 */

// Import required modules
const { Web3 } = require('web3');
const fs = require('fs');
const path = require('path');

// Load ABI files
const marketplaceABI = require('./sosh-smart-contract/artifacts/contracts/sosh_marketplace/SoshMarketplace.sol/SoshMarketplace.json').abi;
const nftABI = require('./sosh-smart-contract/artifacts/contracts/sosh_minting/SoshNFT.sol/SoshNFT.json').abi;

// Configuration for this test
const testConfig = {
  // Replace with the token ID you want to test
  tokenId: 1,
  // Output file for logs
  outputFile: 'retrieval-button-test-results.json',
  // Marketplace address
  marketplaceAddress: '0x25ad5b58a78c1cC1aF3C83607448D0D203158F06',
  // NFT address
  nftAddress: '0x7CA1eA6d19A1df7d17fEaF0eA9a1dEFA0e37f894'
};

// Main function
async function testRetrievalButtonVisibility() {
  try {
    console.log('Starting NFT retrieval button visibility test...');
    
    // Connect to the blockchain
    const web3 = new Web3('https://api.avax-test.network/ext/bc/C/rpc');
    console.log('Connected to network');
    
    // Create contract instance
    const marketplaceContract = new web3.eth.Contract(
      marketplaceABI,
      "0x25ad5b58a78c1cC1aF3C83607448D0D203158F06" // Sosh NFT Marketplace Proxy Address
    );
    
    // Get the current block timestamp
    const currentBlock = await web3.eth.getBlock('latest');
    const currentTimestamp = currentBlock.timestamp;
    console.log(`Current timestamp: ${currentTimestamp} (${new Date(parseInt(currentTimestamp) * 1000).toISOString()})`);
    
    // Get sale information for the token
    console.log(`Fetching sale information for token ID: ${testConfig.tokenId}`);
    
    // Find the sale ID for this token
    // Note: In a real implementation, you would need to query the contract to find the sale ID
    // For this test, we'll assume the sale ID is the same as the token ID
    const saleId = testConfig.tokenId;
    
    // Get sale details
    const saleInfo = await marketplaceContract.methods.reserveSale(saleId).call();
    console.log('Sale information:', {
      seller: saleInfo.seller,
      tokenId: saleInfo.tokenId.toString(),
      startTime: saleInfo.startTime.toString(),
      endTime: saleInfo.endTime.toString(),
      status: saleInfo.status
    });
    
    // Check if the sale has expired
    const isExpired = parseInt(currentTimestamp) > parseInt(saleInfo.endTime);
    console.log(`Sale expired: ${isExpired}`);
    
    // Simulate different user scenarios
    const testUsers = [
      { address: saleInfo.seller, description: 'Original seller' },
      { address: '0x7411e7942f4c8271d4e636429f374997fdaede17', description: 'Random user' },
      { address: '0x0000000000000000000000000000000000000000', description: 'Zero address' }
    ];
    
    const results = [];
    
    for (const user of testUsers) {
      // Check if this user is the seller
      const isUserSeller = user.address.toLowerCase() === saleInfo.seller.toLowerCase();
      
      // Determine if the button should be visible
      const shouldShowButton = isExpired && isUserSeller;
      
      const result = {
        user: user.description,
        userAddress: user.address,
        sellerAddress: saleInfo.seller,
        isUserSeller,
        isExpired,
        shouldShowRetrieveButton: shouldShowButton
      };
      
      results.push(result);
      console.log(`\nTest for ${user.description}:`);
      console.log(JSON.stringify(result, null, 2));
    }
    
    // Save results to file
    fs.writeFileSync(
      path.join(__dirname, testConfig.outputFile),
      JSON.stringify({ timestamp: new Date().toISOString(), results }, null, 2)
    );
    
    console.log(`\nTest results saved to ${testConfig.outputFile}`);
    console.log('\nTest completed successfully!');
    
  } catch (error) {
    console.error('Error during test:', error);
  }
}

// Run the test
testRetrievalButtonVisibility();
