/**
 * Test Production API
 * 
 * This script tests the production API endpoints to verify the fix
 */

const axios = require('axios');

const BASE_URL = 'https://www.soshnft.io/api/V1';
const TOKEN_ID = '1';
const USER_ADDRESS = '0x7411e7942f4C8271D4E636429f374997fdaede17';

// Test token (you may need to get a real one from the logs)
const TEST_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3Y2QxMzE2YjM4YmNiYTllMmRjYjk5YiIsImlhdCI6MTc0ODg4NjE1NSwiZXhwIjoxNzQ4OTE0OTU1fQ.OpW3d-5CIegS2uChH16HIrWZHwq22K4CxRcp_IZyYRI';

async function testAPI() {
  console.log('=== Testing Production API ===');
  console.log('Base URL:', BASE_URL);
  console.log('Token ID:', TOKEN_ID);
  console.log('User Address:', USER_ADDRESS);
  console.log('');

  // Test 1: Sale Info Endpoint (this was working before)
  try {
    console.log('1. Testing /marketplace/sale-info/' + TOKEN_ID);
    const saleInfoResponse = await axios.get(`${BASE_URL}/marketplace/sale-info/${TOKEN_ID}`, {
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ Sale Info Response:', saleInfoResponse.status);
    console.log('   Data:', JSON.stringify(saleInfoResponse.data, null, 2));
  } catch (error) {
    console.log('❌ Sale Info Error:', error.response?.status, error.response?.data || error.message);
  }

  console.log('');

  // Test 2: Verify NFT Endpoint (this was failing before)
  try {
    console.log('2. Testing /marketplace/verify-nft/' + TOKEN_ID);
    const verifyResponse = await axios.get(`${BASE_URL}/marketplace/verify-nft/${TOKEN_ID}`, {
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`,
        'Content-Type': 'application/json'
      },
      params: {
        address: USER_ADDRESS
      }
    });
    console.log('✅ Verify NFT Response:', verifyResponse.status);
    console.log('   Data:', JSON.stringify(verifyResponse.data, null, 2));
  } catch (error) {
    console.log('❌ Verify NFT Error:', error.response?.status, error.response?.data || error.message);
  }
}

testAPI().catch(console.error);
