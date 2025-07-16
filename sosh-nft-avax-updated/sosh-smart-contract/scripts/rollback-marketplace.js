/**
 * Rollback SoshMarketplace Contract Script
 * 
 * This script rolls back to the previous implementation of the SoshMarketplace contract
 * in case there are issues with the new implementation.
 * 
 * Usage: npx hardhat run scripts/rollback-marketplace.js --network [network]
 */

const { ethers, upgrades } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Starting SoshMarketplace contract rollback...");

  // Get the proxy address from environment or config
  const PROXY_ADDRESS = process.env.MARKETPLACE_PROXY_ADDRESS;
  
  if (!PROXY_ADDRESS) {
    console.error("Error: MARKETPLACE_PROXY_ADDRESS environment variable is not set");
    console.error("Please set it to the address of the deployed proxy contract");
    process.exit(1);
  }
  
  // Get the previous implementation address from the backup file
  const BACKUP_DIR = path.join(__dirname, "..", "..", "backups", "contracts");
  const BACKUP_FILE = path.join(BACKUP_DIR, "marketplace-implementation-backup.json");
  
  let previousImplementation;
  
  try {
    if (fs.existsSync(BACKUP_FILE)) {
      const backupData = JSON.parse(fs.readFileSync(BACKUP_FILE, "utf8"));
      previousImplementation = backupData.previousImplementation;
      
      if (!previousImplementation) {
        console.error("Error: Previous implementation address not found in backup file");
        process.exit(1);
      }
    } else {
      console.error("Error: Backup file not found");
      console.error(`Expected at: ${BACKUP_FILE}`);
      console.error("Please provide the previous implementation address manually");
      
      // Prompt for manual input
      const readline = require("readline").createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      previousImplementation = await new Promise((resolve) => {
        readline.question("Enter the previous implementation address: ", (address) => {
          readline.close();
          resolve(address);
        });
      });
    }
  } catch (error) {
    console.error("Error reading backup file:", error);
    process.exit(1);
  }
  
  // Determine the network from the command line arguments
  const network = process.env.HARDHAT_NETWORK || 'fuji';
  const networkName = network === 'mainnet' ? 'Avalanche Mainnet' : 'Avalanche Fuji Testnet';
  
  console.log(`Rolling back SoshMarketplace at proxy address: ${PROXY_ADDRESS}`);
  console.log(`Previous implementation address: ${previousImplementation}`);
  console.log(`Network: ${networkName}`);
  
  try {
    // Get the contract factory for the previous version
    const SoshMarketplace = await ethers.getContractFactory("SoshMarketplace");
    
    // Prepare the rollback
    console.log("Preparing rollback...");
    
    // Upgrade the proxy to the previous implementation
    console.log("Rolling back proxy...");
    
    // Use forceImport to attach the proxy to the contract factory
    const proxy = await upgrades.forceImport(PROXY_ADDRESS, SoshMarketplace);
    
    // Upgrade to the previous implementation
    const rollbackTx = await upgrades.upgradeProxy(PROXY_ADDRESS, SoshMarketplace, {
      implementation: previousImplementation
    });
    
    // Wait for the transaction to be mined
    await rollbackTx.deployed();
    
    console.log("Rollback complete!");
    console.log(`Proxy address: ${rollbackTx.address}`);
    console.log(`Transaction hash: ${rollbackTx.deployTransaction.hash}`);
    
    // Verify the rollback
    console.log("\nVerifying rollback...");
    
    // Check if the implementation address matches the previous implementation
    const implementationAddress = await upgrades.erc1967.getImplementationAddress(PROXY_ADDRESS);
    
    if (implementationAddress.toLowerCase() === previousImplementation.toLowerCase()) {
      console.log("✅ Rollback successful! Implementation address matches the previous implementation.");
    } else {
      console.error("❌ Rollback verification failed! Implementation address does not match the previous implementation.");
      console.error(`Expected: ${previousImplementation}`);
      console.error(`Actual: ${implementationAddress}`);
    }
    
    console.log("\nRollback verification complete!");
  } catch (error) {
    console.error("Error during rollback:", error);
    process.exit(1);
  }
}

// Run the rollback
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Unhandled error:", error);
    process.exit(1);
  });
