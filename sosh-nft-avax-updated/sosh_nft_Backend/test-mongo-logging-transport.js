/**
 * MongoDB Logging Transport Test Script
 * 
 * This script specifically tests the MongoDB logging transport to ensure
 * it's properly writing logs to the MongoDB collections.
 */

const mongoose = require('mongoose');
const winston = require('winston');
const MongoTransport = require('./app/logging/transports/mongoTransport');
const dbConnection = require('./app/services/dbConnection');
const { createLogger } = require('./app/logging/config/logConfig');
const errorLogger = require('./app/logging/handlers/errorLogger');
const apiLogger = require('./app/logging/handlers/apiLogger');
const authLogger = require('./app/logging/handlers/authLogger');
const dbLogger = require('./app/logging/handlers/dbLogger');

// Test results
const testResults = {
  connection: {},
  collections: {},
  transports: {},
  loggers: {},
  directLogging: {},
  handlerLogging: {}
};

async function runTests() {
  console.log('=== Starting MongoDB Logging Transport Tests ===\n');
  
  try {
    // Test 1: Database Connection
    await testDatabaseConnection();
    
    // Test 2: Check Collections
    await testCollections();
    
    // Test 3: Test Direct Transport
    await testDirectTransport();
    
    // Test 4: Test Logger Creation
    await testLoggerCreation();
    
    // Test 5: Test Handler Logging
    await testHandlerLogging();
    
    // Test 6: Verify Logs in MongoDB
    await verifyLogsInMongoDB();
    
    // Print results
    console.log('\n=== MongoDB Logging Transport Test Results ===\n');
    console.log(JSON.stringify(testResults, null, 2));
    
  } catch (error) {
    console.error('Test script failed:', error);
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

async function testDatabaseConnection() {
  console.log('Testing database connection...');
  try {
    const connection = await dbConnection.getConnection();
    testResults.connection = {
      success: true,
      state: connection.connection.readyState,
      database: connection.connection.name,
      host: connection.connection.host,
      port: connection.connection.port
    };
    
    console.log('✓ Database connection test passed');
    console.log(`Connected to MongoDB at ${connection.connection.host}:${connection.connection.port}/${connection.connection.name}`);
  } catch (error) {
    testResults.connection = {
      success: false,
      error: error.message,
      stack: error.stack
    };
    console.error('✗ Database connection test failed:', error.message);
    throw error; // Stop tests if connection fails
  }
}

async function testCollections() {
  console.log('\nChecking MongoDB collections...');
  try {
    const connection = await dbConnection.getConnection();
    const collections = await connection.connection.db.listCollections().toArray();
    
    const collectionNames = collections.map(c => c.name);
    const logCollections = collectionNames.filter(name => name.includes('_logs'));
    
    testResults.collections = {
      success: true,
      total: collections.length,
      logCollections: logCollections,
      hasErrorLogs: collectionNames.includes('error_logs'),
      hasApiLogs: collectionNames.includes('api_logs'),
      hasAuthLogs: collectionNames.includes('auth_logs'),
      hasDbLogs: collectionNames.includes('db_logs')
    };
    
    console.log(`✓ Found ${collections.length} collections`);
    console.log(`✓ Log collections: ${logCollections.join(', ')}`);
  } catch (error) {
    testResults.collections = {
      success: false,
      error: error.message,
      stack: error.stack
    };
    console.error('✗ Collections test failed:', error.message);
  }
}

async function testDirectTransport() {
  console.log('\nTesting direct MongoDB transport...');
  try {
    // Create test transport
    const transport = new MongoTransport({ 
      collection: 'test_logs'
    });
    
    // Wait for connection
    await transport.connectionPromise;
    
    // Test logging with different log levels
    const testLogs = [
      { level: 'info', message: 'Test info message', timestamp: new Date().toISOString() },
      { level: 'error', message: 'Test error message', timestamp: new Date().toISOString() },
      { level: 'warn', message: 'Test warning message', timestamp: new Date().toISOString() }
    ];
    
    // Log each message
    for (const log of testLogs) {
      await new Promise((resolve, reject) => {
        transport.log(log, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      console.log(`  Logged ${log.level} message: ${log.message}`);
    }
    
    // Wait for logs to be written
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Verify logs were written
    const connection = await dbConnection.getConnection();
    const logs = await connection.connection.db
      .collection('test_logs')
      .find({
        timestamp: { $gte: new Date(Date.now() - 60000).toISOString() }
      })
      .toArray();
    
    testResults.directLogging = {
      success: logs.length >= testLogs.length,
      transportConnected: transport.isConnected,
      collection: transport.collection,
      logsWritten: logs.length,
      expectedLogs: testLogs.length,
      logs: logs.map(log => ({ level: log.level, message: log.message }))
    };
    
    if (testResults.directLogging.success) {
      console.log(`✓ Direct transport test passed - ${logs.length} logs written`);
    } else {
      console.log(`✗ Direct transport test failed - only ${logs.length}/${testLogs.length} logs written`);
    }
  } catch (error) {
    testResults.directLogging = {
      success: false,
      error: error.message,
      stack: error.stack
    };
    console.error('✗ Direct transport test failed:', error.message);
  }
}

async function testLoggerCreation() {
  console.log('\nTesting Winston logger creation with MongoDB transport...');
  try {
    // Create test logger
    const logger = await createLogger('test');
    
    // Check transports
    const transports = logger.transports;
    const mongoTransports = transports.filter(t => t.name === 'MongoTransport');
    
    testResults.transports = {
      success: mongoTransports.length > 0,
      totalTransports: transports.length,
      mongoTransports: mongoTransports.length,
      transportTypes: transports.map(t => t.constructor.name)
    };
    
    if (testResults.transports.success) {
      console.log(`✓ Logger creation test passed - found ${mongoTransports.length} MongoDB transports`);
    } else {
      console.log('✗ Logger creation test failed - no MongoDB transports found');
    }
    
    // Test logging with the created logger
    logger.info('Test message from created logger');
    logger.error('Test error from created logger');
    
    // Wait for logs to be written
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    testResults.loggers = {
      success: true,
      loggerName: 'test',
      transports: transports.length
    };
  } catch (error) {
    testResults.loggers = {
      success: false,
      error: error.message,
      stack: error.stack
    };
    console.error('✗ Logger creation test failed:', error.message);
  }
}

async function testHandlerLogging() {
  console.log('\nTesting logging handlers...');
  try {
    // Wait for handlers to initialize
    await Promise.all([
      errorLogger.initPromise,
      apiLogger.initPromise,
      authLogger.initPromise,
      dbLogger.initPromise
    ]);
    
    console.log('All handlers initialized');
    
    // Test error logger
    const testError = new Error('Test error from handler test');
    await errorLogger.logError(testError, {
      context: 'handler_test',
      timestamp: new Date().toISOString()
    });
    console.log('  Logged error message');
    
    // Test API logger
    const mockReq = {
      method: 'GET',
      url: '/api/test',
      headers: { 'user-agent': 'Test Agent' },
      ip: '127.0.0.1'
    };
    await apiLogger.logRequest(mockReq);
    console.log('  Logged API request');
    
    // Test auth logger
    const mockUser = { id: 'test-user-id', email: 'test@example.com' };
    await authLogger.logLogin(mockUser, true);
    console.log('  Logged auth event');
    
    // Test DB logger
    await dbLogger.logQuery('find', 'users', { test: true }, 10);
    console.log('  Logged DB query');
    
    // Wait for logs to be written
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    testResults.handlerLogging = {
      success: true,
      errorLoggerReady: errorLogger.ready,
      apiLoggerReady: apiLogger.ready,
      authLoggerReady: authLogger.ready,
      dbLoggerReady: dbLogger.ready
    };
    
    console.log('✓ Handler logging test completed');
  } catch (error) {
    testResults.handlerLogging = {
      success: false,
      error: error.message,
      stack: error.stack
    };
    console.error('✗ Handler logging test failed:', error.message);
  }
}

async function verifyLogsInMongoDB() {
  console.log('\nVerifying logs in MongoDB collections...');
  try {
    const connection = await dbConnection.getConnection();
    const db = connection.connection.db;
    
    // Check each log collection
    const collections = ['error_logs', 'api_logs', 'auth_logs', 'db_logs', 'test_logs'];
    const results = {};
    
    for (const collection of collections) {
      try {
        const count = await db.collection(collection).countDocuments();
        const recentLogs = await db.collection(collection)
          .find({})
          .sort({ timestamp: -1 })
          .limit(5)
          .toArray();
        
        results[collection] = {
          exists: true,
          count,
          hasRecentLogs: recentLogs.length > 0,
          recentLogCount: recentLogs.length,
          sampleLog: recentLogs[0] ? {
            level: recentLogs[0].level,
            message: recentLogs[0].message,
            timestamp: recentLogs[0].timestamp
          } : null
        };
        
        console.log(`  ${collection}: ${count} logs found, ${recentLogs.length} recent logs`);
      } catch (error) {
        results[collection] = {
          exists: false,
          error: error.message
        };
        console.log(`  ${collection}: Error - ${error.message}`);
      }
    }
    
    testResults.verification = {
      success: Object.values(results).some(r => r.exists && r.hasRecentLogs),
      collections: results
    };
    
    if (testResults.verification.success) {
      console.log('✓ Log verification test passed - found logs in MongoDB');
    } else {
      console.log('✗ Log verification test failed - no logs found in MongoDB');
    }
  } catch (error) {
    testResults.verification = {
      success: false,
      error: error.message,
      stack: error.stack
    };
    console.error('✗ Log verification test failed:', error.message);
  }
}

// Run the tests
runTests().catch(err => {
  console.error('Test script failed:', err);
  process.exit(1);
});
