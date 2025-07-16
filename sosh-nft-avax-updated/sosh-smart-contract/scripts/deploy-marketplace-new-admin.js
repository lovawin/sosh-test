// Script to deploy SoshMarketplace with the new Treasury and NFT contracts
const { ethers, upgrades } = require("hardhat");
require("dotenv").config();

async function main() {
  console.log("Starting SoshMarketplace deployment with new Treasury and NFT...");
  
  // These should be the addresses of the newly deployed contracts
  // You can replace these with the actual addresses after running the previous deployment scripts
  const NEW_TREASURY_ADDRESS = process.env.NEW_TREASURY_ADDRESS || "REPLACE_WITH_NEW_TREASURY_ADDRESS";
  const NEW_NFT_ADDRESS = process.env.NEW_NFT_ADDRESS || "REPLACE_WITH_NEW_NFT_ADDRESS";
  
  // Validate the addresses
  if (NEW_TREASURY_ADDRESS === "REPLACE_WITH_NEW_TREASURY_ADDRESS") {
    console.error("ERROR: You must set the NEW_TREASURY_ADDRESS environment variable or update this script with the actual address");
    process.exit(1);
  }
  
  if (NEW_NFT_ADDRESS === "REPLACE_WITH_NEW_NFT_ADDRESS") {
    console.error("ERROR: You must set the NEW_NFT_ADDRESS environment variable or update this script with the actual address");
    process.exit(1);
  }
  
  // Parameters for Marketplace contract initialization
  const PRIMARY_SALE_FEE = 250; // 2.5% (in basis points)
  const SECONDARY_SALE_FEE = 250; // 2.5% (in basis points)
  const UPPERCAP_PRIMARY_SALE_FEE = 1000; // 10% (in basis points)
  const UPPERCAP_SECONDARY_SALE_FEE = 1000; // 10% (in basis points)
  
  // Get the contract factory
  const SoshMarketplace = await ethers.getContractFactory("SoshMarketplace");
  
  // Deploy the contract as a proxy
  console.log("Deploying SoshMarketplace...");
  const marketplace = await upgrades.deployProxy(
    SoshMarketplace, 
    [
      NEW_NFT_ADDRESS, // Use the new NFT address
      NEW_TREASURY_ADDRESS, // Use the new Treasury address
      PRIMARY_SALE_FEE,
      SECONDARY_SALE_FEE,
      UPPERCAP_PRIMARY_SALE_FEE,
      UPPERCAP_SECONDARY_SALE_FEE
    ],
    { initializer: 'initialize' }
  );
  
  await marketplace.deployed();
  
  console.log("SoshMarketplace deployed to:", marketplace.address);
  console.log("Pointing to Treasury at:", NEW_TREASURY_ADDRESS);
  console.log("Pointing to NFT at:", NEW_NFT_ADDRESS);
  
  // Now update the NFT contract with the new marketplace address
  console.log("Updating NFT contract with new marketplace address...");
  
  // Get the NFT contract instance
  const SoshNFT = await ethers.getContractFactory("SoshNFT");
  const nft = await SoshNFT.attach(NEW_NFT_ADDRESS);
  
  // Update the marketplace address in the NFT contract
  const updateTx = await nft.adminUpdateSoshMarket(marketplace.address);
  await updateTx.wait();
  
  console.log("NFT contract updated with new marketplace address");
  
  // Return the deployed contract addresses
  return {
    marketplaceAddress: marketplace.address,
    nftAddress: NEW_NFT_ADDRESS,
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
