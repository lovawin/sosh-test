/**
 * Script to check marketplace approval logs
 * 
 * This script connects to the MongoDB database and retrieves logs related to
 * NFT marketplace approval operations, displaying them in a readable format
 * to help diagnose approval-related issues.
 */

const { MongoClient } = require('mongodb');
require('dotenv').config();

// MongoDB connection string
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sosh_nft';
const DB_NAME = process.env.MONGODB_NAME || 'sosh_nft';
const LOGS_COLLECTION = 'marketplace_logs';

// ANSI color codes for better readability
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m'
};

// Helper function to format timestamps
function formatTimestamp(timestamp) {
  if (!timestamp) return 'N/A';
  
  try {
    const date = new Date(timestamp);
    return date.toLocaleString();
  } catch (e) {
    return timestamp;
  }
}

// Helper function to format JSON for display
function formatJSON(obj, indent = 2) {
  return JSON.stringify(obj, null, indent);
}

// Helper function to truncate long strings
function truncate(str, maxLength = 100) {
  if (!str || str.length <= maxLength) return str;
  return str.substring(0, maxLength) + '...';
}

// Helper function to print a section header
function printSectionHeader(title) {
  const line = '='.repeat(80);
  console.log(`\n${colors.bright}${colors.cyan}${line}`);
  console.log(`${title}`);
  console.log(`${line}${colors.reset}\n`);
}

// Helper function to print a log entry
function printLogEntry(log, detailed = false) {
  const message = log.message || {};
  const timestamp = formatTimestamp(message.timestamp || log.timestamp);
  const type = message.type || 'UNKNOWN';
  const level = message.level || 'INFO';
  const tokenId = message.tokenId || 'N/A';
  const operation = message.operation || '';
  
  // Determine color based on log level
  let levelColor = colors.white;
  if (level === 'ERROR') levelColor = colors.red;
  if (level === 'WARN') levelColor = colors.yellow;
  if (level === 'INFO') levelColor = colors.green;
  
  // Print basic log info
  console.log(`${colors.bright}${colors.blue}[${timestamp}]${colors.reset} ${levelColor}${level}${colors.reset} ${colors.magenta}${type}${colors.reset} ${operation ? `(${operation})` : ''} - Token ID: ${tokenId}`);
  
  // Print success/failure status if available
  if (message.success !== undefined) {
    const successColor = message.success ? colors.green : colors.red;
    const successText = message.success ? 'SUCCESS' : 'FAILURE';
    console.log(`${successColor}${successText}${colors.reset}`);
  }
  
  // Print user address if available
  if (message.userAddress) {
    console.log(`User: ${message.userAddress}`);
  }
  
  // Print marketplace address if available
  if (message.marketplaceAddress) {
    console.log(`Marketplace: ${message.marketplaceAddress}`);
  }
  
  // Print transaction hash if available
  if (message.transactionHash) {
    console.log(`Transaction: ${message.transactionHash}`);
  }
  
  // Print error details if available
  if (message.error) {
    console.log(`${colors.red}Error: ${message.error.message || 'Unknown error'}${colors.reset}`);
    
    if (detailed && message.error.code) {
      console.log(`Error Code: ${message.error.code}`);
    }
    
    if (detailed && message.error.stack) {
      console.log(`Stack Trace: ${truncate(message.error.stack, 200)}`);
    }
  }
  
  // Print additional details in detailed mode
  if (detailed) {
    // Print context if available
    if (message.context) {
      console.log(`\nContext:`);
      console.log(formatJSON(message.context));
    }
    
    // Print environment if available
    if (message.environment) {
      console.log(`\nEnvironment:`);
      console.log(formatJSON(message.environment));
    }
    
    // Print any other fields
    const skipFields = ['timestamp', 'type', 'level', 'tokenId', 'operation', 'success', 'userAddress', 'marketplaceAddress', 'transactionHash', 'error', 'context', 'environment'];
    const otherFields = Object.keys(message).filter(key => !skipFields.includes(key));
    
    if (otherFields.length > 0) {
      console.log(`\nAdditional Details:`);
      otherFields.forEach(key => {
        console.log(`${key}: ${typeof message[key] === 'object' ? formatJSON(message[key]) : message[key]}`);
      });
    }
  }
  
  console.log(''); // Empty line for separation
}

