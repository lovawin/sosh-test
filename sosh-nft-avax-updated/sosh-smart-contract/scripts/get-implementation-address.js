// Script to get the implementation address of an ERC1967 proxy
const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
  try {
    console.log("Getting implementation address for the marketplace proxy...");

    // Get the marketplace proxy address from the environment or config
    const MARKETPLACE_PROXY_ADDRESS = process.env.MARKETPLACE_PROXY_ADDRESS || "0x25ad5b58a78c1cC1aF3C83607448D0D203158F06";
    
    // Connect to the network using hardhat's ethers provider
    const provider = ethers.provider;
    
    // ERC1967 uses a specific storage slot for the implementation address
    // This is the keccak-256 hash of "eip1967.proxy.implementation" subtracted by 1
    const IMPLEMENTATION_SLOT = "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc";
    
    // Get the value at the implementation slot
    const implementationData = await provider.getStorageAt(MARKETPLACE_PROXY_ADDRESS, IMPLEMENTATION_SLOT);
    
    // Convert the data to an address (remove padding and add 0x prefix)
    const implementationAddress = ethers.utils.getAddress("0x" + implementationData.slice(-40));
    
    console.log(`Proxy address: ${MARKETPLACE_PROXY_ADDRESS}`);
    console.log(`Implementation address: ${implementationAddress}`);
    
    // Get the code at the implementation address to verify it's a contract
    const code = await provider.getCode(implementationAddress);
    if (code === "0x") {
      console.log("Warning: No code found at the implementation address. This might not be a valid contract.");
    } else {
      console.log(`Implementation contract has ${(code.length - 2) / 2} bytes of code.`);
      console.log(`\nTo view the implementation contract on Snowtrace:`);
      console.log(`https://testnet.snowtrace.io/address/${implementationAddress}#code`);
    }
    
  } catch (error) {
    console.error("Error getting implementation address:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
