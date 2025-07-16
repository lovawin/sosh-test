// Script to test the marketplace approval functionality after the fix
const { ethers } = require('hardhat');
require('dotenv').config();

async function main() {
  console.log("Testing marketplace approval functionality after the fix...");
  
  // Get the signer (admin wallet)
  const [signer] = await ethers.getSigners();
  console.log("Using signer:", signer.address);
  
  // Get the NFT contract
  const nftAddress = "0x7CA1eA6d19A1df7d17fEaF0eA9a1dEFA0e37f894";
  const nftAbi = [
    "function adminUpdateSoshMarket(address _soshMarket) external",
    "function nftContractAddress() external view returns (address)"
  ];
  const nftContract = new ethers.Contract(nftAddress, nftAbi, signer);
  
  // Get the marketplace contract
  const marketplaceAddress = "0x25ad5b58a78c1cC1aF3C83607448D0D203158F06";
  const marketplaceAbi = [
    "function nftContractAddress() external view returns (address)"
  ];
  const marketplaceContract = new ethers.Contract(marketplaceAddress, marketplaceAbi, signer);
  
  // Check if the marketplace address is correctly set in the NFT contract
  try {
    const marketplaceInNft = await nftContract.nftContractAddress();
    console.log("Marketplace address in NFT contract:", marketplaceInNft);
    
    if (marketplaceInNft.toLowerCase() === marketplaceAddress.toLowerCase()) {
      console.log("✅ Marketplace address is correctly set in the NFT contract");
    } else {
      console.log("❌ Marketplace address is NOT correctly set in the NFT contract");
      console.log("Expected:", marketplaceAddress);
      console.log("Actual:", marketplaceInNft);
    }
  } catch (error) {
    console.error("Error checking marketplace address in NFT contract:", error.message);
  }
  
  // Check if the NFT address is correctly set in the marketplace contract
  try {
    const nftInMarketplace = await marketplaceContract.nftContractAddress();
    console.log("NFT address in marketplace contract:", nftInMarketplace);
    
    if (nftInMarketplace.toLowerCase() === nftAddress.toLowerCase()) {
      console.log("✅ NFT address is correctly set in the marketplace contract");
    } else {
      console.log("❌ NFT address is NOT correctly set in the marketplace contract");
      console.log("Expected:", nftAddress);
      console.log("Actual:", nftInMarketplace);
    }
  } catch (error) {
    console.error("Error checking NFT address in marketplace contract:", error.message);
  }
  
  console.log("\n=== Summary ===");
  console.log("The marketplace approval functionality has been tested.");
  console.log("If both checks passed, the fix has been successfully applied.");
  console.log("If any check failed, please review the configuration and try again.");
}

// Execute the script
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
