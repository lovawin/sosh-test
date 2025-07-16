/**
 * Marketplace Logging Test Script
 * 
 * This script tests the marketplace logging functionality by:
 * 1. Directly using the marketplaceLogger to log events
 * 2. Making HTTP requests to the logging endpoint to simulate frontend calls
 * 
 * Usage: node test-marketplace-logging.js
 */

require('dotenv').config();
const axios = require('axios');
const { marketplaceLogger } = require('./app/logging');
const { MongoClient } = require('mongodb');

// Configuration
const API_URL = process.env.API_URL || 'http://localhost:3001';
const MONGODB_URI = process.env.MONGODB_CONNECTION_STRING || 'mongodb://localhost:27017';
const DB_NAME = process.env.NODE_ENV === 'production' ? 'sosh' : 'soshnew1';
const COLLECTION_NAME = 'marketplace_logs';

// Test data
const TEST_TOKEN_ID = 'test-token-' + Date.now();
const TEST_USER_ID = 'test-user-' + Date.now();
const TEST_MARKETPLACE_ADDRESS = '0x1234567890123456789012345678901234567890';

/**
 * Test direct logger calls
 */
async function testDirectLogging() {
  console.log('\n=== Testing Direct Logger Calls ===');
  
  try {
    // Wait for logger to initialize
    await marketplaceLogger.initPromise;
    console.log('Marketplace logger initialized');
    
    // Log approval attempt
    console.log('Logging approval attempt...');
    await marketplaceLogger.logApprovalAttempt(
      TEST_USER_ID,
      TEST_TOKEN_ID,
      TEST_MARKETPLACE_ADDRESS,
      { source: 'test-script' }
    );
    console.log('Approval attempt logged successfully');
    
    // Log approval failure
    console.log('Logging approval failure...');
    await marketplaceLogger.logApprovalResult(
      TEST_USER_ID,
      TEST_TOKEN_ID,
      false, // failure
      { 
        error: {
          message: 'Test approval failure',
          code: 'TEST_ERROR'
        },
        source: 'test-script'
      }
    );
    console.log('Approval failure logged successfully');
    
    // Log transaction error
    console.log('Logging transaction error...');
    await marketplaceLogger.logTransactionError(
      TEST_USER_ID,
      TEST_TOKEN_ID,
      { 
        message: 'Test transaction error',
        code: 'TEST_TX_ERROR',
        name: 'TransactionError'
      },
      'APPROVAL',
      { source: 'test-script' }
    );
    console.log('Transaction error logged successfully');
    
    return true;
  } catch (error) {
    console.error('Error in direct logging test:', error);
    return false;
  }
}

/**
 * Test HTTP endpoint calls (simulating frontend)
 */
async function testHttpLogging() {
  console.log('\n=== Testing HTTP Logging Endpoints ===');
  
  try {
    // Log approval attempt
    console.log('Sending approval attempt via HTTP...');
    const approvalAttemptResponse = await axios.post(`${API_URL}/api/V1/log/marketplace`, {
      type: 'APPROVAL_ATTEMPT',
      tokenId: TEST_TOKEN_ID,
      marketplaceAddress: TEST_MARKETPLACE_ADDRESS,
      source: 'test-script-http'
    });
    console.log('Approval attempt HTTP response:', approvalAttemptResponse.status, approvalAttemptResponse.data);
    
    // Log approval failure
    console.log('Sending approval failure via HTTP...');
    const approvalFailureResponse = await axios.post(`${API_URL}/api/V1/log/marketplace`, {
      type: 'APPROVAL_RESULT',
      tokenId: TEST_TOKEN_ID,
      success: false,
      error: {
        message: 'Test approval failure via HTTP',
        code: 'TEST_ERROR_HTTP'
      },
      source: 'test-script-http'
    });
    console.log('Approval failure HTTP response:', approvalFailureResponse.status, approvalFailureResponse.data);
    
    // Log transaction error
    console.log('Sending transaction error via HTTP...');
    const transactionErrorResponse = await axios.post(`${API_URL}/api/V1/log/marketplace`, {
      type: 'TRANSACTION_ERROR',
      tokenId: TEST_TOKEN_ID,
      operation: 'APPROVAL',
      error: {
        message: 'Test transaction error via HTTP',
        code: 'TEST_TX_ERROR_HTTP',
        name: 'TransactionError'
      },
      source: 'test-script-http'
    });
    console.log('Transaction error HTTP response:', transactionErrorResponse.status, transactionErrorResponse.data);
    
    return true;
  } catch (error) {
    console.error('Error in HTTP logging test:', error);
    console.error('Error details:', error.response?.data || error.message);
    return false;
  }
}

/**
 * Check if logs were successfully stored in MongoDB
 */
