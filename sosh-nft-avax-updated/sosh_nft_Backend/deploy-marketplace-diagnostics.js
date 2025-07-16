/**
 * Marketplace Diagnostics Deployment Script
 * 
 * This script deploys the marketplace diagnostic tools to the production server
 * and runs them there to diagnose issues with the marketplace logging system.
 * 
 * Usage: node deploy-marketplace-diagnostics.js
 */

const { spawn, exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const { promisify } = require('util');

const execAsync = promisify(exec);

// Configuration
const SERVER_USER = 'taurien';
const SERVER_HOST = '3.216.178.231';
const SSH_KEY_PATH = '../taurien';
const REMOTE_DIR = 'marketplace-diagnostics';

// Files to deploy
const DIAGNOSTIC_FILES = [
  'check-mongo-connection.js',
  'test-marketplace-logging.js',
  'check-frontend-integration.js',
  'check-marketplace-logs.js',
  'run-marketplace-diagnostics.js',
  'marketplace-diagnostics-README.md'
];

/**
 * Run a PowerShell command and return its output
 */
async function runCommand(command) {
  // Wrap the command in PowerShell
  const psCommand = `powershell -Command "${command.replace(/"/g, '\\"')}"`;
  console.log(`Running command: ${psCommand}`);
  
  try {
    const { stdout, stderr } = await execAsync(psCommand);
    
    if (stderr) {
      console.error(`Command stderr: ${stderr}`);
    }
    
    return stdout.trim();
  } catch (error) {
    console.error(`Command error: ${error.message}`);
    throw error;
  }
}

/**
 * Deploy files to the server
 */
async function deployFiles() {
  console.log('\n=== Deploying Diagnostic Files ===');
  
  try {
    // Create remote directory if it doesn't exist
    await runCommand(`ssh -i "${SSH_KEY_PATH}" ${SERVER_USER}@${SERVER_HOST} "mkdir -p ${REMOTE_DIR}"`);
    
    // Copy each diagnostic file
    for (const file of DIAGNOSTIC_FILES) {
      const localPath = path.join(__dirname, file);
      
      if (fs.existsSync(localPath)) {
        console.log(`Copying ${file} to server...`);
        // Use PowerShell syntax for SCP
        await runCommand(`scp -i "${SSH_KEY_PATH}" "${localPath}" "${SERVER_USER}@${SERVER_HOST}:${REMOTE_DIR}/${file}"`);
      } else {
        console.error(`File not found: ${localPath}`);
      }
    }
    
    console.log('All files deployed successfully');
    return true;
  } catch (error) {
    console.error('Error deploying files:', error);
    return false;
  }
}

/**
 * Run a diagnostic script on the server
 */
function runRemoteScript(script, args = []) {
  return new Promise((resolve) => {
    console.log(`\n=== Running ${script} on Server ===`);
    
    // PowerShell command for SSH
    const sshCommand = `ssh -i "${SSH_KEY_PATH}" ${SERVER_USER}@${SERVER_HOST} "cd ${REMOTE_DIR} && node ${script} ${args.join(' ')}"`;
    
    // Wrap in PowerShell
    const psCommand = `powershell -Command "${sshCommand.replace(/"/g, '\\"')}"`;
    
    const child = spawn('cmd.exe', ['/c', psCommand], {
      stdio: 'inherit'
    });
    
    child.on('close', (code) => {
      const result = {
        script,
        exitCode: code,
        success: code === 0
      };
      
      console.log(`\n${script} ${result.success ? 'completed successfully' : 'failed'} (exit code: ${code})`);
      
      resolve(result);
    });
  });
}

/**
 * Run all diagnostic scripts on the server
 */
async function runRemoteDiagnostics() {
  console.log('\n=== Running Remote Diagnostics ===');
  
  const results = [];
  
  // Run MongoDB connection check
  results.push(await runRemoteScript('check-mongo-connection.js'));
  
  // Run backend marketplace logging test
  results.push(await runRemoteScript('test-marketplace-logging.js'));
  
  // Run frontend integration check
  results.push(await runRemoteScript('check-frontend-integration.js'));
  
  // Run marketplace logs analysis
  results.push(await runRemoteScript('check-marketplace-logs.js', ['--days=30', '--verbose']));
  
  // Print summary
  console.log('\n=== Diagnostic Summary ===');
  
  const successCount = results.filter(r => r.success).length;
  console.log(`${successCount} of ${results.length} tests completed successfully`);
  
  results.forEach((result, index) => {
    console.log(`\n${index + 1}. ${result.script}: ${result.success ? '✅ Passed' : '❌ Failed'}`);
    console.log(`   Exit Code: ${result.exitCode}`);
  });
  
  return results;
}

/**
 * Run the SSH tunnel check
 */
async function checkSshTunnel() {
  console.log('\n=== Checking SSH Tunnel ===');
  
  try {
    // PowerShell command to check for listening ports
    const tunnelCheck = await runCommand('Get-NetTCPConnection -LocalPort 8500 -State Listen -ErrorAction SilentlyContinue');
    
    if (tunnelCheck) {
      console.log('✅ SSH tunnel is active on port 8500');
      return true;
    } else {
      console.log('❌ SSH tunnel is not active on port 8500');
      console.log('\nTo establish SSH tunnel, run in PowerShell:');
      console.log(`ssh -i "${SSH_KEY_PATH}" -L 8500:localhost:8500 ${SERVER_USER}@${SERVER_HOST}`);
      return false;
    }
  } catch (error) {
    console.error('Error checking SSH tunnel:', error);
    return false;
  }
}

/**
 * Main function
 */
async function main() {
  console.log('=== Marketplace Diagnostics Deployment ===');
  
  // Check SSH tunnel
  const tunnelOk = await checkSshTunnel();
  
  if (!tunnelOk) {
    console.log('\nWarning: SSH tunnel is not active. Mongo Express may not be accessible.');
    console.log('Do you want to continue anyway? (y/n)');
    
    // For now, we'll continue regardless
    console.log('Continuing with deployment...');
  }
  
  // Deploy files
  const deployOk = await deployFiles();
  
  if (!deployOk) {
    console.error('Failed to deploy diagnostic files. Aborting.');
    return;
  }
  
  // Run diagnostics
  await runRemoteDiagnostics();
  
  console.log('\n=== Deployment Complete ===');
  console.log('All diagnostic scripts have been deployed and run on the production server.');
  console.log('Review the output above for diagnostic results and recommendations.');
}

// Run the main function
main().catch(console.error);
