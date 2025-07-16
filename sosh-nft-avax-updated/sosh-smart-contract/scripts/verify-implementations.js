// Script to verify implementation contracts on Snowtrace
const { run } = require("hardhat");
require("dotenv").config();

// Implementation addresses provided by the user
const IMPLEMENTATION_ADDRESSES = {
  nft: "0xb86C57E455F714a5F456CaF0AFBf6da1161dB69e",
  marketplace: "0x4d7BbCf22d663d69E02fc88d65dbA73D1bB9e711"
};

// Proxy addresses for reference
const PROXY_ADDRESSES = {
  nft: process.env.NEW_NFT_ADDRESS || "0x7CA1eA6d19A1df7d17fEaF0eA9a1dEFA0e37f894",
  marketplace: process.env.NEW_MARKETPLACE_ADDRESS || "0x25ad5b58a78c1cC1aF3C83607448D0D203158F06"
};

async function main() {
  console.log("Verifying implementation contracts on Snowtrace...");
  console.log("NFT implementation address:", IMPLEMENTATION_ADDRESSES.nft);
  console.log("Marketplace implementation address:", IMPLEMENTATION_ADDRESSES.marketplace);
  console.log("\nProxy addresses for reference:");
  console.log("NFT proxy address:", PROXY_ADDRESSES.nft);
  console.log("Marketplace proxy address:", PROXY_ADDRESSES.marketplace);
  
  // Verify NFT implementation contract
  console.log("\n=== Verifying NFT Implementation Contract ===");
  try {
    await run("verify:verify", {
      address: IMPLEMENTATION_ADDRESSES.nft,
      constructorArguments: [],
      contract: "contracts/sosh_minting/SoshNFT.sol:SoshNFT"
    });
    console.log("✅ NFT implementation contract verified successfully");
  } catch (error) {
    if (error.message.includes("Already Verified")) {
      console.log("✅ NFT implementation contract already verified");
    } else {
      console.error("❌ NFT implementation contract verification failed:", error.message);
    }
  }
  
  // Verify Marketplace implementation contract
  console.log("\n=== Verifying Marketplace Implementation Contract ===");
  try {
    await run("verify:verify", {
      address: IMPLEMENTATION_ADDRESSES.marketplace,
      constructorArguments: [],
      contract: "contracts/sosh_marketplace/SoshMarketplace.sol:SoshMarketplace"
    });
    console.log("✅ Marketplace implementation contract verified successfully");
  } catch (error) {
    if (error.message.includes("Already Verified")) {
      console.log("✅ Marketplace implementation contract already verified");
    } else {
      console.error("❌ Marketplace implementation contract verification failed:", error.message);
    }
  }
  
  console.log("\n=== Verification Complete ===");
  console.log("You can now view the implementation contracts on Snowtrace:");
  console.log(`NFT implementation: https://testnet.snowtrace.io/address/${IMPLEMENTATION_ADDRESSES.nft}#code`);
  console.log(`Marketplace implementation: https://testnet.snowtrace.io/address/${IMPLEMENTATION_ADDRESSES.marketplace}#code`);
  
  console.log("\n=== Next Steps ===");
  console.log("1. After verification, you can view the full contract code and ABI");
  console.log("2. This will help you understand the available functions and parameters");
  console.log("3. Remember to interact with the proxy addresses, not the implementation addresses");
  console.log(`4. To update minTimeDifference, use the proxy address: ${PROXY_ADDRESSES.marketplace}`);
}

// Execute the script
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
