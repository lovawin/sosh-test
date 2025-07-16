/**
 * Script to check Twitter link validation logs in MongoDB
 * 
 * This script queries the MongoDB database for Twitter link validation logs
 * to help diagnose issues with the screenshot and S3 upload processes.
 */

const mongoose = require('mongoose');
const appconfig = require('./config/appconfig');

// Connect to MongoDB
async function connectToMongoDB() {
  console.log('Connecting to MongoDB...');
  try {
    await mongoose.connect(appconfig.MONGODB_CONNECTION_STRING, {
      useUnifiedTopology: true,
      useNewUrlParser: true
    });
    console.log('Connected to MongoDB');
    return mongoose.connection.db;
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }
}

// Format date for display
function formatDate(date) {
  return new Date(date).toISOString().replace('T', ' ').substring(0, 19);
}

// Check error logs for Twitter validation issues
async function checkErrorLogs(db, options = {}) {
  const { limit = 10, context = 'twitter_validation', since = null } = options;
  
  console.log(`\n=== Checking Error Logs (${context}) ===`);
  
  // Build query
  const query = { context: new RegExp(context) };
  if (since) {
    query.timestamp = { $gt: new Date(since) };
  }
  
  // Execute query
  const logs = await db.collection('error_logs')
    .find(query)
    .sort({ timestamp: -1 })
    .limit(limit)
    .toArray();
  
  if (logs.length === 0) {
    console.log(`No ${context} logs found`);
    return;
  }
  
  console.log(`Found ${logs.length} logs:`);
  
  // Display logs
  logs.forEach((log, index) => {
    console.log(`\n--- Log ${index + 1} ---`);
    console.log(`Timestamp: ${formatDate(log.timestamp)}`);
    console.log(`Context: ${log.context}`);
    console.log(`Message: ${log.message}`);
    
    // Display metadata if available
    if (log.metadata) {
      console.log('Details:');
      
      // Display request ID if available
      if (log.metadata.requestId) {
        console.log(`  Request ID: ${log.metadata.requestId}`);
      }
      
      // Display user ID if available
      if (log.metadata.userId) {
        console.log(`  User ID: ${log.metadata.userId}`);
      }
      
      // Display tweet ID if available
      if (log.metadata.tweetId) {
        console.log(`  Tweet ID: ${log.metadata.tweetId}`);
      }
      
      // Display error type if available
      if (log.metadata.errorType) {
        console.log(`  Error Type: ${log.metadata.errorType}`);
      }
      
      // Display error message if available
      if (log.metadata.errorMessage) {
        console.log(`  Error Message: ${log.metadata.errorMessage}`);
      }
      
      // Display operation if available
      if (log.metadata.operation) {
        console.log(`  Operation: ${log.metadata.operation}`);
      }
    }
  });
}

// Check API logs for Twitter validation requests
async function checkApiLogs(db, options = {}) {
  const { limit = 10, operation = 'validate_twitter_link', since = null } = options;
  
  console.log(`\n=== Checking API Logs (${operation}) ===`);
  
  // Build query
  const query = { 'metadata.context.operation': operation };
  if (since) {
    query.timestamp = { $gt: new Date(since) };
  }
  
  // Execute query
  const logs = await db.collection('api_logs')
    .find(query)
    .sort({ timestamp: -1 })
    .limit(limit)
    .toArray();
  
  if (logs.length === 0) {
    console.log(`No ${operation} logs found`);
    return;
  }
  
  console.log(`Found ${logs.length} logs:`);
  
  // Display logs
  logs.forEach((log, index) => {
    console.log(`\n--- Log ${index + 1} ---`);
    console.log(`Timestamp: ${formatDate(log.timestamp)}`);
    console.log(`Method: ${log.metadata.method}`);
    console.log(`URL: ${log.metadata.url}`);
    
    // Display context if available
    if (log.metadata.context) {
      console.log('Context:');
      
      // Display request ID if available
      if (log.metadata.context.requestId) {
        console.log(`  Request ID: ${log.metadata.context.requestId}`);
      }
      
      // Display operation if available
      if (log.metadata.context.operation) {
        console.log(`  Operation: ${log.metadata.context.operation}`);
      }
      
      // Display status if available
      if (log.metadata.context.status) {
        console.log(`  Status: ${log.metadata.context.status}`);
      }
    }
  });
}

// Main function
async function main() {
  // Parse command line arguments
  const args = process.argv.slice(2);
  const options = {
    limit: 10,
    context: 'twitter_validation',
    operation: 'validate_twitter_link',
    since: null
  };
  
  // Parse arguments
  args.forEach(arg => {
    if (arg.startsWith('--limit=')) {
      options.limit = parseInt(arg.split('=')[1], 10);
    } else if (arg.startsWith('--context=')) {
      options.context = arg.split('=')[1];
    } else if (arg.startsWith('--operation=')) {
      options.operation = arg.split('=')[1];
    } else if (arg.startsWith('--since=')) {
      options.since = arg.split('=')[1];
    }
  });
  
  console.log('Twitter Link Validation Log Checker');
  console.log('==================================');
  console.log('Options:');
  console.log(`  Limit: ${options.limit}`);
  console.log(`  Context: ${options.context}`);
  console.log(`  Operation: ${options.operation}`);
  console.log(`  Since: ${options.since || 'all time'}`);
  
  // Connect to MongoDB
  const db = await connectToMongoDB();
  
  try {
    // Check error logs
    await checkErrorLogs(db, options);
    
    // Check API logs
    await checkApiLogs(db, options);
    
    console.log('\nLog check completed');
  } catch (error) {
    console.error('Error checking logs:', error);
  } finally {
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('\nMongoDB connection closed');
  }
}

// Run the script
main().catch(console.error);
