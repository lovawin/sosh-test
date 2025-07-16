// Script to verify contracts on Snowtrace
const { run } = require("hardhat");
require("dotenv").config();
const fs = require('fs');
const path = require('path');

// Load deployed addresses from .env.deployed file if it exists
let deployedAddresses = {
  treasury: process.env.NEW_TREASURY_ADDRESS || "0x6B93d11526086B43E93c0B6AD7375d8105Ce562A",
  nft: process.env.NEW_NFT_ADDRESS || "0x7CA1eA6d19A1df7d17fEaF0eA9a1dEFA0e37f894",
  marketplace: process.env.NEW_MARKETPLACE_ADDRESS || "0x25ad5b58a78c1cC1aF3C83607448D0D203158F06"
};

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
  console.log("Verifying contracts on Snowtrace...");
  console.log("NFT contract address:", deployedAddresses.nft);
  console.log("Marketplace address:", deployedAddresses.marketplace);
  
  // Verify NFT contract
  console.log("\n=== Verifying NFT Contract ===");
  try {
    await run("verify:verify", {
      address: deployedAddresses.nft,
      constructorArguments: [],
      contract: "contracts/sosh_minting/SoshNFT.sol:SoshNFT"
    });
    console.log("✅ NFT contract verified successfully");
  } catch (error) {
    if (error.message.includes("Already Verified")) {
      console.log("✅ NFT contract already verified");
    } else {
      console.error("❌ NFT contract verification failed:", error.message);
    }
  }
  
  // Verify Marketplace contract
  console.log("\n=== Verifying Marketplace Contract ===");
  try {
    await run("verify:verify", {
      address: deployedAddresses.marketplace,
      constructorArguments: [],
      contract: "contracts/sosh_marketplace/SoshMarketplace.sol:SoshMarketplace"
    });
    console.log("✅ Marketplace contract verified successfully");
  } catch (error) {
    if (error.message.includes("Already Verified")) {
      console.log("✅ Marketplace contract already verified");
    } else {
      console.error("❌ Marketplace contract verification failed:", error.message);
    }
  }
  
  console.log("\n=== Verification Complete ===");
  console.log("You can now interact with the contracts on Snowtrace:");
  console.log(`NFT contract: https://testnet.snowtrace.io/address/${deployedAddresses.nft}`);
  console.log(`Marketplace contract: https://testnet.snowtrace.io/address/${deployedAddresses.marketplace}`);
  
  console.log("\nTo update the NFT contract with the marketplace address:");
  console.log("1. Go to the NFT contract on Snowtrace");
  console.log("2. Connect your admin wallet (0xDBca3Ea7E2A3aE047d1775954226B71Ad60179C2)");
  console.log("3. Navigate to the 'Write Contract' tab");
  console.log("4. Find the 'adminUpdateSoshMarket' function");
  console.log(`5. Enter the marketplace address (${deployedAddresses.marketplace}) as the parameter`);
  console.log("6. Click 'Write' to execute the transaction");
}

// Execute the script
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
