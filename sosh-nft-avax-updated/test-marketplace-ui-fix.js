/**
 * Marketplace UI Update Fix Test Script
 * 
 * This script helps verify that the UI update fix is working correctly.
 * It monitors the marketplace logs for UI_UPDATE_ATTEMPT events.
 * 
 * Usage:
 * node test-marketplace-ui-fix.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { MongoClient } = require('mongodb');

// Configuration
const config = {
  sshKeyPath: '../taurien', // Update this with the correct path to your SSH key
  remoteUser: 'taurien', // Update this with your remote username
  remoteHost: '3.216.178.231', // Update this with your remote host
  mongoUrl: 'mongodb://localhost:27017', // MongoDB connection URL
  dbName: 'sosh_nft', // MongoDB database name
  collectionName: 'marketplace_logs', // MongoDB collection name
  localPort: 8500, // Local port for SSH tunnel
  remotePort: 27017 // Remote port for MongoDB
};

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

/**
 * Execute a command and return the output
 * @param {string} command - Command to execute
 * @param {boolean} silent - Whether to suppress console output
 * @returns {string} - Command output
 */
function exec(command, silent = false) {
  try {
    if (!silent) {
      console.log(`Executing: ${command}`);
    }
    return execSync(command, { encoding: 'utf8' });
  } catch (error) {
    console.error(`Error executing command: ${command}`);
    console.error(error.message);
    process.exit(1);
  }
}

/**
 * Set up SSH tunnel to MongoDB
 */
function setupSshTunnel() {
  console.log('\n--- Setting up SSH tunnel to MongoDB ---');
  
  // Check if tunnel is already running
  try {
    const tunnelCheck = exec(`netstat -ano | findstr :${config.localPort}`, true);
    if (tunnelCheck.includes(`127.0.0.1:${config.localPort}`)) {
      console.log(`SSH tunnel already running on port ${config.localPort}`);
      return;
    }
  } catch (error) {
    // Ignore error, tunnel is not running
  }
  
  // Start SSH tunnel
  console.log(`Starting SSH tunnel on port ${config.localPort}...`);
  const tunnelCommand = `start cmd /c ssh -i "${config.sshKeyPath}" -L ${config.localPort}:localhost:${config.remotePort} ${config.remoteUser}@${config.remoteHost}`;
  exec(tunnelCommand);
  
  // Wait for tunnel to start
  console.log('Waiting for SSH tunnel to start...');
  setTimeout(() => {
    console.log('SSH tunnel should be ready now.');
  }, 2000);
}

/**
 * Query MongoDB for UI_UPDATE_ATTEMPT events
 */
async function queryMongoDb() {
  console.log('\n--- Querying MongoDB for UI_UPDATE_ATTEMPT events ---');
  
  // Connect to MongoDB
  const client = new MongoClient(`mongodb://localhost:${config.localPort}`);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db(config.dbName);
    const collection = db.collection(config.collectionName);
    
    // Get current timestamp
    const timestamp = new Date();
    console.log(`Current timestamp: ${timestamp.toISOString()}`);
    
    // Query for UI_UPDATE_ATTEMPT events in the last 24 hours
    const yesterday = new Date(timestamp);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const query = {
      'message.type': 'UI_UPDATE_ATTEMPT',
      timestamp: { $gte: yesterday }
    };
    
    const events = await collection.find(query).sort({ timestamp: -1 }).toArray();
    
    if (events.length === 0) {
      console.log('No UI_UPDATE_ATTEMPT events found in the last 24 hours.');
      console.log('This could mean that the fix has not been triggered yet.');
      console.log('Try listing an NFT for sale and then run this script again.');
    } else {
      console.log(`Found ${events.length} UI_UPDATE_ATTEMPT events:`);
      
      events.forEach((event, index) => {
        console.log(`\nEvent ${index + 1}:`);
        console.log(`Timestamp: ${event.timestamp}`);
        console.log(`Token ID: ${event.message.tokenId}`);
        console.log(`Operation: ${event.message.operation}`);
        console.log(`Method: ${event.message.method}`);
      });
      
      console.log('\nThe UI update fix appears to be working correctly!');
    }
  } catch (error) {
    console.error('Error querying MongoDB:', error.message);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

/**
 * Main function
 */
async function main() {
  console.log('=== Marketplace UI Update Fix Test ===');
  
  try {
    // Set up SSH tunnel
    setupSshTunnel();
    
    // Wait for user to confirm tunnel is ready
    rl.question('\nPress Enter to continue once the SSH tunnel is established...', async () => {
      try {
        // Query MongoDB
        await queryMongoDb();
        
        console.log('\n=== Test completed ===');
        console.log('To verify the fix manually:');
        console.log('1. Navigate to the NFT profile page');
        console.log('2. Click "List / Sell" on an NFT');
        console.log('3. Complete the listing process');
        console.log('4. Verify that the page automatically refreshes and shows the NFT as listed for sale');
      } catch (error) {
        console.error('\n=== Test failed ===');
        console.error(error.message);
      } finally {
        rl.close();
      }
    });
  } catch (error) {
    console.error('\n=== Test failed ===');
    console.error(error.message);
    rl.close();
  }
}

// Run main function
main();
