/**
 * Marketplace Cleanup Service
 * 
 * This service periodically checks for expired sales and calls the cleanupExpiredSales function
 * to clean them up. It can be run as a standalone service or as a cron job.
 * 
 * Usage: node marketplace-cleanup-service.js
 */

require('dotenv').config();
const Web3 = require('web3');
const { logger } = require('./app/logging');
const fs = require('fs');
const path = require('path');

// Network configurations
const NETWORKS = {
  mainnet: {
    name: 'Avalanche Mainnet',
    rpcEndpoint: 'https://api.avax.network/ext/bc/C/rpc',
    chainId: 43114,
    blockExplorerUrl: 'https://snowtrace.io'
  },
  testnet: {
    name: 'Avalanche Fuji Testnet',
    rpcEndpoint: 'https://api.avax-test.network/ext/bc/C/rpc',
    chainId: 43113,
    blockExplorerUrl: 'https://testnet.snowtrace.io'
  }
};

// Configuration
const CONFIG = {
  // How often to run the cleanup (in milliseconds)
  cleanupInterval: process.env.CLEANUP_INTERVAL || 3600000, // Default: 1 hour
  
  // Maximum number of sales to process in a single batch
  batchSize: process.env.CLEANUP_BATCH_SIZE || 50,
  
  // Minimum age of expired sales to clean up (in seconds)
  minExpiredAge: process.env.CLEANUP_MIN_EXPIRED_AGE || 3600, // Default: 1 hour
  
  // Network to use (mainnet or testnet)
  network: process.env.NETWORK || 'testnet',
  
  // RPC endpoint (will be set based on network)
  rpcEndpoint: null,
  
  // Contract addresses
  marketplaceAddress: process.env.MARKETPLACE_ADDRESS,
  
  // Private key for the service account
  privateKey: process.env.SERVICE_PRIVATE_KEY,
  
  // Gas price multiplier (1.1 = 10% higher than current gas price)
  gasPriceMultiplier: process.env.GAS_PRICE_MULTIPLIER || 1.1,
  
  // Maximum gas price (in gwei)
  maxGasPrice: process.env.MAX_GAS_PRICE || 100,
  
  // Whether to run in test mode (doesn't actually send transactions)
  testMode: process.env.TEST_MODE === 'true',
};

// Set RPC endpoint based on network
if (CONFIG.network === 'mainnet') {
  CONFIG.rpcEndpoint = process.env.RPC_ENDPOINT || NETWORKS.mainnet.rpcEndpoint;
  logger.info(`Using Avalanche Mainnet: ${CONFIG.rpcEndpoint}`);
} else {
  CONFIG.rpcEndpoint = process.env.RPC_ENDPOINT || NETWORKS.testnet.rpcEndpoint;
  logger.info(`Using Avalanche Fuji Testnet: ${CONFIG.rpcEndpoint}`);
}

// Validate configuration
if (!CONFIG.marketplaceAddress) {
  console.error('Error: MARKETPLACE_ADDRESS environment variable is not set');
  process.exit(1);
}

if (!CONFIG.privateKey && !CONFIG.testMode) {
  console.error('Error: SERVICE_PRIVATE_KEY environment variable is not set');
  console.error('If you want to run in test mode, set TEST_MODE=true');
  process.exit(1);
}

// Load ABI
const MARKETPLACE_ABI_PATH = path.join(__dirname, 'sosh-smart-contract/artifacts/contracts/sosh_marketplace/SoshMarketplace.sol/SoshMarketplace.json');
let MARKETPLACE_ABI;

try {
  const abiFile = fs.readFileSync(MARKETPLACE_ABI_PATH, 'utf8');
  const abiJson = JSON.parse(abiFile);
  MARKETPLACE_ABI = abiJson.abi;
} catch (error) {
  console.error(`Error loading ABI from ${MARKETPLACE_ABI_PATH}:`, error);
  process.exit(1);
}

// Initialize Web3
const web3 = new Web3(CONFIG.rpcEndpoint);
const marketplaceContract = new web3.eth.Contract(MARKETPLACE_ABI, CONFIG.marketplaceAddress);

// Set up account if not in test mode
let account;
if (!CONFIG.testMode) {
  account = web3.eth.accounts.privateKeyToAccount(CONFIG.privateKey);
  web3.eth.accounts.wallet.add(account);
}

/**
 * Find expired sales that need to be cleaned up
 */
