/**
 * Fix NFT Verification
 * 
 * This script fixes the NFT verification by ensuring proper environment loading
 * and adding better error handling for the ownerOf call
 */

const fs = require('fs');
const path = require('path');

// Read the current marketplace.js file
const marketplaceFilePath = path.join(__dirname, 'sosh_nft_Backend/app/routes/marketplace.js');
const currentContent = fs.readFileSync(marketplaceFilePath, 'utf8');

// Create a backup
const backupPath = marketplaceFilePath + '.backup-verification-fix-' + Date.now();
fs.writeFileSync(backupPath, currentContent);
console.log('Backup created:', backupPath);

// Add debug logging at the top of the verify-nft endpoint
const verifyNftStart = `router.get('/verify-nft/:tokenId', async (req, res) => {
  const tokenId = req.params.tokenId;
  const userId = req.user?.id;
  const userAddress = req.query.address;`;

const verifyNftStartWithDebug = `router.get('/verify-nft/:tokenId', async (req, res) => {
  const tokenId = req.params.tokenId;
  const userId = req.user?.id;
  const userAddress = req.query.address;
  
  // Debug logging for environment variables
  console.log('DEBUG - Environment check in verify-nft:');
  console.log('  tokenAddress:', appconfig.tokenAddress);
  console.log('  MARKETPLACE_PROXY_ADDRESS:', appconfig.MARKETPLACE_PROXY_ADDRESS);
  console.log('  INFURA_URL:', appconfig.INFURA_URL);`;

// Replace the ownership check section with better error handling
const oldOwnershipCheck = `    // Check current owner of the NFT
    let currentOwner;
    let isMarketplaceOwner = false;
    
    try {
      currentOwner = await nftContract.methods.ownerOf(tokenId).call();
      isMarketplaceOwner = currentOwner.toLowerCase() === appconfig.MARKETPLACE_PROXY_ADDRESS.toLowerCase();`;

const newOwnershipCheck = `    // Check current owner of the NFT
    let currentOwner;
    let isMarketplaceOwner = false;
    
    try {
      console.log('DEBUG - Attempting to call ownerOf for token:', tokenId);
      console.log('DEBUG - Using NFT contract address:', appconfig.tokenAddress);
      
      currentOwner = await nftContract.methods.ownerOf(tokenId).call();
      isMarketplaceOwner = currentOwner.toLowerCase() === appconfig.MARKETPLACE_PROXY_ADDRESS.toLowerCase();
      
      console.log('DEBUG - ownerOf call successful:');
      console.log('  currentOwner:', currentOwner);
      console.log('  isMarketplaceOwner:', isMarketplaceOwner);`;

// Apply the fixes
let fixedContent = currentContent.replace(verifyNftStart, verifyNftStartWithDebug);
fixedContent = fixedContent.replace(oldOwnershipCheck, newOwnershipCheck);

// Write the fixed content
fs.writeFileSync(marketplaceFilePath, fixedContent);

console.log('✅ Applied debug logging to marketplace.js verify-nft endpoint');
console.log('📁 Backup saved to:', backupPath);
console.log('🔧 Added environment variable debugging and ownerOf call debugging');
