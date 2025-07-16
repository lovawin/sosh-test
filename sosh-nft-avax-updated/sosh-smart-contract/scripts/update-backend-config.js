// Script to update backend configuration with new contract addresses
const fs = require('fs');
const path = require('path');
require("dotenv").config();

async function main() {
  console.log("Updating backend configuration with new contract addresses...");
  
  // Get the addresses of the deployed contracts
  // You can replace these with the actual addresses or set them as environment variables
  const TREASURY_ADDRESS = process.env.NEW_TREASURY_ADDRESS || "REPLACE_WITH_NEW_TREASURY_ADDRESS";
  const MARKETPLACE_ADDRESS = process.env.NEW_MARKETPLACE_ADDRESS || "REPLACE_WITH_NEW_MARKETPLACE_ADDRESS";
  const ADMIN_ADDRESS = "0xDBca3Ea7E2A3aE047d1775954226B71Ad60179C2"; // New admin wallet address
  
  // Validate the addresses
  if (TREASURY_ADDRESS === "REPLACE_WITH_NEW_TREASURY_ADDRESS") {
    console.error("ERROR: You must set the NEW_TREASURY_ADDRESS environment variable or update this script with the actual address");
    process.exit(1);
  }
  
  if (MARKETPLACE_ADDRESS === "REPLACE_WITH_NEW_MARKETPLACE_ADDRESS") {
    console.error("ERROR: You must set the NEW_MARKETPLACE_ADDRESS environment variable or update this script with the actual address");
    process.exit(1);
  }
  
  console.log("New Treasury address:", TREASURY_ADDRESS);
  console.log("New Marketplace address:", MARKETPLACE_ADDRESS);
  console.log("New Admin address:", ADMIN_ADDRESS);
  
  // Define path to the backend configuration file
  const backendDir = path.join(__dirname, '..', '..', 'sosh_nft_Backend', 'config', 'prod');
  const envFilePath = path.join(backendDir, 'dev.env');
  
  // Update backend configuration
  try {
    console.log(`Updating backend configuration in ${envFilePath}...`);
    
    // Read the current file content
    let envContent = fs.readFileSync(envFilePath, 'utf8');
    
    // Create a backup of the original file
    const backupPath = `${envFilePath}.bak`;
    fs.writeFileSync(backupPath, envContent);
    console.log(`Backup created at ${backupPath}`);
    
    // Replace the Treasury address
    const treasuryRegex = /(TreasuryAddress=)([^\r\n]+)/;
    const oldTreasuryAddress = envContent.match(treasuryRegex)[2];
    envContent = envContent.replace(treasuryRegex, `$1${TREASURY_ADDRESS}`);
    
    // Replace the Admin address
    const adminRegex = /(adminAddress=)([^\r\n]+)/;
    const oldAdminAddress = envContent.match(adminRegex)[2];
    envContent = envContent.replace(adminRegex, `$1${ADMIN_ADDRESS}`);
    
    // Replace the Marketplace address
    const marketplaceRegex = /(MARKETPLACE_PROXY_ADDRESS=)([^\r\n]+)/;
    const oldMarketplaceAddress = envContent.match(marketplaceRegex)?.[2] || "not found";
    
    if (oldMarketplaceAddress !== "not found") {
      envContent = envContent.replace(marketplaceRegex, `$1${MARKETPLACE_ADDRESS}`);
    } else {
      // If MARKETPLACE_PROXY_ADDRESS doesn't exist, add it to the end of the file
      envContent += `\nMARKETPLACE_PROXY_ADDRESS=${MARKETPLACE_ADDRESS}`;
    }
    
    // Write the updated content back to the file
    fs.writeFileSync(envFilePath, envContent);
    
    console.log(`✅ Treasury address updated from ${oldTreasuryAddress} to ${TREASURY_ADDRESS}`);
    console.log(`✅ Admin address updated from ${oldAdminAddress} to ${ADMIN_ADDRESS}`);
    
    if (oldMarketplaceAddress !== "not found") {
      console.log(`✅ Marketplace address updated from ${oldMarketplaceAddress} to ${MARKETPLACE_ADDRESS}`);
    } else {
      console.log(`✅ Marketplace address added: ${MARKETPLACE_ADDRESS}`);
    }
  } catch (error) {
    console.error(`❌ Error updating backend config file: ${error.message}`);
  }
  
  console.log("\n=== Summary ===");
  console.log("Backend configuration file has been updated with the new contract addresses.");
  console.log("A backup of the original file has been created with .bak extension.");
  console.log("You should restart the backend service to apply these changes.");
}

// Execute the script
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
