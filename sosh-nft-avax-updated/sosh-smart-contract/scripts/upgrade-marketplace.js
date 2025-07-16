/**
 * Upgrade SoshMarketplace Contract Script
 * 
 * This script deploys a new implementation of the SoshMarketplace contract
 * and upgrades the existing proxy to use the new implementation.
 * 
 * Usage: npx hardhat run scripts/upgrade-marketplace.js --network [network]
 */

const { ethers, upgrades } = require("hardhat");
const { execSync } = require("child_process");
const path = require("path");

async function main() {
  console.log("Starting SoshMarketplace contract upgrade...");

  // Get the contract factory
  const SoshMarketplace = await ethers.getContractFactory("SoshMarketplace");
  
  // Get the proxy address from environment or config
  // Replace this with your actual proxy address
  const PROXY_ADDRESS = process.env.MARKETPLACE_PROXY_ADDRESS;
  
  if (!PROXY_ADDRESS) {
    console.error("Error: MARKETPLACE_PROXY_ADDRESS environment variable is not set");
    console.error("Please set it to the address of the deployed proxy contract");
    process.exit(1);
  }
  
  // Determine the network from the command line arguments
  const network = process.env.HARDHAT_NETWORK || 'fuji';
  const networkName = network === 'mainnet' ? 'Avalanche Mainnet' : 'Avalanche Fuji Testnet';
  
  console.log(`Upgrading SoshMarketplace at proxy address: ${PROXY_ADDRESS}`);
  console.log(`Network: ${networkName}`);
  
  try {
    // Backup the current implementation address
    console.log("Backing up current implementation address...");
    const backupScriptPath = path.join(__dirname, "backup-implementation.js");
    execSync(`npx hardhat run ${backupScriptPath} --network ${network}`, { stdio: 'inherit' });
    
    // Prepare the upgrade
    console.log("Preparing upgrade...");
    const upgradeTx = await upgrades.prepareUpgrade(PROXY_ADDRESS, SoshMarketplace);
    console.log(`New implementation contract deployed at: ${upgradeTx}`);
    
    // Upgrade the proxy
    console.log("Upgrading proxy...");
    const upgraded = await upgrades.upgradeProxy(PROXY_ADDRESS, SoshMarketplace);
    
    // Wait for the transaction to be mined
    await upgraded.deployed();
    
    console.log("Upgrade complete!");
    console.log(`Proxy address: ${upgraded.address}`);
    console.log(`Transaction hash: ${upgraded.deployTransaction.hash}`);
    
    // Verify the upgrade
    console.log("\nVerifying upgrade...");
    
    // Check if the cleanupExpiredSales function exists
    try {
      // This will throw an error if the function doesn't exist
      const functionSignature = SoshMarketplace.interface.getFunction("cleanupExpiredSales");
      console.log("✅ cleanupExpiredSales function exists in the new implementation");
    } catch (error) {
      console.error("❌ cleanupExpiredSales function does not exist in the new implementation");
      console.error(error);
    }
    
    console.log("\nUpgrade verification complete!");
  } catch (error) {
    console.error("Error during upgrade:", error);
    process.exit(1);
  }
}

// Run the upgrade
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Unhandled error:", error);
    process.exit(1);
  });
