# Marketplace Restriction Implementation

This document outlines the implementation of marketplace restrictions for the Sosh NFT platform, which ensures that NFTs can only be sold through the Sosh marketplace.

## Overview

We've modified the SoshNFT contract to add restrictions that prevent NFTs from being sold on external marketplaces. This is achieved by:

1. Adding a `marketplaceRestricted` flag to control whether restrictions are enabled
2. Overriding the standard ERC721 transfer functions to only allow transfers through the Sosh marketplace or by the token owner
3. Restricting approvals to only the Sosh marketplace contract

## Changes Made

### SoshNFT Contract

The following changes were made to the SoshNFT contract:

1. Added a `marketplaceRestricted` boolean flag (default: true)
2. Added an `adminToggleMarketplaceRestriction` function that allows admins to enable/disable the restriction
3. Overridden the following ERC721 functions to enforce the restriction:
   - `transferFrom`
   - `safeTransferFrom`
   - `approve`
   - `setApprovalForAll`

When the restriction is enabled:
- Only the marketplace contract or the token owner can transfer NFTs
- Only the marketplace contract can be approved to transfer NFTs

## Deployment Process

The deployment process involves two steps:

1. Deploy the updated SoshNFT contract
2. Deploy the Marketplace contract and update the NFT contract with the Marketplace address

### Step 1: Deploy the Updated SoshNFT Contract

```bash
npx hardhat run scripts/deploy-restricted-nft.js --network fuji
```

This script:
- Deploys the updated SoshNFT contract with marketplace restrictions
- Uses the existing Treasury contract
- Saves the deployed addresses to `.env.deployed`

### Step 2: Deploy the Marketplace Contract

```bash
npx hardhat run scripts/deploy-marketplace-only.js --network fuji
```

This script:
- Deploys the Marketplace contract
- Updates the NFT contract with the Marketplace address
- Verifies admin rights
- Saves the deployed addresses to `.env.deployed`

## Post-Deployment Steps

After deployment, you should:

1. Update the frontend configuration:
```bash
npx hardhat run scripts/update-frontend-config.js --network fuji
```

2. Update the backend configuration:
```bash
npx hardhat run scripts/update-backend-config.js --network fuji
```

3. Test the deployment:
```bash
npx hardhat run scripts/test-mint-nft.js --network fuji
npx hardhat run scripts/test-create-sale.js --network fuji
```

## Admin Controls

The marketplace restriction can be toggled on/off by an admin using the `adminToggleMarketplaceRestriction` function:

```solidity
// Enable marketplace restriction
nft.adminToggleMarketplaceRestriction(true);

// Disable marketplace restriction
nft.adminToggleMarketplaceRestriction(false);
```

This allows flexibility in case the restriction needs to be temporarily disabled for any reason.

## Security Considerations

1. Only admin accounts can toggle the marketplace restriction
2. The restriction still allows token owners to transfer their NFTs directly (person-to-person transfers)
3. The restriction prevents approvals to external marketplaces, which prevents NFTs from being listed on other platforms

## Troubleshooting

If you encounter issues with the marketplace restriction:

1. Verify that the marketplace address is correctly set in the NFT contract
2. Check if the marketplace restriction is enabled using `nft.marketplaceRestricted()`
3. Ensure that the account trying to transfer or approve has the appropriate permissions
