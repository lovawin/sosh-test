# Marketplace UI Update Fix - Deployment Guide

This guide outlines the steps to deploy the fix for the marketplace UI update issue, where the UI wasn't refreshing after a successful NFT listing.

## Overview

The fix involves updating the `ModalForSellNFT.jsx` file to add a page reload after a successful listing transaction, along with enhanced logging to track the UI update process.

## Prerequisites

- SSH access to the production server
- Access to the frontend repository
- Docker installed on the production server

## Deployment Steps

### 1. Backup Current Files

Before making any changes, create a backup of the current files:

```bash
# Create a backup directory if it doesn't exist
mkdir -p backups/frontend

# Backup the ModalForSellNFT.jsx file
cp frontend/src/components/ModalForSellNFT/ModalForSellNFT.jsx backups/frontend/ModalForSellNFT.jsx.$(date +%Y-%m-%d-%H%M%S)
```

### 2. Update the Frontend Code

Update the `ModalForSellNFT.jsx` file with the changes outlined in the fix:

```bash
# Apply the changes to ModalForSellNFT.jsx
# (This can be done manually or through a deployment script)
```

### 3. Build the Frontend

Build the frontend with the updated code:

```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies (if needed)
npm install

# Build the frontend
npm run build

# Create a tar archive of the build directory
tar -cf build.tar build/
```

### 4. Deploy to Production

Transfer the build files to the production server and restart the frontend container:

```bash
# Transfer the build files to the production server
scp -i "/path/to/ssh/key" build.tar username@production-server:~/frontend-update/

# SSH into the production server
ssh -i "/path/to/ssh/key" username@production-server

# Extract the build files
cd ~/frontend-update
tar -xf build.tar

# Restart the frontend container
sudo docker restart frontend-container-name
```

### 5. Verify the Deployment

After deploying the changes, verify that the fix is working correctly:

1. Navigate to the NFT profile page
2. Click "List / Sell" on an NFT
3. Complete the listing process
4. Verify that the page automatically refreshes and shows the NFT as listed for sale

### 6. Monitor Logs

Monitor the marketplace logs to ensure that the UI update is being triggered correctly:

```bash
# SSH into the production server
ssh -i "/path/to/ssh/key" username@production-server

# Check the marketplace logs for UI_UPDATE_ATTEMPT events
# (This will depend on your logging setup)
```

Look for log entries with the type `UI_UPDATE_ATTEMPT` to confirm that the UI update is being triggered after successful listing transactions.

## Rollback Plan

If issues are encountered after deployment, you can roll back to the previous version:

```bash
# SSH into the production server
ssh -i "/path/to/ssh/key" username@production-server

# Restore the backup files
cp backups/frontend/ModalForSellNFT.jsx.TIMESTAMP frontend/src/components/ModalForSellNFT/ModalForSellNFT.jsx

# Rebuild and redeploy the frontend
# (Follow steps 3 and 4 above)
```

## Additional Notes

- The enhanced logging will generate events with the type `UI_UPDATE_ATTEMPT` in the marketplace logs
- These logs can be used to monitor the UI update process and identify any issues
- The fix is designed to be minimally invasive, only affecting the UI update after a successful listing transaction
