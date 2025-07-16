/**
 * Frontend Integration Check Script
 * 
 * This script checks if the frontend code is properly calling the marketplace logger
 * when an approval fails. It analyzes the frontend code to find where approval operations
 * are handled and verifies that logging methods are called.
 * 
 * Usage: node check-frontend-integration.js
 */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const readFileAsync = promisify(fs.readFile);
const readdirAsync = promisify(fs.readdir);
const statAsync = promisify(fs.stat);

// Configuration
const FRONTEND_DIR = path.join(__dirname, '..', 'frontend');
const SRC_DIR = path.join(FRONTEND_DIR, 'src');

// Patterns to search for
const APPROVAL_PATTERNS = [
  /isApprovedForAll/,
  /setApprovalForAll/,
  /approve\(/,
  /approval/i
];

const MARKETPLACE_PATTERNS = [
  /marketplace/i,
  /listing/i,
  /createSale/,
  /createListing/,
  /listNFT/
];

const LOGGER_PATTERNS = [
  /marketplaceLogger/,
  /logApprovalAttempt/,
  /logApprovalResult/,
  /logTransactionError/
];

/**
 * Find files matching patterns
 */
async function findFiles(dir, patterns, results = []) {
  const files = await readdirAsync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = await statAsync(filePath);
    
    if (stat.isDirectory()) {
      await findFiles(filePath, patterns, results);
    } else if (
      file.endsWith('.js') || 
      file.endsWith('.jsx') || 
      file.endsWith('.ts') || 
      file.endsWith('.tsx')
    ) {
      try {
        const content = await readFileAsync(filePath, 'utf8');
        
        // Check if file matches any pattern
        const matchesPattern = patterns.some(pattern => pattern.test(content));
        
        if (matchesPattern) {
          results.push({
            path: filePath,
            relativePath: path.relative(FRONTEND_DIR, filePath)
          });
        }
      } catch (error) {
        console.error(`Error reading file ${filePath}:`, error);
      }
    }
  }
  
  return results;
}

/**
 * Analyze file for marketplace approval and logging
 */
async function analyzeFile(filePath) {
  try {
    const content = await readFileAsync(filePath, 'utf8');
    const lines = content.split('\n');
    
    // Check for imports
    const hasMarketplaceLoggerImport = /import.*marketplaceLogger/.test(content);
    
    // Find approval-related code
    const approvalLines = [];
    const loggingLines = [];
    
    lines.forEach((line, index) => {
      // Check for approval-related code
      if (APPROVAL_PATTERNS.some(pattern => pattern.test(line))) {
        approvalLines.push({
          line: index + 1,
          content: line.trim()
        });
      }
      
      // Check for logging-related code
      if (LOGGER_PATTERNS.some(pattern => pattern.test(line))) {
        loggingLines.push({
          line: index + 1,
          content: line.trim()
        });
      }
    });
    
    // Check for approval failure handling
    const hasApprovalFailureHandling = content.includes('catch') && 
      approvalLines.some(({ line }) => {
        // Look for catch blocks near approval lines
        const startLine = Math.max(0, line - 20);
        const endLine = Math.min(lines.length - 1, line + 20);
        const surroundingCode = lines.slice(startLine, endLine).join('\n');
        return surroundingCode.includes('catch');
      });
    
    // Check for logging in failure handling
    const hasLoggingInFailureHandling = content.includes('catch') && 
      content.includes('marketplaceLogger') &&
      (content.includes('logApprovalResult') || content.includes('logTransactionError'));
    
    return {
      path: filePath,
      relativePath: path.relative(FRONTEND_DIR, filePath),
      hasMarketplaceLoggerImport,
      approvalLines,
      loggingLines,
      hasApprovalFailureHandling,
      hasLoggingInFailureHandling
    };
  } catch (error) {
    console.error(`Error analyzing file ${filePath}:`, error);
    return {
      path: filePath,
      relativePath: path.relative(FRONTEND_DIR, filePath),
      error: error.message
    };
  }
}

/**
 * Run the check
 */
