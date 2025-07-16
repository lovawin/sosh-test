/**
 * MongoDB Logging Diagnostic Script
 * 
 * This script performs a series of tests to diagnose issues with MongoDB logging:
 * 1. Tests direct MongoDB connection and insertion
 * 2. Tests the MongoDB transport
 * 3. Tests the error logger
 * 4. Checks MongoDB collections and indexes
 * 5. Tests with a simple log entry
 */

const mongoose = require('mongoose');
const appconfig = require('./config/appconfig');
const errorLogger = require('./app/logging/handlers/errorLogger');
const MongoTransport = require('./app/logging/transports/mongoTransport');
const dbConnection = require('./app/services/dbConnection');

// Test results
const testResults = {
  directMongo: {},
  transport: {},
  errorLogger: {},
  collections: {},
  simpleLog: {}
};

async function runDiagnostics() {
  console.log('=== Starting MongoDB Logging Diagnostic Tests ===\n');
  
  try {
    // Test 1: Direct MongoDB Connection and Insertion
    await testDirectMongoConnection();
    
    // Test 2: MongoDB Transport
    await testMongoTransport();
    
    // Test 3: Error Logger
    await testErrorLogger();
    
    // Test 4: Check MongoDB Collections and Indexes
    await checkMongoCollections();
    
    // Test 5: Simple Log Entry
    await testSimpleLog();
    
    // Print results
    console.log('\n=== MongoDB Logging Diagnostic Results ===\n');
    console.log(JSON.stringify(testResults, null, 2));
    
  } catch (error) {
    console.error('Diagnostic script failed:', error);
  } finally {
    // Close MongoDB connection
    try {
      await mongoose.connection.close();
      console.log('MongoDB connection closed');
    } catch (err) {
      console.error('Error closing MongoDB connection:', err);
    }
    
    process.exit(0);
  }
}

async function testDirectMongoConnection() {
  console.log('\n1. Testing direct MongoDB connection and insertion...');
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(appconfig.MONGODB_CONNECTION_STRING, {
      useUnifiedTopology: true,
      useNewUrlParser: true
    });
    console.log('Connected to MongoDB');
    
    // Get connection details
    const connectionDetails = {
      readyState: mongoose.connection.readyState,
      host: mongoose.connection.host,
      port: mongoose.connection.port,
      name: mongoose.connection.name
    };
    console.log('Connection details:', connectionDetails);
    
    // Insert a test log directly
    const db = mongoose.connection.db;
    const testId = Math.random().toString(36).substring(7);
    const result = await db.collection('error_logs').insertOne({
      timestamp: new Date(),
      level: 'ERROR',
      message: 'Test direct MongoDB insert',
      source: 'test-script',
      testId: testId,
      metadata: {
        test: true,
        testId: testId
      }
    });
    
    console.log('Test log inserted:', result.insertedId);
    
    // Verify the log was inserted
    const insertedLog = await db.collection('error_logs').findOne({ testId: testId });
    
    testResults.directMongo = {
      success: !!insertedLog,
      connectionDetails: connectionDetails,
      insertedId: result.insertedId.toString(),
      logFound: !!insertedLog,
      testId: testId
    };
    
    if (insertedLog) {
      console.log('✓ Direct MongoDB test passed - log was inserted and retrieved');
    } else {
      console.log('✗ Direct MongoDB test failed - log was not found after insertion');
    }
    
  } catch (error) {
    testResults.directMongo = {
      success: false,
      error: error.message,
      stack: error.stack
    };
    console.error('✗ Direct MongoDB test failed:', error.message);
  }
}