async function findExpiredSales() {
  try {
    logger.info('Finding expired sales to clean up...');
    
    // Get the current block timestamp
    const currentBlock = await web3.eth.getBlock('latest');
    const currentTimestamp = currentBlock.timestamp;
    const cutoffTimestamp = currentTimestamp - CONFIG.minExpiredAge;
    
    // We need to find sales that:
    // 1. Are still open
    // 2. Have passed their end time
    // 3. Have no buyer
    
    // Since there's no easy way to query this directly from the contract,
    // we'll use events to find recently created sales, then check each one
    
    // Get recent SaleCreated events
    const events = await marketplaceContract.getPastEvents('SaleCreated', {
      fromBlock: currentBlock.number - 10000, // Look back ~1 day (assuming ~8.6s block time)
      toBlock: 'latest'
    });
    
    logger.info(`Found ${events.length} recent sales`);
    
    // Check each sale to see if it's expired
    const expiredSaleIds = [];
    
    for (const event of events) {
      const saleId = event.returnValues.saleId;
      
      // Get the sale details
      const sale = await marketplaceContract.methods.reserveSale(saleId).call();
      
      // Check if the sale is expired and needs cleanup
      if (
        sale.status === '1' && // Open
        parseInt(sale.endTime) < cutoffTimestamp && // Expired for at least minExpiredAge
        sale.buyer === '0x0000000000000000000000000000000000000000' // No buyer
      ) {
        expiredSaleIds.push(saleId);
        
        if (expiredSaleIds.length >= CONFIG.batchSize) {
          break; // Don't process more than batchSize at once
        }
      }
    }
    
    logger.info(`Found ${expiredSaleIds.length} expired sales to clean up`);
    return expiredSaleIds;
  } catch (error) {
    logger.error('Error finding expired sales:', error);
    return [];
  }
}

/**
 * Clean up a batch of expired sales
 */
async function cleanupExpiredSales(saleIds) {
  if (saleIds.length === 0) {
    logger.info('No expired sales to clean up');
    return;
  }
  
  logger.info(`Cleaning up ${saleIds.length} expired sales: ${saleIds.join(', ')}`);
  
  if (CONFIG.testMode) {
    logger.info('TEST MODE: Would clean up sales:', saleIds);
    return;
  }
  
  try {
    // Get the current gas price and apply the multiplier
    const gasPrice = await web3.eth.getGasPrice();
    const adjustedGasPrice = Math.min(
      Math.floor(gasPrice * CONFIG.gasPriceMultiplier),
      web3.utils.toWei(CONFIG.maxGasPrice.toString(), 'gwei')
    );
    
    // Estimate gas for the transaction
    const gasEstimate = await marketplaceContract.methods.cleanupExpiredSales(saleIds).estimateGas({
      from: account.address
    });
    
    // Add a 10% buffer to the gas estimate
    const gasLimit = Math.floor(gasEstimate * 1.1);
    
    // Send the transaction
    const tx = await marketplaceContract.methods.cleanupExpiredSales(saleIds).send({
      from: account.address,
      gas: gasLimit,
      gasPrice: adjustedGasPrice
    });
    
    logger.info(`Cleanup transaction sent: ${tx.transactionHash}`);
    logger.info(`Gas used: ${tx.gasUsed}`);
    
    // Log each cleaned up sale
    for (const saleId of saleIds) {
      logger.info(`Cleaned up sale ${saleId}`);
    }
  } catch (error) {
    logger.error('Error cleaning up expired sales:', error);
  }
}

/**
 * Main cleanup function
 */
async function runCleanup() {
  logger.info('Starting marketplace cleanup...');
  
  try {
    // Find expired sales
    const expiredSaleIds = await findExpiredSales();
    
    // Clean them up
    await cleanupExpiredSales(expiredSaleIds);
    
    logger.info('Marketplace cleanup completed');
  } catch (error) {
    logger.error('Error during marketplace cleanup:', error);
  }
}

// Run the cleanup immediately
runCleanup();

// If running as a service, set up the interval
if (!process.env.CRON_JOB) {
  logger.info(`Setting up cleanup interval: ${CONFIG.cleanupInterval}ms`);
  
  setInterval(runCleanup, CONFIG.cleanupInterval);
  
  logger.info('Marketplace cleanup service started');
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  logger.info('Marketplace cleanup service shutting down...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger.info('Marketplace cleanup service shutting down...');
  process.exit(0);
});

// Export for testing
module.exports = {
  findExpiredSales,
  cleanupExpiredSales,
  runCleanup
};
