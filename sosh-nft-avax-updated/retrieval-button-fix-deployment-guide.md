# NFT Retrieval Button Fix - Deployment Guide

This guide provides step-by-step instructions for deploying the fix for the NFT retrieval button issue.

## Prerequisites

- SSH access to the production server
- SSH key file (`../taurien`)
- Node.js and npm installed locally
- Access to the frontend and backend repositories

## Pre-Deployment Testing

Before deploying to production, it's important to test the changes locally:

1. Run the test script:
   ```bash
   node test-retrieval-button-fix.js
   ```

2. Verify that all tests pass. If any tests fail, review the issues before proceeding with deployment.

## Deployment Steps

### 1. Backup Current Files

Before making any changes, create backups of the files you're going to modify:

```bash
# Create backups directory if it doesn't exist
mkdir -p backups/frontend
mkdir -p backups/backend

# Backup frontend file
cp frontend/src/common/helpers/nftMarketPlaceFunctions.js backups/frontend/nftMarketPlaceFunctions.js.$(date +%Y-%m-%d-%H%M%S)

# Backup backend file
cp sosh_nft_Backend/app/routes/marketplace.js backups/backend/marketplace.js.$(date +%Y-%m-%d-%H%M%S)
```

### 2. Automated Deployment

Run the deployment script to automatically deploy the changes:

```bash
node deploy-retrieval-button-fix.js
```

This script will:
- Create a frontend build
- Create a tar build file
- Copy the tar build file to the frontend server
- Extract the tar file on the server
- Copy the updated backend file to the backend server
- Restart both the frontend and backend servers

### 3. Manual Deployment (if automated deployment fails)

If the automated deployment fails, you can follow these manual steps:

#### Frontend Deployment

1. Build the frontend:
   ```bash
   cd frontend
   npm run build
   ```

2. Create a tar file of the build:
   ```bash
   tar -czf build.tar.gz -C build .
   ```

3. Copy the tar file to the server:
   ```bash
   scp -i "../taurien" build.tar.gz taurien@3.216.178.231:frontend-update/build.tar.gz
   ```

4. Extract the tar file on the server:
   ```bash
   ssh -i "../taurien" taurien@3.216.178.231 "tar -xzf frontend-update/build.tar.gz -C frontend-update/build"
   ```

5. Restart the frontend server:
   ```bash
   ssh -i "../taurien" taurien@3.216.178.231 "sudo docker restart frontend-update-sosh-nft-fe-1"
   ```

#### Backend Deployment

1. Copy the updated backend file to the server:
   ```bash
   scp -i "../taurien" sosh_nft_Backend/app/routes/marketplace.js taurien@3.216.178.231:backend-update/app/routes/marketplace.js
   ```

2. Restart the backend server:
   ```bash
   ssh -i "../taurien" taurien@3.216.178.231 "sudo docker restart sosh-backend-app"
   ```

## Post-Deployment Verification

After deploying the changes, verify that the fix is working correctly:

1. Go to https://www.soshnft.io/my-profile?owner=true
2. Look for NFTs that are owned by the marketplace contract and have expired listings
3. Verify that the "Retrieve" button appears for these NFTs
4. Test the retrieval functionality by clicking the button

## Rollback Procedure (if needed)

If issues are encountered after deployment, you can roll back to the previous version:

1. Restore the frontend file:
   ```bash
   # Find the latest backup
   LATEST_FRONTEND_BACKUP=$(ls -t backups/frontend/nftMarketPlaceFunctions.js.* | head -1)
   
   # Restore the file
   cp $LATEST_FRONTEND_BACKUP frontend/src/common/helpers/nftMarketPlaceFunctions.js
   ```

2. Restore the backend file:
   ```bash
   # Find the latest backup
   LATEST_BACKEND_BACKUP=$(ls -t backups/backend/marketplace.js.* | head -1)
   
   # Restore the file
   cp $LATEST_BACKEND_BACKUP sosh_nft_Backend/app/routes/marketplace.js
   ```

3. Redeploy using the steps in the "Manual Deployment" section above.

## Troubleshooting

If you encounter issues during or after deployment:

1. Check the logs on the server:
   ```bash
   ssh -i "../taurien" taurien@3.216.178.231 "docker logs frontend-update-sosh-nft-fe-1 --tail 100"
   ssh -i "../taurien" taurien@3.216.178.231 "docker logs sosh-backend-app --tail 100"
   ```

2. Check the MongoDB logs for any errors:
   ```bash
   ssh -i "../taurien" taurien@3.216.178.231 "docker logs sosh_mongo_db --tail 100"
   ```

3. Verify that the contract addresses are correct:
   - NFT Contract: 0x7CA1eA6d19A1df7d17fEaF0eA9a1dEFA0e37f894
   - Marketplace Contract: 0x25ad5b58a78c1cC1aF3C83607448D0D203158F06

4. Check the browser console for any JavaScript errors.

## Support

If you need assistance with the deployment, contact the development team.
