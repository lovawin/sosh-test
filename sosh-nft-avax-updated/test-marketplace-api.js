/**
 * Test script for the marketplace API endpoint
 * 
 * This script tests the /api/V1/marketplace/sale-info/:tokenId endpoint
 * to ensure it correctly retrieves sale information from the blockchain.
 */

const axios = require('axios');

// Configuration
const API_BASE_URL = 'http://localhost:3001'; // Adjust this to your backend URL
const TOKEN_ID = '1'; // The token ID to test with

// Test the API endpoint
async function testMarketplaceAPI() {
  console.log('Testing marketplace API endpoint...');
  console.log(`Requesting sale info for token ID: ${TOKEN_ID}`);
  
  try {
    const response = await axios.get(`${API_BASE_URL}/api/V1/marketplace/sale-info/${TOKEN_ID}`);
    
    console.log('\nAPI Response:');
    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    console.log('Data:', JSON.stringify(response.data, null, 2));
    
    if (response.data.status === 'success') {
      console.log('\nSale Information:');
      console.log('Sale ID:', response.data.data.saleId);
      console.log('Token ID:', response.data.data.tokenId);
      console.log('Seller:', response.data.data.seller);
      console.log('Ask Price:', response.data.data.askPrice);
      console.log('Start Time:', new Date(response.data.data.startTime * 1000).toISOString());
      console.log('End Time:', new Date(response.data.data.endTime * 1000).toISOString());
      console.log('Status:', response.data.data.status);
      console.log('Sale Type:', response.data.data.saleType);
      
      // Check if the sale has expired
      const now = Math.floor(Date.now() / 1000);
      const endTime = parseInt(response.data.data.endTime);
      const hasExpired = now > endTime;
      
      console.log('\nExpiration Check:');
      console.log('Current Time:', new Date(now * 1000).toISOString());
      console.log('End Time:', new Date(endTime * 1000).toISOString());
      console.log('Has Expired:', hasExpired);
      
      console.log('\nTest Result: SUCCESS');
      console.log('The API endpoint is working correctly!');
    } else {
      console.log('\nTest Result: FAILURE');
      console.log('The API returned a non-success status:', response.data.status);
      console.log('Message:', response.data.message);
    }
  } catch (error) {
    console.log('\nTest Result: ERROR');
    console.error('Error calling the API endpoint:', error.message);
    
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Status Text:', error.response.statusText);
      console.log('Data:', error.response.data);
    }
  }
}

// Run the test
testMarketplaceAPI();
