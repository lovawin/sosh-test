const axios = require('axios');

async function testApiEndpoint() {
  try {
    console.log('Testing API endpoint for token ID 1...');
    const response = await axios.get('https://www.soshnft.io/api/V1/marketplace/sale-info/1');
    
    console.log('API Response Status:', response.status);
    console.log('API Response Data:', JSON.stringify(response.data, null, 2));
    
    // Check specific fields
    if (response.data && response.data.data) {
      const data = response.data.data;
      console.log('\nKey fields:');
      console.log('isOwnedByMarketplace:', data.isOwnedByMarketplace);
      console.log('currentOwner:', data.currentOwner);
      console.log('seller:', data.seller);
      console.log('endTime:', data.endTime);
      console.log('status:', data.status);
      
      // Check if the conditions for showing the retrieve button are met
      const now = Math.floor(Date.now() / 1000);
      const isExpired = data.endTime && parseInt(data.endTime) < now;
      
      console.log('\nRetrieve button conditions:');
      console.log('Has endTime:', !!data.endTime);
      console.log('Has saleId:', !!data.saleId);
      console.log('Is expired:', isExpired);
      console.log('Is owned by marketplace:', !!data.isOwnedByMarketplace);
      
      console.log('\nShould show retrieve button:', 
        isExpired && 
        data.isOwnedByMarketplace && 
        data.saleId
      );
    }
  } catch (error) {
    console.error('Error testing API endpoint:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testApiEndpoint();
