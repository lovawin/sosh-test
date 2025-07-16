/**
 * Deployment script for the marketplace ABI fix
 * 
 * This script deploys the fix for the marketplace ABI loading issue
 * that was causing the "marketplaceContract.methods.saleIdTracker is not a function" error.
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

// Configuration
const SSH_KEY_PATH = "../taurien";
const SERVER_USER = "taurien";
const SERVER_IP = "3.216.178.231";
const BACKEND_PATH = "backend-update/app/routes/marketplace.js";
const LOCAL_FILE_PATH = path.join(__dirname, "sosh_nft_Backend/app/routes/marketplace.js");

// Backup the original file on the server
async function backupOriginalFile() {
  console.log("Creating backup of the original marketplace.js file on the server...");
  
  try {
    const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
    const backupCommand = `ssh -i "${SSH_KEY_PATH}" ${SERVER_USER}@${SERVER_IP} "cp ${BACKEND_PATH} ${BACKEND_PATH}.backup-${timestamp}"`;
    
    const { stdout, stderr } = await execPromise(backupCommand);
    
    if (stderr && !stderr.includes("Warning")) {
      throw new Error(`Error creating backup: ${stderr}`);
    }
    
    console.log("Backup created successfully.");
    return true;
  } catch (error) {
    console.error("Failed to create backup:", error.message);
    return false;
  }
}

// Copy the updated file to the server
async function copyUpdatedFile() {
  console.log("Copying updated marketplace.js file to the server...");
  
  try {
    // Ensure the file exists locally
    if (!fs.existsSync(LOCAL_FILE_PATH)) {
      throw new Error(`Local file not found: ${LOCAL_FILE_PATH}`);
    }
    
    const copyCommand = `scp -i "${SSH_KEY_PATH}" "${LOCAL_FILE_PATH}" ${SERVER_USER}@${SERVER_IP}:${BACKEND_PATH}`;
    
    const { stdout, stderr } = await execPromise(copyCommand);
    
    if (stderr && !stderr.includes("Warning")) {
      throw new Error(`Error copying file: ${stderr}`);
    }
    
    console.log("File copied successfully.");
    return true;
  } catch (error) {
    console.error("Failed to copy file:", error.message);
    return false;
  }
}

// Restart the backend server
async function restartBackendServer() {
  console.log("Restarting the backend server...");
  
  try {
    const restartCommand = `ssh -i "${SSH_KEY_PATH}" ${SERVER_USER}@${SERVER_IP} "sudo docker restart sosh-backend-app"`;
    
    const { stdout, stderr } = await execPromise(restartCommand);
    
    if (stderr && !stderr.includes("Warning")) {
      throw new Error(`Error restarting server: ${stderr}`);
    }
    
    console.log("Backend server restarted successfully.");
    return true;
  } catch (error) {
    console.error("Failed to restart server:", error.message);
    return false;
  }
}

// Main deployment function
async function deploy() {
  console.log("Starting deployment of marketplace ABI fix...");
  
  try {
    // Step 1: Backup the original file
    const backupSuccess = await backupOriginalFile();
    if (!backupSuccess) {
      throw new Error("Backup failed. Aborting deployment.");
    }
    
    // Step 2: Copy the updated file
    const copySuccess = await copyUpdatedFile();
    if (!copySuccess) {
      throw new Error("File copy failed. Aborting deployment.");
    }
    
    // Step 3: Restart the backend server
    const restartSuccess = await restartBackendServer();
    if (!restartSuccess) {
      throw new Error("Server restart failed. The file was copied, but the server may not be using the updated version.");
    }
    
    console.log("Deployment completed successfully!");
    console.log("The marketplace ABI fix has been deployed and the backend server has been restarted.");
    console.log("The 'Retrieve' button should now appear correctly for expired listings.");
  } catch (error) {
    console.error("Deployment failed:", error.message);
    console.error("Please check the logs and try again.");
  }
}

// Run the deployment
deploy();