// Main function to query and display logs
async function checkApprovalLogs(options = {}) {
  const { tokenId, limit = 20, detailed = false, includeListingLogs = false } = options;
  
  let client;
  try {
    // Connect to MongoDB
    client = new MongoClient(MONGO_URI);
    await client.connect();
    console.log(`${colors.green}Connected to MongoDB${colors.reset}`);
    
    const db = client.db(DB_NAME);
    const collection = db.collection(LOGS_COLLECTION);
    
    // Build query based on options
    const query = {
      $or: [
        { 'message.type': 'APPROVAL_ATTEMPT' },
        { 'message.type': 'APPROVAL_RESULT' },
        { 'message.type': 'APPROVAL_SKIPPED' },
        { 'message.type': 'APPROVAL_VERIFICATION_FAILED' },
        { 'message.operation': 'APPROVAL' }
      ]
    };
    
    // Add token ID filter if provided
    if (tokenId) {
      query['message.tokenId'] = tokenId.toString();
    }
    
    // Include listing logs if requested
    if (includeListingLogs) {
      query.$or = query.$or.concat([
        { 'message.type': 'LISTING_ATTEMPT' },
        { 'message.type': 'LISTING_RESULT' },
        { 'message.operation': 'LISTING' },
        { 'message.operation': 'CREATE_SALE' }
      ]);
    }
    
    // Query logs
    const logs = await collection.find(query)
      .sort({ timestamp: -1 })
      .limit(limit)
      .toArray();
    
    if (logs.length === 0) {
      console.log(`${colors.yellow}No approval logs found${tokenId ? ` for token ID ${tokenId}` : ''}${colors.reset}`);
      return;
    }
    
    // Display logs
    printSectionHeader(`Found ${logs.length} approval logs${tokenId ? ` for token ID ${tokenId}` : ''}`);
    
    // Group logs by token ID for better readability
    const logsByToken = {};
    logs.forEach(log => {
      const tokenId = log.message?.tokenId || 'unknown';
      if (!logsByToken[tokenId]) {
        logsByToken[tokenId] = [];
      }
      logsByToken[tokenId].push(log);
    });
    
    // Print logs grouped by token ID
    Object.keys(logsByToken).forEach(tokenId => {
      printSectionHeader(`Logs for Token ID: ${tokenId}`);
      logsByToken[tokenId].forEach(log => {
        printLogEntry(log, detailed);
      });
    });
    
  } catch (error) {
    console.error(`${colors.red}Error:${colors.reset}`, error);
  } finally {
    if (client) {
      await client.close();
      console.log(`${colors.green}Disconnected from MongoDB${colors.reset}`);
    }
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  tokenId: null,
  limit: 20,
  detailed: false,
  includeListingLogs: false
};

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--token-id' && args[i + 1]) {
    options.tokenId = args[i + 1];
    i++;
  } else if (args[i] === '--limit' && args[i + 1]) {
    options.limit = parseInt(args[i + 1], 10);
    i++;
  } else if (args[i] === '--detailed') {
    options.detailed = true;
  } else if (args[i] === '--include-listing') {
    options.includeListingLogs = true;
  } else if (args[i] === '--help') {
    console.log(`
Usage: node check-approval-logs.js [options]

Options:
  --token-id <id>     Filter logs by token ID
  --limit <number>    Limit the number of logs to display (default: 20)
  --detailed          Show detailed log information
  --include-listing   Include listing-related logs
  --help              Show this help message
    `);
    process.exit(0);
  }
}

// Run the script
checkApprovalLogs(options).catch(console.error);
