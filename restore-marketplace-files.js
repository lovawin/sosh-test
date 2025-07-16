/**
 * Restoration Script for Marketplace Files
 * 
 * This script helps restore backups of marketplace files if needed.
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to list available backups
function listBackups(directory) {
  try {
    if (!fs.existsSync(directory)) {
      console.log(`Directory ${directory} does not exist.`);
      return [];
    }
    
    const files = fs.readdirSync(directory);
    return files;
  } catch (error) {
    console.error(`Error listing backups in ${directory}:`, error.message);
    return [];
  }
}

// Function to restore a file
function restoreFile(backupPath, originalPath) {
  try {
    if (!fs.existsSync(backupPath)) {
      console.log(`Backup file ${backupPath} does not exist.`);
      return false;
    }
    
    // Create directory if it doesn't exist
    const originalDir = path.dirname(originalPath);
    if (!fs.existsSync(originalDir)) {
      fs.mkdirSync(originalDir, { recursive: true });
    }
    
    fs.copyFileSync(backupPath, originalPath);
    console.log(`✓ Restored ${backupPath} to ${originalPath}`);
    return true;
  } catch (error) {
    console.error(`✗ Failed to restore ${backupPath}:`, error.message);
    return false;
  }
}

// Main function
async function main() {
  console.log('=== Marketplace Files Restoration Tool ===\n');
  
  // List available backups
  console.log('Available contract backups:');
  const contractBackups = listBackups('backups/contracts');
  contractBackups.forEach((file, index) => {
    if (file !== 'README.md') {
      console.log(`${index + 1}. ${file}`);
    }
  });
  
  console.log('\nAvailable frontend backups:');
  const frontendBackups = listBackups('backups/frontend');
  frontendBackups.forEach((file, index) => {
    if (file !== 'README.md') {
      console.log(`${index + 1}. ${file}`);
    }
  });
  
  console.log('\nAvailable database backups:');
  const dbBackups = listBackups('backups/db');
  dbBackups.forEach((file, index) => {
    if (file !== 'README.md') {
      console.log(`${index + 1}. ${file}`);
    }
  });
  
  // Prompt for which backups to restore
  const askQuestion = (question) => {
    return new Promise((resolve) => {
      rl.question(question, (answer) => {
        resolve(answer);
      });
    });
  };
  
  // Restore contract files
  if (contractBackups.length > 0) {
    const contractAnswer = await askQuestion('\nEnter contract backup number to restore (or 0 to skip): ');
    const contractIndex = parseInt(contractAnswer) - 1;
    
    if (contractIndex >= 0 && contractIndex < contractBackups.length) {
      const contractBackup = contractBackups[contractIndex];
      // Extract original filename from backup (remove timestamp)
      const originalFile = contractBackup.split('.').slice(0, -1).join('.');
      
      // Try different possible locations for the contract
      const possiblePaths = [
        `sosh-smart-contract/contracts/${originalFile}`,
        `sosh-smart-contract/contracts/marketplace/${originalFile}`,
        `sosh-smart-contract/contracts/sosh_marketplace/${originalFile}`
      ];
      
      let restored = false;
      for (const originalPath of possiblePaths) {
        if (restoreFile(`backups/contracts/${contractBackup}`, originalPath)) {
          restored = true;
          break;
        }
      }
      
      if (!restored) {
        console.log('Failed to restore contract file. Please specify the destination path:');
        const customPath = await askQuestion('Enter destination path: ');
        restoreFile(`backups/contracts/${contractBackup}`, customPath);
      }
    }
  }
  
  // Restore frontend files
  if (frontendBackups.length > 0) {
    const frontendAnswer = await askQuestion('\nEnter frontend backup number to restore (or 0 to skip): ');
    const frontendIndex = parseInt(frontendAnswer) - 1;
    
    if (frontendIndex >= 0 && frontendIndex < frontendBackups.length) {
      const frontendBackup = frontendBackups[frontendIndex];
      // Extract original filename from backup (remove timestamp)
      const originalFile = frontendBackup.split('.').slice(0, -1).join('.');
      
      // Map backup files to their original locations
      const pathMap = {
        'postCard.js': 'frontend/src/components/myProfileComponents/postCards/postCard.js',
        'ModalForSellNFT.jsx': 'frontend/src/components/ModalForSellNFT/ModalForSellNFT.jsx',
        'nftMarketPlaceFunctions.js': 'frontend/src/common/helpers/nftMarketPlaceFunctions.js',
        'marketplaceLogger.js': 'frontend/src/services/marketplaceLogger.js'
      };
      
      if (pathMap[originalFile]) {
        restoreFile(`backups/frontend/${frontendBackup}`, pathMap[originalFile]);
      } else {
        console.log('Unknown frontend file. Please specify the destination path:');
        const customPath = await askQuestion('Enter destination path: ');
        restoreFile(`backups/frontend/${frontendBackup}`, customPath);
      }
    }
  }
  
  // Restore database (this would typically be done with mongorestore)
  if (dbBackups.length > 0) {
    const dbAnswer = await askQuestion('\nEnter database backup number to restore (or 0 to skip): ');
    const dbIndex = parseInt(dbAnswer) - 1;
    
    if (dbIndex >= 0 && dbIndex < dbBackups.length) {
      const dbBackup = dbBackups[dbIndex];
      console.log(`\nTo restore the database backup ${dbBackup}, run the following command:`);
      console.log(`mongorestore --db=sosh backups/db/${dbBackup}`);
    }
  }
  
  console.log('\nRestoration process completed.');
  rl.close();
}

main().catch(error => {
  console.error('Error in restoration process:', error);
  rl.close();
});
