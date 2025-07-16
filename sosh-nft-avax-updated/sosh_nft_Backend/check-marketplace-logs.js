/**
 * Marketplace Logs Diagnostic Script
 * 
 * This script analyzes marketplace logs to identify patterns in failed transactions,
 * particularly focusing on approval and listing failures.
 * 
 * Usage:
 *   node check-marketplace-logs.js [--days=7] [--user=userId] [--token=tokenId]
 * 
 * Options:
 *   --days=N     : Look at logs from the last N days (default: 7)
 *   --user=ID    : Filter logs for a specific user ID
 *   --token=ID   : Filter logs for a specific token ID
 *   --verbose    : Show detailed log entries
 *   --failures   : Show only failures
 *   --errors     : Also check error logs for marketplace errors
 */

require('dotenv').config();
const { MongoClient } = require('mongodb');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

// Parse command line arguments
const argv = yargs(hideBin(process.argv))
  .option('days', {
    type: 'number',
    description: 'Number of days to look back',
    default: 7
  })
  .option('user', {
    type: 'string',
    description: 'Filter by user ID'
  })
  .option('token', {
    type: 'string',
    description: 'Filter by token ID'
  })
  .option('verbose', {
    type: 'boolean',
    description: 'Show detailed log entries',
    default: false
  })
  .option('failures', {
    type: 'boolean',
    description: 'Show only failures',
    default: false
  })
  .option('errors', {
    type: 'boolean',
    description: 'Also check error logs for marketplace errors',
    default: false
  })
  .help()
  .alias('help', 'h')
  .argv;

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_CONNECTION_STRING || 'mongodb://localhost:27017';
const DB_NAME = process.env.NODE_ENV === 'production' ? 'sosh' : 'soshnew1';
const COLLECTION_NAME = 'marketplace_logs';
const ERROR_LOGS_COLLECTION = 'error_logs';

async function analyzeErrorLogs(client) {
  try {
    console.log('\n=== Analyzing Error Logs for Marketplace Errors ===');
    
    const db = client.db(DB_NAME);
    const collection = db.collection(ERROR_LOGS_COLLECTION);
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - argv.days);
    
    // Build query for marketplace-related errors
    const query = {
      timestamp: { $gte: startDate.toISOString(), $lte: endDate.toISOString() },
      type: 'MARKETPLACE_TRANSACTION_ERROR'
    };
    
    if (argv.token) {
      query['context.tokenId'] = argv.token;
    }
    
    // Get all error logs matching the query
    const logs = await collection.find(query).sort({ timestamp: -1 }).toArray();
    
    if (logs.length === 0) {
      console.log('No marketplace error logs found matching the criteria');
      return;
    }
    
    console.log(`Found ${logs.length} marketplace error logs`);
    
    // Group logs by subType
    const logsBySubType = {};
    logs.forEach(log => {
      const subType = log.subType || 'UNKNOWN';
      if (!logsBySubType[subType]) {
        logsBySubType[subType] = [];
      }
      logsBySubType[subType].push(log);
    });
    
    // Print summary by subType
    console.log('\n=== Error Logs by SubType ===');
    Object.keys(logsBySubType).forEach(subType => {
      console.log(`${subType}: ${logsBySubType[subType].length} errors`);
    });
    
    // Check for common error messages
    const errorMessages = {};
    logs.forEach(log => {
      if (log.error && log.error.message) {
        if (!errorMessages[log.error.message]) {
          errorMessages[log.error.message] = 0;
        }
        errorMessages[log.error.message]++;
      }
    });
    
    const commonErrors = Object.entries(errorMessages)
      .sort((a, b) => b[1] - a[1]);
    
    if (commonErrors.length > 0) {
      console.log('\nCommon Error Messages in Error Logs:');
      commonErrors.forEach(([message, count]) => {
        console.log(`"${message}": ${count} occurrences`);
      });
    }
    
    // Show detailed error logs if verbose
    if (argv.verbose) {
      console.log('\nDetailed Error Logs:');
      logs.slice(0, 10).forEach((log, index) => {
        console.log(`\n--- Error Log ${index + 1} ---`);
        console.log(`Timestamp: ${log.timestamp}`);
        console.log(`Type: ${log.type}`);
        console.log(`SubType: ${log.subType || 'UNKNOWN'}`);
        
        if (log.error) {
          console.log(`Error: ${log.error.message || JSON.stringify(log.error)}`);
          if (log.error.code) {
            console.log(`Error Code: ${log.error.code}`);
          }
        }
        
        if (log.context) {
          console.log('Context:');
          if (log.context.tokenId) {
            console.log(`  Token ID: ${log.context.tokenId}`);
          }
          if (log.context.saleId) {
            console.log(`  Sale ID: ${log.context.saleId}`);
          }
          if (log.context.userAddress) {
            console.log(`  User Address: ${log.context.userAddress}`);
          }
          if (log.context.price) {
            console.log(`  Price: ${log.context.price}`);
          }
        }
      });
      
      if (logs.length > 10) {
        console.log(`\n... and ${logs.length - 10} more error logs`);
      }
    }
    
    // Check for tokens with multiple errors
    const tokenErrors = {};
    logs.forEach(log => {
      if (log.context && log.context.tokenId) {
        const tokenId = log.context.tokenId;
        if (!tokenErrors[tokenId]) {
          tokenErrors[tokenId] = 0;
        }
        tokenErrors[tokenId]++;
      }
    });
    
    const tokensWithMultipleErrors = Object.entries(tokenErrors)
      .filter(([_, count]) => count > 1)
      .sort((a, b) => b[1] - a[1]);
    
    if (tokensWithMultipleErrors.length > 0) {
      console.log('\nTokens with Multiple Errors:');
      tokensWithMultipleErrors.forEach(([tokenId, count]) => {
        console.log(`Token ${tokenId}: ${count} errors`);
      });
    }
    
    return logs;
  } catch (error) {
    console.error('Error analyzing error logs:', error);
    return [];
  }
}

