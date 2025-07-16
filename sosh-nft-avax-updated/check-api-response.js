/**
 * Diagnostic script to check the API response for the NFT retrieval button
 * 
 * This script makes a direct API call to the backend to check if it's returning
 * the correct data for the NFT with token ID 1.
 */

const axios = require('axios');
const fs = require('fs');

// Configuration
const TOKEN_ID = 1;
const API_BASE_URL = 'https://www.soshnft.io';
const API_ENDPOINT = `/api/V1/marketplace/sale-info/${TOKEN_ID}`;

async function checkApiResponse() {
  try {
    console.log(`Making API request to ${API_BASE_URL}${API_ENDPOINT}...`);
    
    const response = await axios.get(`${API_BASE_URL}${API_ENDPOINT}`);
    
    console.log('API Response:');
    console.log(JSON.stringify(response.data, null, 2));
    
    // Check if the response contains the necessary information
    if (response.data.status === 'success') {
      const data = response.data.data;
      
      console.log('\nChecking response data:');
      console.log(`- Token ID: ${data.tokenId || 'Not available'}`);
      console.log(`- Is owned by marketplace: ${data.isOwnedByMarketplace || false}`);
      console.log(`- Sale ID: ${data.saleId || 'Not available'}`);
      console.log(`- End time: ${data.endTime ? new Date(data.endTime * 1000).toISOString() : 'Not available'}`);
      console.log(`- Status: ${data.status || 'Not available'}`);
      console.log(`- Seller: ${data.seller || 'Not available'}`);
      
      // Check if all required fields are present
      const missingFields = [];
      if (!data.tokenId) missingFields.push('tokenId');
      if (!data.isOwnedByMarketplace) missingFields.push('isOwnedByMarketplace');
      if (!data.saleId) missingFields.push('saleId');
      if (!data.endTime) missingFields.push('endTime');
      if (!data.status) missingFields.push('status');
      if (!data.seller) missingFields.push('seller');
      
      if (missingFields.length > 0) {
        console.log(`\nWARNING: The following fields are missing from the API response: ${missingFields.join(', ')}`);
      } else {
        console.log('\nAll required fields are present in the API response.');
      }
      
      // Check if the conditions for showing the "Retrieve" button are met
      const now = Math.floor(Date.now() / 1000);
      const isExpired = data.endTime && data.endTime < now;
      
      console.log('\nChecking conditions for "Retrieve" button:');
      console.log(`- Is owned by marketplace: ${data.isOwnedByMarketplace || false}`);
      console.log(`- Is expired: ${isExpired}`);
      console.log(`- Status is "Open" (1): ${data.status === '1'}`);
      console.log(`- Has seller: ${!!data.seller}`);
      
      const shouldShowRetrieveButton = 
        data.isOwnedByMarketplace && 
        isExpired && 
        data.status === '1' && 
        data.seller;
      
      console.log(`\nShould the "Retrieve" button be displayed? ${shouldShowRetrieveButton}`);
      
      if (!shouldShowRetrieveButton) {
        console.log('\nReasons why the "Retrieve" button might not be displayed:');
        if (!data.isOwnedByMarketplace) console.log('- The NFT is not owned by the marketplace contract.');
        if (!isExpired) console.log('- The listing has not expired yet.');
        if (data.status !== '1') console.log(`- The sale status is ${data.status} instead of 1 (Open).`);
        if (!data.seller) console.log('- No seller information is available.');
      }
    } else {
      console.error('\nAPI returned an error response:');
      console.error(response.data);
    }
    
    // Save the response to a file for further analysis
    fs.writeFileSync('api-response.json', JSON.stringify(response.data, null, 2));
    console.log('\nAPI response saved to api-response.json');
    
  } catch (error) {
    console.error('Error making API request:', error);
    
    if (error.response) {
      console.error('API Error Response:', error.response.data);
      fs.writeFileSync('api-error.json', JSON.stringify(error.response.data, null, 2));
      console.log('API error response saved to api-error.json');
    }
  }
}

// Run the check
checkApiResponse();
