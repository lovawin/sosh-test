/**
 * Test Marketplace Cleanup Service
 * 
 * This script tests the marketplace cleanup service in test mode.
 * It doesn't actually send any transactions, but it will find expired sales
 * and simulate cleaning them up.
 * 
 * Usage: node test-marketplace-cleanup.js
 */

require('dotenv').config();
const { findExpiredSales, cleanupExpiredSales } = require('./marketplace-cleanup-service');

// Override environment variables for testing
process.env.TEST_MODE = 'true';

/**
 * Run the test
 */
async function runTest() {
  console.log('=== Testing Marketplace Cleanup Service ===\n');
  
  try {
    // Find expired sales
    console.log('Finding expired sales...');
    const expiredSaleIds = await findExpiredSales();
    
    if (expiredSaleIds.length === 0) {
      console.log('No expired sales found. This could be normal if there are no expired sales,');
      console.log('or it could indicate an issue with the configuration or contract address.');
      console.log('\nTry creating a test sale that expires quickly, then run this test again.');
    } else {
      console.log(`Found ${expiredSaleIds.length} expired sales: ${expiredSaleIds.join(', ')}`);
      
      // Simulate cleaning them up
      console.log('\nSimulating cleanup...');
      await cleanupExpiredSales(expiredSaleIds);
      
      console.log('\n✅ Test completed successfully!');
      console.log('The cleanup service is working correctly in test mode.');
    }
    
    console.log('\n=== Test Configuration ===');
    
    // Determine network
    const network = process.env.NETWORK || 'testnet';
    const networkName = network === 'mainnet' ? 'Avalanche Mainnet' : 'Avalanche Fuji Testnet';
    const rpcEndpoint = process.env.RPC_ENDPOINT || 
                        (network === 'mainnet' ? 
                         'https://api.avax.network/ext/bc/C/rpc' : 
                         'https://api.avax-test.network/ext/bc/C/rpc');
    
    console.log('Network:', networkName);
    console.log('RPC Endpoint:', rpcEndpoint);
    console.log('Marketplace Address:', process.env.MARKETPLACE_ADDRESS || 'Not set');
    console.log('Batch Size:', process.env.CLEANUP_BATCH_SIZE || '50');
    console.log('Min Expired Age:', process.env.CLEANUP_MIN_EXPIRED_AGE || '3600', 'seconds');
    
    console.log('\n=== Next Steps ===');
    console.log('1. If the test was successful, you can run the service in production mode:');
    console.log('   - Set TEST_MODE=false in .env');
    console.log('   - Set SERVICE_PRIVATE_KEY in .env');
    console.log('   - Run: node marketplace-cleanup-service.js');
    console.log('2. To run as a cron job:');
    console.log('   - Set CRON_JOB=true in .env');
    console.log('   - Add to crontab: 0 * * * * cd /path/to/project && node marketplace-cleanup-service.js');
  } catch (error) {
    console.error('Error during test:', error);
  }
}

// Run the test
runTest()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
