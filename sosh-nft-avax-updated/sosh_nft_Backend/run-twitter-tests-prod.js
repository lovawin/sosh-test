/**
 * Script to run both test configurations on the production server
 * This will help confirm our hypothesis about the middleware order
 */

const { spawn } = require('child_process');
const axios = require('axios');

// Function to run a test script and capture its output
async function runTest(scriptPath, port) {
  return new Promise((resolve, reject) => {
    console.log(`\n=== STARTING TEST: ${scriptPath} ===\n`);
    
    // Spawn the test script as a child process
    const child = spawn('node', [scriptPath]);
    
    let output = '';
    
    // Capture stdout
    child.stdout.on('data', (data) => {
      const text = data.toString();
      output += text;
      console.log(`[${scriptPath}] ${text.trim()}`);
    });
    
    // Capture stderr
    child.stderr.on('data', (data) => {
      const text = data.toString();
      output += text;
      console.error(`[${scriptPath}] ERROR: ${text.trim()}`);
    });
    
    // Handle process exit
    child.on('close', (code) => {
      if (code !== 0) {
        console.error(`[${scriptPath}] Process exited with code ${code}`);
        resolve({ success: false, output, code });
        return;
      }
      
      resolve({ success: true, output, code });
    });
    
    // Wait for the server to start
    setTimeout(async () => {
      try {
        // Make a request to the test-login endpoint
        console.log(`Making request to http://localhost:${port}/test-login`);
        await axios.get(`http://localhost:${port}/test-login`);
      } catch (error) {
        console.error(`Error making request to test server: ${error.message}`);
      }
    }, 2000);
    
    // Kill the process after 10 seconds
    setTimeout(() => {
      console.log(`\n=== STOPPING TEST: ${scriptPath} ===\n`);
      child.kill();
    }, 10000);
  });
}

// Run both tests
async function runTests() {
  try {
    console.log('\n=== TWITTER SESSION TESTS ===\n');
    console.log('These tests will help confirm if the middleware order is causing the Twitter OAuth issue');
    
    console.log('\n=== TEST 1: Session middleware FIRST (proposed solution) ===\n');
    const test1Result = await runTest('./test-twitter-session-prod.js', 3001);
    
    console.log('\n=== TEST 1 COMPLETED ===\n');
    
    console.log('\n=== TEST 2: JWT middleware FIRST (current configuration) ===\n');
    const test2Result = await runTest('./test-twitter-session-prod-current.js', 3002);
    
    console.log('\n=== TEST 2 COMPLETED ===\n');
    
    console.log('\n=== TEST RESULTS SUMMARY ===\n');
    console.log('Test 1 (Session First):', test1Result.success ? 'PASSED' : 'FAILED');
    console.log('Test 2 (JWT First):', test2Result.success ? 'PASSED' : 'FAILED');
    
    console.log('\n=== CONCLUSION ===\n');
    if (test1Result.success && !test2Result.success) {
      console.log('The tests confirm our hypothesis: The middleware order is causing the Twitter OAuth issue.');
      console.log('RECOMMENDATION: Move the session middleware before the JWT middleware in app.js');
    } else if (test1Result.success && test2Result.success) {
      console.log('Both tests passed. The middleware order may not be the only issue.');
      console.log('RECOMMENDATION: Still try moving the session middleware before the JWT middleware, but look for other issues as well.');
    } else {
      console.log('Test results are inconclusive. Further investigation is needed.');
    }
    
  } catch (error) {
    console.error('Error running tests:', error);
  }
}

// Run the tests
runTests();
