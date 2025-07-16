/**
 * Deployment script for the NFT retrieval button fix
 * 
 * This script deploys the changes to both frontend and backend to fix the issue
 * with the "Retrieve" button not displaying in the UI.
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const sshKeyPath = "../taurien";
const serverUser = "taurien";
const serverAddress = "3.216.178.231";
const frontendSourceDir = "sosh-nft-avax-updated/frontend";
const backendSourceDir = "sosh-nft-avax-updated/sosh_nft_Backend";
const frontendServerDir = "frontend-update";
const backendServerDir = "backend-update";

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

// Main deployment function
async function deploy() {
  try {
    console.log("Starting deployment of NFT retrieval button fix...");
    
    // Step 1: Create frontend build
    console.log("\n--- Creating frontend build ---");
    await executeCommand(`cd ${frontendSourceDir} && npm run build`);
    
    // Step 2: Create tar build file
    console.log("\n--- Creating tar build file ---");
    await executeCommand(`cd ${frontendSourceDir} && tar -czf build.tar.gz -C build .`);
    
    // Step 3: Copy tar build file to frontend server
    console.log("\n--- Copying tar build file to frontend server ---");
    await executeCommand(`scp -i "${sshKeyPath}" ${frontendSourceDir}/build.tar.gz ${serverUser}@${serverAddress}:${frontendServerDir}/build.tar.gz`);
    
    // Step 4: Extract the tar file on the server
    console.log("\n--- Extracting tar file on server ---");
    await executeCommand(`ssh -i "${sshKeyPath}" ${serverUser}@${serverAddress} "tar -xzf ${frontendServerDir}/build.tar.gz -C ${frontendServerDir}/build"`);
    
    // Step 5: Copy the updated backend file to the backend server
    console.log("\n--- Copying backend file to server ---");
    await executeCommand(`scp -i "${sshKeyPath}" ${backendSourceDir}/app/routes/marketplace.js ${serverUser}@${serverAddress}:${backendServerDir}/app/routes/marketplace.js`);
    
    // Step 6: Restart frontend server
    console.log("\n--- Restarting frontend server ---");
    await executeCommand(`ssh -i "${sshKeyPath}" ${serverUser}@${serverAddress} "sudo docker restart frontend-update-sosh-nft-fe-1"`);
    
    // Step 7: Restart backend server
    console.log("\n--- Restarting backend server ---");
    await executeCommand(`ssh -i "${sshKeyPath}" ${serverUser}@${serverAddress} "sudo docker restart sosh-backend-app"`);
    
    console.log("\n✅ Deployment completed successfully!");
    console.log("The 'Retrieve' button should now display correctly in the UI.");
    
  } catch (error) {
    console.error("Deployment failed:", error);
    process.exit(1);
  }
}

// Run the deployment
deploy();
