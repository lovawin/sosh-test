const { spawn } = require('child_process');
const axios = require('axios');

// Function to run a test script and capture its output
async function runTest(scriptPath, port) {
  return new Promise((resolve, reject) => {
    console.log(`Starting test: ${scriptPath}`);
    
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
        reject(new Error(`Process exited with code ${code}`));
        return;
      }
      
      resolve(output);
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
      console.log(`Stopping test: ${scriptPath}`);
      child.kill();
    }, 10000);
  });
}

// Run both tests
async function runTests() {
  try {
    console.log('=== RUNNING TESTS ===');
    console.log('Test 1: Session middleware FIRST (proposed solution)');
    await runTest('./test-twitter-session.js', 3001);
    
    console.log('\n=== Test 1 completed ===\n');
    
    console.log('Test 2: Session middleware AFTER JWT (current configuration)');
    await runTest('./test-twitter-session-current.js', 3002);
    
    console.log('\n=== Test 2 completed ===\n');
    
    console.log('=== ALL TESTS COMPLETED ===');
  } catch (error) {
    console.error('Error running tests:', error);
  }
}

// Run the tests
runTests();
