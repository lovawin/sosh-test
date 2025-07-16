// Script to update the NFT contract with the marketplace address using the admin wallet
const { ethers } = require("hardhat");
require("dotenv").config();
const fs = require('fs');
const path = require('path');

// Load deployed addresses from .env.deployed file if it exists
let deployedAddresses = {
  treasury: process.env.NEW_TREASURY_ADDRESS || "0x6B93d11526086B43E93c0B6AD7375d8105Ce562A",
  nft: process.env.NEW_NFT_ADDRESS || "0x7CA1eA6d19A1df7d17fEaF0eA9a1dEFA0e37f894",
  marketplace: process.env.NEW_MARKETPLACE_ADDRESS || "0x25ad5b58a78c1cC1aF3C83607448D0D203158F06"
};

// Admin wallet address and private key
// NOTE: You need to set the ADMIN_PRIVATE_KEY environment variable before running this script
const ADMIN_ADDRESS = process.env.NEW_ADMIN_ADDRESS || "0xDBca3Ea7E2A3aE047d1775954226B71Ad60179C2";
const ADMIN_PRIVATE_KEY = process.env.ADMIN_PRIVATE_KEY;

// Try to load addresses from .env.deployed file
try {
  const envPath = path.join(__dirname, '..', '.env.deployed');
  if (fs.existsSync(envPath)) {
    require('dotenv').config({ path: envPath });
    deployedAddresses.treasury = process.env.NEW_TREASURY_ADDRESS || deployedAddresses.treasury;
    deployedAddresses.nft = process.env.NEW_NFT_ADDRESS || deployedAddresses.nft;
    deployedAddresses.marketplace = process.env.NEW_MARKETPLACE_ADDRESS || deployedAddresses.marketplace;
  }
} catch (error) {
  console.warn("Warning: Could not load .env.deployed file. Using default addresses.");
}

async function main() {
  // Check if admin private key is provided
  if (!ADMIN_PRIVATE_KEY) {
    console.error("Error: ADMIN_PRIVATE_KEY environment variable is required.");
    console.error("Please set it before running this script:");
    console.error("  On Windows: $env:ADMIN_PRIVATE_KEY='your-private-key'");
    console.error("  On Linux/Mac: export ADMIN_PRIVATE_KEY='your-private-key'");
    process.exit(1);
  }

  console.log("Updating NFT contract with marketplace address...");
  console.log("Admin address:", ADMIN_ADDRESS);
  console.log("NFT contract address:", deployedAddresses.nft);
  console.log("Marketplace address:", deployedAddresses.marketplace);
  
  // Create a provider - try a different RPC endpoint
  const provider = new ethers.JsonRpcProvider("https://avalanche-fuji-c-chain.publicnode.com");
  
  // Create a wallet with the admin private key
  const adminWallet = new ethers.Wallet(ADMIN_PRIVATE_KEY, provider);
  
  // Get the NFT contract ABI
  const SoshNFT = await ethers.getContractFactory("SoshNFT");
  
  // Create a contract instance connected to the admin wallet
  const nft = new ethers.Contract(
    deployedAddresses.nft,
    SoshNFT.interface,
    adminWallet
  );
  
  // Update the marketplace address in the NFT contract
  console.log("Updating NFT contract with marketplace address:", deployedAddresses.marketplace);
  const updateTx = await nft.adminUpdateSoshMarket(deployedAddresses.marketplace);
  
  console.log("Transaction sent:", updateTx.hash);
  console.log("Waiting for transaction to be mined...");
  
  // Wait for the transaction to be mined
  const receipt = await updateTx.wait();
  
  console.log("Transaction confirmed in block:", receipt.blockNumber);
  console.log("✅ NFT contract updated with marketplace address");
  
  // Verify the update
  const marketplaceInNFT = await nft.marketContractAddress();
  console.log("Marketplace address in NFT contract:", marketplaceInNFT);
  
  if (marketplaceInNFT.toLowerCase() !== deployedAddresses.marketplace.toLowerCase()) {
    console.error("❌ Marketplace address not updated correctly in NFT contract!");
    process.exit(1);
  } else {
    console.log("✅ Verification successful: Marketplace address correctly set in NFT contract");
  }
  
  console.log("\n=== Update Complete ===");
  console.log("Treasury address:", deployedAddresses.treasury);
  console.log("NFT address:", deployedAddresses.nft);
  console.log("Marketplace address:", deployedAddresses.marketplace);
  
  console.log("\nNext steps:");
  console.log("1. Run 'npx hardhat run scripts/update-frontend-config.js --network fuji'");
  console.log("2. Run 'npx hardhat run scripts/update-backend-config.js --network fuji'");
  console.log("3. Test the deployment with 'npx hardhat run scripts/test-mint-nft.js --network fuji'");
  console.log("4. Test the deployment with 'npx hardhat run scripts/test-create-sale.js --network fuji'");
}

// Execute the script
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
