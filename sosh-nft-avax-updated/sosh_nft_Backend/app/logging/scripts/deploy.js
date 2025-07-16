/**
 * Logging System Deployment Script
 * 
 * @description Sets up logging system with MongoDB transport
 */

const fs = require('fs');
const path = require('path');
const setupHttp = require('./setupHttp');

async function createDirectories() {
  console.log('Creating directories...');
  const dirs = [
    'logs',
    'logs/dev',
    'logs/prod',
    'logs/backup'
  ];

  dirs.forEach(dir => {
    const fullPath = path.join(process.cwd(), dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }
  });
}

async function backupExistingLogs() {
  console.log('Backing up existing logs...');
  const backupDir = path.join(process.cwd(), 'logs/backup', `backup-${new Date().toISOString().split('T')[0]}`);
  
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const logDir = path.join(process.cwd(), 'logs/dev');
  if (fs.existsSync(logDir)) {
    const files = fs.readdirSync(logDir);
    files.forEach(file => {
      if (file.endsWith('.log')) {
        const srcPath = path.join(logDir, file);
        const destPath = path.join(backupDir, file);
        fs.copyFileSync(srcPath, file);
        console.log(`Backed up: ${file}`);
      }
    });
  }
}

function verifyConfiguration() {
  console.log('Verifying configuration...');
  const requiredFiles = [
    'app/logging/config/logConfig.js',
    'app/logging/transports/httpTransport.js',
    'config/prod/dev.env'
  ];

  requiredFiles.forEach(file => {
    const fullPath = path.join(process.cwd(), file);
    if (!fs.existsSync(fullPath)) {
      throw new Error(`Required file not found: ${file}`);
    }
  });

  console.log('Configuration verified');
}

function setupLogRotation() {
  console.log('Setting up log rotation...');
  // Log rotation is handled by winston-daily-rotate-file transport
  // which is configured in logConfig.js
  console.log('Log rotation configured');
}

async function deploy() {
  try {
    console.log('Starting logging system deployment...');
    
    // Create directories
    createDirectories();
    
    // Backup existing logs
    await backupExistingLogs();
    
    // Verify configuration
    verifyConfiguration();
    
    // Setup log rotation
    setupLogRotation();
    
    // Setup HTTP logging
    console.log('Setting up HTTP logging...');
    await setupHttp();
    
    console.log('Deployment completed successfully');
  } catch (error) {
    console.error('Deployment failed:', error);
    throw error;
  }
}

// Run deployment if called directly
if (require.main === module) {
  deploy().catch(error => {
    console.error('Deployment failed:', error);
    process.exit(1);
  });
}

module.exports = deploy;
