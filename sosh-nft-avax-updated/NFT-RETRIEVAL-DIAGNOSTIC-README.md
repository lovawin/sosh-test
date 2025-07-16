# NFT Retrieval Feature Diagnostic Tools

This directory contains several diagnostic tools to help identify and fix issues with the NFT retrieval feature. The feature allows users to reclaim their NFTs from expired listings on the marketplace.

## Issue Description

When a user lists an NFT for sale, the NFT is transferred to the marketplace contract. If the listing expires without a sale, the user should be able to retrieve their NFT back to their wallet with a "Retrieve" button on the profile page. However, the "Retrieve" button is not appearing for expired listings.

## Diagnostic Tools

### 1. Browser Console Diagnostic Script

**File:** `nft-retrieval-diagnostic.js`

This script is designed to be run in the browser console while on the profile page. It checks various conditions that might be preventing the "Retrieve" button from appearing:

- Verifies if you're on the correct page
- Checks if you're logged in
- Examines the NFT cards on the page
- Looks for specific token IDs
- Checks if the marketplace contract owns the NFTs
- Verifies if the listings have expired
- Checks if the saleId is present in the data

**Usage:**
1. Navigate to https://www.soshnft.io/my-profile?owner=true
2. Open the browser console (F12 or right-click > Inspect > Console)
3. Copy and paste the entire content of `nft-retrieval-diagnostic.js` into the console
4. Press Enter to run the script

### 2. Server-Side Diagnostic Script

**File:** `server-retrieval-diagnostic.js`

This script checks the blockchain and database for NFT listings to diagnose issues with the NFT retrieval feature:

- Checks NFT ownership on the blockchain
- Verifies if the listings are in "Open" status
- Checks if the listings have expired
- Verifies if you are the original seller of the NFTs
- Examines the MongoDB database for listing information

**Usage:**
1. Set your wallet address in the `WALLET_ADDRESS` variable
2. Run with: `node server-retrieval-diagnostic.js`

### 3. Frontend Data Check Script

**File:** `check-frontend-data.js`

This script checks if the saleId is being passed to the frontend data for NFT listings:

- Queries the API endpoint that provides data for the profile page
- Checks if the saleId is included in the response
- Verifies if the endTime is present and if the listing has expired
- Examines other relevant fields in the data

**Usage:**
1. Set your wallet address in the `WALLET_ADDRESS` variable
2. Run with: `node check-frontend-data.js`
3. If prompted, provide your JWT token from the browser

### 4. Retrieval Test Script

**File:** `run-retrieval-test.js`

This script runs the `test-retrieve-nft.js` script with your wallet address to check if the NFTs are eligible for retrieval:

- Finds all expired listings for your address
- Displays them in a table
- Allows you to test the retrieval process
- Verifies if the NFT is returned to your wallet

**Usage:**
1. Run with: `PRIVATE_KEY=your_private_key_here node run-retrieval-test.js`

## Common Issues and Solutions

### 1. Missing saleId in the Data

The most common issue is that the saleId is not being passed to the frontend data. The "Retrieve" button only appears if both the endTime and saleId are present in the data.

**Solution:**
- Check if the saleId is present in the API response using `check-frontend-data.js`
- If missing, update the backend API to include the saleId in the response

### 2. Incorrect Expiration Detection

Another common issue is that the expiration detection is not working correctly. The "Retrieve" button only appears if the listing has expired (endTime < current time).

**Solution:**
- Check if the endTime is present and if the listing has expired using `check-frontend-data.js`
- Verify the expiration check in the frontend code

### 3. Improper Ownership Verification

The "Retrieve" button should only appear if you are the original seller of the NFT and the marketplace contract is the current owner.

**Solution:**
- Check NFT ownership on the blockchain using `server-retrieval-diagnostic.js`
- Verify if you are the original seller of the NFTs

### 4. Deployment Issues

If the frontend code was recently updated, the changes might not have been properly deployed to the production server.

**Solution:**
- Rebuild the frontend with: `cd sosh-nft-avax-updated/frontend && npm run build`
- Deploy the updated build to the production server

## Fix Implementation

Once you've identified the issue, you can use the `frontend-retrieval-fix.js` script to apply the fix:

```bash
node frontend-retrieval-fix.js
```

This script will:
1. Create backup files of the modified files
2. Update the PostCard component to better handle saleId and expiration detection
3. Update the retrieveBid function to better handle error cases
4. Rebuild the frontend and deploy the changes

## Testing the Fix

After applying the fix, you can test it by:

1. Running the browser console diagnostic script again
2. Checking if the "Retrieve" button appears for expired listings
3. Clicking the "Retrieve" button to see if the NFT is returned to your wallet

## Additional Resources

- [Marketplace Retrieval Feature README](./marketplace-retrieval-feature-README.md)
- [Marketplace Retrieval Feature Deployment Guide](./marketplace-retrieval-feature-deployment-guide.md)
- [Test Retrieve NFT Script](./test-retrieve-nft.js)
