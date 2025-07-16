/**
 * Advanced diagnostic script to check the API response for the NFT retrieval button
 * 
 * This script authenticates with the backend before making the API request
 * to simulate a logged-in user accessing the API. It includes comprehensive
 * debugging to identify the root cause of the "contract address not set" error.
 */

const axios = require('axios');
const fs = require('fs');
const Web3 = require('web3');
const ethers = require('ethers');

// Configuration
const TOKEN_ID = 1;
const API_BASE_URL = 'https://www.soshnft.io';
const API_ENDPOINT = `/api/V1/marketplace/sale-info/${TOKEN_ID}`;
const USER_WALLET_ADDRESS = '0x7411e7942f4C8271D4E636429f374997fdaede17'; // The wallet address of the user
const NFT_CONTRACT_ADDRESS = '0x7CA1eA6d19A1df7d17fEaF0eA9a1dEFA0e37f894';
const MARKETPLACE_PROXY_ADDRESS = '0x25ad5b58a78c1cC1aF3C83607448D0D203158F06';
const INFURA_URL = 'https://api.avax-test.network/ext/bc/C/rpc';

// Hardcoded JWT token for the user with wallet address 0x7411e7942f4C8271D4E636429f374997fdaede17
// Note: This token needs to be updated regularly as it expires
const USER_JWT_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3Y2QxMzE2YjM4YmNiYTllMmRjYjk5YiIsImlhdCI6MTc0NzE1ODQ5MCwiZXhwIjoxNzQ3MTg3MjkwfQ.j4RGoCiLogL1HpXaVBQ8dIoCrmPiXZP95Bexmxi64RM";

