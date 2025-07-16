/**
 * Force Import SoshMarketplace Contract Script
 * 
 * This script registers a previously deployed proxy for upgrading.
 * 
 * Usage: npx hardhat run scripts/force-import-marketplace.js --network [network]
 */

const { ethers, upgrades } = require("hardhat");

async function main() {
  console.log("Starting SoshMarketplace contract force import...");

  // Get the contract factory
  const SoshMarketplace = await ethers.getContractFactory("SoshMarketplace");
  
  // Get the proxy address from environment or config
  const PROXY_ADDRESS = process.env.MARKETPLACE_PROXY_ADDRESS;
  
  if (!PROXY_ADDRESS) {
    console.error("Error: MARKETPLACE_PROXY_ADDRESS environment variable is not set");
    console.error("Please set it to the address of the deployed proxy contract");
    process.exit(1);
  }
  
  // Determine the network from the command line arguments
  const network = process.env.HARDHAT_NETWORK || 'fuji';
  const networkName = network === 'mainnet' ? 'Avalanche Mainnet' : 'Avalanche Fuji Testnet';
  
  console.log(`Force importing SoshMarketplace at proxy address: ${PROXY_ADDRESS}`);
  console.log(`Network: ${networkName}`);
  
  try {
    // Force import the proxy
    console.log("Forcing import...");
    await upgrades.forceImport(PROXY_ADDRESS, SoshMarketplace);
    
    console.log("Force import complete!");
    console.log(`Proxy address: ${PROXY_ADDRESS}`);
    
  } catch (error) {
    console.error("Error during force import:", error);
    process.exit(1);
  }
}

// Run the force import
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Unhandled error:", error);
    process.exit(1);
  });
