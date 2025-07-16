// Script to verify admin rights in the deployed contracts
const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
  console.log("Verifying admin rights in deployed contracts...");
  
  // Get the addresses of the deployed contracts
  // You can replace these with the actual addresses or set them as environment variables
  const TREASURY_ADDRESS = process.env.NEW_TREASURY_ADDRESS || "REPLACE_WITH_NEW_TREASURY_ADDRESS";
  const NFT_ADDRESS = process.env.NEW_NFT_ADDRESS || "REPLACE_WITH_NEW_NFT_ADDRESS";
  const MARKETPLACE_ADDRESS = process.env.NEW_MARKETPLACE_ADDRESS || "REPLACE_WITH_NEW_MARKETPLACE_ADDRESS";
  
  // New admin wallet address
  const NEW_ADMIN_ADDRESS = "0xDBca3Ea7E2A3aE047d1775954226B71Ad60179C2";
  
  // Validate the addresses
  if (TREASURY_ADDRESS === "REPLACE_WITH_NEW_TREASURY_ADDRESS") {
    console.error("ERROR: You must set the NEW_TREASURY_ADDRESS environment variable or update this script with the actual address");
    process.exit(1);
  }
  
  console.log("Checking admin rights for:", NEW_ADMIN_ADDRESS);
  console.log("Treasury address:", TREASURY_ADDRESS);
  console.log("NFT address:", NFT_ADDRESS);
  console.log("Marketplace address:", MARKETPLACE_ADDRESS);
  
  // Get contract instances
  const SoshTreasury = await ethers.getContractFactory("SoshTreasury");
  const treasury = await SoshTreasury.attach(TREASURY_ADDRESS);
  
  // Check admin rights in Treasury
  console.log("\n=== Treasury Contract Admin Rights ===");
  const hasAdminRole = await treasury.isAdmin(NEW_ADMIN_ADDRESS);
  const hasSuperAdminRole = await treasury.isSuperAdmin(NEW_ADMIN_ADDRESS);
  
  console.log("Has ADMIN_ROLE:", hasAdminRole);
  console.log("Has DEFAULT_ADMIN_ROLE (Super Admin):", hasSuperAdminRole);
  
  // If NFT address is provided, check admin rights via Treasury
  if (NFT_ADDRESS !== "REPLACE_WITH_NEW_NFT_ADDRESS") {
    const SoshNFT = await ethers.getContractFactory("SoshNFT");
    const nft = await SoshNFT.attach(NFT_ADDRESS);
    
    console.log("\n=== NFT Contract ===");
    console.log("Treasury address in NFT contract:", await nft.treasuryContractAddress());
    
    // Try to call an admin-only function
    try {
      // Get the current mint fee (read-only, should work)
      const mintFee = await nft.mintFee();
      console.log("Current mint fee:", ethers.utils.formatEther(mintFee), "AVAX");
      
      // We won't actually execute this, just check if the admin has the right
      console.log("Admin can update mint fee:", hasAdminRole);
    } catch (error) {
      console.error("Error checking NFT contract:", error.message);
    }
  }
  
  // If Marketplace address is provided, check admin rights via Treasury
  if (MARKETPLACE_ADDRESS !== "REPLACE_WITH_NEW_MARKETPLACE_ADDRESS") {
    const SoshMarketplace = await ethers.getContractFactory("SoshMarketplace");
    const marketplace = await SoshMarketplace.attach(MARKETPLACE_ADDRESS);
    
    console.log("\n=== Marketplace Contract ===");
    console.log("Treasury address in Marketplace contract:", await marketplace.treasuryContractAddress());
    console.log("NFT address in Marketplace contract:", await marketplace.nftContractAddress());
    
    // Try to call an admin-only function
    try {
      // Get the current fee config (read-only, should work)
      const feeConfig = await marketplace.getFeeConfig();
      console.log("Primary sale fee (basis points):", feeConfig.primarySoshFeeBasisPoints.toString());
      console.log("Secondary sale fee (basis points):", feeConfig.secondarySoshFeeBasisPoints.toString());
      
      // We won't actually execute this, just check if the admin has the right
      console.log("Admin can update marketplace fees:", hasAdminRole);
    } catch (error) {
      console.error("Error checking Marketplace contract:", error.message);
    }
  }
  
  console.log("\n=== Summary ===");
  if (hasAdminRole && hasSuperAdminRole) {
    console.log("✅ Admin rights verification PASSED. The new admin wallet has the necessary permissions.");
  } else {
    console.log("❌ Admin rights verification FAILED. The new admin wallet is missing some permissions:");
    if (!hasAdminRole) console.log("  - Missing ADMIN_ROLE");
    if (!hasSuperAdminRole) console.log("  - Missing DEFAULT_ADMIN_ROLE (Super Admin)");
  }
}

// Execute the verification
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
