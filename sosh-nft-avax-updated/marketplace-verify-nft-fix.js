/**
 * Marketplace Verify NFT Fix
 * 
 * This script creates a fixed version of the verify-nft endpoint
 * that handles ABI errors more gracefully
 */

const fs = require('fs');
const path = require('path');

// Read the current marketplace.js file
const marketplaceFilePath = path.join(__dirname, 'sosh_nft_Backend/app/routes/marketplace.js');
const currentContent = fs.readFileSync(marketplaceFilePath, 'utf8');

// Create a backup
const backupPath = marketplaceFilePath + '.backup-' + Date.now();
fs.writeFileSync(backupPath, currentContent);
console.log('Backup created:', backupPath);

// The fix: Replace the error handling in the verify-nft endpoint
const oldErrorHandling = `    // Also log to error logs
    await errorLogger.logError(error, {
      context: {
        operation: 'VERIFY_NFT_ELIGIBILITY',
        tokenId,
        userId,
        userAddress,
        endpoint: '/marketplace/verify-nft/' + tokenId
      }
    });
    
    // Try to provide a meaningful response even in case of error
    // This helps the frontend handle the error gracefully
    return res.status(200).json({
      status: 'success',
      data: {
        isEligibleForRetrieval: false,
        reason: 'VERIFICATION_ERROR',
        error: error.message,
        // Include any partial data we might have gathered before the error
        isMarketplaceOwner: typeof isMarketplaceOwner !== 'undefined' ? isMarketplaceOwner : false,
        isOriginalSeller: typeof isOriginalSeller !== 'undefined' ? isOriginalSeller : false,
        hasExpired: typeof hasExpired !== 'undefined' ? hasExpired : false,
        currentOwner: typeof currentOwner !== 'undefined' ? currentOwner : null,
        originalSeller: typeof originalSeller !== 'undefined' ? originalSeller : null
      }
    });`;

const newErrorHandling = `    // Also log to error logs
    await errorLogger.logError(error, {
      context: {
        operation: 'VERIFY_NFT_ELIGIBILITY',
        tokenId,
        userId,
        userAddress,
        endpoint: '/marketplace/verify-nft/' + tokenId
      }
    });
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to verify NFT eligibility',
      error: error.message
    });`;

// Apply the fix
const fixedContent = currentContent.replace(oldErrorHandling, newErrorHandling);

// Write the fixed content
fs.writeFileSync(marketplaceFilePath, fixedContent);

console.log('✅ Applied fix to marketplace.js');
console.log('📁 Backup saved to:', backupPath);
console.log('🔧 Fixed error handling in /verify-nft endpoint to return 500 status instead of 200');
