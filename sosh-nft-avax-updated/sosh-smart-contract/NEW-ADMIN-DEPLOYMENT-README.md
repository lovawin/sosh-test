# Sosh NFT Contract Redeployment with New Admin Wallet

This README provides comprehensive instructions for redeploying the Sosh NFT contracts with a new admin wallet address.

## Overview

The Sosh NFT platform consists of three main smart contracts:

1. **SoshTreasury**: Central authority for admin rights management
2. **SoshNFT**: ERC-721 NFT contract for minting and managing NFTs
3. **SoshMarketplace**: Marketplace contract for buying, selling, and auctioning NFTs

This redeployment process will deploy new versions of these contracts with a new admin wallet address (`0xDBca3Ea7E2A3aE047d1775954226B71Ad60179C2`), ensuring that the new admin has full control over the platform.

## Prerequisites

Before starting the deployment process, ensure you have:

1. Node.js and npm installed
2. Hardhat environment set up
3. Access to the private key for deployment (in `.env` file)
4. Sufficient AVAX tokens for gas fees
5. The new admin wallet address: `0xDBca3Ea7E2A3aE047d1775954226B71Ad60179C2`

## Deployment Scripts

The following scripts have been created to facilitate the deployment process:

### Individual Deployment Scripts

1. **deploy-treasury-new-admin.js**: Deploys the SoshTreasury contract with the new admin wallet
2. **deploy-nft-new-admin.js**: Deploys the SoshNFT contract pointing to the new Treasury
3. **deploy-marketplace-new-admin.js**: Deploys the SoshMarketplace contract pointing to the new Treasury and NFT

### Configuration Update Scripts

4. **update-frontend-config.js**: Updates the frontend configuration files with the new contract addresses
5. **update-backend-config.js**: Updates the backend configuration with the new contract addresses

### Testing Scripts

6. **verify-admin-rights.js**: Verifies that the new admin wallet has the necessary permissions
7. **test-mint-nft.js**: Tests minting an NFT with the new contracts
8. **test-create-sale.js**: Tests creating a sale with the new contracts

### All-in-One Deployment Script

9. **deploy-all-new-admin.js**: Comprehensive script that runs all deployment steps in sequence

## Deployment Process

### Option 1: All-in-One Deployment

For a streamlined deployment process, use the all-in-one script:

```bash
npx hardhat run scripts/deploy-all-new-admin.js --network avaxTest
```

This script will:
- Deploy the Treasury contract with the new admin wallet
- Deploy the NFT contract pointing to the new Treasury
- Deploy the Marketplace contract pointing to the new Treasury and NFT
- Update the NFT contract with the Marketplace address
- Save the deployed addresses to a `.env.deployed` file
- Verify that the admin rights are properly set

After running this script, you'll need to update the frontend and backend configurations:

```bash
npx hardhat run scripts/update-frontend-config.js --network avaxTest
npx hardhat run scripts/update-backend-config.js --network avaxTest
```

### Option 2: Step-by-Step Deployment

For more control over the deployment process, you can run the scripts individually:

1. Deploy the Treasury contract:
```bash
npx hardhat run scripts/deploy-treasury-new-admin.js --network avaxTest
```

2. Set the Treasury address as an environment variable:
```bash
export NEW_TREASURY_ADDRESS=<treasury_contract_address>
```

3. Deploy the NFT contract:
```bash
npx hardhat run scripts/deploy-nft-new-admin.js --network avaxTest
```

4. Set the NFT address as an environment variable:
```bash
export NEW_NFT_ADDRESS=<nft_contract_address>
```

5. Deploy the Marketplace contract:
```bash
npx hardhat run scripts/deploy-marketplace-new-admin.js --network avaxTest
```

6. Set the Marketplace address as an environment variable:
```bash
export NEW_MARKETPLACE_ADDRESS=<marketplace_contract_address>
```

7. Update the frontend configuration:
```bash
npx hardhat run scripts/update-frontend-config.js --network avaxTest
```

8. Update the backend configuration:
```bash
npx hardhat run scripts/update-backend-config.js --network avaxTest
```

## Testing the Deployment

After deploying the contracts, it's important to verify that everything is working correctly:

1. Verify admin rights:
```bash
npx hardhat run scripts/verify-admin-rights.js --network avaxTest
```

2. Test minting an NFT:
```bash
npx hardhat run scripts/test-mint-nft.js --network avaxTest
```

3. Test creating a sale:
```bash
npx hardhat run scripts/test-create-sale.js --network avaxTest
```

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

## Troubleshooting

### Common Issues

1. **Insufficient Gas**: Ensure the deployer account has enough AVAX for gas fees.
2. **Contract Verification Failure**: If contract verification fails, check that the contract source code matches the deployed bytecode.
3. **Admin Rights Issues**: If the new admin doesn't have the necessary permissions, check the Treasury contract deployment.

### Logs and Debugging

All deployment scripts include detailed logging to help diagnose issues. Check the console output for error messages and transaction details.

## Security Considerations

1. **Private Keys**: Never commit private keys to version control. Use environment variables or a secrets manager.
2. **Admin Transition**: Plan for a smooth transition period where both old and new admin addresses might need to coexist.
3. **Testing**: Thoroughly test all admin functions with the new admin wallet before full deployment.

## Support

If you encounter any issues during the deployment process, please contact the development team for assistance.
