// Script to deploy SoshTreasury with a new admin wallet
const { ethers, upgrades } = require("hardhat");
require("dotenv").config();

async function main() {
  console.log("Starting SoshTreasury deployment with new admin...");
  
  // New admin wallet address
  const NEW_ADMIN_ADDRESS = "0xDBca3Ea7E2A3aE047d1775954226B71Ad60179C2";
  
  // Get the contract factory
  const SoshTreasury = await ethers.getContractFactory("SoshTreasury");
  
  // Deploy the contract as a proxy
  console.log("Deploying SoshTreasury...");
  const treasury = await upgrades.deployProxy(
    SoshTreasury, 
    [NEW_ADMIN_ADDRESS], // Initialize with the new admin address
    { initializer: 'initialize' }
  );
  
  await treasury.deployed();
  
  console.log("SoshTreasury deployed to:", treasury.address);
  console.log("New admin address:", NEW_ADMIN_ADDRESS);
  
  // Verify that the admin role was set correctly
  const hasAdminRole = await treasury.isAdmin(NEW_ADMIN_ADDRESS);
  const hasSuperAdminRole = await treasury.isSuperAdmin(NEW_ADMIN_ADDRESS);
  
  console.log("Admin role verification:");
  console.log("- Has ADMIN_ROLE:", hasAdminRole);
  console.log("- Has DEFAULT_ADMIN_ROLE:", hasSuperAdminRole);
  
  // Return the deployed contract address for use in subsequent scripts
  return {
    treasuryAddress: treasury.address,
    adminAddress: NEW_ADMIN_ADDRESS
  };
}

// Execute the deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
