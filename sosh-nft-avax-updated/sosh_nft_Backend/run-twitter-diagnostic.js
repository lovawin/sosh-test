/**
 * Script to run both Twitter OAuth diagnostic servers
 * 
 * This script will:
 * 1. Start both diagnostic servers (proposed and current configurations)
 * 2. Provide instructions for testing both configurations
 * 3. Help identify the exact cause of the Twitter OAuth session issue
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Function to run a diagnostic server and capture its output
function runDiagnosticServer(scriptPath, logFilePath) {
  console.log(`Starting diagnostic server: ${scriptPath}`);
  
  // Create log file stream
  const logStream = fs.createWriteStream(logFilePath, { flags: 'a' });
  
  // Log start time
  const startTime = new Date().toISOString();
  logStream.write(`\n\n=== DIAGNOSTIC SERVER STARTED AT ${startTime} ===\n\n`);
  
  // Spawn the diagnostic server as a child process
  const child = spawn('node', [scriptPath]);
  
  // Capture stdout
  child.stdout.on('data', (data) => {
    const text = data.toString();
    process.stdout.write(`[${path.basename(scriptPath)}] ${text}`);
    logStream.write(text);
  });
  
  // Capture stderr
  child.stderr.on('data', (data) => {
    const text = data.toString();
    process.stderr.write(`[${path.basename(scriptPath)}] ERROR: ${text}`);
    logStream.write(`ERROR: ${text}`);
  });
  
  // Handle process exit
  child.on('close', (code) => {
    const endTime = new Date().toISOString();
    logStream.write(`\n\n=== DIAGNOSTIC SERVER EXITED WITH CODE ${code} AT ${endTime} ===\n\n`);
    logStream.end();
    console.log(`Diagnostic server ${scriptPath} exited with code ${code}`);
  });
  
  return child;
}

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, 'diagnostic-logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Start both diagnostic servers
const proposedServer = runDiagnosticServer(
  path.join(__dirname, 'twitter-oauth-diagnostic.js'),
  path.join(logsDir, 'proposed-config.log')
);

const currentServer = runDiagnosticServer(
  path.join(__dirname, 'twitter-oauth-diagnostic-current.js'),
  path.join(logsDir, 'current-config.log')
);

// Print instructions
console.log('\n=== TWITTER OAUTH DIAGNOSTIC INSTRUCTIONS ===\n');
console.log('Two diagnostic servers are now running:');
console.log('1. Proposed Configuration (Session First): http://localhost:3003');
console.log('2. Current Configuration (JWT First): http://localhost:3004');
console.log('\nTo test each configuration:');
console.log('1. Open each URL in a browser');
console.log('2. Click on "Login with Twitter (Manual)" or "Login with Twitter (Passport)"');
console.log('3. Complete the Twitter OAuth flow');
console.log('4. Check the terminal output and log files for detailed session information');
console.log('\nLog files are being written to:');
console.log(`- Proposed Configuration: ${path.join(logsDir, 'proposed-config.log')}`);
console.log(`- Current Configuration: ${path.join(logsDir, 'current-config.log')}`);
console.log('\nPress Ctrl+C to stop both servers when testing is complete.');

// Handle process termination
process.on('SIGINT', () => {
  console.log('\nStopping diagnostic servers...');
  proposedServer.kill();
  currentServer.kill();
  process.exit(0);
});
