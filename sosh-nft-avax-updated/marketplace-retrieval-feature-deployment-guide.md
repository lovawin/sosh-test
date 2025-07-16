# NFT Retrieval Feature Deployment Guide

This guide outlines the steps to deploy the NFT Retrieval feature to production. This feature allows users to reclaim their NFTs from expired listings on the marketplace.

## Overview

The deployment involves updating the `postCard.js` component to add a "Retrieve" button for expired listings, which calls the `retrieveBid` function from `nftMarketPlaceFunctions.js`.

## Prerequisites

- SSH access to the production server
- Access to the frontend repository
- Docker installed on the production server

## Deployment Steps

### 1. Backup Current Files

Before making any changes, create a backup of the current files:

```bash
# Run the backup script
node backup-marketplace-files.js
```

This will create backups of:
- `frontend/src/components/myProfileComponents/postCards/postCard.js`

### 2. Create Deployment Script

Create a deployment script named `deploy-marketplace-retrieval-feature.js` based on the existing deployment script:

```javascript
/**
 * Marketplace Retrieval Feature Deployment Script
 * 
 * This script automates the deployment of the NFT retrieval feature.
 * It builds the frontend with the updated code and deploys it to the production server.
 * 
 * Usage:
 * node deploy-marketplace-retrieval-feature.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Configuration
const config = {
  frontendDir: path.join(__dirname, 'frontend'),
  sshKeyPath: '../taurien', // Update this with the correct path to your SSH key
  remoteUser: 'taurien', // Update this with your remote username
  remoteHost: '3.216.178.231', // Update this with your remote host
  remoteDir: '~/frontend-update',
  containerName: 'frontend-update-sosh-nft-fe-1' // Update this with your frontend container name
};

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

/**
 * Execute a command and return the output
 * @param {string} command - Command to execute
 * @param {boolean} silent - Whether to suppress console output
 * @returns {string} - Command output
 */
function exec(command, silent = false) {
  try {
    if (!silent) {
      console.log(`Executing: ${command}`);
    }
    return execSync(command, { encoding: 'utf8' });
  } catch (error) {
    console.error(`Error executing command: ${command}`);
    console.error(error.message);
    process.exit(1);
  }
}

/**
 * Create a backup of the postCard.js file
 */
function backupFiles() {
  console.log('\n--- Creating backups ---');
  
  const backupDir = path.join(__dirname, 'backups', 'frontend');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  
  // Create backup directory if it doesn't exist
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
    console.log(`Created backup directory: ${backupDir}`);
  }
  
  // Backup postCard.js
  const sourceFile = path.join(config.frontendDir, 'src', 'components', 'myProfileComponents', 'postCards', 'postCard.js');
  const backupFile = path.join(backupDir, `postCard.js.${timestamp}`);
  
  fs.copyFileSync(sourceFile, backupFile);
  console.log(`Backed up ${sourceFile} to ${backupFile}`);
}

/**
 * Build the frontend
 */
function buildFrontend() {
  console.log('\n--- Building frontend ---');
  
  // Navigate to frontend directory
  process.chdir(config.frontendDir);
  
  // Install dependencies
  console.log('Installing dependencies...');
  exec('npm install');
  
  // Build frontend
  console.log('Building frontend...');
  exec('npm run build');
  
  // Create tar archive of build directory
  console.log('Creating tar archive of build directory...');
  exec('tar -cf build.tar build/');
  
  console.log('Frontend build completed successfully.');
}

/**
 * Deploy the frontend to the production server
 */
function deployFrontend() {
  console.log('\n--- Deploying frontend ---');
  
  // Navigate to frontend directory
  process.chdir(config.frontendDir);
  
  // Transfer build files to production server
  console.log('Transferring build files to production server...');
  exec(`scp -i "${config.sshKeyPath}" build.tar ${config.remoteUser}@${config.remoteHost}:${config.remoteDir}/`);
  
  // Extract build files and restart frontend container
  console.log('Extracting build files and restarting frontend container...');
  exec(`ssh -i "${config.sshKeyPath}" ${config.remoteUser}@${config.remoteHost} "cd ${config.remoteDir} && tar -xf build.tar && sudo docker restart ${config.containerName}"`);
  
  console.log('Frontend deployment completed successfully.');
}

/**
 * Main function
 */
async function main() {
  console.log('=== Marketplace Retrieval Feature Deployment ===');
  
  // Confirm deployment
  rl.question('Are you sure you want to deploy the marketplace retrieval feature? (y/n) ', (answer) => {
    if (answer.toLowerCase() !== 'y') {
      console.log('Deployment cancelled.');
      rl.close();
      return;
    }
    
    try {
      // Backup files
      backupFiles();
      
      // Build frontend
      buildFrontend();
      
      // Deploy frontend
      deployFrontend();
      
      console.log('\n=== Deployment completed successfully ===');
      console.log('Please verify the feature by testing the NFT retrieval process.');
      console.log('Monitor the marketplace logs for RETRIEVAL_ATTEMPT events to confirm the retrieval functionality is working correctly.');
    } catch (error) {
      console.error('\n=== Deployment failed ===');
      console.error(error.message);
    } finally {
      rl.close();
    }
  });
}

// Run main function
main();
```