async function analyzeMarketplaceLogs() {
  console.log('Connecting to MongoDB...');
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - argv.days);
    
    console.log(`Analyzing marketplace logs from ${startDate.toISOString()} to ${endDate.toISOString()}`);
    
    // Build query
    const query = {
      timestamp: { $gte: startDate.toISOString(), $lte: endDate.toISOString() }
    };
    
    if (argv.user) {
      query.userId = argv.user;
      console.log(`Filtering for user: ${argv.user}`);
    }
    
    if (argv.token) {
      query.tokenId = argv.token;
      console.log(`Filtering for token: ${argv.token}`);
    }
    
    if (argv.failures) {
      query.$or = [
        { type: 'APPROVAL_RESULT', success: false },
        { type: 'LISTING_RESULT', success: false },
        { type: 'PURCHASE_RESULT', success: false },
        { type: 'BID_RESULT', success: false },
        { type: 'TRANSACTION_ERROR' }
      ];
      console.log('Showing only failures');
    }
    
    // Get all logs matching the query
    const logs = await collection.find(query).sort({ timestamp: 1 }).toArray();
    
    if (logs.length === 0) {
      console.log('No marketplace logs found matching the criteria');
      return;
    }
    
    console.log(`Found ${logs.length} marketplace logs`);
    
    // Group logs by type
    const logsByType = {};
    logs.forEach(log => {
      if (!logsByType[log.type]) {
        logsByType[log.type] = [];
      }
      logsByType[log.type].push(log);
    });
    
    // Print summary by type
    console.log('\n=== Summary by Event Type ===');
    Object.keys(logsByType).forEach(type => {
      console.log(`${type}: ${logsByType[type].length} events`);
    });
    
    // Analyze approval results
    if (logsByType['APPROVAL_RESULT']) {
      const approvalResults = logsByType['APPROVAL_RESULT'];
      const successfulApprovals = approvalResults.filter(log => log.success).length;
      const failedApprovals = approvalResults.filter(log => !log.success).length;
      
      console.log('\n=== Approval Results ===');
      console.log(`Total: ${approvalResults.length}`);
      console.log(`Successful: ${successfulApprovals} (${(successfulApprovals / approvalResults.length * 100).toFixed(2)}%)`);
      console.log(`Failed: ${failedApprovals} (${(failedApprovals / approvalResults.length * 100).toFixed(2)}%)`);
      
      if (failedApprovals > 0 && argv.verbose) {
        console.log('\nFailed Approval Details:');
        approvalResults.filter(log => !log.success).forEach((log, index) => {
          console.log(`\n--- Failed Approval ${index + 1} ---`);
          console.log(`Timestamp: ${log.timestamp}`);
          console.log(`User ID: ${log.userId}`);
          console.log(`Token ID: ${log.tokenId}`);
          if (log.error) {
            console.log(`Error: ${log.error.message || JSON.stringify(log.error)}`);
          }
          if (log.transactionHash) {
            console.log(`Transaction Hash: ${log.transactionHash}`);
          }
        });
      }
    }
    
    // Analyze listing results
    if (logsByType['LISTING_RESULT']) {
      const listingResults = logsByType['LISTING_RESULT'];
      const successfulListings = listingResults.filter(log => log.success).length;
      const failedListings = listingResults.filter(log => !log.success).length;
      
      console.log('\n=== Listing Results ===');
      console.log(`Total: ${listingResults.length}`);
      console.log(`Successful: ${successfulListings} (${(successfulListings / listingResults.length * 100).toFixed(2)}%)`);
      console.log(`Failed: ${failedListings} (${(failedListings / listingResults.length * 100).toFixed(2)}%)`);
      
      if (failedListings > 0 && argv.verbose) {
        console.log('\nFailed Listing Details:');
        listingResults.filter(log => !log.success).forEach((log, index) => {
          console.log(`\n--- Failed Listing ${index + 1} ---`);
          console.log(`Timestamp: ${log.timestamp}`);
          console.log(`User ID: ${log.userId}`);
          console.log(`Token ID: ${log.tokenId}`);
          if (log.error) {
            console.log(`Error: ${log.error.message || JSON.stringify(log.error)}`);
          }
          if (log.transactionHash) {
            console.log(`Transaction Hash: ${log.transactionHash}`);
          }
        });
      }
    }
    
    // Analyze transaction errors
    if (logsByType['TRANSACTION_ERROR']) {
      const transactionErrors = logsByType['TRANSACTION_ERROR'];
      
      console.log('\n=== Transaction Errors ===');
      console.log(`Total: ${transactionErrors.length}`);
      
      // Group by operation
      const errorsByOperation = {};
      transactionErrors.forEach(log => {
        if (!errorsByOperation[log.operation]) {
          errorsByOperation[log.operation] = [];
        }
        errorsByOperation[log.operation].push(log);
      });
      
      console.log('\nErrors by Operation:');
      Object.keys(errorsByOperation).forEach(operation => {
        console.log(`${operation}: ${errorsByOperation[operation].length} errors`);
      });
      
      if (argv.verbose) {
        console.log('\nTransaction Error Details:');
        transactionErrors.forEach((log, index) => {
          console.log(`\n--- Transaction Error ${index + 1} ---`);
          console.log(`Timestamp: ${log.timestamp}`);
          console.log(`User ID: ${log.userId}`);
          console.log(`Token ID: ${log.tokenId}`);
          console.log(`Operation: ${log.operation}`);
          if (log.error) {
            console.log(`Error: ${log.error.message || JSON.stringify(log.error)}`);
            if (log.error.code) {
              console.log(`Error Code: ${log.error.code}`);
            }
          }
        });
      }
    }
    
    // Find patterns in failed transactions
    console.log('\n=== Pattern Analysis ===');
    
    // Check for users with multiple failures
    const userFailures = {};
    logs.forEach(log => {
      if ((log.type.endsWith('_RESULT') && !log.success) || log.type === 'TRANSACTION_ERROR') {
        if (!userFailures[log.userId]) {
          userFailures[log.userId] = 0;
        }
        userFailures[log.userId]++;
      }
    });
    
    const usersWithMultipleFailures = Object.entries(userFailures)
      .filter(([_, count]) => count > 1)
      .sort((a, b) => b[1] - a[1]);
    
    if (usersWithMultipleFailures.length > 0) {
      console.log('\nUsers with Multiple Failures:');
      usersWithMultipleFailures.forEach(([userId, count]) => {
        console.log(`User ${userId}: ${count} failures`);
      });
    } else {
      console.log('\nNo users with multiple failures found');
    }
    
    // Check for tokens with multiple failures
    const tokenFailures = {};
    logs.forEach(log => {
      if ((log.type.endsWith('_RESULT') && !log.success) || log.type === 'TRANSACTION_ERROR') {
        if (!tokenFailures[log.tokenId]) {
          tokenFailures[log.tokenId] = 0;
        }
        tokenFailures[log.tokenId]++;
      }
    });
    
    const tokensWithMultipleFailures = Object.entries(tokenFailures)
      .filter(([_, count]) => count > 1)
      .sort((a, b) => b[1] - a[1]);
    
    if (tokensWithMultipleFailures.length > 0) {
      console.log('\nTokens with Multiple Failures:');
      tokensWithMultipleFailures.forEach(([tokenId, count]) => {
        console.log(`Token ${tokenId}: ${count} failures`);
      });
    } else {
      console.log('\nNo tokens with multiple failures found');
    }
    
    // Check for common error messages
    const errorMessages = {};
    logs.forEach(log => {
      if (log.error && log.error.message) {
        if (!errorMessages[log.error.message]) {
          errorMessages[log.error.message] = 0;
        }
        errorMessages[log.error.message]++;
      }
    });
    
    const commonErrors = Object.entries(errorMessages)
      .sort((a, b) => b[1] - a[1]);
    
    if (commonErrors.length > 0) {
      console.log('\nCommon Error Messages:');
      commonErrors.forEach(([message, count]) => {
        console.log(`"${message}": ${count} occurrences`);
      });
    } else {
      console.log('\nNo common error messages found');
    }
    
    // Check for approval-then-listing patterns
    console.log('\n=== Transaction Flow Analysis ===');
    
    // Group logs by token ID to analyze the sequence of events
    const logsByToken = {};
    logs.forEach(log => {
      if (log.tokenId) {
        if (!logsByToken[log.tokenId]) {
          logsByToken[log.tokenId] = [];
        }
        logsByToken[log.tokenId].push(log);
      }
    });
    
    // Analyze each token's event sequence
    let approvalSuccessThenListingFailure = 0;
    let approvalFailureThenListingAttempt = 0;
    
    Object.entries(logsByToken).forEach(([tokenId, tokenLogs]) => {
      // Sort logs by timestamp
      tokenLogs.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      
      // Look for patterns
      for (let i = 0; i < tokenLogs.length - 1; i++) {
        // Pattern: Successful approval followed by failed listing
        if (tokenLogs[i].type === 'APPROVAL_RESULT' && tokenLogs[i].success &&
            tokenLogs[i+1].type === 'LISTING_RESULT' && !tokenLogs[i+1].success) {
          approvalSuccessThenListingFailure++;
        }
        
        // Pattern: Failed approval followed by listing attempt
        if (tokenLogs[i].type === 'APPROVAL_RESULT' && !tokenLogs[i].success &&
            tokenLogs[i+1].type === 'LISTING_ATTEMPT') {
          approvalFailureThenListingAttempt++;
        }
      }
    });
    
    console.log(`Successful approval followed by failed listing: ${approvalSuccessThenListingFailure} instances`);
    console.log(`Failed approval followed by listing attempt: ${approvalFailureThenListingAttempt} instances`);
    
    // Recommendations based on analysis
    console.log('\n=== Recommendations ===');
    
    if (approvalSuccessThenListingFailure > 0) {
      console.log('- Investigate why listings are failing after successful approvals');
      console.log('  This could indicate issues with the listing transaction parameters or contract state');
    }
    
    if (approvalFailureThenListingAttempt > 0) {
      console.log('- Improve frontend validation to prevent listing attempts after failed approvals');
      console.log('  Consider adding clearer error messages and user guidance');
    }
    
    if (usersWithMultipleFailures.length > 0) {
      console.log('- Reach out to users with multiple failures to gather more information');
      console.log('  They may be encountering specific issues that need addressing');
    }
    
    if (commonErrors.length > 0) {
      console.log('- Address the most common error messages:');
      commonErrors.slice(0, 3).forEach(([message, _]) => {
        console.log(`  * "${message}"`);
      });
    }
    
  } catch (error) {
    console.error('Error analyzing marketplace logs:', error);
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

async function main() {
  console.log('Connecting to MongoDB...');
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    // Analyze marketplace logs
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - argv.days);
    
    console.log(`Analyzing marketplace logs from ${startDate.toISOString()} to ${endDate.toISOString()}`);
    
    // Build query
    const query = {
      timestamp: { $gte: startDate.toISOString(), $lte: endDate.toISOString() }
    };
    
    if (argv.user) {
      query.userId = argv.user;
      console.log(`Filtering for user: ${argv.user}`);
    }
    
    if (argv.token) {
      query.tokenId = argv.token;
      console.log(`Filtering for token: ${argv.token}`);
    }
    
    if (argv.failures) {
      query.$or = [
        { type: 'APPROVAL_RESULT', success: false },
        { type: 'LISTING_RESULT', success: false },
        { type: 'PURCHASE_RESULT', success: false },
        { type: 'BID_RESULT', success: false },
        { type: 'TRANSACTION_ERROR' }
      ];
      console.log('Showing only failures');
    }
    
    // Get all logs matching the query
    const logs = await collection.find(query).sort({ timestamp: 1 }).toArray();
    
    if (logs.length === 0) {
      console.log('No marketplace logs found matching the criteria');
    } else {
      await analyzeMarketplaceLogs(client, logs);
    }
    
    // Check error logs if requested
    if (argv.errors) {
      await analyzeErrorLogs(client);
    }
    
  } catch (error) {
    console.error('Error analyzing logs:', error);
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Update the analyzeMarketplaceLogs function to accept client and logs parameters
async function analyzeMarketplaceLogs(client, logs) {
  console.log(`Found ${logs.length} marketplace logs`);
  
  // Group logs by type
  const logsByType = {};
  logs.forEach(log => {
    if (!logsByType[log.type]) {
      logsByType[log.type] = [];
    }
    logsByType[log.type].push(log);
  });
  
  // Print summary by type
  console.log('\n=== Summary by Event Type ===');
  Object.keys(logsByType).forEach(type => {
    console.log(`${type}: ${logsByType[type].length} events`);
  });
  
  // Analyze approval results
  if (logsByType['APPROVAL_RESULT']) {
    const approvalResults = logsByType['APPROVAL_RESULT'];
    const successfulApprovals = approvalResults.filter(log => log.success).length;
    const failedApprovals = approvalResults.filter(log => !log.success).length;
    
    console.log('\n=== Approval Results ===');
    console.log(`Total: ${approvalResults.length}`);
    console.log(`Successful: ${successfulApprovals} (${(successfulApprovals / approvalResults.length * 100).toFixed(2)}%)`);
    console.log(`Failed: ${failedApprovals} (${(failedApprovals / approvalResults.length * 100).toFixed(2)}%)`);
    
    if (failedApprovals > 0 && argv.verbose) {
      console.log('\nFailed Approval Details:');
      approvalResults.filter(log => !log.success).forEach((log, index) => {
        console.log(`\n--- Failed Approval ${index + 1} ---`);
        console.log(`Timestamp: ${log.timestamp}`);
        console.log(`User ID: ${log.userId}`);
        console.log(`Token ID: ${log.tokenId}`);
        if (log.error) {
          console.log(`Error: ${log.error.message || JSON.stringify(log.error)}`);
        }
        if (log.transactionHash) {
          console.log(`Transaction Hash: ${log.transactionHash}`);
        }
      });
    }
  }
  
  // Analyze listing results
  if (logsByType['LISTING_RESULT']) {
    const listingResults = logsByType['LISTING_RESULT'];
    const successfulListings = listingResults.filter(log => log.success).length;
    const failedListings = listingResults.filter(log => !log.success).length;
    
    console.log('\n=== Listing Results ===');
    console.log(`Total: ${listingResults.length}`);
    console.log(`Successful: ${successfulListings} (${(successfulListings / listingResults.length * 100).toFixed(2)}%)`);
    console.log(`Failed: ${failedListings} (${(failedListings / listingResults.length * 100).toFixed(2)}%)`);
    
    if (failedListings > 0 && argv.verbose) {
      console.log('\nFailed Listing Details:');
      listingResults.filter(log => !log.success).forEach((log, index) => {
        console.log(`\n--- Failed Listing ${index + 1} ---`);
        console.log(`Timestamp: ${log.timestamp}`);
        console.log(`User ID: ${log.userId}`);
        console.log(`Token ID: ${log.tokenId}`);
        if (log.error) {
          console.log(`Error: ${log.error.message || JSON.stringify(log.error)}`);
        }
        if (log.transactionHash) {
          console.log(`Transaction Hash: ${log.transactionHash}`);
        }
      });
    }
  }
  
  // Analyze transaction errors
  if (logsByType['TRANSACTION_ERROR']) {
    const transactionErrors = logsByType['TRANSACTION_ERROR'];
    
    console.log('\n=== Transaction Errors ===');
    console.log(`Total: ${transactionErrors.length}`);
    
    // Group by operation
    const errorsByOperation = {};
    transactionErrors.forEach(log => {
      if (!errorsByOperation[log.operation]) {
        errorsByOperation[log.operation] = [];
      }
      errorsByOperation[log.operation].push(log);
    });
    
    console.log('\nErrors by Operation:');
    Object.keys(errorsByOperation).forEach(operation => {
      console.log(`${operation}: ${errorsByOperation[operation].length} errors`);
    });
    
    if (argv.verbose) {
      console.log('\nTransaction Error Details:');
      transactionErrors.forEach((log, index) => {
        console.log(`\n--- Transaction Error ${index + 1} ---`);
        console.log(`Timestamp: ${log.timestamp}`);
        console.log(`User ID: ${log.userId}`);
        console.log(`Token ID: ${log.tokenId}`);
        console.log(`Operation: ${log.operation}`);
        if (log.error) {
          console.log(`Error: ${log.error.message || JSON.stringify(log.error)}`);
          if (log.error.code) {
            console.log(`Error Code: ${log.error.code}`);
          }
        }
      });
    }
  }
  
  // Find patterns in failed transactions
  console.log('\n=== Pattern Analysis ===');
  
  // Check for users with multiple failures
  const userFailures = {};
  logs.forEach(log => {
    if ((log.type.endsWith('_RESULT') && !log.success) || log.type === 'TRANSACTION_ERROR') {
      if (!userFailures[log.userId]) {
        userFailures[log.userId] = 0;
      }
      userFailures[log.userId]++;
    }
  });
  
  const usersWithMultipleFailures = Object.entries(userFailures)
    .filter(([_, count]) => count > 1)
    .sort((a, b) => b[1] - a[1]);
  
  if (usersWithMultipleFailures.length > 0) {
    console.log('\nUsers with Multiple Failures:');
    usersWithMultipleFailures.forEach(([userId, count]) => {
      console.log(`User ${userId}: ${count} failures`);
    });
  } else {
    console.log('\nNo users with multiple failures found');
  }
  
  // Check for tokens with multiple failures
  const tokenFailures = {};
  logs.forEach(log => {
    if ((log.type.endsWith('_RESULT') && !log.success) || log.type === 'TRANSACTION_ERROR') {
      if (!tokenFailures[log.tokenId]) {
        tokenFailures[log.tokenId] = 0;
      }
      tokenFailures[log.tokenId]++;
    }
  });
  
  const tokensWithMultipleFailures = Object.entries(tokenFailures)
    .filter(([_, count]) => count > 1)
    .sort((a, b) => b[1] - a[1]);
  
  if (tokensWithMultipleFailures.length > 0) {
    console.log('\nTokens with Multiple Failures:');
    tokensWithMultipleFailures.forEach(([tokenId, count]) => {
      console.log(`Token ${tokenId}: ${count} failures`);
    });
  } else {
    console.log('\nNo tokens with multiple failures found');
  }
  
  // Check for common error messages
  const errorMessages = {};
  logs.forEach(log => {
    if (log.error && log.error.message) {
      if (!errorMessages[log.error.message]) {
        errorMessages[log.error.message] = 0;
      }
      errorMessages[log.error.message]++;
    }
  });
  
  const commonErrors = Object.entries(errorMessages)
    .sort((a, b) => b[1] - a[1]);
  
  if (commonErrors.length > 0) {
    console.log('\nCommon Error Messages:');
    commonErrors.forEach(([message, count]) => {
      console.log(`"${message}": ${count} occurrences`);
    });
  } else {
    console.log('\nNo common error messages found');
  }
  
  // Check for approval-then-listing patterns
  console.log('\n=== Transaction Flow Analysis ===');
  
  // Group logs by token ID to analyze the sequence of events
  const logsByToken = {};
  logs.forEach(log => {
    if (log.tokenId) {
      if (!logsByToken[log.tokenId]) {
        logsByToken[log.tokenId] = [];
      }
      logsByToken[log.tokenId].push(log);
    }
  });
  
  // Analyze each token's event sequence
  let approvalSuccessThenListingFailure = 0;
  let approvalFailureThenListingAttempt = 0;
  
  Object.entries(logsByToken).forEach(([tokenId, tokenLogs]) => {
    // Sort logs by timestamp
    tokenLogs.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    // Look for patterns
    for (let i = 0; i < tokenLogs.length - 1; i++) {
      // Pattern: Successful approval followed by failed listing
      if (tokenLogs[i].type === 'APPROVAL_RESULT' && tokenLogs[i].success &&
          tokenLogs[i+1].type === 'LISTING_RESULT' && !tokenLogs[i+1].success) {
        approvalSuccessThenListingFailure++;
      }
      
      // Pattern: Failed approval followed by listing attempt
      if (tokenLogs[i].type === 'APPROVAL_RESULT' && !tokenLogs[i].success &&
          tokenLogs[i+1].type === 'LISTING_ATTEMPT') {
        approvalFailureThenListingAttempt++;
      }
    }
  });
  
  console.log(`Successful approval followed by failed listing: ${approvalSuccessThenListingFailure} instances`);
  console.log(`Failed approval followed by listing attempt: ${approvalFailureThenListingAttempt} instances`);
  
  // Recommendations based on analysis
  console.log('\n=== Recommendations ===');
  
  if (approvalSuccessThenListingFailure > 0) {
    console.log('- Investigate why listings are failing after successful approvals');
    console.log('  This could indicate issues with the listing transaction parameters or contract state');
  }
  
  if (approvalFailureThenListingAttempt > 0) {
    console.log('- Improve frontend validation to prevent listing attempts after failed approvals');
    console.log('  Consider adding clearer error messages and user guidance');
  }
  
  if (usersWithMultipleFailures.length > 0) {
    console.log('- Reach out to users with multiple failures to gather more information');
    console.log('  They may be encountering specific issues that need addressing');
  }
  
  if (commonErrors.length > 0) {
    console.log('- Address the most common error messages:');
    commonErrors.slice(0, 3).forEach(([message, _]) => {
      console.log(`  * "${message}"`);
    });
  }
}

// Run the main function
main().catch(error => {
  console.error('Error in main function:', error);
  process.exit(1);
});