async function testMongoTransport() {
  console.log('\n2. Testing MongoDB transport...');
  try {
    // Create test transport
    console.log('Creating MongoDB transport...');
    const transport = new MongoTransport({ 
      collection: 'test_logs'
    });
    
    // Wait for connection
    console.log('Waiting for transport connection...');
    await transport.connectionPromise;
    console.log('Transport connected:', transport.isConnected);
    
    // Test logging with the transport
    const testId = Math.random().toString(36).substring(7);
    const testLog = { 
      level: 'info', 
      message: 'Test transport message', 
      timestamp: new Date().toISOString(),
      testId: testId
    };
    
    console.log('Logging test message through transport...');
    await new Promise((resolve, reject) => {
      transport.log(testLog, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    console.log('Test message logged through transport');
    
    // Wait for log to be written
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Verify log was written
    const connection = await dbConnection.getConnection();
    const insertedLog = await connection.connection.db
      .collection('test_logs')
      .findOne({ testId: testId });
    
    testResults.transport = {
      success: !!insertedLog,
      transportConnected: transport.isConnected,
      collection: transport.collection,
      logFound: !!insertedLog,
      testId: testId,
      database: transport.database
    };
    
    if (insertedLog) {
      console.log('✓ MongoDB transport test passed - log was inserted and retrieved');
    } else {
      console.log('✗ MongoDB transport test failed - log was not found after insertion');
    }
    
  } catch (error) {
    testResults.transport = {
      success: false,
      error: error.message,
      stack: error.stack
    };
    console.error('✗ MongoDB transport test failed:', error.message);
  }
}

async function testErrorLogger() {
  console.log('\n3. Testing error logger...');
  try {
    // Wait for error logger to initialize
    console.log('Initializing error logger...');
    await errorLogger.initPromise;
    console.log('Error logger initialized:', errorLogger.ready);
    
    // Test logging an error
    const testId = Math.random().toString(36).substring(7);
    console.log('Logging test error...');
    await errorLogger.logError(new Error('Test error from diagnostic script'), {
      context: 'diagnostic_test',
      testId: testId,
      timestamp: new Date().toISOString()
    });
    console.log('Test error logged');
    
    // Wait for log to be written
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Verify log was written
    const connection = await dbConnection.getConnection();
    const insertedLog = await connection.connection.db
      .collection('error_logs')
      .findOne({ 'metadata.testId': testId });
    
    testResults.errorLogger = {
      success: !!insertedLog,
      loggerReady: errorLogger.ready,
      logFound: !!insertedLog,
      testId: testId
    };
    
    if (insertedLog) {
      console.log('✓ Error logger test passed - log was inserted and retrieved');
    } else {
      console.log('✗ Error logger test failed - log was not found after insertion');
    }
    
  } catch (error) {
    testResults.errorLogger = {
      success: false,
      error: error.message,
      stack: error.stack
    };
    console.error('✗ Error logger test failed:', error.message);
  }
}

async function checkMongoCollections() {
  console.log('\n4. Checking MongoDB collections and indexes...');
  try {
    // Get connection
    const connection = await dbConnection.getConnection();
    const db = connection.connection.db;
    
    // Get list of collections
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    console.log('Collections in database:', collectionNames);
    
    // Check for log collections
    const logCollections = collectionNames.filter(name => name.includes('_logs'));
    console.log('Log collections:', logCollections);
    
    // Check indexes on error_logs collection
    let errorLogsIndexes = [];
    if (collectionNames.includes('error_logs')) {
      errorLogsIndexes = await db.collection('error_logs').indexes();
      console.log('Indexes on error_logs collection:', errorLogsIndexes);
    } else {
      console.log('error_logs collection does not exist');
    }
    
    testResults.collections = {
      success: true,
      totalCollections: collections.length,
      collectionNames: collectionNames,
      logCollections: logCollections,
      hasErrorLogs: collectionNames.includes('error_logs'),
      errorLogsIndexes: errorLogsIndexes
    };
    
    console.log('✓ Collections check completed');
    
  } catch (error) {
    testResults.collections = {
      success: false,
      error: error.message,
      stack: error.stack
    };
    console.error('✗ Collections check failed:', error.message);
  }
}

async function testSimpleLog() {
  console.log('\n5. Testing with a simple log entry...');
  try {
    // Wait for error logger to initialize
    console.log('Ensuring error logger is initialized...');
    await errorLogger.initPromise;
    
    // Test with a very simple log entry
    const testId = Math.random().toString(36).substring(7);
    console.log('Logging a simple error...');
    await errorLogger.logError(new Error('Simple test error'), {
      context: 'simple_test',
      testId: testId,
      timestamp: new Date().toISOString()
    });
    console.log('Simple error logged');
    
    // Wait for log to be written
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Verify log was written
    const connection = await dbConnection.getConnection();
    const insertedLog = await connection.connection.db
      .collection('error_logs')
      .findOne({ 'metadata.testId': testId });
    
    testResults.simpleLog = {
      success: !!insertedLog,
      logFound: !!insertedLog,
      testId: testId
    };
    
    if (insertedLog) {
      console.log('✓ Simple log test passed - log was inserted and retrieved');
    } else {
      console.log('✗ Simple log test failed - log was not found after insertion');
    }
    
  } catch (error) {
    testResults.simpleLog = {
      success: false,
      error: error.message,
      stack: error.stack
    };
    console.error('✗ Simple log test failed:', error.message);
  }
}

// Run the diagnostics
runDiagnostics().catch(err => {
  console.error('Diagnostic script failed:', err);
  process.exit(1);
});
