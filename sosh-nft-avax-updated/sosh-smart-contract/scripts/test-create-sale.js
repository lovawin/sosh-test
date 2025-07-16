// Script to test creating a sale with the new contracts
const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
  console.log("Testing sale creation with new contracts...");
  
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
  
  console.log("NFT contract address:", NFT_ADDRESS);
  console.log("Marketplace contract address:", MARKETPLACE_ADDRESS);
  
  // Get the contract instances
  const SoshNFT = await ethers.getContractFactory("SoshNFT");
  const nft = await SoshNFT.attach(NFT_ADDRESS);
  
  const SoshMarketplace = await ethers.getContractFactory("SoshMarketplace");
  const marketplace = await SoshMarketplace.attach(MARKETPLACE_ADDRESS);
  
  // Get the signer (deployer)
  const [deployer] = await ethers.getSigners();
  console.log("Testing with account:", deployer.address);
  
  // First, we need to mint an NFT to create a sale for
  console.log("\n=== Step 1: Minting a new NFT ===");
  
  // Get the current mint fee
  const mintFee = await nft.mintFee();
  console.log("Current mint fee:", ethers.utils.formatEther(mintFee), "AVAX");
  
  // Prepare mint parameters
  const recipient = deployer.address; // Mint to the deployer's address
  const tokenURI = "ipfs://QmSaleTest123456789"; // Example IPFS URI
  
  console.log("Minting NFT to:", recipient);
  console.log("Token URI:", tokenURI);
  
  let tokenId;
  
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
      tokenId = mintedEvent.args.tokenId.toString();
      console.log("✅ NFT minted successfully!");
      console.log("Token ID:", tokenId);
    } else {
      console.log("❌ Minted event not found in transaction receipt");
      process.exit(1);
    }
  } catch (error) {
    console.error("❌ Error minting NFT:", error.message);
    process.exit(1);
  }
  
  // Now create a sale for the minted NFT
  console.log("\n=== Step 2: Creating a sale for the NFT ===");
  
  // Check if the marketplace is approved to transfer the NFT
  const isApproved = await nft.isApprovedForAll(deployer.address, MARKETPLACE_ADDRESS);
  if (!isApproved) {
    console.log("Approving marketplace to transfer NFTs...");
    const approveTx = await nft.setApprovalForAll(MARKETPLACE_ADDRESS, true);
    await approveTx.wait();
    console.log("✅ Marketplace approved to transfer NFTs");
  } else {
    console.log("Marketplace already approved to transfer NFTs");
  }
  
  // Prepare sale parameters
  const saleType = 0; // 0 for fixed price, 1 for auction
  const askPrice = ethers.utils.parseEther("0.1"); // 0.1 AVAX
  
  // Set sale duration (start now, end in 7 days)
  const now = Math.floor(Date.now() / 1000);
  const startTime = now;
  const endTime = now + (7 * 24 * 60 * 60); // 7 days from now
  
  console.log("Sale parameters:");
  console.log("- Token ID:", tokenId);
  console.log("- Sale type:", saleType === 0 ? "Fixed Price" : "Auction");
  console.log("- Ask price:", ethers.utils.formatEther(askPrice), "AVAX");
  console.log("- Start time:", new Date(startTime * 1000).toLocaleString());
  console.log("- End time:", new Date(endTime * 1000).toLocaleString());
  
  // Create the sale
  try {
    const createSaleTx = await marketplace.createSale(
      saleType,
      tokenId,
      askPrice,
      startTime,
      endTime
    );
    
    console.log("Create sale transaction submitted:", createSaleTx.hash);
    console.log("Waiting for transaction confirmation...");
    
    const receipt = await createSaleTx.wait();
    console.log("Transaction confirmed in block:", receipt.blockNumber);
    
    // Find the SaleCreated event
    const saleCreatedEvent = receipt.events.find(event => event.event === 'SaleCreated');
    if (saleCreatedEvent) {
      const saleId = saleCreatedEvent.args.saleId.toString();
      console.log("✅ Sale created successfully!");
      console.log("Sale ID:", saleId);
      
      // Get the sale details
      const sale = await marketplace.reserveSale(saleId);
      console.log("\nSale details:");
      console.log("- Seller:", sale.seller);
      console.log("- Token ID:", sale.tokenId.toString());
      console.log("- Ask price:", ethers.utils.formatEther(sale.askPrice), "AVAX");
      console.log("- Sale type:", sale.saleType === 0 ? "Fixed Price" : "Auction");
      console.log("- Status:", getSaleStatusString(sale.status));
      console.log("- Start time:", new Date(sale.startTime.toNumber() * 1000).toLocaleString());
      console.log("- End time:", new Date(sale.endTime.toNumber() * 1000).toLocaleString());
    } else {
      console.log("❌ SaleCreated event not found in transaction receipt");
    }
  } catch (error) {
    console.error("❌ Error creating sale:", error.message);
    
    // Check for common errors
    if (error.message.includes("not owner")) {
      console.error("Make sure the deployer account owns the NFT");
    }
    
    if (error.message.includes("not approved")) {
      console.error("Make sure the marketplace is approved to transfer the NFT");
    }
  }
}

// Helper function to convert sale status to string
function getSaleStatusString(status) {
  const statusMap = {
    0: "OPEN",
    1: "CLOSED",
    2: "CANCELLED"
  };
  return statusMap[status] || `UNKNOWN (${status})`;
}

// Execute the test
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
