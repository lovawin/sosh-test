/**
 * Deployment script for the NFT retrieval button fix
 * 
 * This script deploys both frontend and backend changes to fix the NFT retrieval button issue.
 */

const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

// Configuration
const SSH_KEY_PATH = "../taurien";
const SERVER_USER = "taurien";
const SERVER_IP = "3.216.178.231";
const FRONTEND_REMOTE_PATH = "frontend-update";
const BACKEND_REMOTE_PATH = "backend-update";

// Helper function to execute commands
function executeCommand(command) {
  return new Promise((resolve, reject) => {
    console.log(`Executing: ${command}`);
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error: ${error.message}`);
        return reject(error);
      }
      if (stderr) {
        console.log(`stderr: ${stderr}`);
      }
      console.log(`stdout: ${stdout}`);
      resolve(stdout);
    });
  });
}

// Deploy frontend changes
async function deployFrontend() {
  try {
    console.log('Deploying frontend changes...');
    
    // Copy the tar file to the server
    await executeCommand(`scp -i "${SSH_KEY_PATH}" frontend/build.tar.gz ${SERVER_USER}@${SERVER_IP}:${FRONTEND_REMOTE_PATH}/build.tar.gz`);
    
    // Extract the tar file on the server
    await executeCommand(`ssh -i "${SSH_KEY_PATH}" ${SERVER_USER}@${SERVER_IP} "tar -xzf ${FRONTEND_REMOTE_PATH}/build.tar.gz -C ${FRONTEND_REMOTE_PATH}/build"`);
    
    // Restart the frontend server
    await executeCommand(`ssh -i "${SSH_KEY_PATH}" ${SERVER_USER}@${SERVER_IP} "sudo docker restart frontend-update-sosh-nft-fe-1"`);
    
    console.log('Frontend deployment completed successfully!');
  } catch (error) {
    console.error('Frontend deployment failed:', error);
    throw error;
  }
}

// Deploy backend changes
async function deployBackend() {
  try {
    console.log('Deploying backend changes...');
    
    // Copy the updated marketplace.js file to the server
    await executeCommand(`scp -i "${SSH_KEY_PATH}" sosh_nft_Backend/app/routes/marketplace.js ${SERVER_USER}@${SERVER_IP}:${BACKEND_REMOTE_PATH}/app/routes/marketplace.js`);
    
    // Restart the backend server
    await executeCommand(`ssh -i "${SSH_KEY_PATH}" ${SERVER_USER}@${SERVER_IP} "sudo docker restart sosh-backend-app"`);
    
    console.log('Backend deployment completed successfully!');
  } catch (error) {
    console.error('Backend deployment failed:', error);
    throw error;
  }
}

// Main function to deploy both frontend and backend
async function deploy() {
  try {
    console.log('Starting deployment process...');
    
    // Deploy frontend first
    await deployFrontend();
    
    // Then deploy backend
    await deployBackend();
    
    console.log('Deployment completed successfully!');
  } catch (error) {
    console.error('Deployment failed:', error);
    process.exit(1);
  }
}

// Run the deployment
deploy();
