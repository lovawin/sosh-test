/**
 * Run Retrieval Test with Key
 * 
 * This script runs the test-retrieve-nft.js script with the user's wallet address
 * to check if the NFTs are eligible for retrieval.
 * 
 * Usage:
 * 1. Run with: node run-retrieval-test-with-key.js
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const WALLET_ADDRESS = "0x7411e7942f4c8271d4e636429f374997fdaede17"; // The wallet address from the logs
const TOKEN_IDS = [1, 2]; // The token IDs we're interested in
const PRIVATE_KEY = "bf2ed39f86cad525513c1ecd3f1b58f5d55251b585008def376191c4646dd9f3"; // The private key provided by the user

// Path to the test-retrieve-nft.js script
const testScriptPath = path.join(__dirname, 'test-retrieve-nft.js');

// Check if the test script exists
if (!fs.existsSync(testScriptPath)) {
  console.error(`Error: Test script not found at ${testScriptPath}`);
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
    PRIVATE_KEY: PRIVATE_KEY,
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
