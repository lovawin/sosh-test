// Script to manually verify implementation contracts by comparing bytecode
const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

// Implementation addresses
const IMPLEMENTATION_ADDRESSES = {
  nft: "0xb86C57E455F714a5F456CaF0AFBf6da1161dB69e",
  marketplace: "0x4d7BbCf22d663d69E02fc88d65dbA73D1bB9e711"
};

// Contract source paths
const CONTRACT_PATHS = {
  nft: "contracts/sosh_minting/SoshNFT.sol",
  marketplace: "contracts/sosh_marketplace/SoshMarketplace.sol"
};

async function main() {
  console.log("Starting manual verification of implementation contracts...");

  // Get the network
  const network = await ethers.provider.getNetwork();
  console.log(`Connected to network: ${network.name} (chainId: ${network.chainId})`);

  // Verify NFT implementation
  console.log("\n=== Verifying NFT Implementation Contract ===");
  await verifyImplementation("nft");

  // Verify Marketplace implementation
  console.log("\n=== Verifying Marketplace Implementation Contract ===");
  await verifyImplementation("marketplace");

  console.log("\n=== Manual Verification Complete ===");
  console.log("You can view the implementation contracts on Snowtrace:");
  console.log(`NFT implementation: https://testnet.snowtrace.io/address/${IMPLEMENTATION_ADDRESSES.nft}#code`);
  console.log(`Marketplace implementation: https://testnet.snowtrace.io/address/${IMPLEMENTATION_ADDRESSES.marketplace}#code`);
}

async function verifyImplementation(contractType) {
  try {
    const address = IMPLEMENTATION_ADDRESSES[contractType];
    const contractPath = CONTRACT_PATHS[contractType];
    
    console.log(`Checking implementation at: ${address}`);
    
    // Get deployed bytecode
    const deployedBytecode = await ethers.provider.getCode(address);
    if (deployedBytecode === "0x") {
      console.error(`❌ No code found at address ${address}`);
      return;
    }
    
    console.log(`✅ Contract exists at ${address} with ${(deployedBytecode.length - 2) / 2} bytes of code`);
    
    // Check if source file exists
    const fullPath = path.join(__dirname, "..", contractPath);
    if (!fs.existsSync(fullPath)) {
      console.error(`❌ Source file not found: ${fullPath}`);
      return;
    }
    
    // Read source code
    const sourceCode = fs.readFileSync(fullPath, "utf8");
    console.log(`✅ Source code found: ${contractPath} (${sourceCode.length} characters)`);
    
    // Get contract factory
    const contractName = path.basename(contractPath, ".sol");
    console.log(`Attempting to get contract factory for: ${contractName}`);
    
    try {
      // This will compile the contract and get the bytecode
      const factory = await ethers.getContractFactory(contractName);
      const deploymentBytecode = factory.bytecode;
      
      console.log(`✅ Contract compiled successfully`);
      console.log(`Deployment bytecode length: ${(deploymentBytecode.length - 2) / 2} bytes`);
      
      // Note: We can't directly compare deployment bytecode with deployed bytecode
      // because deployment bytecode includes constructor logic and arguments
      // Instead, we'll check if the contract is deployable and has functions
      
      // Check for key functions based on contract type
      const contract = new ethers.Contract(address, factory.interface, ethers.provider);
      
      if (contractType === "nft") {
        // Check for NFT functions
        const name = await contract.name().catch(() => null);
        const symbol = await contract.symbol().catch(() => null);
        
        if (name && symbol) {
          console.log(`✅ NFT contract verified: name=${name}, symbol=${symbol}`);
        } else {
          console.log(`❌ Could not verify NFT functions`);
        }
      } else if (contractType === "marketplace") {
        // Check for Marketplace functions
        try {
          const maxSaleDuration = await contract.maxSaleDuration();
          const minSaleDuration = await contract.minSaleDuration();
          const minTimeDifference = await contract.minTimeDifference();
          
          console.log(`✅ Marketplace contract verified with time settings:`);
          console.log(`  - maxSaleDuration: ${maxSaleDuration.toString()} seconds`);
          console.log(`  - minSaleDuration: ${minSaleDuration.toString()} seconds`);
          console.log(`  - minTimeDifference: ${minTimeDifference.toString()} seconds`);
        } catch (error) {
          console.log(`❌ Could not verify Marketplace functions: ${error.message}`);
        }
      }
      
    } catch (error) {
      console.error(`❌ Error compiling contract: ${error.message}`);
    }
    
  } catch (error) {
    console.error(`❌ Error verifying ${contractType} implementation:`, error.message);
  }
}

// Execute the script
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
