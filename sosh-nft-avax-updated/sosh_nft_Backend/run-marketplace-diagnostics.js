/**
 * Marketplace Logging Diagnostics Runner
 * 
 * This script runs all the diagnostic tests for the marketplace logging system
 * and provides a comprehensive report of the results.
 * 
 * Usage: node run-marketplace-diagnostics.js
 */

const { spawn } = require('child_process');
const path = require('path');

// Configuration
const TESTS = [
  {
    name: 'MongoDB Connection Check',
    script: 'check-mongo-connection.js',
    description: 'Checks MongoDB connection and verifies marketplace_logs collection'
  },
  {
    name: 'Backend Marketplace Logging Test',
    script: 'test-marketplace-logging.js',
    description: 'Tests backend marketplace logging functionality'
  },
  {
    name: 'Frontend Integration Check',
    script: 'check-frontend-integration.js',
    description: 'Checks if frontend code properly calls marketplace logger'
  },
  {
    name: 'Marketplace Logs Analysis',
    script: 'check-marketplace-logs.js',
    description: 'Analyzes existing marketplace logs for patterns',
    args: ['--days=30', '--verbose']
  }
];

/**
 * Run a diagnostic test
 */
function runTest(test) {
  return new Promise((resolve) => {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`Running ${test.name}: ${test.description}`);
    console.log(`Script: ${test.script}`);
    if (test.args && test.args.length > 0) {
      console.log(`Arguments: ${test.args.join(' ')}`);
    }
    console.log(`${'='.repeat(80)}\n`);
    
    const scriptPath = path.join(__dirname, test.script);
    const args = test.args || [];
    
    const child = spawn('node', [scriptPath, ...args], {
      stdio: 'inherit'
    });
    
    child.on('close', (code) => {
      const result = {
        name: test.name,
        script: test.script,
        exitCode: code,
        success: code === 0
      };
      
      console.log(`\n${'='.repeat(80)}`);
      console.log(`${test.name} ${result.success ? 'completed successfully' : 'failed'} (exit code: ${code})`);
      console.log(`${'='.repeat(80)}\n`);
      
      resolve(result);
    });
  });
}

/**
 * Run all diagnostic tests
 */
async function runAllTests() {
  console.log('=== Marketplace Logging Diagnostics ===');
  console.log(`Running ${TESTS.length} diagnostic tests\n`);
  
  const results = [];
  
  for (const test of TESTS) {
    const result = await runTest(test);
    results.push(result);
  }
  
  // Print summary
  console.log('\n=== Diagnostic Summary ===');
  
  const successCount = results.filter(r => r.success).length;
  console.log(`${successCount} of ${results.length} tests completed successfully`);
  
  results.forEach((result, index) => {
    console.log(`\n${index + 1}. ${result.name}: ${result.success ? '✅ Passed' : '❌ Failed'}`);
    console.log(`   Script: ${result.script}`);
    console.log(`   Exit Code: ${result.exitCode}`);
  });
  
  // Print recommendations based on results
  console.log('\n=== Recommendations ===');
  
  if (results.every(r => r.success)) {
    console.log('All tests passed successfully. Here are some general recommendations:');
    console.log('1. Check if the frontend code is correctly calling the marketplace logger when approvals fail');
    console.log('2. Verify that the SSH tunnel to Mongo Express is working correctly');
    console.log('3. Check if there are any network issues between the frontend and backend');
    console.log('4. Ensure that the MongoDB collection has the correct permissions');
  } else {
    console.log('Some tests failed. Here are specific recommendations based on the failures:');
    
    // MongoDB connection issues
    if (!results[0].success) {
      console.log('\nMongoDB Connection Issues:');
      console.log('- Check MongoDB connection string in environment variables');
      console.log('- Verify MongoDB server is running');
      console.log('- Check network connectivity to MongoDB server');
      console.log('- Ensure the marketplace_logs collection exists');
    }
    
    // Backend logging issues
    if (!results[1].success) {
      console.log('\nBackend Logging Issues:');
      console.log('- Check marketplaceLogger implementation for errors');
      console.log('- Verify MongoDB transport is properly configured');
      console.log('- Check if the backend API server is running');
      console.log('- Verify marketplace logging routes are properly registered');
    }
    
    // Frontend integration issues
    if (!results[2].success) {
      console.log('\nFrontend Integration Issues:');
      console.log('- Add proper error handling for approval operations');
      console.log('- Import the marketplaceLogger in files that handle approvals');
      console.log('- Call logApprovalResult(tokenId, false, { error }) when approvals fail');
      console.log('- Call logTransactionError(tokenId, error, "APPROVAL") for transaction errors');
    }
  }
  
  console.log('\nNext Steps:');
  console.log('1. Review the detailed output of each test above');
  console.log('2. Fix any issues identified by the tests');
  console.log('3. Run the tests again to verify the fixes');
  console.log('4. If all tests pass but the issue persists, consider checking:');
  console.log('   - Browser console for frontend errors');
  console.log('   - Backend server logs for API errors');
  console.log('   - Network requests in browser developer tools');
}

// Run all tests
runAllTests().catch(console.error);
