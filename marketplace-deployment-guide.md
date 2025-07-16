s# NFT Marketplace Deployment Guide

This guide provides step-by-step instructions for deploying the NFT marketplace fixes and improvements.

## Overview

The deployment consists of three main parts:

1. **Contract Upgrade**: Deploy the updated SoshMarketplace contract with the new cleanupExpiredSales function.
2. **Backend Updates**: Deploy the updated backend files with improved logging and error handling.
3. **Cleanup Service**: Deploy the marketplace cleanup service that periodically cleans up expired sales.

## Prerequisites

- SSH access to the production server
- Private key for the contract upgrade
- Service account with ETH for gas fees
- Node.js and npm installed

## 1. Contract Upgrade on Avalanche Fuji Testnet

### 1.1. Set Environment Variables

The environment variables are already set in the `sosh_nft_Backend/config/prod/dev.env` file:

```
MARKETPLACE_PROXY_ADDRESS=0x4b94a3361031c3839db0f22e202c138f1bccbc13
DEPLOYER_PRIVATE_KEY=49c5135659bd54f24a31c12aea9c6a86306b718060ed6f245ca7c11cbd8de6c2
SNOWTRACE_API_KEY= # Optional, for contract verification
```

These variables will be used by the hardhat scripts to deploy to the Avalanche Fuji testnet.

### 1.2. Configure Hardhat for Fuji Testnet

Make sure your `hardhat.config.js` file is configured for the Avalanche Fuji testnet:

```javascript
module.exports = {
  networks: {
    fuji: {
      url: "https://api.avax-test.network/ext/bc/C/rpc",
      chainId: 43113,
      accounts: [process.env.PRIVATE_KEY],
      gasPrice: 225000000000
    },
    // other networks...
  },
  // rest of config...
};
```

### 1.3. Backup the Current Implementation

Before upgrading, it's important to backup the current implementation address in case you need to rollback:

```bash
cd sosh-nft-avax-updated/sosh-smart-contract
npx hardhat run scripts/backup-implementation.js --network fuji
```

This will create a backup file in the `backups/contracts` directory with the current implementation address.

### 1.4. Run the Upgrade Script

```bash
cd sosh-nft-avax-updated/sosh-smart-contract
npx hardhat run scripts/upgrade-marketplace.js --network fuji
```

Note: The upgrade script will automatically run the backup script before upgrading, but it's recommended to run it separately first to ensure you have a backup.

### 1.5. Verify the Upgrade

Check that the upgrade was successful by verifying that the cleanupExpiredSales function exists:

```bash
npx hardhat verify-upgrade --network fuji
```

You can also verify the contract on the Fuji testnet explorer:

```bash
npx hardhat verify --network fuji <NEW_IMPLEMENTATION_ADDRESS>
```

## 2. Backend Updates

### 2.1. Deploy Backend Files

Use the following commands to deploy the updated backend files:

```bash
# SSH key path
SSH_KEY="../taurien"
REMOTE_USER="taurien"
REMOTE_HOST="3.216.178.231"
REMOTE_DIR="backend-update"

# Create remote directory if it doesn't exist
ssh -i "$SSH_KEY" $REMOTE_USER@$REMOTE_HOST "mkdir -p $REMOTE_DIR/app/logging/handlers $REMOTE_DIR/app/routes"

# Copy updated files
scp -i "$SSH_KEY" sosh-nft-avax-updated/sosh_nft_Backend/app/logging/handlers/marketplaceLogger.js $REMOTE_USER@$REMOTE_HOST:$REMOTE_DIR/app/logging/handlers/
scp -i "$SSH_KEY" sosh-nft-avax-updated/sosh_nft_Backend/app/routes/marketplace.logging.js $REMOTE_USER@$REMOTE_HOST:$REMOTE_DIR/app/routes/
```

### 2.2. Restart Backend Service

SSH into the server and restart the backend service:

```bash
ssh -i "$SSH_KEY" $REMOTE_USER@$REMOTE_HOST

# Navigate to the backend directory
cd backend

# Copy updated files from the update directory
cp -r ../backend-update/app/logging/handlers/marketplaceLogger.js app/logging/handlers/
cp -r ../backend-update/app/routes/marketplace.logging.js app/routes/

# Restart the backend service
docker-compose restart backend
```

## 3. Cleanup Service Deployment

### 3.1. Run the Deployment Script

```bash
cd sosh-nft-avax-updated/sosh_nft_Backend
node deploy-marketplace-cleanup.js
```

Follow the prompts to enter the marketplace contract address and service account private key.

### 3.2. Test the Cleanup Service

SSH into the server and test the cleanup service:

```bash
ssh -i "$SSH_KEY" $REMOTE_USER@$REMOTE_HOST

# Navigate to the cleanup service directory
cd marketplace-cleanup

# Run the test script
node test-marketplace-cleanup.js
```

### 3.3. Monitor the Cleanup Service

Check the logs to ensure the cleanup service is running correctly:

```bash
ssh -i "$SSH_KEY" $REMOTE_USER@$REMOTE_HOST

# Navigate to the cleanup service directory
cd marketplace-cleanup

# View the logs
cat cleanup.log
```

## 4. Verification

### 4.1. Test the Approval Process

Run the diagnostic script to test the NFT approval process:

```bash
node test-marketplace-approval.js 12 0x7411e7942f4c8271d4e636429f374997fdaede17
```

### 4.2. Check Logs

Check the marketplace logs to ensure everything is working correctly:

```bash
node sosh_nft_Backend/check-marketplace-logs.js
```

### 4.3. Manual Testing

1. Log in to the marketplace with a wallet that owns NFTs
2. Navigate to the profile page
3. Attempt to list an NFT for sale
4. Observe if the "Approve Marketplace" button appears appropriately
5. Complete the approval process if needed
6. Verify the NFT can be listed for sale

## 5. Rollback Procedure

If issues are encountered, use the restore script:

```bash
node restore-marketplace-files.js
```

Follow the prompts to select which backup files to restore.

For the contract upgrade, you'll need to deploy the previous implementation:

```bash
cd sosh-nft-avax-updated/sosh-smart-contract
npx hardhat run scripts/rollback-marketplace.js --network fuji
```

Note: If you deployed to mainnet, use `--network mainnet` instead.

## 6. Troubleshooting

### 6.1. Contract Upgrade Issues

- Check that the MARKETPLACE_PROXY_ADDRESS is correct
- Ensure the private key has enough ETH for gas fees
- Verify that the contract compiles correctly

### 6.2. Backend Issues

- Check the backend logs for errors
- Verify that the files were copied correctly
- Restart the backend service if needed

### 6.3. Cleanup Service Issues

- Check the cleanup.log file for errors
- Verify that the service has the correct environment variables
- Ensure the service account has enough ETH for gas fees
