/**
 * Backup Script for Marketplace Files
 * 
 * This script creates backups of important files related to the marketplace
 * functionality before making any changes to them.
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Get timestamp for backup filenames
const now = new Date();
const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;

console.log(`Creating backups with timestamp: ${timestamp}`);

// Files to backup
const filesToBackup = [
  // Frontend files
  {
    src: 'frontend/src/components/myProfileComponents/postCards/postCard.js',
    dest: `backups/frontend/postCard.js.${timestamp}`
  },
  {
    src: 'frontend/src/components/ModalForSellNFT/ModalForSellNFT.jsx',
    dest: `backups/frontend/ModalForSellNFT.jsx.${timestamp}`
  },
  {
    src: 'frontend/src/common/helpers/nftMarketPlaceFunctions.js',
    dest: `backups/frontend/nftMarketPlaceFunctions.js.${timestamp}`
  },
  {
    src: 'frontend/src/services/marketplaceLogger.js',
    dest: `backups/frontend/marketplaceLogger.js.${timestamp}`
  },
  
  // Smart contract files - we'll need to check if these exist first
  {
    src: 'sosh-smart-contract/contracts/SoshMarketplace.sol',
    dest: `backups/contracts/SoshMarketplace.sol.${timestamp}`
  },
  {
    src: 'sosh-smart-contract/contracts/marketplace/SoshMarketplace.sol',
    dest: `backups/contracts/SoshMarketplace.sol.${timestamp}`
  }
];

// Backup files
let backupCount = 0;
filesToBackup.forEach(file => {
  try {
    if (fs.existsSync(file.src)) {
      fs.copyFileSync(file.src, file.dest);
      console.log(`✓ Backed up ${file.src} to ${file.dest}`);
      backupCount++;
    } else {
      console.log(`✗ Source file not found: ${file.src}`);
    }
  } catch (error) {
    console.error(`✗ Failed to backup ${file.src}:`, error.message);
  }
});

console.log(`Backup process completed. ${backupCount} files backed up.`);

// Create a README file in the backups directory with instructions
const readmeContent = `# Marketplace Backups

These backups were created on ${now.toLocaleString()} before implementing changes to fix the NFT approval issue.

## Backup Files

The following files were backed up:
${filesToBackup.map(file => `- ${file.src} -> ${file.dest}`).join('\n')}

## Restoration Instructions

To restore a backup:

1. Identify the backup file you want to restore
2. Copy it back to its original location, removing the timestamp from the filename
3. Test the functionality after restoration

Example:
\`\`\`
cp backups/frontend/postCard.js.${timestamp} frontend/src/components/myProfileComponents/postCards/postCard.js
\`\`\`
`;

fs.writeFileSync('backups/README.md', readmeContent);
console.log('Created README.md with restoration instructions in the backups directory.');
