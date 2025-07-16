/**
 * Test Runner Script
 * 
 * This script sets up the environment variables needed to run the diagnostic tests
 * and then executes each test in sequence.
 */

const { spawn } = require('child_process');
const path = require('path');

// Set the MongoDB connection string to the production server
// Replace with the actual IP address of the MongoDB server
process.env.MONGODB_CONNECTION_STRING = 'mongodb://soshadmin:VHUCTYXRTFYGJYFUTVHVYU@3.216.178.231:27017/sosh?authSource=admin';

// Set NODE_ENV to production
process.env.NODE_ENV = 'production';

// List of test scripts to run
const testScripts = [
  'test-twitter-callback.js',
  'test-mongo-logging-transport.js',
  'test-twitter-oauth-logging.js',
  'test-twitter-oauth-error-logging.js'
];

// Function to run a script and return a promise
function runScript(scriptPath) {
  return new Promise((resolve, reject) => {
    console.log(`\n=== Running ${path.basename(scriptPath)} ===\n`);
    
    const child = spawn('node', [scriptPath], {
      stdio: 'inherit',
      env: process.env
    });
    
    child.on('close', (code) => {
      if (code !== 0) {
        console.log(`\n${path.basename(scriptPath)} exited with code ${code}\n`);
        resolve(); // Continue with next test even if this one fails
      } else {
        console.log(`\n${path.basename(scriptPath)} completed successfully\n`);
        resolve();
      }
    });
    
    child.on('error', (err) => {
      console.error(`Error running ${path.basename(scriptPath)}:`, err);
      resolve(); // Continue with next test even if this one fails
    });
  });
}

// Run the tests in sequence
async function runTests() {
  console.log('=== Starting Diagnostic Tests ===\n');
  console.log('Using MongoDB connection:', process.env.MONGODB_CONNECTION_STRING.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'));
  
  for (const script of testScripts) {
    try {
      await runScript(script);
    } catch (error) {
      console.error(`Error running ${script}:`, error);
    }
  }
  
  console.log('\n=== All Tests Completed ===\n');
}

// Run the tests
runTests().catch(console.error);
