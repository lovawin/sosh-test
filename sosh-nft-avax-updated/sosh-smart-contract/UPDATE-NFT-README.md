# Updating NFT Contract with Marketplace Address

This README provides instructions on how to update the NFT contract with the marketplace address using the admin wallet.

## Background

The NFT contract has been successfully deployed to: `0x7CA1eA6d19A1df7d17fEaF0eA9a1dEFA0e37f894`
The Marketplace contract has been successfully deployed to: `0x25ad5b58a78c1cC1aF3C83607448D0D203158F06`

However, the NFT contract needs to be updated with the marketplace address to enable the marketplace restriction feature. This update can only be performed by an account with admin rights.

## Prerequisites

- The admin wallet's private key
- Node.js and npm installed

## Instructions

1. Set the admin wallet's private key as an environment variable:

   **On Windows (PowerShell):**
   ```powershell
   $env:ADMIN_PRIVATE_KEY='your-admin-private-key'
   ```

   **On Linux/Mac:**
   ```bash
   export ADMIN_PRIVATE_KEY='your-admin-private-key'
   ```

   > **IMPORTANT:** Replace `'your-admin-private-key'` with the actual private key of the admin wallet (`0xDBca3Ea7E2A3aE047d1775954226B71Ad60179C2`). Never share your private key or commit it to version control.

2. Run the update script:

   ```bash
   cd sosh-nft-avax-updated/sosh-smart-contract
   npx hardhat run scripts/update-nft-with-marketplace.js --network fuji
   ```

3. The script will:
   - Connect to the Fuji testnet
   - Use the admin wallet to call the `adminUpdateSoshMarket` function on the NFT contract
   - Verify that the update was successful
   - Display the transaction details and confirmation

4. After successful completion, you should see a message confirming that the marketplace address has been correctly set in the NFT contract.

## Next Steps

After updating the NFT contract, you should:

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

## Troubleshooting

If you encounter any issues:

- Ensure you've set the `ADMIN_PRIVATE_KEY` environment variable correctly
- Verify that the admin wallet has sufficient AVAX for gas fees
- Check that the admin wallet has admin rights in the Treasury contract
- Confirm that the contract addresses in the script match the actual deployed contracts
