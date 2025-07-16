/**
 * Run Retrieval Test
 * 
 * This script runs the test-retrieve-nft.js script with the user's wallet address
 * to check if the NFTs are eligible for retrieval.
 * 
 * Usage:
 * 1. Set your wallet address in the WALLET_ADDRESS variable
 * 2. Run with: node run-retrieval-test.js
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const WALLET_ADDRESS = "0x7411e7942f4c8271d4e636429f374997fdaede17"; // The wallet address from the logs
const TOKEN_IDS = [1, 2]; // The token IDs we're interested in

// Path to the test-retrieve-nft.js script
const testScriptPath = path.join(__dirname, 'test-retrieve-nft.js');

// Check if the test script exists
if (!fs.existsSync(testScriptPath)) {
  console.error(`Error: Test script not found at ${testScriptPath}`);
  process.exit(1);
}

// Set the environment variable for the private key
// Note: You'll need to provide your private key when running this script
const privateKey = process.env.PRIVATE_KEY;
if (!privateKey) {
  console.error('Error: PRIVATE_KEY environment variable not set');
  console.error('Please run this script with your private key:');
  console.error('PRIVATE_KEY=your_private_key_here node run-retrieval-test.js');
  process.exit(1);
}

console.log('=== Running NFT Retrieval Test ===');
console.log(`Wallet Address: ${WALLET_ADDRESS}`);
console.log(`Token IDs: ${TOKEN_IDS.join(', ')}`);
console.log('Running test-retrieve-nft.js...');

// Run the test script
const testProcess = spawn('node', [testScriptPath], {
  env: {
    ...process.env,
    PRIVATE_KEY: privateKey,
    WALLET_ADDRESS: WALLET_ADDRESS
  }
});

// Handle output
testProcess.stdout.on('data', (data) => {
  console.log(data.toString());
});

testProcess.stderr.on('data', (data) => {
  console.error(data.toString());
});

testProcess.on('close', (code) => {
  console.log(`Test script exited with code ${code}`);
  
  if (code === 0) {
    console.log('\n=== Test Completed Successfully ===');
    console.log('If the test found expired listings, you should be able to retrieve your NFTs.');
    console.log('If no expired listings were found, check the following:');
    console.log('1. Verify the listings are actually expired (check end times)');
    console.log('2. Verify the listings are in "Open" status');
    console.log('3. Verify you are the original seller of the NFTs');
    console.log('4. Verify the NFTs are owned by the marketplace contract');
  } else {
    console.log('\n=== Test Failed ===');
    console.log('Please check the error messages above for details.');
  }
});
