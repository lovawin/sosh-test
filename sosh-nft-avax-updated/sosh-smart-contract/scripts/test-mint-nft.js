// Script to test minting an NFT with the new contracts
const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
  console.log("Testing NFT minting with new contracts...");
  
  // Get the addresses of the deployed contracts
  // You can replace these with the actual addresses or set them as environment variables
  const NFT_ADDRESS = process.env.NEW_NFT_ADDRESS || "REPLACE_WITH_NEW_NFT_ADDRESS";
  
  // Validate the addresses
  if (NFT_ADDRESS === "REPLACE_WITH_NEW_NFT_ADDRESS") {
    console.error("ERROR: You must set the NEW_NFT_ADDRESS environment variable or update this script with the actual address");
    process.exit(1);
  }
  
  console.log("NFT contract address:", NFT_ADDRESS);
  
  // Get the NFT contract instance
  const SoshNFT = await ethers.getContractFactory("SoshNFT");
  const nft = await SoshNFT.attach(NFT_ADDRESS);
  
  // Get the signer (deployer)
  const [deployer] = await ethers.getSigners();
  console.log("Testing with account:", deployer.address);
  
  // Get the current mint fee
  const mintFee = await nft.mintFee();
  console.log("Current mint fee:", ethers.utils.formatEther(mintFee), "AVAX");
  
  // Prepare mint parameters
  const recipient = deployer.address; // Mint to the deployer's address
  const tokenURI = "ipfs://QmExample123456789"; // Example IPFS URI
  
  console.log("Minting NFT to:", recipient);
  console.log("Token URI:", tokenURI);
  
  // Mint the NFT
  try {
    const mintTx = await nft.mintWithRoyalty(
      recipient,
      tokenURI,
      { value: mintFee }
    );
    
    console.log("Mint transaction submitted:", mintTx.hash);
    console.log("Waiting for transaction confirmation...");
    
    const receipt = await mintTx.wait();
    console.log("Transaction confirmed in block:", receipt.blockNumber);
    
    // Find the Minted event
    const mintedEvent = receipt.events.find(event => event.event === 'Minted');
    if (mintedEvent) {
      const tokenId = mintedEvent.args.tokenId.toString();
      console.log("✅ NFT minted successfully!");
      console.log("Token ID:", tokenId);
      
      // Get the token owner
      const owner = await nft.ownerOf(tokenId);
      console.log("Token owner:", owner);
      
      // Get the token URI
      const uri = await nft.tokenURI(tokenId);
      console.log("Token URI:", uri);
    } else {
      console.log("❌ Minted event not found in transaction receipt");
    }
  } catch (error) {
    console.error("❌ Error minting NFT:", error.message);
    
    // Check if the error is due to insufficient funds
    if (error.message.includes("insufficient funds")) {
      console.error("Make sure the deployer account has enough AVAX to pay the mint fee");
    }
    
    // Check if the error is due to paused contract
    if (error.message.includes("Pausable: paused")) {
      console.error("The NFT contract is paused. An admin needs to unpause it first.");
    }
  }
}

// Execute the test
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
