/**
 * Run Approval Diagnostic Script
 * 
 * This script runs the nft-retrieval-button-diagnostic.js script with the token ID and user address
 * from the error logs to diagnose the issue with the NFT approval process.
 * 
 * Usage:
 *   node run-approval-diagnostic.js
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Token ID and user address from the error logs
const TOKEN_ID = '1';
const USER_ADDRESS = '0x7411e7942f4c8271d4e636429f374997fdaede17';

console.log(`=== Running NFT Approval Diagnostic for Token #${TOKEN_ID} ===`);
console.log(`User Address: ${USER_ADDRESS}`);
console.log('');

// Check if the diagnostic script exists
const diagnosticScriptPath = path.join(__dirname, 'nft-retrieval-button-diagnostic.js');
if (!fs.existsSync(diagnosticScriptPath)) {
  console.error(`Error: Diagnostic script not found at ${diagnosticScriptPath}`);
  console.error('Please make sure the nft-retrieval-button-diagnostic.js file exists in the current directory.');
  process.exit(1);
}

// Run the diagnostic script
const diagnostic = spawn('node', [diagnosticScriptPath, TOKEN_ID, USER_ADDRESS], {
  stdio: 'inherit'
});

diagnostic.on('close', (code) => {
  if (code !== 0) {
    console.error(`\nDiagnostic script exited with code ${code}`);
    console.error('Please check the error messages above for more information.');
  } else {
    console.log('\n=== Diagnostic Complete ===');
    console.log('For more information about the enhanced logging and diagnostic tools,');
    console.log('please refer to the nft-approval-enhanced-logging-guide.md file.');
  }
});

// Handle errors
diagnostic.on('error', (err) => {
  console.error(`Error running diagnostic script: ${err.message}`);
  process.exit(1);
});

// Handle SIGINT (Ctrl+C)
process.on('SIGINT', () => {
  console.log('\nDiagnostic interrupted by user.');
  diagnostic.kill('SIGINT');
  process.exit(1);
});
