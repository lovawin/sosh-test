/**
 * Deploy Marketplace Cleanup Service
 * 
 * This script deploys the marketplace cleanup service to the production server.
 * It copies the necessary files and sets up the service to run as a cron job.
 * 
 * Usage: node deploy-marketplace-cleanup.js
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Configuration
const CONFIG = {
  // SSH key path
  sshKeyPath: '../taurien',
  
  // Remote server details
  remoteUser: 'taurien',
  remoteHost: '3.216.178.231',
  remoteDir: 'marketplace-cleanup',
  
  // Files to deploy
  filesToDeploy: [
    'marketplace-cleanup-service.js',
    'test-marketplace-cleanup.js'
  ],
  
  // Environment variables for the service
  envVars: {
    MARKETPLACE_ADDRESS: '',
    NETWORK: 'testnet', // Default to testnet, can be 'mainnet' or 'testnet'
    RPC_ENDPOINT: '', // Will be set based on network if empty
    CLEANUP_INTERVAL: '3600000',
    CLEANUP_BATCH_SIZE: '50',
    CLEANUP_MIN_EXPIRED_AGE: '3600',
    GAS_PRICE_MULTIPLIER: '1.1',
    MAX_GAS_PRICE: '100',
    TEST_MODE: 'false',
    CRON_JOB: 'true'
  }
};

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

/**
 * Execute a shell command
 */
function executeCommand(command) {
  return new Promise((resolve, reject) => {
    console.log(`Executing: ${command}`);
    
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error: ${error.message}`);
        return reject(error);
      }
      
      if (stderr) {
        console.error(`stderr: ${stderr}`);
      }
      
      console.log(`stdout: ${stdout}`);
      resolve(stdout);
    });
  });
}

/**
 * Ask for user input
 */
function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

/**
 * Deploy the service
 */
async function deploy() {
  try {
    console.log('=== Deploying Marketplace Cleanup Service ===\n');
    
    // Ask which network to deploy to
    const network = await askQuestion('Which network do you want to deploy to? (testnet/mainnet) [default: testnet]: ');
    if (network.toLowerCase() === 'mainnet') {
      CONFIG.envVars.NETWORK = 'mainnet';
      console.log('Deploying to Avalanche Mainnet');
      console.log('RPC Endpoint: https://api.avax.network/ext/bc/C/rpc');
    } else {
      CONFIG.envVars.NETWORK = 'testnet';
      console.log('Deploying to Avalanche Fuji Testnet');
      console.log('RPC Endpoint: https://api.avax-test.network/ext/bc/C/rpc');
    }
    
    // Ask for marketplace address if not provided
    if (!CONFIG.envVars.MARKETPLACE_ADDRESS) {
      CONFIG.envVars.MARKETPLACE_ADDRESS = await askQuestion(`Enter the marketplace contract address on ${CONFIG.envVars.NETWORK}: `);
    }
    
    // Ask for service private key
    const servicePrivateKey = await askQuestion('Enter the service account private key (will not be displayed): ');
    CONFIG.envVars.SERVICE_PRIVATE_KEY = servicePrivateKey;
    
    // Create remote directory if it doesn't exist
    await executeCommand(`ssh -i "${CONFIG.sshKeyPath}" ${CONFIG.remoteUser}@${CONFIG.remoteHost} "mkdir -p ${CONFIG.remoteDir}"`);
    
    // Create .env file
    const envFileContent = Object.entries(CONFIG.envVars)
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');
    
    const tempEnvFile = path.join(__dirname, '.env.temp');
    fs.writeFileSync(tempEnvFile, envFileContent);
    
    // Copy .env file to remote server
    await executeCommand(`scp -i "${CONFIG.sshKeyPath}" ${tempEnvFile} ${CONFIG.remoteUser}@${CONFIG.remoteHost}:${CONFIG.remoteDir}/.env`);
    
    // Delete temporary .env file
    fs.unlinkSync(tempEnvFile);
    
    // Copy service files to remote server
    for (const file of CONFIG.filesToDeploy) {
      await executeCommand(`scp -i "${CONFIG.sshKeyPath}" ${path.join(__dirname, file)} ${CONFIG.remoteUser}@${CONFIG.remoteHost}:${CONFIG.remoteDir}/${file}`);
    }
    
    // Set up cron job
    const cronCommand = `(crontab -l 2>/dev/null || echo "") | grep -v "marketplace-cleanup-service.js" | { cat; echo "0 * * * * cd ~/${CONFIG.remoteDir} && node marketplace-cleanup-service.js >> cleanup.log 2>&1"; } | crontab -`;
    await executeCommand(`ssh -i "${CONFIG.sshKeyPath}" ${CONFIG.remoteUser}@${CONFIG.remoteHost} "${cronCommand}"`);
    
    console.log('\n=== Deployment Complete ===');
    console.log(`The marketplace cleanup service has been deployed to ${CONFIG.remoteHost}:${CONFIG.remoteDir}`);
    console.log('It will run every hour via cron job.');
    console.log('\nTo test the service:');
    console.log(`1. SSH into the server: ssh -i "${CONFIG.sshKeyPath}" ${CONFIG.remoteUser}@${CONFIG.remoteHost}`);
    console.log(`2. Navigate to the directory: cd ${CONFIG.remoteDir}`);
    console.log('3. Run the test script: node test-marketplace-cleanup.js');
    
    console.log('\nTo check the logs:');
    console.log(`1. SSH into the server: ssh -i "${CONFIG.sshKeyPath}" ${CONFIG.remoteUser}@${CONFIG.remoteHost}`);
    console.log(`2. Navigate to the directory: cd ${CONFIG.remoteDir}`);
    console.log('3. View the log file: cat cleanup.log');
  } catch (error) {
    console.error('Error during deployment:', error);
  } finally {
    rl.close();
  }
}

// Run the deployment
deploy();
