# Marketplace Approval Fix

This document outlines the changes made to fix the NFT marketplace approval issue.

## Problem

When trying to list an NFT for sale on the marketplace, the "Approve Marketplace" step was failing with the following error:

```
Transaction has been reverted by the EVM:
{
  "blockHash": "0x89780093699ea144a0cd8f824025ae5afe1a909d0bb14ea01cc91f55ccad22c1",
  "blockNumber": 39459478,
  "contractAddress": null,
  "cumulativeGasUsed": 31669,
  "effectiveGasPrice": 2500000001,
  "from": "0x7411e7942f4c8271d4e636429f374997fdaede17",
  "gasUsed": 31669,
   - `update-nft-with-marketplace.js`: Script to update the NFT contract with the marketplace address using the admin wallet
   - `verify-contracts.js`: Script to verify the contracts on Snowtrace

## Remaining Steps

The final step is to update the NFT contract with the marketplace address. This can be done in one of two ways:

### Option 1: Using the Update Script (Recommended when network is stable)

1. Set the admin wallet's private key as an environment variable:
   ```powershell
   $env:ADMIN_PRIVATE_KEY = "7dd6156bd42710512863a2b374c6b3e01d24307df8674bc37c229c4e4496e653"
   ```

2. Run the update script:
   ```bash
   cd sosh-nft-avax-updated/sosh-smart-contract
   npx hardhat run scripts/update-nft-with-marketplace.js --network fuji
   ```

### Option 2: Manual Update via Snowtrace

1. Go to the NFT contract on Snowtrace: [0x7CA1eA6d19A1df7d17fEaF0eA9a1dEFA0e37f894](https://testnet.snowtrace.io/address/0x7CA1eA6d19A1df7d17fEaF0eA9a1dEFA0e37f894)

2. If the contract is not verified, verify it first:
   ```bash
   cd sosh-nft-avax-updated/sosh-smart-contract
   npx hardhat verify --network fuji 0x7CA1eA6d19A1df7d17fEaF0eA9a1dEFA0e37f894
   ```

3. Connect your admin wallet (0xDBca3Ea7E2A3aE047d1775954226B71Ad60179C2) to Snowtrace

4. Navigate to the 'Write Contract' tab

5. Find the 'adminUpdateSoshMarket' function

6. Enter the marketplace address (0x25ad5b58a78c1cC1aF3C83607448D0D203158F06) as the parameter

7. Click 'Write' to execute the transaction

## Testing the Implementation

After updating the NFT contract with the marketplace address, you should test the implementation:

1. Try to approve a non-marketplace address for an NFT - this should fail
2. Try to approve the marketplace address for an NFT - this should succeed
3. Try to transfer an NFT directly - this should succeed
4. Try to list an NFT for sale on the marketplace - this should succeed

## Troubleshooting

If you encounter connection issues with the Avalanche Fuji testnet:

1. Try using a different RPC endpoint in the hardhat.config.js file
2. Check the status of the Avalanche Fuji testnet
3. Try again later when the network is more stable

## Implementation Details

The key changes to the SoshNFT contract are:

1. Added a `marketplaceRestricted` flag to enable/disable the marketplace restriction feature
2. Modified the `approve` function to only allow approvals to the marketplace contract when the restriction is enabled
3. Modified the `setApprovalForAll` function to only allow approvals to the marketplace contract when the restriction is enabled
4. Added an `adminToggleMarketplaceRestriction` function to allow the admin to toggle the restriction

These changes ensure that NFTs can only be listed on the Sosh marketplace while still allowing peer-to-peer transfers and transfers from multi-signature wallets.
