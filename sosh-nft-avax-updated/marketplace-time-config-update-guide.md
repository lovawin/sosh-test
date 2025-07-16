# Marketplace Time Configuration Update Guide

This guide outlines the steps to update the marketplace time configuration to reduce the minimum time difference for NFT listings from 30 minutes to 1 minute.

## Background

The SoshMarketplace contract has several time-related configuration parameters that control the timing of NFT listings:

- `maxSaleDuration`: Maximum allowed duration for a sale (currently 20 days)
- `minSaleDuration`: Minimum allowed duration for a sale (currently 60 minutes)
- `minTimeDifference`: Minimum time in the future for a sale to start (currently 30 minutes)
- `extensionDuration`: Time extension for auctions when bids are placed near the end (currently 15 minutes)
- `minSaleUpdateDuration`: Minimum time before a sale starts that it can be updated (currently 1 day)

The current issue is that users are unable to create listings with start times less than 30 minutes in the future, which is causing transaction failures when attempting to list NFTs for sale.

## Solution

We've created a script to update the `minTimeDifference` parameter to 60 seconds (1 minute) while keeping all other time configuration parameters the same. This will allow users to create listings with start times as little as 1 minute in the future.

## Prerequisites

1. Access to an admin wallet with the necessary permissions to call the `adminUpdateTimeConfigs` function on the marketplace contract
2. Node.js and npm installed
3. Hardhat environment configured with the correct network settings
4. The admin wallet's private key for authentication

## Environment Setup

1. Create or update the `.env` file in the smart contract directory:

```bash
cd sosh-nft-avax-updated/sosh-smart-contract
```

2. Add the following environment variables to the `.env` file:

```
# Network configuration
INFURA_URL=https://api.avax-test.network/ext/bc/C/rpc

# Contract addresses
MARKETPLACE_PROXY_ADDRESS=0x25ad5b58a78c1cC1aF3C83607448D0D203158F06

# Admin account
ADMIN_PRIVATE_KEY=your_admin_private_key_here

# API keys
SNOWTRACE_API_KEY=your_snowtrace_api_key_here
```

3. Replace `your_admin_private_key_here` with the actual private key of the admin wallet that has permission to update the marketplace configuration.

> **IMPORTANT**: Keep your private key secure and never commit it to version control.

## Deployment Steps

### Step 1: Verify Implementation Contracts (Optional but Recommended)

Before updating the marketplace configuration, it's helpful to verify the implementation contracts on Snowtrace to better understand the contract functions:

1. Navigate to the smart contract directory:

```bash
cd sosh-nft-avax-updated/sosh-smart-contract
```

2. Run the implementation verification script:

```bash
npx hardhat run scripts/verify-implementations.js --network fuji
```

This script will:
- Verify the NFT implementation contract at `0xb86C57E455F714a5F456CaF0AFBf6da1161dB69e`
- Verify the Marketplace implementation contract at `0x4d7BbCf22d663d69E02fc88d65dbA73D1bB9e711`
- Provide links to view the verified contracts on Snowtrace

After verification, you can view the full contract code and ABI on Snowtrace, which helps understand the available functions and their parameters.

### Step 2: Update Marketplace Time Configuration

1. Ensure your `.env` file is properly configured as described in the Environment Setup section.

2. Run the update script:

```bash
npx hardhat run scripts/update-marketplace-time-config.js --network mainnet
```

4. Verify the output to confirm that the `minTimeDifference` has been successfully updated to 60 seconds.

## Expected Output

The script will display:

1. The current time configuration values
2. The transaction hash for the update
3. The updated `minTimeDifference` value after the transaction is confirmed

Example output:
```
Starting marketplace time configuration update...
Using admin account: 0xYourAdminAddress

Current time configuration:
- maxSaleDuration: 1728000 seconds (20 days)
- minSaleDuration: 3600 seconds (60 minutes)
- minTimeDifference: 1800 seconds (30 minutes)
- extensionDuration: 900 seconds (15 minutes)
- minSaleUpdateDuration: 86400 seconds (1 days)

Updating minTimeDifference to 60 seconds (1 minute)...
Transaction hash: 0xYourTransactionHash
Waiting for transaction confirmation...

Updated time configuration:
- minTimeDifference: 60 seconds (1 minutes)

Marketplace time configuration updated successfully!
```

## Production Deployment

To deploy this change to the production environment:

1. Copy the script to the production server:

```bash
scp -i "../taurien" sosh-nft-avax-updated/sosh-smart-contract/scripts/update-marketplace-time-config.js taurien@3.216.178.231:smart-contract-update/scripts/
```

2. SSH into the production server:

```bash
ssh -i "../taurien" taurien@3.216.178.231
```

3. Navigate to the smart contract directory and run the script:

```bash
cd smart-contract-update
npx hardhat run scripts/update-marketplace-time-config.js --network mainnet
```

## Verification

After deploying the change, verify that users can now create listings with start times as little as 1 minute in the future:

1. Log into the application
2. Navigate to your profile page
3. Select an NFT to list for sale
4. Set the sale parameters with a start time 1-2 minutes in the future
5. Confirm that the transaction completes successfully

## Rollback Plan

If any issues are encountered, the time configuration can be restored to its original values by running the script with the original `minTimeDifference` value of 1800 seconds (30 minutes).