async function checkMongoLogs() {
  console.log('\n=== Checking MongoDB for Logs ===');
  
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);
    
    // Query for test logs
    const query = {
      $or: [
        { tokenId: TEST_TOKEN_ID },
        { 'metadata.tokenId': TEST_TOKEN_ID }
      ]
    };
    
    console.log('Querying for logs with test token ID:', TEST_TOKEN_ID);
    const logs = await collection.find(query).toArray();
    
    if (logs.length > 0) {
      console.log(`Found ${logs.length} logs for test token ID`);
      logs.forEach((log, index) => {
        console.log(`\nLog ${index + 1}:`);
        console.log(`Type: ${log.type}`);
        console.log(`Timestamp: ${log.timestamp}`);
        console.log(`Source: ${log.source || log.metadata?.source}`);
        if (log.error) {
          console.log(`Error: ${JSON.stringify(log.error)}`);
        }
      });
      return true;
    } else {
      console.log('No logs found for test token ID');
      
      // Check if the collection exists and has any documents
      const collections = await db.listCollections({ name: COLLECTION_NAME }).toArray();
      if (collections.length === 0) {
        console.log(`Collection '${COLLECTION_NAME}' does not exist`);
      } else {
        const totalCount = await collection.countDocuments();
        console.log(`Collection '${COLLECTION_NAME}' exists and has ${totalCount} documents`);
        
        // Get the most recent logs
        const recentLogs = await collection.find().sort({ timestamp: -1 }).limit(3).toArray();
        console.log('\nMost recent logs:');
        recentLogs.forEach((log, index) => {
          console.log(`\nRecent Log ${index + 1}:`);
          console.log(`Type: ${log.type}`);
          console.log(`Timestamp: ${log.timestamp}`);
          console.log(`TokenId: ${log.tokenId || log.metadata?.tokenId || 'N/A'}`);
        });
      }
      
      return false;
    }
  } catch (error) {
    console.error('Error checking MongoDB logs:', error);
    return false;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

/**
 * Check MongoDB connection details
 */
async function checkMongoConnection() {
  console.log('\n=== Checking MongoDB Connection ===');
  
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Successfully connected to MongoDB');
    
    const adminDb = client.db('admin');
    const serverInfo = await adminDb.command({ serverStatus: 1 });
    
    console.log('\nMongoDB Server Info:');
    console.log(`Version: ${serverInfo.version}`);
    console.log(`Uptime: ${serverInfo.uptime} seconds`);
    console.log(`Connections: ${serverInfo.connections.current} current, ${serverInfo.connections.available} available`);
    
    const db = client.db(DB_NAME);
    const collections = await db.listCollections().toArray();
    
    console.log(`\nDatabase '${DB_NAME}' has ${collections.length} collections:`);
    collections.forEach(collection => {
      console.log(`- ${collection.name}`);
    });
    
    return true;
  } catch (error) {
    console.error('Error checking MongoDB connection:', error);
    return false;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

/**
 * Run all tests
 */
async function runTests() {
  console.log('=== Marketplace Logging Test Script ===');
  console.log('Test Token ID:', TEST_TOKEN_ID);
  console.log('Test User ID:', TEST_USER_ID);
  console.log('MongoDB URI:', MONGODB_URI);
  console.log('Database:', DB_NAME);
  console.log('Collection:', COLLECTION_NAME);
  
  // Check MongoDB connection first
  const mongoConnectionOk = await checkMongoConnection();
  if (!mongoConnectionOk) {
    console.error('MongoDB connection check failed. Aborting tests.');
    return;
  }
  
  // Run direct logging tests
  const directLoggingOk = await testDirectLogging();
  
  // Run HTTP logging tests
  const httpLoggingOk = await testHttpLogging();
  
  // Wait a bit for logs to be processed
  console.log('\nWaiting for logs to be processed...');
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Check if logs were stored
  const logsStoredOk = await checkMongoLogs();
  
  // Print summary
  console.log('\n=== Test Summary ===');
  console.log(`MongoDB Connection: ${mongoConnectionOk ? '✅ OK' : '❌ Failed'}`);
  console.log(`Direct Logging: ${directLoggingOk ? '✅ OK' : '❌ Failed'}`);
  console.log(`HTTP Logging: ${httpLoggingOk ? '✅ OK' : '❌ Failed'}`);
  console.log(`Logs Stored: ${logsStoredOk ? '✅ OK' : '❌ Failed'}`);
  
  if (!logsStoredOk) {
    console.log('\n=== Troubleshooting Recommendations ===');
    if (!mongoConnectionOk) {
      console.log('- Check MongoDB connection string and ensure the database is running');
      console.log('- Verify network connectivity to the MongoDB server');
    }
    if (!directLoggingOk) {
      console.log('- Check marketplaceLogger implementation for errors');
      console.log('- Verify MongoDB transport is properly configured');
    }
    if (!httpLoggingOk) {
      console.log('- Check API server is running and accessible');
      console.log('- Verify marketplace logging routes are properly registered');
    }
    console.log('- Check for errors in the server logs');
    console.log('- Verify the MongoDB collection exists and has the correct permissions');
  }
}

// Run the tests
runTests().catch(console.error);
