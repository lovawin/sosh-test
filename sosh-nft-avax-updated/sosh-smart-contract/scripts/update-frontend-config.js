// Script to update frontend configuration files with new contract addresses
const fs = require('fs');
const path = require('path');
require("dotenv").config();

async function main() {
  console.log("Updating frontend configuration with new contract addresses...");
  
  // Get the addresses of the deployed contracts
  // You can replace these with the actual addresses or set them as environment variables
  const NFT_ADDRESS = process.env.NEW_NFT_ADDRESS || "REPLACE_WITH_NEW_NFT_ADDRESS";
  const MARKETPLACE_ADDRESS = process.env.NEW_MARKETPLACE_ADDRESS || "REPLACE_WITH_NEW_MARKETPLACE_ADDRESS";
  
  // Validate the addresses
  if (NFT_ADDRESS === "REPLACE_WITH_NEW_NFT_ADDRESS") {
    console.error("ERROR: You must set the NEW_NFT_ADDRESS environment variable or update this script with the actual address");
    process.exit(1);
  }
  
  if (MARKETPLACE_ADDRESS === "REPLACE_WITH_NEW_MARKETPLACE_ADDRESS") {
    console.error("ERROR: You must set the NEW_MARKETPLACE_ADDRESS environment variable or update this script with the actual address");
    process.exit(1);
  }
  
  console.log("New NFT contract address:", NFT_ADDRESS);
  console.log("New Marketplace contract address:", MARKETPLACE_ADDRESS);
  
  // Define paths to the frontend configuration files
  const frontendDir = path.join(__dirname, '..', '..', 'frontend', 'src', 'common');
  const nftConfigPath = path.join(frontendDir, 'config721.js');
  const marketplaceConfigPath = path.join(frontendDir, 'config721MarketPlace.js');
  
  // Update NFT contract address in config721.js
  try {
    console.log(`Updating NFT contract address in ${nftConfigPath}...`);
    
    // Read the current file content
    let nftConfigContent = fs.readFileSync(nftConfigPath, 'utf8');
    
    // Create a backup of the original file
    const nftBackupPath = `${nftConfigPath}.bak`;
    fs.writeFileSync(nftBackupPath, nftConfigContent);
    console.log(`Backup created at ${nftBackupPath}`);
    
    // Replace the contract address
    const oldNftAddressRegex = /(export const CUSTOM_TOKEN_ADDRESS_721 = ")([^"]+)(")/;
    const oldNftAddress = nftConfigContent.match(oldNftAddressRegex)[2];
    
    nftConfigContent = nftConfigContent.replace(oldNftAddressRegex, `$1${NFT_ADDRESS}$3`);
    
    // Write the updated content back to the file
    fs.writeFileSync(nftConfigPath, nftConfigContent);
    console.log(`✅ NFT contract address updated from ${oldNftAddress} to ${NFT_ADDRESS}`);
  } catch (error) {
    console.error(`❌ Error updating NFT config file: ${error.message}`);
  }
  
  // Update Marketplace contract address in config721MarketPlace.js
  try {
    console.log(`\nUpdating Marketplace contract address in ${marketplaceConfigPath}...`);
    
    // Read the current file content
    let marketplaceConfigContent = fs.readFileSync(marketplaceConfigPath, 'utf8');
    
    // Create a backup of the original file
    const marketplaceBackupPath = `${marketplaceConfigPath}.bak`;
    fs.writeFileSync(marketplaceBackupPath, marketplaceConfigContent);
    console.log(`Backup created at ${marketplaceBackupPath}`);
    
    // Replace the contract address
    const oldMarketplaceAddressRegex = /(export const CUSTOM_TOKEN_ADDRESS_721_MARKET_PLACE = ")([^"]+)(")/;
    const oldMarketplaceAddress = marketplaceConfigContent.match(oldMarketplaceAddressRegex)[2];
    
    marketplaceConfigContent = marketplaceConfigContent.replace(oldMarketplaceAddressRegex, `$1${MARKETPLACE_ADDRESS}$3`);
    
    // Write the updated content back to the file
    fs.writeFileSync(marketplaceConfigPath, marketplaceConfigContent);
    console.log(`✅ Marketplace contract address updated from ${oldMarketplaceAddress} to ${MARKETPLACE_ADDRESS}`);
  } catch (error) {
    console.error(`❌ Error updating Marketplace config file: ${error.message}`);
  }
  
  console.log("\n=== Summary ===");
  console.log("Frontend configuration files have been updated with the new contract addresses.");
  console.log("Backups of the original files have been created with .bak extension.");
  console.log("You should rebuild the frontend application to apply these changes.");
}

// Execute the script
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
