/**
 * Check MongoDB Marketplace Logs
 * 
 * This script connects to the MongoDB database on the production server
 * and checks the marketplace_logs collection for the enhanced ownership logging.
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const SERVER = 'taurien@3.216.178.231';
const SSH_KEY_PATH = '../taurien';
const MONGO_CONTAINER = 'sosh-mongo-db';
const LOCAL_LOG_PATH = path.join(__dirname, 'marketplace-mongo-logs.json');

// Execute SSH command
function executeSSHCommand(command) {
  return new Promise((resolve, reject) => {
    exec(`ssh -i "${SSH_KEY_PATH}" ${SERVER} "${command}"`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing command: ${error.message}`);
        return reject(error);
      }
      if (stderr) {
        console.error(`Command stderr: ${stderr}`);
      }
      resolve(stdout);
    });
  });
}

// Main function
async function checkMongoMarketplaceLogs() {
  console.log('=== Checking MongoDB Marketplace Logs ===');
  
  try {
    // Simple MongoDB query to check recent logs
    const mongoQuery = 'db.marketplace_logs.find().sort({timestamp:-1}).limit(10)';
    
    // Execute the MongoDB query inside the container
    console.log('Executing MongoDB query...');
    const command = `sudo docker exec ${MONGO_CONTAINER} mongo --quiet --eval "${mongoQuery}"`;
    const logs = await executeSSHCommand(command);
    
    // Save the logs to a file
    fs.writeFileSync(LOCAL_LOG_PATH, logs);
    console.log(`MongoDB logs saved to ${LOCAL_LOG_PATH}`);
    
    // Parse and analyze the logs
    console.log('\nAnalyzing MongoDB logs...');
    
    // Count the number of logs
    const logCount = (logs.match(/ObjectId/g) || []).length;
    console.log(`Found ${logCount} logs`);
    
    // Check for specific fields
    const currentOwnerCount = (logs.match(/currentOwner/g) || []).length;
    const isMarketplaceOwnerCount = (logs.match(/isMarketplaceOwner/g) || []).length;
    const ownershipCheckCount = (logs.match(/OWNERSHIP_CHECK/g) || []).length;
    const dataValidationCount = (logs.match(/DATA_PROPERTY_VALIDATION/g) || []).length;
    
    console.log(`Logs with currentOwner field: ${currentOwnerCount}`);
    console.log(`Logs with isMarketplaceOwner field: ${isMarketplaceOwnerCount}`);
    console.log(`OWNERSHIP_CHECK logs: ${ownershipCheckCount}`);
    console.log(`DATA_PROPERTY_VALIDATION logs: ${dataValidationCount}`);
    
    console.log('\nCheck the saved log file for more details.');
    
  } catch (error) {
    console.error('Error checking MongoDB marketplace logs:', error);
  }
}

// Run the main function
checkMongoMarketplaceLogs();
