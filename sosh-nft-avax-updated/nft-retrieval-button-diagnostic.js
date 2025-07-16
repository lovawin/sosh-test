/**
 * NFT Retrieval Button Diagnostic Script
 * 
 * This script analyzes a specific NFT to determine why the "Retrieve" button 
 * may not be appearing despite the sale having expired.
 * 
 * Usage:
 *   node nft-retrieval-button-diagnostic.js <tokenId> [userAddress]
 * 
 * Example:
 *   node nft-retrieval-button-diagnostic.js 12 0x7411e7942f4c8271d4e636429f374997fdaede17
 */

const { Web3 } = require('web3');
const fs = require('fs');
const path = require('path');

// Load configuration
const config = {
  MARKETPLACE_ADDRESS: '0x25ad5b58a78c1cC1aF3C83607448D0D203158F06', // Marketplace proxy address
  MARKETPLACE_IMPLEMENTATION: '0x4d7BbCf22d663d69E02fc88d65dbA73D1bB9e711', // Marketplace implementation address
  NFT_ADDRESS: '0x7CA1eA6d19A1df7d17fEaF0eA9a1dEFA0e37f894', // NFT proxy address
  NFT_IMPLEMENTATION: '0xb86C57E455F714a5F456CaF0AFBf6da1161dB69e' // NFT implementation address
};

// Connect to the blockchain
const web3 = new Web3('https://api.avax-test.network/ext/bc/C/rpc');

