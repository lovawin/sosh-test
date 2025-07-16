/**
 * Server-side NFT Retrieval Diagnostic Script
 * 
 * This script checks the blockchain and database for NFT listings
 * to diagnose issues with the NFT retrieval feature.
 * 
 * Usage:
 * 1. Set your wallet address in the WALLET_ADDRESS variable
 * 2. Run with: node server-retrieval-diagnostic.js
 */

const Web3 = require('web3');
const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');

// Configuration
const WALLET_ADDRESS = ""; // Set your wallet address here (the one you use on the website)
const TOKEN_IDS = [1, 2]; // The token IDs we're interested in
const MONGODB_URI = "mongodb://localhost:27017/sosh"; // Update with your MongoDB connection string

// Load ABI files
const marketplaceABI = require('./sosh-smart-contract/artifacts/contracts/sosh_marketplace/SoshMarketplace.sol/SoshMarketplace.json').abi;
const nftABI = require('./sosh-smart-contract/artifacts/contracts/sosh_minting/SoshNFT.sol/SoshNFT.json').abi;

// Load configuration
const config = require('./frontend/src/common/config721MarketPlace');

// Connect to the blockchain
const web3 = new Web3(new Web3.providers.HttpProvider('https://api.avax-test.network/ext/bc/C/rpc'));

// Contract instances
const marketplaceContract = new web3.eth.Contract(
  marketplaceABI,
  config.CUSTOM_TOKEN_ADDRESS_721_MARKET_PLACE
);

const nftContract = new web3.eth.Contract(
  nftABI,
  config.NFT_ADDRESS || "" // This will be populated from the marketplace contract if not available
);

// Helper function to format timestamps
function formatTimestamp(timestamp) {
  return new Date(timestamp * 1000).toLocaleString();
}

// Helper function to check if a timestamp is in the past
function isExpired(timestamp) {
  const now = Math.floor(Date.now() / 1000);
  return timestamp < now;
}