### 3. Run the Deployment Script

Execute the deployment script to deploy the changes to production:

```bash
# Run the deployment script
node deploy-marketplace-retrieval-feature.js
```

The script will:
1. Create backups of the modified files
2. Build the frontend with the updated code
3. Deploy the build to the production server
4. Restart the frontend container

### 4. Verify the Deployment

After deploying the changes, verify that the feature is working correctly:

1. Navigate to the user's profile page
2. Look for NFTs with expired listings (these should show a "Retrieve" button)
3. Click the "Retrieve" button
4. Confirm the transaction in MetaMask
5. Verify that the NFT is returned to the user's wallet

### 5. Monitor Logs

Monitor the marketplace logs to ensure that the retrieval functionality is working correctly:

```bash
# SSH into the production server
ssh -i "../taurien" taurien@3.216.178.231

# Check the marketplace logs for RETRIEVAL_ATTEMPT events
# (This will depend on your logging setup)
```

Look for log entries with the type `RETRIEVAL_ATTEMPT` to confirm that the retrieval functionality is being triggered correctly.

## Rollback Plan

If issues are encountered after deployment, you can roll back to the previous version:

```bash
# Run the restore script
node restore-marketplace-files.js
```

Then redeploy the frontend:

```bash
# Navigate to the frontend directory
cd frontend

# Build the frontend
npm run build

# Create a tar archive of the build directory
tar -cf build.tar build/

# Transfer the build files to the production server
scp -i "../taurien" build.tar taurien@3.216.178.231:~/frontend-update/

# SSH into the production server
ssh -i "../taurien" taurien@3.216.178.231

# Extract the build files
cd ~/frontend-update
tar -xf build.tar

# Restart the frontend container
sudo docker restart frontend-update-sosh-nft-fe-1
```

## Testing Script

A test script is provided to verify the functionality in the production environment:

```bash
# Set your private key as an environment variable
export PRIVATE_KEY=your_private_key_here

# Run the test script
node test-retrieve-nft.js
```

This script will:
1. Find all expired listings for your address
2. Display them in a table
3. Allow you to test the retrieval process
4. Verify the NFT is returned to your wallet

## Troubleshooting

### Common Issues and Solutions

1. **"Retrieve" button not appearing for expired listings**
   - Check if the listing is actually expired (endTime < current time)
   - Verify the user is the original seller
   - Confirm the marketplace contract is the current owner of the NFT

2. **Transaction fails when retrieving NFT**
   - Check if the NFT is still in the marketplace contract
   - Verify the sale status is still "Open"
   - Check if the user has enough gas for the transaction

3. **NFT not appearing in wallet after successful transaction**
   - Verify the transaction was confirmed on the blockchain
   - Check if the NFT contract address is correctly configured
   - Refresh the wallet or try viewing the NFT on a block explorer
