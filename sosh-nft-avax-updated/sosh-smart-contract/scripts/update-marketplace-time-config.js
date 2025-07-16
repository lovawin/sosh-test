// Script to update the marketplace time configuration
// This script updates the minTimeDifference to 60 seconds (1 minute)
// while keeping other time configuration values the same

const hre = require("hardhat");
const { ethers } = hre;
require("dotenv").config();

async function main() {
  try {
    console.log("Starting marketplace time configuration update...");

    // Get the marketplace contract address from the environment or config
    const MARKETPLACE_ADDRESS = process.env.MARKETPLACE_PROXY_ADDRESS || "0x25ad5b58a78c1cC1aF3C83607448D0D203158F06";
    
    // Use the admin wallet provided by the user
    const adminPrivateKey = "7dd6156bd42710512863a2b374c6b3e01d24307df8674bc37c229c4e4496e653";
    const adminAddress = "0xDBca3Ea7E2A3aE047d1775954226B71Ad60179C2";
    
    // Create a provider and connect the admin wallet
    const provider = new ethers.JsonRpcProvider("https://api.avax-test.network/ext/bc/C/rpc");
    const adminWallet = new ethers.Wallet(adminPrivateKey, provider);
    console.log(`Using admin account: ${adminWallet.address}`);
    
    const marketplaceABI = [
      "function maxSaleDuration() view returns (uint256)",
      "function minSaleDuration() view returns (uint256)",
      "function minTimeDifference() view returns (uint256)",
      "function extensionDuration() view returns (uint256)",
      "function minSaleUpdateDuration() view returns (uint256)",
      "function adminUpdateTimeConfigs(uint256 _maxSaleDuration, uint256 _minSaleDuration, uint256 _minTimeDifference, uint256 _extensionDuration, uint256 _minSaleUpdateDuration) external"
    ];
    
    const marketplace = new ethers.Contract(
      MARKETPLACE_ADDRESS,
      marketplaceABI,
      adminWallet
    );
    
    // Get current time configuration values
    const maxSaleDuration = await marketplace.maxSaleDuration();
    const minSaleDuration = await marketplace.minSaleDuration();
    const currentMinTimeDifference = await marketplace.minTimeDifference();
    const extensionDuration = await marketplace.extensionDuration();
    const minSaleUpdateDuration = await marketplace.minSaleUpdateDuration();
    
    console.log("Current time configuration:");
    console.log(`- maxSaleDuration: ${maxSaleDuration.toString()} seconds (${Math.floor(Number(maxSaleDuration.toString()) / 86400)} days)`);
    console.log(`- minSaleDuration: ${minSaleDuration.toString()} seconds (${Math.floor(Number(minSaleDuration.toString()) / 60)} minutes)`);
    console.log(`- minTimeDifference: ${currentMinTimeDifference.toString()} seconds (${Math.floor(Number(currentMinTimeDifference.toString()) / 60)} minutes)`);
    console.log(`- extensionDuration: ${extensionDuration.toString()} seconds (${Math.floor(Number(extensionDuration.toString()) / 60)} minutes)`);
    console.log(`- minSaleUpdateDuration: ${minSaleUpdateDuration.toString()} seconds (${Math.floor(Number(minSaleUpdateDuration.toString()) / 86400)} days)`);
    
    // Set new minTimeDifference to 60 seconds (1 minute)
    const newMinTimeDifference = 60; // 1 minute in seconds
    
    console.log("\nUpdating minTimeDifference to 60 seconds (1 minute)...");
    
    // Call the adminUpdateTimeConfigs function with the new values
    const tx = await marketplace.adminUpdateTimeConfigs(
      maxSaleDuration,
      minSaleDuration,
      newMinTimeDifference,
      extensionDuration,
      minSaleUpdateDuration
    );
    
    console.log(`Transaction hash: ${tx.hash}`);
    console.log("Waiting for transaction confirmation...");
    
    await tx.wait();
    
    // Verify the new configuration
    const updatedMinTimeDifference = await marketplace.minTimeDifference();
    
    console.log("\nUpdated time configuration:");
    console.log(`- minTimeDifference: ${updatedMinTimeDifference.toString()} seconds (${Math.floor(Number(updatedMinTimeDifference.toString()) / 60)} minutes)`);
    
    console.log("\nMarketplace time configuration updated successfully!");
  } catch (error) {
    console.error("Error updating marketplace time configuration:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
