/**
 * Check Frontend Data
 * 
 * This script checks if the saleId is being passed to the frontend data
 * for NFT listings. It queries the API endpoint that provides the data
 * for the profile page and checks if the saleId is included in the response.
 * 
 * Usage:
 * 1. Set your wallet address in the WALLET_ADDRESS variable
 * 2. Run with: node check-frontend-data.js
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Configuration
const WALLET_ADDRESS = "0x7411e7942f4c8271d4e636429f374997fdaede17"; // The wallet address from the logs
const TOKEN_IDS = [1, 2]; // The token IDs we're interested in
const API_BASE_URL = "https://www.soshnft.io/api"; // Update with your API base URL

// Function to get the JWT token
async function getAuthToken() {
  try {
    // Try to read the token from local storage or session storage
    // This is just a simulation - in a real browser environment, you would use localStorage or sessionStorage
    const tokenPath = path.join(__dirname, '.auth-token');
    if (fs.existsSync(tokenPath)) {
      return fs.readFileSync(tokenPath, 'utf8');
    }
    
    console.log('No auth token found. Please provide your JWT token:');
    console.log('You can get this from your browser by:');
    console.log('1. Opening the developer tools (F12)');
    console.log('2. Going to the Application tab');
    console.log('3. Looking in Local Storage or Session Storage for the "token" key');
    console.log('4. Save it to a file named .auth-token in this directory');
    
    return null;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
}

// Function to get user assets
async function getUserAssets(token) {
  try {
    const response = await axios.get(`${API_BASE_URL}/assets/user/${WALLET_ADDRESS}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error getting user assets:', error.message);
    return null;
  }
}

// Function to check if the saleId is present in the data
function checkSaleId(assets) {
  console.log(`Found ${assets.length} assets for wallet ${WALLET_ADDRESS}`);
  
  // Filter for our token IDs
  const targetAssets = assets.filter(asset => TOKEN_IDS.includes(parseInt(asset.token_id)));
  
  console.log(`Found ${targetAssets.length} assets with token IDs ${TOKEN_IDS.join(', ')}`);
  
  // Check each asset for saleId
  targetAssets.forEach(asset => {
    console.log(`\nAsset with token ID ${asset.token_id}:`);
    console.log(`- Has saleId: ${asset.saleId ? 'Yes' : 'No'}`);
    if (asset.saleId) {
      console.log(`- Sale ID: ${asset.saleId}`);
    }
    
    console.log(`- Has endTime: ${asset.endTime ? 'Yes' : 'No'}`);
    if (asset.endTime) {
      const now = Math.floor(Date.now() / 1000);
      const endTime = parseInt(asset.endTime);
      console.log(`- End Time: ${new Date(endTime * 1000).toLocaleString()} (${endTime})`);
      console.log(`- Is Expired: ${endTime < now ? 'Yes' : 'No'}`);
    }
    
    // Check for other relevant fields
    console.log(`- Owner: ${asset.owner || 'Not set'}`);
    console.log(`- Is owner our wallet: ${asset.owner === WALLET_ADDRESS ? 'Yes' : 'No'}`);
    
    // Log all fields for debugging
    console.log('- All fields:');
    Object.keys(asset).forEach(key => {
      console.log(`  - ${key}: ${JSON.stringify(asset[key])}`);
    });
  });
  
  return targetAssets;
}

// Main function
async function main() {
  console.log('=== Checking Frontend Data ===');
  console.log(`Wallet Address: ${WALLET_ADDRESS}`);
  console.log(`Token IDs: ${TOKEN_IDS.join(', ')}`);
  
  // Get auth token
  const token = await getAuthToken();
  if (!token) {
    console.error('No auth token available. Cannot proceed.');
    return;
  }
  
  // Get user assets
  console.log('\nFetching user assets...');
  const assets = await getUserAssets(token);
  if (!assets) {
    console.error('Failed to get user assets.');
    return;
  }
  
  // Check if saleId is present
  console.log('\nChecking for saleId in the data...');
  const targetAssets = checkSaleId(assets);
  
  // Summary
  console.log('\n=== Summary ===');
  const assetsMissingSaleId = targetAssets.filter(asset => !asset.saleId);
  const assetsMissingEndTime = targetAssets.filter(asset => !asset.endTime);
  
  console.log(`Assets missing saleId: ${assetsMissingSaleId.length}`);
  console.log(`Assets missing endTime: ${assetsMissingEndTime.length}`);
  
  if (assetsMissingSaleId.length > 0) {
    console.log('\nThe following assets are missing saleId:');
    assetsMissingSaleId.forEach(asset => {
      console.log(`- Token ID ${asset.token_id}`);
    });
    
    console.log('\nThis is likely the reason why the "Retrieve" button is not appearing.');
    console.log('The frontend code checks for both endTime and saleId before showing the button.');
  }
  
  if (assetsMissingEndTime.length > 0) {
    console.log('\nThe following assets are missing endTime:');
    assetsMissingEndTime.forEach(asset => {
      console.log(`- Token ID ${asset.token_id}`);
    });
    
    console.log('\nThis is likely the reason why the "Retrieve" button is not appearing.');
    console.log('The frontend code checks for both endTime and saleId before showing the button.');
  }
  
  if (assetsMissingSaleId.length === 0 && assetsMissingEndTime.length === 0) {
    console.log('\nAll assets have both saleId and endTime.');
    console.log('The issue might be with the expiration check or ownership verification.');
    console.log('Try running the browser diagnostic script to check for other issues.');
  }
}

// Run the main function
main().catch(error => {
  console.error('Error:', error);
});
