/**
 * Test Script for Marketplace Logger
 * 
 * This script tests the marketplace logger functionality by simulating
 * various marketplace operations and their error scenarios.
 * 
 * Usage:
 *   node test-marketplace-logger.js
 */

const marketplaceLogger = require('./src/services/marketplaceLogger');
const errorLogger = require('./src/services/errorLogger');

// Mock error for testing
class MockError extends Error {
  constructor(message, code) {
    super(message);
    this.name = 'MockError';
    this.code = code;
    this.stack = 'Mock stack trace';
  }
}

// Test function to simulate various marketplace operations
async function testMarketplaceLogger() {
  console.log('=== Testing Marketplace Logger ===');
  
  const tokenId = '12345';
  const saleId = '67890';
  const userAddress = '0x1234567890abcdef1234567890abcdef12345678';
  
  try {
    // Test listing attempt logging
    console.log('\nTesting listing attempt logging...');
    await marketplaceLogger.logListingAttempt(
      tokenId,
      {
        saleType: 'FIXED_PRICE',
        price: '0.5',
        startTime: Math.floor(Date.now() / 1000) + 3600,
        endTime: Math.floor(Date.now() / 1000) + 86400,
        userAddress
      }
    );
    console.log('✓ Listing attempt logged successfully');
    
    // Test listing result success logging
    console.log('\nTesting listing result success logging...');
    await marketplaceLogger.logListingResult(
      tokenId,
      saleId,
      true,
      {
        transactionHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
        saleType: 'FIXED_PRICE',
        price: '0.5'
      }
    );
    console.log('✓ Listing result (success) logged successfully');
    
    // Test listing result failure logging
    console.log('\nTesting listing result failure logging...');
    const listingError = new MockError('Failed to list NFT', 'CONTRACT_ERROR');
    await marketplaceLogger.logListingResult(
      tokenId,
      null,
      false,
      { error: { message: listingError.message, code: listingError.code } }
    );
    const error = new Error('Failed to approve marketplace');
    error.code = 'APPROVAL_REJECTED';
    
    await marketplaceLogger.logApprovalResult(
      TEST_TOKEN_ID,
      false, // failure
      { 
        error: error,
        transactionHash: null
      }
    );
    
    // Log transaction error
    console.log('\nLogging transaction error...');
    await marketplaceLogger.logTransactionError(
      TEST_TOKEN_ID,
      error,
      'APPROVAL',
      { 
        marketplaceAddress: TEST_MARKETPLACE_ADDRESS,
        userAddress: '0xabcdef1234567890abcdef1234567890abcdef12'
      }
    );
    
    return true;
  } catch (error) {
    console.error('Error in approval workflow test:', error);
    return false;
  }
}

/**
 * Test listing workflow
 */
async function testListingWorkflow() {
  console.log('\n=== Testing Listing Workflow ===');
  
  try {
    // Log listing attempt
    console.log('\nLogging listing attempt...');
    await marketplaceLogger.logListingAttempt(
      TEST_TOKEN_ID,
      { 
        saleType: 'fixed',
        price: '1.5 AVAX',
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      }
    );
    
    // Log listing success
    console.log('\nLogging listing success...');
    await marketplaceLogger.logListingResult(
      TEST_TOKEN_ID,
      TEST_SALE_ID,
      true, // success
      { 
        transactionHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
      }
    );
    
    return true;
  } catch (error) {
    console.error('Error in listing workflow test:', error);
    return false;
  }
}

/**
 * Run all tests
 */
async function runTests() {
  console.log('=== Frontend Marketplace Logger Test Script ===');
  console.log('Test Token ID:', TEST_TOKEN_ID);
  console.log('Test Marketplace Address:', TEST_MARKETPLACE_ADDRESS);
  
  // Run approval workflow test
  const approvalWorkflowOk = await testApprovalWorkflow();
  
  // Run listing workflow test
  const listingWorkflowOk = await testListingWorkflow();
  
  // Print summary
  console.log('\n=== Test Summary ===');
  console.log(`Approval Workflow: ${approvalWorkflowOk ? '✅ OK' : '❌ Failed'}`);
  console.log(`Listing Workflow: ${listingWorkflowOk ? '✅ OK' : '❌ Failed'}`);
  
  console.log('\n=== Request Log ===');
  console.log(`Total requests sent: ${requestLog.length}`);
  
  requestLog.forEach((req, index) => {
    console.log(`\nRequest ${index + 1}:`);
    console.log(`URL: ${req.url}`);
    console.log(`Timestamp: ${req.timestamp.toISOString()}`);
    console.log(`Event Type: ${req.data.type}`);
    console.log(`Token ID: ${req.data.tokenId}`);
  });
  
  // Restore original axios
  marketplaceLogger.axios = originalAxios;
}

// Run the tests
runTests().catch(console.error);