// Main function to check API response
async function checkApiResponse() {
  try {
    // Use the hardcoded token or an environment variable if provided
    const token = process.env.TEST_TOKEN || USER_JWT_TOKEN;
    
    console.log('=== NFT Retrieval Button API Diagnostic (Advanced) ===');
    console.log('NFT Contract Address:', NFT_CONTRACT_ADDRESS);
    console.log('Marketplace Proxy Address:', MARKETPLACE_PROXY_ADDRESS);
    console.log('Token ID:', TOKEN_ID);
    console.log('User Wallet Address:', USER_WALLET_ADDRESS);
    console.log('Infura URL:', INFURA_URL);
    console.log('\nUsing JWT token for authentication');
    
    // First, check if we can directly access the blockchain to verify contract addresses
    console.log('\nAttempting direct blockchain verification...');
    try {
      // Initialize Web3
      const web3 = new Web3(INFURA_URL);
      
      // Check if the NFT contract address is valid
      console.log('Checking NFT contract code at address:', NFT_CONTRACT_ADDRESS);
      const nftCode = await web3.eth.getCode(NFT_CONTRACT_ADDRESS);
      const isNftContractValid = nftCode !== '0x';
      console.log('NFT contract is valid:', isNftContractValid);
      
      // Check if the marketplace contract address is valid
      console.log('Checking marketplace contract code at address:', MARKETPLACE_PROXY_ADDRESS);
      const marketplaceCode = await web3.eth.getCode(MARKETPLACE_PROXY_ADDRESS);
      const isMarketplaceContractValid = marketplaceCode !== '0x';
      console.log('Marketplace contract is valid:', isMarketplaceContractValid);
      
      // Try to load the NFT contract ABI
      try {
        const nftAbi = require('./sosh_nft_Backend/app/ABI/contract.nft.json');
        console.log('Successfully loaded NFT contract ABI');
        
        // Create NFT contract instance
        const nftContract = new web3.eth.Contract(nftAbi, NFT_CONTRACT_ADDRESS);
        console.log('Successfully created NFT contract instance');
        
        // Try to get the owner of the token
        try {
          const owner = await nftContract.methods.ownerOf(TOKEN_ID).call();
          console.log(`Owner of token ${TOKEN_ID}:`, owner);
          
          // Check if the marketplace owns the token
          const isMarketplaceOwner = owner.toLowerCase() === MARKETPLACE_PROXY_ADDRESS.toLowerCase();
          console.log(`Is owned by marketplace: ${isMarketplaceOwner}`);
        } catch (ownerError) {
          console.error(`Error getting owner of token ${TOKEN_ID}:`, ownerError.message);
        }
      } catch (abiError) {
        console.error('Error loading NFT contract ABI:', abiError.message);
      }
    } catch (blockchainError) {
      console.error('Error during blockchain verification:', blockchainError.message);
      console.log('Continuing with API checks...');
    }
    
    // Check the server configuration
    console.log('\nChecking server configuration...');
    try {
      const configResponse = await axios.get(`${API_BASE_URL}/api/V1/config/env-check`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('Server configuration response:', configResponse.data);
    } catch (configError) {
      console.log('Could not check server configuration:', configError.message);
      console.log('This endpoint might not exist. Trying alternative endpoints...');
      
      // Try to get the server version or status
      try {
        const statusResponse = await axios.get(`${API_BASE_URL}/api/V1/status`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        console.log('Server status response:', statusResponse.data);
      } catch (statusError) {
        console.log('Could not check server status:', statusError.message);
      }
    }
    
    // Try to get user profile to check if authentication is working
    console.log('\nChecking user authentication...');
    try {
      const userResponse = await axios.get(`${API_BASE_URL}/api/V1/user/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('User profile response:', userResponse.data);
    } catch (userError) {
      console.log('Could not get user profile:', userError.message);
      if (userError.response) {
        console.log('Response status:', userError.response.status);
        console.log('Response data:', userError.response.data);
      }
    }
    
    console.log(`\nMaking authenticated API request to ${API_BASE_URL}${API_ENDPOINT}...`);
    
    // Make the API request with the authentication token and debug headers
    const response = await axios.get(`${API_BASE_URL}${API_ENDPOINT}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Debug-Mode': 'true',
        'X-Debug-Level': 'verbose'
      }
    });
    
    console.log('API Response:');
    console.log(JSON.stringify(response.data, null, 2));
    
    // Check if the response contains the necessary information
    if (response.data.status === 'success') {
      const data = response.data.data;
      
      console.log('\nChecking response data:');
      console.log(`- Token ID: ${data.tokenId || 'Not available'}`);
      console.log(`- Is owned by marketplace: ${data.isOwnedByMarketplace || false}`);
      console.log(`- Current owner: ${data.currentOwner || 'Not available'}`);
      console.log(`- Sale ID: ${data.saleId || 'Not available'}`);
      console.log(`- End time: ${data.endTime ? new Date(data.endTime * 1000).toISOString() : 'Not available'}`);
      console.log(`- Status: ${data.status || 'Not available'}`);
      console.log(`- Seller: ${data.seller || 'Not available'}`);
      
      // Examine the raw response to see if currentOwner is present but not being properly extracted
      console.log('\nExamining raw response structure:');
      console.log('Response keys:', Object.keys(response.data));
      console.log('Data keys:', Object.keys(response.data.data));
      
      // Check if all required fields are present
      const missingFields = [];
      if (!data.tokenId) missingFields.push('tokenId');
      if (data.isOwnedByMarketplace === undefined) missingFields.push('isOwnedByMarketplace');
      if (!data.currentOwner) missingFields.push('currentOwner');
      if (!data.saleId) missingFields.push('saleId');
      if (!data.endTime) missingFields.push('endTime');
      if (!data.status) missingFields.push('status');
      if (!data.seller) missingFields.push('seller');
      
      if (missingFields.length > 0) {
        console.log(`\nWARNING: The following fields are missing from the API response: ${missingFields.join(', ')}`);
        
        // Analyze why currentOwner might be missing
        if (missingFields.includes('currentOwner')) {
          console.log('\n=== DETAILED DIAGNOSIS: Why currentOwner field is missing ===');
          
          console.log('\n1. Backend Code Analysis:');
          console.log('   - In marketplace.js, the currentOwner field should be set during token ownership check');
          console.log('   - The code path is: GET /api/V1/marketplace/sale-info/:tokenId → check token ownership → set currentOwner');
          console.log('   - The field might not be included in the response JSON serialization');
          
          // Check if isOwnedByMarketplace is false, which might explain why currentOwner is not set
          if (data.isOwnedByMarketplace === false) {
            console.log('\n2. Ownership Status Analysis:');
            console.log('   - The isOwnedByMarketplace field is FALSE');
            console.log('   - This indicates the NFT is NOT owned by the marketplace contract');
            console.log('   - This is the primary reason why the "Retrieve" button is not showing');
            console.log('   - The backend might be skipping the currentOwner field when isOwnedByMarketplace is false');
            console.log('   - Or the currentOwner field might be set but not included in the response serialization');
          }
          
          console.log('\n3. API Response Structure Analysis:');
          console.log('   - The API response might be filtering out the currentOwner field');
          console.log('   - This could be happening in the controller or serialization layer');
          console.log('   - Check if there\'s a response transformer or serializer that\'s excluding this field');
          
          console.log('\n4. Debugging Steps:');
          console.log('   a. Add logging in the backend to trace the currentOwner field:');
          console.log('      - Log the owner value after the NFT contract call');
          console.log('      - Log the saleData object before returning the response');
          console.log('   b. Check if the field is being set but not serialized:');
          console.log('      - Add explicit serialization for the currentOwner field');
          console.log('   c. Verify the actual ownership on the blockchain directly:');
          console.log('      - Use etherscan.io or a direct contract query');
          console.log('      - Compare the on-chain owner with the API response');
          
          console.log('\n5. Potential Fixes:');
          console.log('   a. If the field is not being set:');
          console.log('      - Ensure the owner value is correctly assigned to saleData.currentOwner');
          console.log('   b. If the field is being set but not serialized:');
          console.log('      - Modify the response serialization to include the currentOwner field');
          console.log('   c. If the field is only set when isOwnedByMarketplace is true:');
          console.log('      - Modify the code to always set the currentOwner field regardless of ownership');
        }
      } else {
        console.log('\nAll required fields are present in the API response.');
      }
      
      // Check if the conditions for showing the "Retrieve" button are met
      const now = Math.floor(Date.now() / 1000);
      const isExpired = data.endTime && data.endTime < now;
      
      console.log('\nChecking conditions for "Retrieve" button:');
      console.log(`- Is owned by marketplace: ${data.isOwnedByMarketplace || false}`);
      console.log(`- Current owner: ${data.currentOwner || 'Not available'}`);
      console.log(`- Is expired: ${isExpired}`);
      console.log(`- Status is "Open" (1): ${data.status === '1'}`);
      console.log(`- Has seller: ${!!data.seller}`);
      console.log(`- User is seller: ${data.seller && data.seller.toLowerCase() === USER_WALLET_ADDRESS.toLowerCase()}`);
      
      const shouldShowRetrieveButton = 
        data.isOwnedByMarketplace && 
        isExpired && 
        data.status === '1' && 
        data.seller && 
        data.seller.toLowerCase() === USER_WALLET_ADDRESS.toLowerCase();
      
      console.log(`\nShould the "Retrieve" button be displayed? ${shouldShowRetrieveButton}`);
      
      if (!shouldShowRetrieveButton) {
        console.log('\nReasons why the "Retrieve" button might not be displayed:');
        if (!data.isOwnedByMarketplace) console.log('- The NFT is not owned by the marketplace contract.');
        if (!isExpired) console.log('- The listing has not expired yet.');
        if (data.status !== '1') console.log(`- The sale status is ${data.status} instead of 1 (Open).`);
        if (!data.seller) console.log('- No seller information is available.');
        if (data.seller && data.seller.toLowerCase() !== USER_WALLET_ADDRESS.toLowerCase()) {
          console.log('- The current user is not the seller of the NFT.');
        }
      }
    } else {
      console.error('\nAPI returned an error response:');
      console.error(response.data);
    }
    
    // Save the response to a file for further analysis
    fs.writeFileSync('api-response-with-auth.json', JSON.stringify(response.data, null, 2));
    console.log('\nAPI response saved to api-response-with-auth.json');
    
  } catch (error) {
    console.error('Error making API request:', error);
    
    if (error.response) {
      console.error('API Error Response:', error.response.data);
      fs.writeFileSync('api-error-with-auth.json', JSON.stringify(error.response.data, null, 2));
      console.log('API error response saved to api-error-with-auth.json');
    }
  }
}

// Instructions for getting a valid token
console.log('=== NFT Retrieval Button API Diagnostic ===');
console.log('This script checks if the API is returning the correct data for the NFT retrieval button.');
console.log('To use this script with authentication:');
console.log('1. Log in to the website in your browser');
console.log('2. Open the browser developer tools (F12)');
console.log('3. Go to the Network tab');
console.log('4. Find any API request to the backend');
console.log('5. Look for the "Authorization" header in the request headers');
console.log('6. Copy the token (without "Bearer ")');
console.log('7. Run this script with the token: TEST_TOKEN=your_token_here node check-api-response-with-auth.js');
console.log('=========================================\n');

// Run the check
checkApiResponse();
