/**
 * Check Enhanced Ownership Logs
 * 
 * This script connects to the server and checks the marketplace logs
 * to see if the enhanced logging is working and if it helps identify
 * the issue with the currentOwner field.
 */

const fs = require('fs');
const { exec } = require('child_process');
const path = require('path');

// Configuration
const SERVER = 'taurien@3.216.178.231';
const SSH_KEY_PATH = '../taurien';
const LOG_PATH = '/home/taurien/backend-update/logs/prod/marketplace.log';
const LOCAL_LOG_PATH = path.join(__dirname, 'marketplace-ownership-logs.json');

// Execute SSH command to get the logs
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
async function checkEnhancedOwnershipLogs() {
  console.log('=== Checking Enhanced Ownership Logs ===');
  
  try {
    // Get the last 100 log entries
    console.log('Fetching recent marketplace logs...');
    const logs = await executeSSHCommand(`tail -n 100 ${LOG_PATH}`);
    
    // Parse the logs
    const logEntries = logs.split('\n')
      .filter(line => line.trim() !== '')
      .map(line => {
        try {
          return JSON.parse(line);
        } catch (error) {
          console.error(`Error parsing log line: ${line}`);
          return null;
        }
      })
      .filter(entry => entry !== null);
    
    // Filter for ownership-related logs
    const ownershipLogs = logEntries.filter(entry => 
      entry.type === 'OWNERSHIP_CHECK' || 
      entry.type === 'TOKEN_OWNERSHIP_CHECK' || 
      entry.type === 'OWNERSHIP_CHECK_RESULT' ||
      entry.type === 'OWNERSHIP_CHECK_ERROR' ||
      entry.type === 'DATA_PROPERTY_VALIDATION'
    );
    
    // Save the ownership logs to a file
    fs.writeFileSync(LOCAL_LOG_PATH, JSON.stringify(ownershipLogs, null, 2));
    console.log(`Ownership logs saved to ${LOCAL_LOG_PATH}`);
    
    // Analyze the logs
    console.log('\nAnalyzing ownership logs...');
    
    // Check for logs with currentOwner field
    const logsWithCurrentOwner = ownershipLogs.filter(log => log.currentOwner);
    console.log(`Logs with currentOwner field: ${logsWithCurrentOwner.length}`);
    
    // Check for logs with currentOwnerExists field
    const logsWithCurrentOwnerExists = ownershipLogs.filter(log => 'currentOwnerExists' in log);
    console.log(`Logs with currentOwnerExists field: ${logsWithCurrentOwnerExists.length}`);
    
    // Check for logs with isMarketplaceOwner field
    const logsWithIsMarketplaceOwner = ownershipLogs.filter(log => 'isMarketplaceOwner' in log);
    console.log(`Logs with isMarketplaceOwner field: ${logsWithIsMarketplaceOwner.length}`);
    
    // Check for logs with currentOwnerFieldSet field
    const logsWithCurrentOwnerFieldSet = ownershipLogs.filter(log => 'currentOwnerFieldSet' in log);
    console.log(`Logs with currentOwnerFieldSet field: ${logsWithCurrentOwnerFieldSet.length}`);
    
    // Check for logs with ownership check errors
    const ownershipCheckErrors = ownershipLogs.filter(log => log.type === 'OWNERSHIP_CHECK_ERROR');
    console.log(`Ownership check errors: ${ownershipCheckErrors.length}`);
    
    // Print the most recent ownership logs
    console.log('\nMost recent ownership logs:');
    ownershipLogs.slice(-5).forEach((log, index) => {
      console.log(`\nLog ${index + 1}:`);
      console.log(JSON.stringify(log, null, 2));
    });
    
    console.log('\nCheck the saved log file for more details.');
    
  } catch (error) {
    console.error('Error checking enhanced ownership logs:', error);
  }
}

// Run the main function
checkEnhancedOwnershipLogs();
