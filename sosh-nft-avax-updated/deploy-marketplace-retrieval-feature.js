/**
 * Marketplace Retrieval Feature Deployment Script
 * 
 * This script automates the deployment of the NFT retrieval feature.
 * It builds the frontend with the updated code and deploys it to the production server.
 * 
 * Usage:
 * node deploy-marketplace-retrieval-feature.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Configuration
const config = {
  frontendDir: path.join(__dirname, 'frontend'),
  sshKeyPath: '../taurien', // Update this with the correct path to your SSH key
  remoteUser: 'taurien', // Update this with your remote username
  remoteHost: '3.216.178.231', // Update this with your remote host
  remoteDir: '~/frontend-update',
  containerName: 'frontend-update-sosh-nft-fe-1' // Update this with your frontend container name
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
 * Create a backup of the postCard.js file
 */
function backupFiles() {
  console.log('\n--- Creating backups ---');
  
  const backupDir = path.join(__dirname, 'backups', 'frontend');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  
  // Create backup directory if it doesn't exist
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
    console.log(`Created backup directory: ${backupDir}`);
  }
  
  // Backup postCard.js
  const sourceFile = path.join(config.frontendDir, 'src', 'components', 'myProfileComponents', 'postCards', 'postCard.js');
  const backupFile = path.join(backupDir, `postCard.js.${timestamp}`);
  
  fs.copyFileSync(sourceFile, backupFile);
  console.log(`Backed up ${sourceFile} to ${backupFile}`);
}

/**
 * Build the frontend
 */
function buildFrontend() {
  console.log('\n--- Building frontend ---');
  
  // Navigate to frontend directory
  process.chdir(config.frontendDir);
  
  // Install dependencies
  console.log('Installing dependencies...');
  exec('npm install');
  
  // Build frontend
  console.log('Building frontend...');
  exec('npm run build');
  
  // Create tar archive of build directory
  console.log('Creating tar archive of build directory...');
  exec('tar -cf build.tar build/');
  
  console.log('Frontend build completed successfully.');
}

/**
 * Deploy the frontend to the production server
 */
function deployFrontend() {
  console.log('\n--- Deploying frontend ---');
  
  // Navigate to frontend directory
  process.chdir(config.frontendDir);
  
  // Transfer build files to production server
  console.log('Transferring build files to production server...');
  exec(`scp -i "${config.sshKeyPath}" build.tar ${config.remoteUser}@${config.remoteHost}:${config.remoteDir}/`);
  
  // Extract build files and restart frontend container
  console.log('Extracting build files and restarting frontend container...');
  exec(`ssh -i "${config.sshKeyPath}" ${config.remoteUser}@${config.remoteHost} "cd ${config.remoteDir} && tar -xf build.tar && sudo docker restart ${config.containerName}"`);
  
  console.log('Frontend deployment completed successfully.');
}

/**
 * Main function
 */
async function main() {
  console.log('=== Marketplace Retrieval Feature Deployment ===');
  
  // Confirm deployment
  rl.question('Are you sure you want to deploy the marketplace retrieval feature? (y/n) ', (answer) => {
    if (answer.toLowerCase() !== 'y') {
      console.log('Deployment cancelled.');
      rl.close();
      return;
    }
    
    try {
      // Backup files
      backupFiles();
      
      // Build frontend
      buildFrontend();
      
      // Deploy frontend
      deployFrontend();
      
      console.log('\n=== Deployment completed successfully ===');
      console.log('Please verify the feature by testing the NFT retrieval process.');
      console.log('Monitor the marketplace logs for RETRIEVAL_ATTEMPT events to confirm the retrieval functionality is working correctly.');
    } catch (error) {
      console.error('\n=== Deployment failed ===');
      console.error(error.message);
    } finally {
      rl.close();
    }
  });
}

// Run main function
main();
