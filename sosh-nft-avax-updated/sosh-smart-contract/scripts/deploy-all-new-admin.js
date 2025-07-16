// Comprehensive script to deploy all contracts with new admin wallet
const { ethers, upgrades } = require("hardhat");
require("dotenv").config();
const fs = require('fs');
const path = require('path');

// New admin wallet address
const NEW_ADMIN_ADDRESS = "0xDBca3Ea7E2A3aE047d1775954226B71Ad60179C2";

// Store deployed contract addresses
const deployedAddresses = {
  treasury: null,
  nft: null,
  marketplace: null
};

async function main() {
  console.log("Starting comprehensive deployment with new admin wallet...");
  console.log("New admin address:", NEW_ADMIN_ADDRESS);
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "AVAX");
  
  // Step 1: Deploy Treasury
  console.log("\n=== Step 1: Deploying Treasury Contract ===");
  await deployTreasury();
  
  // Step 2: Deploy NFT
  console.log("\n=== Step 2: Deploying NFT Contract ===");
  await deployNFT();
  
  // Step 3: Deploy Marketplace
  console.log("\n=== Step 3: Deploying Marketplace Contract ===");
  await deployMarketplace();
  
  // Step 4: Update NFT with Marketplace address
  console.log("\n=== Step 4: Updating NFT with Marketplace Address ===");
  await updateNFTWithMarketplace();
  
  // Step 5: Save deployed addresses to .env file
  console.log("\n=== Step 5: Saving Deployed Addresses ===");
  await saveAddressesToEnv();
  
  // Step 6: Verify admin rights
  console.log("\n=== Step 6: Verifying Admin Rights ===");
  await verifyAdminRights();
  
  console.log("\n=== Deployment Complete ===");
  console.log("Treasury address:", deployedAddresses.treasury);
  console.log("NFT address:", deployedAddresses.nft);
  console.log("Marketplace address:", deployedAddresses.marketplace);
  console.log("\nNext steps:");
  console.log("1. Run 'npx hardhat run scripts/update-frontend-config.js --network avaxTest'");
  console.log("2. Run 'npx hardhat run scripts/update-backend-config.js --network avaxTest'");
  console.log("3. Test the deployment with 'npx hardhat run scripts/test-mint-nft.js --network avaxTest'");
  console.log("4. Test the deployment with 'npx hardhat run scripts/test-create-sale.js --network avaxTest'");
}

async function deployTreasury() {
  // Get the contract factory
  const SoshTreasury = await ethers.getContractFactory("SoshTreasury");
  
  // Deploy the contract as a proxy
  console.log("Deploying SoshTreasury...");
  const treasury = await upgrades.deployProxy(
    SoshTreasury, 
    [NEW_ADMIN_ADDRESS], // Initialize with the new admin address
    { initializer: 'initialize' }
  );
  
  // Wait for the deployment transaction to be mined
  await treasury.waitForDeployment();
  
  // Get the contract address
  const treasuryAddress = await treasury.getAddress();
  
  console.log("SoshTreasury deployed to:", treasuryAddress);
  deployedAddresses.treasury = treasuryAddress;
  
  // Verify that the admin role was set correctly
  const hasAdminRole = await treasury.isAdmin(NEW_ADMIN_ADDRESS);
  const hasSuperAdminRole = await treasury.isSuperAdmin(NEW_ADMIN_ADDRESS);
  
  console.log("Admin role verification:");
  console.log("- Has ADMIN_ROLE:", hasAdminRole);
  console.log("- Has DEFAULT_ADMIN_ROLE:", hasSuperAdminRole);
  
  if (!hasAdminRole || !hasSuperAdminRole) {
    console.error("❌ Admin roles not set correctly!");
    process.exit(1);
  }
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

async function deployMarketplace() {
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
      deployedAddresses.nft, // Use the deployed NFT address
      deployedAddresses.treasury, // Use the deployed Treasury address
      PRIMARY_SALE_FEE,
      SECONDARY_SALE_FEE,
      UPPERCAP_PRIMARY_SALE_FEE,
      UPPERCAP_SECONDARY_SALE_FEE
    ],
    { initializer: 'initialize' }
  );
  
  // Wait for the deployment transaction to be mined
  await marketplace.waitForDeployment();
  
  // Get the contract address
  const marketplaceAddress = await marketplace.getAddress();
  
  console.log("SoshMarketplace deployed to:", marketplaceAddress);
  console.log("Pointing to Treasury at:", deployedAddresses.treasury);
  console.log("Pointing to NFT at:", deployedAddresses.nft);
  
  deployedAddresses.marketplace = marketplaceAddress;
}

async function updateNFTWithMarketplace() {
  // Get the NFT contract instance
  const SoshNFT = await ethers.getContractFactory("SoshNFT");
  const nft = SoshNFT.attach(deployedAddresses.nft);
  
  // Update the marketplace address in the NFT contract
  console.log("Updating NFT contract with marketplace address:", deployedAddresses.marketplace);
  const updateTx = await nft.adminUpdateSoshMarket(deployedAddresses.marketplace);
  await updateTx.wait();
  
  console.log("✅ NFT contract updated with marketplace address");
  
  // Verify the update
  const marketplaceInNFT = await nft.marketContractAddress();
  console.log("Marketplace address in NFT contract:", marketplaceInNFT);
  
  if (marketplaceInNFT.toLowerCase() !== deployedAddresses.marketplace.toLowerCase()) {
    console.error("❌ Marketplace address not updated correctly in NFT contract!");
    process.exit(1);
  }
}

async function saveAddressesToEnv() {
  // Create a .env file with the deployed addresses
  const envContent = `
# Deployed contract addresses with new admin wallet
NEW_TREASURY_ADDRESS=${deployedAddresses.treasury}
NEW_NFT_ADDRESS=${deployedAddresses.nft}
NEW_MARKETPLACE_ADDRESS=${deployedAddresses.marketplace}
NEW_ADMIN_ADDRESS=${NEW_ADMIN_ADDRESS}
  `.trim();
  
  const envFilePath = path.join(__dirname, '..', '.env.deployed');
  fs.writeFileSync(envFilePath, envContent);
  
  console.log(`Deployed addresses saved to ${envFilePath}`);
  console.log("You can use these environment variables in subsequent scripts");
}

async function verifyAdminRights() {
  // Get contract instances
  const SoshTreasury = await ethers.getContractFactory("SoshTreasury");
  const treasury = SoshTreasury.attach(deployedAddresses.treasury);
  
  // Check admin rights in Treasury
  console.log("Checking admin rights for:", NEW_ADMIN_ADDRESS);
  const hasAdminRole = await treasury.isAdmin(NEW_ADMIN_ADDRESS);
  const hasSuperAdminRole = await treasury.isSuperAdmin(NEW_ADMIN_ADDRESS);
  
  console.log("Has ADMIN_ROLE:", hasAdminRole);
  console.log("Has DEFAULT_ADMIN_ROLE (Super Admin):", hasSuperAdminRole);
  
  if (hasAdminRole && hasSuperAdminRole) {
    console.log("✅ Admin rights verification PASSED");
  } else {
    console.log("❌ Admin rights verification FAILED");
    if (!hasAdminRole) console.log("  - Missing ADMIN_ROLE");
    if (!hasSuperAdminRole) console.log("  - Missing DEFAULT_ADMIN_ROLE (Super Admin)");
  }
}

// Execute the deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