// ABI definitions
const marketplaceABI = [
  {
    "inputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "name": "reserveSale",
    "outputs": [
      {"internalType": "address payable", "name": "seller", "type": "address"},
      {"internalType": "address payable", "name": "buyer", "type": "address"},
      {"internalType": "uint256", "name": "askPrice", "type": "uint256"},
      {"internalType": "uint256", "name": "receivedPrice", "type": "uint256"},
      {"internalType": "uint256", "name": "tokenId", "type": "uint256"},
      {"internalType": "enum SoshMarketplace.SaleType", "name": "saleType", "type": "uint8"},
      {"internalType": "enum SoshMarketplace.SaleStatus", "name": "status", "type": "uint8"},
      {"internalType": "uint256", "name": "startTime", "type": "uint256"},
      {"internalType": "uint256", "name": "endTime", "type": "uint256"},
      {"internalType": "uint256", "name": "minBidIncrement", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "saleIdTracker",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "saleId", "type": "uint256"}],
    "name": "finalizeExpiredSale",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

const nftABI = [
  {
    "inputs": [{"internalType": "uint256", "name": "tokenId", "type": "uint256"}],
    "name": "ownerOf",
    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  }
];

// Sale status mapping
const saleStatusMap = {
  0: "Closed",
  1: "Open",
  2: "Cancel"
};

// Sale type mapping
const saleTypeMap = {
  0: "Auction",
  1: "Direct"
};

async function diagnoseRetrievalButton(tokenId, userAddress) {
  console.log(`=== NFT Retrieval Button Diagnostic for Token #${tokenId} ===`);
  
  // Contract instances
  const marketplaceContract = new web3.eth.Contract(
    marketplaceABI,
    config.MARKETPLACE_ADDRESS
  );
  
  const nftContract = new web3.eth.Contract(
    nftABI,
    config.NFT_ADDRESS
  );
  
  // Get all sales for this token
  const saleCount = await marketplaceContract.methods.saleIdTracker().call();
  let tokenSales = [];
  
  console.log(`Searching through ${saleCount} sales for token #${tokenId}...`);
  
  for (let i = 1; i <= saleCount; i++) {
    try {
      const sale = await marketplaceContract.methods.reserveSale(i).call();
      if (Number(sale.tokenId) == Number(tokenId)) {
        tokenSales.push({
          saleId: i,
          seller: sale.seller,
          buyer: sale.buyer,
          askPrice: web3.utils.fromWei(sale.askPrice.toString(), 'ether'),
          tokenId: Number(sale.tokenId),
          saleType: saleTypeMap[Number(sale.saleType)] || `Unknown (${sale.saleType})`,
          status: saleStatusMap[Number(sale.status)] || `Unknown (${sale.status})`,
          statusCode: Number(sale.status),
          startTime: new Date(Number(sale.startTime) * 1000).toISOString(),
          endTime: new Date(Number(sale.endTime) * 1000).toISOString(),
          isExpired: Number(sale.endTime) < Math.floor(Date.now() / 1000)
        });
      }
    } catch (error) {
      console.error(`Error checking sale #${i}:`, error.message);
    }
  }
  
  console.log(`\nFound ${tokenSales.length} sales for token #${tokenId}:`);
  console.table(tokenSales);
  
  // Check current owner
  let currentOwner;
  try {
    currentOwner = await nftContract.methods.ownerOf(tokenId).call();
    console.log(`\nCurrent owner of token #${tokenId}: ${currentOwner}`);
    console.log(`Marketplace address: ${config.MARKETPLACE_ADDRESS}`);
    console.log(`Is owned by marketplace: ${currentOwner.toLowerCase() === config.MARKETPLACE_ADDRESS.toLowerCase()}`);
  } catch (error) {
    console.error(`Error checking ownership:`, error.message);
  }
  
  // Check if user is seller
  if (userAddress) {
    console.log(`\nChecking if user ${userAddress} is the seller of any sales:`);
    const userSales = tokenSales.filter(sale => 
      sale.seller.toLowerCase() === userAddress.toLowerCase()
    );
    console.log(`User is seller for ${userSales.length} sales`);
    console.table(userSales);
  }
  
  // Analyze retrieval button visibility
  console.log("\n=== Retrieval Button Visibility Analysis ===");
  
  for (const sale of tokenSales) {
    const isUserSeller = userAddress && sale.seller.toLowerCase() === userAddress.toLowerCase();
    const isMarketplaceOwner = currentOwner && currentOwner.toLowerCase() === config.MARKETPLACE_ADDRESS.toLowerCase();
    const isExpired = sale.isExpired;
    const isOpen = sale.statusCode === 1;
    
    console.log(`\nSale #${sale.saleId}:`);
    console.log(`- Is user the seller? ${isUserSeller}`);
    console.log(`- Is marketplace the owner? ${isMarketplaceOwner}`);
    console.log(`- Is sale expired? ${isExpired}`);
    console.log(`- Is sale open (status 1)? ${isOpen}`);
    
    const shouldShowButton = isUserSeller && isMarketplaceOwner && isExpired;
    const canRetrieve = isUserSeller && isMarketplaceOwner && isExpired && isOpen;
    
    console.log(`\nShould show button (based on UI logic)? ${shouldShowButton}`);
    console.log(`Can actually retrieve (based on contract requirements)? ${canRetrieve}`);
    
    if (shouldShowButton && !canRetrieve) {
      console.log(`\n⚠️ ISSUE DETECTED: Button would show but retrieval would fail because sale status is ${sale.status} (needs to be Open/1)`);
    } else if (!shouldShowButton && canRetrieve) {
      console.log(`\n⚠️ ISSUE DETECTED: Button would not show but retrieval would succeed`);
    }
    
    // Provide recommendations
    console.log("\n=== Recommendations ===");
    
    if (!isMarketplaceOwner) {
      console.log("❌ The marketplace is not the current owner of this NFT. The NFT may have already been retrieved or transferred.");
    } else if (!isExpired) {
      console.log("❌ The sale has not expired yet. Wait until the end time has passed.");
    } else if (!isUserSeller) {
      console.log("❌ The current user is not the seller of this NFT. Only the seller can retrieve the NFT.");
    } else if (!isOpen) {
      console.log(`❌ The sale status is ${sale.status} (${sale.statusCode}), but it needs to be Open (1) for retrieval.`);
      console.log("   This may require administrative intervention to reset the sale status.");
    } else {
      console.log("✅ All conditions are met for the Retrieve button to appear and function correctly.");
      console.log(`   You can manually call finalizeExpiredSale(${sale.saleId}) to retrieve the NFT.`);
    }
  }
}

// Get token ID from command line
const tokenId = process.argv[2];
const userAddress = process.argv[3];

if (!tokenId) {
  console.error("Please provide a token ID as the first argument");
  console.log("Usage: node nft-retrieval-button-diagnostic.js <tokenId> [userAddress]");
  process.exit(1);
}

diagnoseRetrievalButton(tokenId, userAddress)
  .then(() => process.exit(0))
  .catch(error => {
    console.error("Error in diagnostic:", error);
    process.exit(1);
  });
