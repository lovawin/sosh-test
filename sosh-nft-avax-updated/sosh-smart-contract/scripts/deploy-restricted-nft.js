// Script to deploy the updated SoshNFT contract with marketplace restrictions
const { ethers, upgrades } = require("hardhat");
require("dotenv").config();
const fs = require('fs');
const path = require('path');

// New admin wallet address
const NEW_ADMIN_ADDRESS = "0xDBca3Ea7E2A3aE047d1775954226B71Ad60179C2";

// Already deployed Treasury contract address
const TREASURY_ADDRESS = "0x6B93d11526086B43E93c0B6AD7375d8105Ce562A";

// Store deployed contract addresses
const deployedAddresses = {
  treasury: TREASURY_ADDRESS,
  nft: null,
  marketplace: null
};

async function main() {
  console.log("Deploying restricted SoshNFT contract...");
  console.log("New admin address:", NEW_ADMIN_ADDRESS);
  console.log("Using existing Treasury contract at:", deployedAddresses.treasury);
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "AVAX");
  
  // Deploy NFT
  console.log("\n=== Deploying Restricted NFT Contract ===");
  await deployNFT();
  
  // Save deployed addresses to .env file
  console.log("\n=== Saving Deployed Addresses ===");
  await saveAddressesToEnv();
  
  console.log("\n=== Deployment Complete ===");
  console.log("Treasury address:", deployedAddresses.treasury);
  console.log("NFT address:", deployedAddresses.nft);
  console.log("\nNext steps:");
  console.log("1. Deploy the Marketplace contract using 'npx hardhat run scripts/deploy-marketplace-only.js --network fuji'");
}

async function deployNFT() {
  // Parameters for NFT contract initialization
  const NFT_NAME = "Sosh NFT";
  const NFT_SYMBOL = "SOSH";
  const BASE_URI = "https://api.soshnft.io/metadata/";
  const ROYALTY_FEE = 250; // 2.5% (in basis points)
  const MAX_ROYALTY_FEE = 1000; // 10% (in basis points)
  const MINT_FEE = ethers.parseEther("0.01"); // 0.01 AVAX
  
  // We'll set the marketplace address later after it's deployed
  // For now, use a placeholder address
  const PLACEHOLDER_MARKETPLACE = "0x0000000000000000000000000000000000000001";
  
  // Get the contract factory
  const SoshNFT = await ethers.getContractFactory("SoshNFT");
  
  // Deploy the contract as a proxy
  console.log("Deploying SoshNFT...");
  const nft = await upgrades.deployProxy(
    SoshNFT, 
    [
      NFT_NAME,
      NFT_SYMBOL,
      deployedAddresses.treasury, // Use the deployed Treasury address
      PLACEHOLDER_MARKETPLACE, // This will be updated later
      BASE_URI,
      ROYALTY_FEE,
      MAX_ROYALTY_FEE,
      MINT_FEE
    ],
    { initializer: 'initialize' }
  );
  
  // Wait for the deployment transaction to be mined
  await nft.waitForDeployment();
  
  // Get the contract address
  const nftAddress = await nft.getAddress();
  
  console.log("SoshNFT deployed to:", nftAddress);
  console.log("Pointing to Treasury at:", deployedAddresses.treasury);
  
  deployedAddresses.nft = nftAddress;
}

async function saveAddressesToEnv() {
  // Create a .env file with the deployed addresses
  const envContent = `
# Deployed contract addresses with new admin wallet
NEW_TREASURY_ADDRESS=${deployedAddresses.treasury}
NEW_NFT_ADDRESS=${deployedAddresses.nft}
NEW_ADMIN_ADDRESS=${NEW_ADMIN_ADDRESS}
  `.trim();
  
  const envFilePath = path.join(__dirname, '..', '.env.deployed');
  fs.writeFileSync(envFilePath, envContent);
  
  console.log(`Deployed addresses saved to ${envFilePath}`);
  console.log("You can use these environment variables in subsequent scripts");
}

// Execute the deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
