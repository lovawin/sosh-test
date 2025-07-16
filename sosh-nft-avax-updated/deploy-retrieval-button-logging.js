/**
 * Deployment Script for Retrieval Button Enhanced Logging
 * 
 * This script automates the deployment of the enhanced logging for the NFT retrieval button functionality.
 * It backs up the current files, copies the updated files to the appropriate locations,
 * and restarts the necessary services.
 * 
 * Usage:
 *   node deploy-retrieval-button-logging.js [--env=production|staging]
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

// Parse command line arguments
const argv = yargs(hideBin(process.argv))
  .option('env', {
    type: 'string',
    description: 'Deployment environment',
    default: 'staging',
    choices: ['production', 'staging']
  })
  .help()
  .alias('help', 'h')
  .argv;

// Configuration
const config = {
  staging: {
    frontendDir: '/path/to/staging/frontend',
    scriptsDir: '/path/to/staging/scripts',
    dockerComposeDir: '/path/to/staging/docker-compose'
  },
  production: {
    frontendDir: '/path/to/production/frontend',
    scriptsDir: '/path/to/production/scripts',
    dockerComposeDir: '/path/to/production/docker-compose'
  }
};

// Files to deploy
const filesToDeploy = [
  {
    source: 'frontend/src/components/myProfileComponents/postCards/postCard.js',
    destination: 'src/components/myProfileComponents/postCards/postCard.js',
    type: 'frontend'
  },
  {
    source: 'check-retrieval-button-logs.js',
    destination: 'check-retrieval-button-logs.js',
    type: 'script'
  }
];

// Backup directory
const backupDir = path.join(__dirname, 'backups', new Date().toISOString().replace(/:/g, '-'));

/**
 * Create backup of files
 */
function createBackups() {
  console.log('Creating backups...');
  
  // Create backup directory if it doesn't exist
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  
  // Create subdirectories
  fs.mkdirSync(path.join(backupDir, 'frontend'), { recursive: true });
  fs.mkdirSync(path.join(backupDir, 'scripts'), { recursive: true });
  
  // Backup frontend files
  filesToDeploy.forEach(file => {
    if (file.type === 'frontend') {
      const envConfig = config[argv.env];
      const sourcePath = path.join(envConfig.frontendDir, file.destination);
      const backupPath = path.join(backupDir, 'frontend', path.basename(file.destination));
      
      if (fs.existsSync(sourcePath)) {
        fs.copyFileSync(sourcePath, backupPath);
        console.log(`Backed up ${sourcePath} to ${backupPath}`);
      } else {
        console.log(`Warning: ${sourcePath} does not exist, skipping backup`);
      }
    }
  });
  
  console.log('Backups created successfully');
}

/**
 * Deploy files to the appropriate locations
 */
function deployFiles() {
  console.log(`Deploying files to ${argv.env} environment...`);
  
  filesToDeploy.forEach(file => {
    const sourcePath = path.join(__dirname, file.source);
    let destinationPath;
    
    if (file.type === 'frontend') {
      destinationPath = path.join(config[argv.env].frontendDir, file.destination);
    } else if (file.type === 'script') {
      destinationPath = path.join(config[argv.env].scriptsDir, file.destination);
    }
    
    // Create directory if it doesn't exist
    const destinationDir = path.dirname(destinationPath);
    if (!fs.existsSync(destinationDir)) {
      fs.mkdirSync(destinationDir, { recursive: true });
    }
    
    // Copy file
    fs.copyFileSync(sourcePath, destinationPath);
    console.log(`Deployed ${sourcePath} to ${destinationPath}`);
  });
  
  console.log('Files deployed successfully');
}

/**
 * Rebuild and restart services
 */
function rebuildAndRestart() {
  console.log('Rebuilding and restarting services...');
  
  try {
    // Navigate to frontend directory
    process.chdir(config[argv.env].frontendDir);
    
    // Install dependencies (if needed)
    console.log('Installing dependencies...');
    execSync('npm install', { stdio: 'inherit' });
    
    // Build frontend
    console.log('Building frontend...');
    execSync('npm run build', { stdio: 'inherit' });
    
    // Navigate to docker-compose directory
    process.chdir(config[argv.env].dockerComposeDir);
    
    // Restart frontend container
    console.log('Restarting frontend container...');
    execSync('docker-compose down frontend', { stdio: 'inherit' });
    execSync('docker-compose up -d frontend', { stdio: 'inherit' });
    
    console.log('Services rebuilt and restarted successfully');
  } catch (error) {
