/**
 * Backup SoshMarketplace Implementation Address
 * 
 * This script backs up the current implementation address of the SoshMarketplace contract
 * before upgrading, so it can be used for rollback if needed.
 * 
 * Usage: npx hardhat run scripts/backup-implementation.js --network [network]
 */

const { ethers, upgrades } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Backing up SoshMarketplace implementation address...");
  
  // Determine the network from the command line arguments
  const network = process.env.HARDHAT_NETWORK || 'fuji';
  const networkName = network === 'mainnet' ? 'Avalanche Mainnet' : 'Avalanche Fuji Testnet';
  console.log(`Network: ${networkName}`);

  // Get the proxy address from environment or config
  const PROXY_ADDRESS = process.env.MARKETPLACE_PROXY_ADDRESS;
  
  if (!PROXY_ADDRESS) {
    console.error("Error: MARKETPLACE_PROXY_ADDRESS environment variable is not set");
    console.error("Please set it to the address of the deployed proxy contract");
    process.exit(1);
  }
  
  try {
    // Get the current implementation address
    const implementationAddress = await upgrades.erc1967.getImplementationAddress(PROXY_ADDRESS);
    console.log(`Current implementation address: ${implementationAddress}`);
    
    // Create backup directory if it doesn't exist
    const BACKUP_DIR = path.join(__dirname, "..", "backups", "contracts");
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }
    
    // Create backup file
    const BACKUP_FILE = path.join(BACKUP_DIR, "marketplace-implementation-backup.json");
    const timestamp = new Date().toISOString();
    
    const backupData = {
      timestamp,
      proxyAddress: PROXY_ADDRESS,
      previousImplementation: implementationAddress
    };
    
    fs.writeFileSync(BACKUP_FILE, JSON.stringify(backupData, null, 2));
    
    console.log(`Backup saved to: ${BACKUP_FILE}`);
    console.log("Backup complete!");
    
    // Also create a timestamped backup
    const TIMESTAMPED_BACKUP_FILE = path.join(BACKUP_DIR, `marketplace-implementation-backup-${timestamp.replace(/:/g, "-")}.json`);
    fs.writeFileSync(TIMESTAMPED_BACKUP_FILE, JSON.stringify(backupData, null, 2));
    console.log(`Timestamped backup saved to: ${TIMESTAMPED_BACKUP_FILE}`);
  } catch (error) {
    console.error("Error during backup:", error);
    process.exit(1);
  }
}

// Run the backup
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Unhandled error:", error);
    process.exit(1);
  });
