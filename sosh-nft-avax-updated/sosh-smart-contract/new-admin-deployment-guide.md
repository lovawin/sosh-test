# Sosh NFT Contract Redeployment Guide

This guide provides step-by-step instructions for redeploying the Sosh NFT contracts with a new admin wallet.

## Prerequisites

1. Node.js and npm installed
2. Hardhat environment set up
3. Access to the private key for deployment
4. AVAX tokens for gas fees
5. New admin wallet address: `0xDBca3Ea7E2A3aE047d1775954226B71Ad60179C2`

## Deployment Steps

### 1. Prepare Environment

1. Make sure your `.env` file is properly configured with the deployer's private key:

```
DEPLOYER_PRIVATE_KEY=your_private_key_here
```

2. Ensure you have enough AVAX in the deployer wallet for gas fees.

### 2. Deploy Treasury Contract

1. Run the Treasury deployment script:

```bash
npx hardhat run scripts/deploy-treasury-new-admin.js --network avaxTest
```

2. Note the deployed Treasury contract address from the console output.

3. Set the Treasury address as an environment variable for subsequent deployments:

```bash
export NEW_TREASURY_ADDRESS=<treasury_contract_address>
```

### 3. Deploy NFT Contract

1. Run the NFT deployment script:

```bash
npx hardhat run scripts/deploy-nft-new-admin.js --network avaxTest
```

2. Note the deployed NFT contract address from the console output.

3. Set the NFT address as an environment variable for subsequent deployments:

```bash
export NEW_NFT_ADDRESS=<nft_contract_address>
```

### 4. Deploy Marketplace Contract

1. Run the Marketplace deployment script:

```bash
npx hardhat run scripts/deploy-marketplace-new-admin.js --network avaxTest
```

2. Note the deployed Marketplace contract address from the console output.

### 5. Update Frontend Configuration

1. Update the NFT contract address in `frontend/src/common/config721.js`:

```javascript
export const CUSTOM_TOKEN_ADDRESS_721 = "<new_nft_contract_address>";
```

2. Update the Marketplace contract address in `frontend/src/common/config721MarketPlace.js`:

```javascript
export const CUSTOM_TOKEN_ADDRESS_721_MARKET_PLACE = "<new_marketplace_contract_address>";
```

### 6. Update Backend Configuration

1. Update the contract addresses in `sosh_nft_Backend/config/prod/dev.env`:

```
TreasuryAddress=<new_treasury_contract_address>
adminAddress=0xDBca3Ea7E2A3aE047d1775954226B71Ad60179C2
MARKETPLACE_PROXY_ADDRESS=<new_marketplace_contract_address>
```

## Verification Steps

After deployment, perform the following verification steps:

### 1. Verify Admin Rights

1. Verify that the new admin wallet has admin rights in the Treasury contract:

```bash
npx hardhat run --network avaxTest scripts/verify-admin-rights.js
```

### 2. Test Basic Operations

1. Test minting an NFT with the new contracts:

```bash
npx hardhat run --network avaxTest scripts/test-mint-nft.js
```

2. Test creating a sale with the new contracts:

```bash
npx hardhat run --network avaxTest scripts/test-create-sale.js
```

### 3. Verify Frontend Integration

1. Start the frontend application and connect with the new admin wallet.
2. Attempt to mint an NFT and verify it works correctly.
3. Attempt to create a sale and verify it works correctly.

## Rollback Plan

If issues are encountered during or after deployment:

1. Keep a backup of all original contract addresses.
2. If needed, revert to the original contract addresses in the frontend and backend configurations.

## Contract Addresses Reference

### Original Contracts
- NFT: `0x4b94A3361031c3839DB0F22E202C138f1BCCBC13`
- Marketplace: `0x0640A2Fbed0a203AD72F975EE80BA650E1D13fbf`
- Treasury: `0x712D994C2D6eeDa2594abEa4074EC46027Af0145`
- Admin: `0x197f7f863A0BB86AB2a7D47e29C977c21F440e90`

### New Contracts
- NFT: `<new_nft_contract_address>`
- Marketplace: `<new_marketplace_contract_address>`
- Treasury: `<new_treasury_contract_address>`
- Admin: `0xDBca3Ea7E2A3aE047d1775954226B71Ad60179C2`
