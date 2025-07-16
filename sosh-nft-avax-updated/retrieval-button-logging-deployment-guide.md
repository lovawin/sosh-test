# Retrieval Button Enhanced Logging Deployment Guide

This guide outlines the steps to deploy the enhanced logging for the NFT retrieval button functionality.

## Overview of Changes

1. **Enhanced Frontend Logging**:
   - Added detailed time information to debug the `isExpired` condition
   - Added enhanced address comparison to debug the `isUserSeller` condition
   - Added URL parameters to debug the `isLoggedInProfile` condition
   - Added component rendering information

2. **Diagnostic Script**:
   - Created a specialized script (`check-retrieval-button-logs.js`) to analyze logs related to the retrieval button visibility

## Deployment Steps

### 1. Backup Current Files

Before deploying, create backups of the files that will be modified:

```bash
# Create backups directory if it doesn't exist
mkdir -p backups/frontend

# Backup the frontend files
cp sosh-nft-avax-updated/frontend/src/components/myProfileComponents/postCards/postCard.js backups/frontend/postCard.js.$(date +%Y-%m-%d-%H%M%S)
```

### 2. Deploy Frontend Changes

Copy the updated `postCard.js` file to the frontend source directory on the production server:

```bash
# Copy the updated file to the production server
scp -i /path/to/ssh/key sosh-nft-avax-updated/frontend/src/components/myProfileComponents/postCards/postCard.js user@production-server:/path/to/frontend/src/components/myProfileComponents/postCards/
```

### 3. Rebuild and Restart Frontend

Rebuild the frontend application and restart the container:

```bash
# Navigate to the frontend directory
cd /path/to/frontend

# Install dependencies (if needed)
npm install

# Build the frontend
npm run build

# Restart the frontend container
cd /path/to/docker-compose
docker-compose down frontend
docker-compose up -d frontend
```

### 4. Deploy Diagnostic Script

Copy the diagnostic script to the server:

```bash
# Copy the diagnostic script to the server
scp -i /path/to/ssh/key sosh-nft-avax-updated/check-retrieval-button-logs.js user@production-server:/path/to/scripts/
```

### 5. Verify Deployment

1. **Check Frontend Logs**:
   ```bash
   # Check frontend container logs
   docker logs frontend
   ```

2. **Test Retrieval Button Functionality**:
   - Navigate to a user's profile page with expired NFTs
   - Verify the retrieval button appears correctly
   - Check the browser console for the enhanced logging messages

3. **Run Diagnostic Script**:
   ```bash
   # Run the diagnostic script for a specific token
   node /path/to/scripts/check-retrieval-button-logs.js --token=12 --verbose
   ```

## Rollback Procedure

If issues are encountered, restore the backed-up files:

```bash
# Restore the frontend file
cp backups/frontend/postCard.js.[timestamp] sosh-nft-avax-updated/frontend/src/components/myProfileComponents/postCards/postCard.js

# Rebuild and restart frontend
cd /path/to/frontend
npm run build
cd /path/to/docker-compose
docker-compose down frontend
docker-compose up -d frontend
```

## Monitoring

After deployment, monitor the following:

1. **Frontend Logs**: Check for any errors or warnings in the frontend logs
2. **MongoDB Logs**: Monitor the marketplace logs collection for the enhanced logging data
3. **User Feedback**: Collect feedback from users about the retrieval button functionality

## Troubleshooting

If the retrieval button is still not appearing correctly:

1. Run the diagnostic script to analyze the logs:
   ```bash
   node check-retrieval-button-logs.js --token=[token_id] --verbose
   ```

2. Check the browser console for any errors or warnings

3. Verify the three conditions for the button to appear:
   - `isLoggedInProfile`: User is viewing their own profile page (URL includes `?owner=true`)
   - `isExpired`: The sale's end time has passed
   - `isUserSeller`: The user's wallet address matches the seller address
