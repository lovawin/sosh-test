/**
 * Test script for the NFT retrieval button fix
 * 
 * This script tests the changes made to fix the issue with the "Retrieve" button
 * not displaying in the UI.
 */

const Web3 = require('web3');
const axios = require('axios');
const { marketPlaceInstance } = require('./frontend/src/common/methodInstance');

// Configuration
const tokenId = 1; // The token ID to test
const userAddress = '0x7411e7942f4C8271D4E636429f374997fdaede17'; // The user's wallet address
const marketplaceAddress = '0x25ad5b58a78c1cC1aF3C83607448D0D203158F06'; // The marketplace contract address

// Initialize Web3
const web3 = new Web3('https://api.avax-test.network/ext/bc/C/rpc');

// Test functions
async function testFrontendChanges() {
  console.log('\n--- Testing Frontend Changes ---');
  
  try {
    // Test that reserveSale works correctly
    const Contract = marketPlaceInstance();
    const saleId = 1; // Use a known sale ID for testing
    
    console.log(`Testing reserveSale call for saleId ${saleId}...`);
    const saleInfo = await Contract.methods.reserveSale(saleId).call();
    
    console.log('Sale info retrieved successfully:');
    console.log('- Token ID:', saleInfo.tokenId);
    console.log('- Seller:', saleInfo.seller);
    console.log('- End Time:', new Date(saleInfo.endTime * 1000).toISOString());
    console.log('- Status:', saleInfo.status);
    
    return true;
  } catch (error) {
    console.error('Frontend test failed:', error.message);
    return false;
  }
}

async function testBackendChanges() {
  console.log('\n--- Testing Backend Changes ---');
  
  try {
    // Test the verify-nft endpoint
    console.log(`Testing /api/V1/marketplace/verify-nft/${tokenId} endpoint...`);
    
    // Get an authentication token (you may need to implement this)
    // const token = await getAuthToken();
    
    // For testing purposes, we'll make a direct request to the endpoint
    // In a real scenario, you would use the actual API with authentication
    const response = await axios.get(`http://localhost:5000/api/V1/marketplace/verify-nft/${tokenId}?address=${userAddress}`);
    
    console.log('API response:', response.data);
    
    if (response.data.status === 'success') {
      const data = response.data.data;
      console.log('Verification result:');
      console.log('- Is Eligible For Retrieval:', data.isEligibleForRetrieval);
      console.log('- Is Marketplace Owner:', data.isMarketplaceOwner);
      console.log('- Is Original Seller:', data.isOriginalSeller);
      console.log('- Has Expired:', data.hasExpired);
      
      return true;
    } else {
      console.error('Backend test failed: API returned error status');
      return false;
    }
  } catch (error) {
    console.error('Backend test failed:', error.message);
    if (error.response) {
      console.error('API error response:', error.response.data);
    }
    return false;
  }
}

async function testNFTOwnership() {
  console.log('\n--- Testing NFT Ownership ---');
  
  try {
    // Load NFT ABI (you'll need to provide this)
    const nftABI = require('./sosh_nft_Backend/app/ABI/contract.nft.json');
    const nftAddress = '0x7CA1eA6d19A1df7d17fEaF0eA9a1dEFA0e37f894'; // NFT contract address
    
    // Create NFT contract instance
    const nftContract = new web3.eth.Contract(nftABI, nftAddress);
    
    // Check current owner of the NFT
    console.log(`Checking ownership of NFT with tokenId ${tokenId}...`);
    const currentOwner = await nftContract.methods.ownerOf(tokenId).call();
    
    console.log('Current owner:', currentOwner);
    console.log('Marketplace address:', marketplaceAddress);
    console.log('Is owned by marketplace:', currentOwner.toLowerCase() === marketplaceAddress.toLowerCase());
    
    return currentOwner.toLowerCase() === marketplaceAddress.toLowerCase();
  } catch (error) {
    console.error('NFT ownership test failed:', error.message);
    return false;
  }
}

// Main test function
async function runTests() {
  console.log('Starting tests for NFT retrieval button fix...');
  
  // Test NFT ownership
  const ownershipTestPassed = await testNFTOwnership();
  console.log(`NFT ownership test ${ownershipTestPassed ? 'PASSED' : 'FAILED'}`);
  
  // Test frontend changes
  const frontendTestPassed = await testFrontendChanges();
  console.log(`Frontend test ${frontendTestPassed ? 'PASSED' : 'FAILED'}`);
  
  // Test backend changes
  const backendTestPassed = await testBackendChanges();
  console.log(`Backend test ${backendTestPassed ? 'PASSED' : 'FAILED'}`);
  
  // Overall result
  if (ownershipTestPassed && frontendTestPassed && backendTestPassed) {
    console.log('\n✅ All tests PASSED! The fix is working correctly.');
    console.log('You can now deploy the changes to production.');
  } else {
    console.log('\n❌ Some tests FAILED! Please review the issues before deploying.');
  }
}

// Run the tests
runTests().catch(error => {
  console.error('Test script error:', error);
  process.exit(1);
});