async function runCheck() {
  console.log('=== Frontend Integration Check ===');
  console.log(`Frontend directory: ${FRONTEND_DIR}`);
  
  try {
    // Find marketplace-related files
    console.log('\nFinding marketplace-related files...');
    const marketplaceFiles = await findFiles(SRC_DIR, MARKETPLACE_PATTERNS);
    console.log(`Found ${marketplaceFiles.length} marketplace-related files`);
    
    // Find approval-related files
    console.log('\nFinding approval-related files...');
    const approvalFiles = await findFiles(SRC_DIR, APPROVAL_PATTERNS);
    console.log(`Found ${approvalFiles.length} approval-related files`);
    
    // Find logger-related files
    console.log('\nFinding logger-related files...');
    const loggerFiles = await findFiles(SRC_DIR, LOGGER_PATTERNS);
    console.log(`Found ${loggerFiles.length} logger-related files`);
    
    // Combine unique files
    const allFiles = [...new Set([
      ...marketplaceFiles, 
      ...approvalFiles,
      ...loggerFiles
    ].map(file => file.path))].map(path => ({ path }));
    
    console.log(`\nAnalyzing ${allFiles.length} unique files...`);
    
    // Analyze each file
    const analysisResults = await Promise.all(
      allFiles.map(file => analyzeFile(file.path))
    );
    
    // Filter files with approval code
    const filesWithApproval = analysisResults.filter(
      result => result.approvalLines && result.approvalLines.length > 0
    );
    
    console.log(`\nFound ${filesWithApproval.length} files with approval-related code:`);
    filesWithApproval.forEach(file => {
      console.log(`\n- ${file.relativePath}`);
      console.log(`  Approval lines: ${file.approvalLines.length}`);
      console.log(`  Logging lines: ${file.loggingLines.length}`);
      console.log(`  Imports marketplace logger: ${file.hasMarketplaceLoggerImport ? 'Yes' : 'No'}`);
      console.log(`  Has approval failure handling: ${file.hasApprovalFailureHandling ? 'Yes' : 'No'}`);
      console.log(`  Logs approval failures: ${file.hasLoggingInFailureHandling ? 'Yes' : 'No'}`);
      
      // Show approval lines
      if (file.approvalLines.length > 0) {
        console.log('\n  Approval code:');
        file.approvalLines.slice(0, 3).forEach(line => {
          console.log(`    Line ${line.line}: ${line.content}`);
        });
        if (file.approvalLines.length > 3) {
          console.log(`    ... and ${file.approvalLines.length - 3} more lines`);
        }
      }
      
      // Show logging lines
      if (file.loggingLines.length > 0) {
        console.log('\n  Logging code:');
        file.loggingLines.slice(0, 3).forEach(line => {
          console.log(`    Line ${line.line}: ${line.content}`);
        });
        if (file.loggingLines.length > 3) {
          console.log(`    ... and ${file.loggingLines.length - 3} more lines`);
        }
      }
    });
    
    // Check for potential issues
    const filesWithoutLogging = filesWithApproval.filter(
      file => !file.hasLoggingInFailureHandling
    );
    
    if (filesWithoutLogging.length > 0) {
      console.log('\n⚠️ Potential issues found:');
      console.log(`${filesWithoutLogging.length} files have approval code but may not log failures properly:`);
      
      filesWithoutLogging.forEach(file => {
        console.log(`\n- ${file.relativePath}`);
        if (!file.hasMarketplaceLoggerImport) {
          console.log('  ❌ Does not import marketplaceLogger');
        }
        if (!file.hasApprovalFailureHandling) {
          console.log('  ❌ May not handle approval failures properly');
        } else if (!file.hasLoggingInFailureHandling) {
          console.log('  ❌ Does not log approval failures');
        }
      });
      
      console.log('\nRecommendations:');
      console.log('1. Add proper error handling for approval operations');
      console.log('2. Import the marketplaceLogger in files that handle approvals');
      console.log('3. Call logApprovalResult(tokenId, false, { error }) when approvals fail');
      console.log('4. Call logTransactionError(tokenId, error, "APPROVAL") for transaction errors');
    } else if (filesWithApproval.length > 0) {
      console.log('\n✅ All files with approval code appear to log failures properly');
    } else {
      console.log('\n⚠️ No files with both approval code and failure logging were found');
      console.log('This could indicate that:');
      console.log('1. The approval code is in a different location');
      console.log('2. The approval process is handled by a third-party library');
      console.log('3. The approval process is not properly implemented');
    }
    
  } catch (error) {
    console.error('Error running check:', error);
  }
}

// Run the check
runCheck().catch(console.error);
