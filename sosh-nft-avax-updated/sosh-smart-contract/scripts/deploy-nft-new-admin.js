// Script to deploy SoshNFT with the new Treasury contract
const { ethers, upgrades } = require("hardhat");
require("dotenv").config();

async function main() {
  console.log("Starting SoshNFT deployment with new Treasury...");
  
  // This should be the address of the newly deployed Treasury contract
  // You can replace this with the actual address after running deploy-treasury-new-admin.js
  const NEW_TREASURY_ADDRESS = process.env.NEW_TREASURY_ADDRESS || "REPLACE_WITH_NEW_TREASURY_ADDRESS";
  
  // Validate the Treasury address
  if (NEW_TREASURY_ADDRESS === "REPLACE_WITH_NEW_TREASURY_ADDRESS") {
    console.error("ERROR: You must set the NEW_TREASURY_ADDRESS environment variable or update this script with the actual address");
    process.exit(1);
  }
  
  // Parameters for NFT contract initialization
  const NFT_NAME = "Sosh NFT";
  const NFT_SYMBOL = "SOSH";
  const BASE_URI = "https://api.soshnft.io/metadata/";
  const ROYALTY_FEE = 250; // 2.5% (in basis points)
  const MAX_ROYALTY_FEE = 1000; // 10% (in basis points)
  const MINT_FEE = ethers.utils.parseEther("0.01"); // 0.01 AVAX
  
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
      NEW_TREASURY_ADDRESS, // Use the new Treasury address
      PLACEHOLDER_MARKETPLACE, // This will be updated later
      BASE_URI,
      ROYALTY_FEE,
      MAX_ROYALTY_FEE,
      MINT_FEE
    ],
    { initializer: 'initialize' }
  );
  
  await nft.deployed();
  
  console.log("SoshNFT deployed to:", nft.address);
  console.log("Pointing to Treasury at:", NEW_TREASURY_ADDRESS);
  
  // Return the deployed contract address for use in subsequent scripts
  return {
    nftAddress: nft.address,
    treasuryAddress: NEW_TREASURY_ADDRESS
  };
}

// Execute the deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