// Main diagnostic function
async function runDiagnostic() {
  console.log("=== Server-side NFT Retrieval Diagnostic ===");
  
  if (!WALLET_ADDRESS) {
    console.error("Error: Please set your wallet address in the WALLET_ADDRESS variable");
    return;
  }
  
  console.log(`Wallet Address: ${WALLET_ADDRESS}`);
  console.log(`Token IDs: ${TOKEN_IDS.join(', ')}`);
  console.log(`Marketplace Contract: ${config.CUSTOM_TOKEN_ADDRESS_721_MARKET_PLACE}`);
  
  try {
    // 1. Check NFT Contract Address
    console.log("\n1. Checking NFT Contract Address...");
    const nftContractAddress = await marketplaceContract.methods.nftContractAddress().call();
    console.log(`NFT Contract Address: ${nftContractAddress}`);
    
    // 2. Check NFT Ownership
    console.log("\n2. Checking NFT Ownership...");
    for (const tokenId of TOKEN_IDS) {
      try {
        const owner = await nftContract.methods.ownerOf(tokenId).call();
        console.log(`Token #${tokenId} Owner: ${owner}`);
        console.log(`Is owned by marketplace: ${owner.toLowerCase() === config.CUSTOM_TOKEN_ADDRESS_721_MARKET_PLACE.toLowerCase()}`);
        console.log(`Is owned by user: ${owner.toLowerCase() === WALLET_ADDRESS.toLowerCase()}`);
      } catch (error) {
        console.error(`Error checking ownership of Token #${tokenId}:`, error.message);
      }
    }
    
    // 3. Check Sale IDs
    console.log("\n3. Checking Sale IDs...");
    const saleIdTracker = await marketplaceContract.methods.saleIdTracker().call();
    console.log(`Total number of sales: ${saleIdTracker}`);
    
    // 4. Check Sales for our tokens
    console.log("\n4. Checking Sales for our tokens...");
    const relevantSales = [];
    
    for (let saleId = 1; saleId <= saleIdTracker; saleId++) {
      try {
        const sale = await marketplaceContract.methods.reserveSale(saleId).call();
        
        // Check if this sale is for one of our tokens
        if (TOKEN_IDS.includes(parseInt(sale.tokenId))) {
          console.log(`\nFound sale #${saleId} for token #${sale.tokenId}:`);
          console.log(`- Seller: ${sale.seller}`);
          console.log(`- Is seller our wallet: ${sale.seller.toLowerCase() === WALLET_ADDRESS.toLowerCase()}`);
          console.log(`- Buyer: ${sale.buyer}`);
          console.log(`- Ask Price: ${web3.utils.fromWei(sale.askPrice, 'ether')} ETH`);
          console.log(`- Sale Type: ${sale.saleType}`); // 0 = Fixed Price, 1 = Auction
          console.log(`- Status: ${sale.status}`); // 0 = Open, 1 = Pending, 2 = Closed
          console.log(`- Start Time: ${formatTimestamp(sale.startTime)} (${sale.startTime})`);
          console.log(`- End Time: ${formatTimestamp(sale.endTime)} (${sale.endTime})`);
          console.log(`- Is Expired: ${isExpired(sale.endTime)}`);
          
          relevantSales.push({
            saleId,
            tokenId: sale.tokenId,
            seller: sale.seller,
            status: sale.status,
            startTime: sale.startTime,
            endTime: sale.endTime,
            isExpired: isExpired(sale.endTime)
          });
        }
      } catch (error) {
        console.error(`Error checking sale #${saleId}:`, error.message);
      }
    }
    
    // 5. Check MongoDB for listings
    console.log("\n5. Checking MongoDB for listings...");
    let mongoClient;
    
    try {
      mongoClient = new MongoClient(MONGODB_URI);
      await mongoClient.connect();
      console.log("Connected to MongoDB");
      
      const db = mongoClient.db();
      
      // Check assets collection
      const assets = await db.collection('assets').find({
        token_id: { $in: TOKEN_IDS.map(id => id.toString()) }
      }).toArray();
      
      console.log(`Found ${assets.length} assets in the database:`);
      for (const asset of assets) {
        console.log(`\nAsset for token #${asset.token_id}:`);
        console.log(`- _id: ${asset._id}`);
        console.log(`- Owner: ${asset.owner}`);
        console.log(`- Is owner our wallet: ${asset.owner === WALLET_ADDRESS}`);
        console.log(`- Sale ID: ${asset.saleId || 'Not set'}`);
        console.log(`- End Time: ${asset.endTime ? formatTimestamp(asset.endTime) : 'Not set'}`);
        console.log(`- Is Expired: ${asset.endTime ? isExpired(asset.endTime) : 'N/A'}`);
      }
      
      // Check marketplace_logs collection
      const logs = await db.collection('marketplace_logs').find({
        'message.tokenId': { $in: TOKEN_IDS.map(id => id.toString()) }
      }).sort({ timestamp: -1 }).limit(10).toArray();
      
      console.log(`\nFound ${logs.length} recent logs for our tokens:`);
      for (const log of logs) {
        console.log(`\nLog from ${new Date(log.timestamp).toLocaleString()}:`);
        console.log(`- Type: ${log.message.type}`);
        console.log(`- Token ID: ${log.message.tokenId}`);
        console.log(`- Operation: ${log.message.operation || 'N/A'}`);
        if (log.message.error) {
          console.log(`- Error: ${log.message.error.message}`);
        }
      }
    } catch (error) {
      console.error("MongoDB Error:", error);
    } finally {
      if (mongoClient) {
        await mongoClient.close();
        console.log("MongoDB connection closed");
      }
    }
    
    // 6. Summary and Recommendations
    console.log("\n=== Diagnostic Summary ===");
    console.log(`- NFT Contract Address: ${nftContractAddress}`);
    console.log(`- Relevant Sales Found: ${relevantSales.length}`);
    
    // Check for expired open sales
    const expiredOpenSales = relevantSales.filter(sale => 
      sale.status === '0' && sale.isExpired && sale.seller.toLowerCase() === WALLET_ADDRESS.toLowerCase()
    );
    
    console.log(`- Expired Open Sales Found: ${expiredOpenSales.length}`);
    
    if (expiredOpenSales.length > 0) {
      console.log("\nExpired sales that should show Retrieve button:");
      for (const sale of expiredOpenSales) {
        console.log(`- Sale #${sale.saleId} for Token #${sale.tokenId} (Expired: ${formatTimestamp(sale.endTime)})`);
      }
      
      console.log("\nRecommendations:");
      console.log("1. Verify the frontend is correctly checking for expired listings");
      console.log("2. Check if the saleId is being passed to the frontend data");
      console.log("3. Verify the isExpired state is being set correctly in the PostCard component");
      console.log("4. Try manually retrieving the NFT using the test-retrieve-nft.js script");
    } else {
      console.log("\nNo expired open sales found that would qualify for the Retrieve button.");
      console.log("\nPossible issues:");
      console.log("1. The listings may not actually be expired (check end times)");
      console.log("2. The listings may not be in 'Open' status");
      console.log("3. You may not be the original seller of the NFTs");
      console.log("4. The NFTs may not be owned by the marketplace contract");
    }
    
  } catch (error) {
    console.error("Error during diagnostic:", error);
  }
  
  console.log("\n=== End of Diagnostic ===");
}

// Run the diagnostic
runDiagnostic()
  .then(() => process.exit(0))
  .catch(error => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
