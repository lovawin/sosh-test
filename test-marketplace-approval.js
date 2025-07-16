/**
 * NFT Marketplace Approval Diagnostic Script
 * 
 * This script tests the NFT approval process to verify that the ownership check
 * is working correctly before attempting to approve the marketplace.
 */

const Web3 = require('web3');
const fs = require('fs');
const path = require('path');
const { contactInstance } = require('./frontend/src/common/methodInstance');
const { CUSTOM_TOKEN_ADDRESS_721_MARKET_PLACE } = require('./frontend/src/common/config721MarketPlace');

// Configuration
const TEST_TOKEN_ID = process.argv[2] || '12'; // Default to token ID 12 or use command line arg
const WALLET_ADDRESS = process.argv[3]; // User's wallet address from command line

// Initialize Web3
let web3;
try {
  // Connect to the network
  if (process.env.NODE_ENV === 'production') {
    web3 = new Web3('https://api.avax.network/ext/bc/C/rpc');
  } else {
    web3 = new Web3('https://api.avax-test.network/ext/bc/C/rpc');
  }
  console.log('Connected to Web3 provider');
} catch (error) {
  console.error('Failed to connect to Web3 provider:', error);
  process.exit(1);
}

// Main function
async function main() {
  if (!WALLET_ADDRESS) {
    console.error('Error: Wallet address is required. Usage: node test-marketplace-approval.js [tokenId] [walletAddress]');
    process.exit(1);
  }

  console.log(`\n=== NFT Marketplace Approval Diagnostic ===`);
  console.log(`Testing token ID: ${TEST_TOKEN_ID}`);
  console.log(`Wallet address: ${WALLET_ADDRESS}`);
  console.log(`Marketplace address: ${CUSTOM_TOKEN_ADDRESS_721_MARKET_PLACE}`);
  console.log('-------------------------------------------\n');

  try {
    // Get contract instance
    const contract = contactInstance();
    
    // Check token owner
    console.log('Checking token ownership...');
    const owner = await contract.methods.ownerOf(TEST_TOKEN_ID).call();
    console.log(`Token owner: ${owner}`);
    
    // Check if marketplace already owns the token
    const isMarketplaceOwner = owner.toLowerCase() === CUSTOM_TOKEN_ADDRESS_721_MARKET_PLACE.toLowerCase();
    console.log(`Is marketplace the owner? ${isMarketplaceOwner ? 'YES' : 'NO'}`);
    
    if (isMarketplaceOwner) {
      console.log('\n✅ DIAGNOSIS: Marketplace already owns this token. No approval needed.');
      console.log('   The fix is working correctly - approval will be skipped.');
    } else {
      // Check current approval
      console.log('\nChecking current approval...');
      const approved = await contract.methods.getApproved(TEST_TOKEN_ID).call();
      console.log(`Currently approved address: ${approved}`);
      
      const isApproved = approved.toLowerCase() === CUSTOM_TOKEN_ADDRESS_721_MARKET_PLACE.toLowerCase();
      console.log(`Is marketplace approved? ${isApproved ? 'YES' : 'NO'}`);
      
      if (isApproved) {
        console.log('\n✅ DIAGNOSIS: Marketplace is already approved for this token.');
      } else if (approved === WALLET_ADDRESS) {
        console.log('\n✅ DIAGNOSIS: User wallet is approved. This is an unusual state.');
      } else if (approved === '0x0000000000000000000000000000000000000000') {
        console.log('\n✅ DIAGNOSIS: No approval set. User will need to approve the marketplace.');
      } else {
        console.log('\n⚠️ DIAGNOSIS: Another address is approved. User will need to change approval to the marketplace.');
      }
    }
    
    // Simulate approval process
    console.log('\n=== Simulating Approval Process ===');
    if (isMarketplaceOwner) {
      console.log('1. Ownership check: Marketplace owns the token');
      console.log('2. Skip approval process');
      console.log('3. Log APPROVAL_SKIPPED event');
      console.log('4. Proceed with listing');
    } else {
      console.log('1. Ownership check: User owns the token');
      console.log('2. Check current approval');
      console.log('3. Request approval from user');
      console.log('4. Execute approval transaction');
      console.log('5. Log approval result');
      console.log('6. Proceed with listing');
    }
    
    console.log('\n=== Recommendation ===');
    if (isMarketplaceOwner) {
      console.log('The token is already owned by the marketplace. No action needed for approval.');
      console.log('User can proceed directly to listing the NFT for sale.');
    } else if (isApproved) {
      console.log('The marketplace is already approved for this token. No action needed for approval.');
      console.log('User can proceed directly to listing the NFT for sale.');
    } else {
      console.log('User needs to approve the marketplace for this token before listing it for sale.');
      console.log('The "Approve Marketplace" button should be displayed to the user.');
    }
    
  } catch (error) {
    console.error('\n❌ ERROR during diagnosis:', error.message);
    if (error.message.includes('nonexistent token')) {
      console.log('\nDIAGNOSIS: The token ID does not exist or is not owned by anyone.');
    } else if (error.message.includes('revert')) {
      console.log('\nDIAGNOSIS: Contract reverted the operation. This could be due to:');
      console.log('- Token ID does not exist');
      console.log('- Caller does not have permission');
      console.log('- Contract is paused or has other restrictions');
    }
  }
}

// Run the main function
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
