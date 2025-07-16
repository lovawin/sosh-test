/**
 * Test script to verify how Error objects are handled by the MongoDB transport
 */

const errorLogger = require('./app/logging/handlers/errorLogger');
const mongoose = require('mongoose');
const appconfig = require('./config/appconfig');

async function testErrorObjectLogging() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(appconfig.MONGODB_CONNECTION_STRING, {
      useUnifiedTopology: true,
      useNewUrlParser: true
    });
    console.log('Connected to MongoDB');
    
    // Wait for error logger to initialize
    console.log('Initializing error logger...');
    await errorLogger.initPromise;
    console.log('Error logger initialized');
    
    // Test 1: Log a real error
    console.log('\nTest 1: Logging a real error...');
    const testId1 = Math.random().toString(36).substring(7);
    await errorLogger.logError(new Error('This is a real error'), {
      context: 'test_error_object',
      testId: testId1,
      timestamp: new Date().toISOString()
    });
    console.log('Real error logged');
    
    // Test 2: Log a string message
    console.log('\nTest 2: Logging a string message...');
    const testId2 = Math.random().toString(36).substring(7);
    await errorLogger.logWarning('This is a warning message', {
      context: 'test_string_message',
      testId: testId2,
      timestamp: new Date().toISOString()
    });
    console.log('String message logged');
    
    // Test 3: Log an Error object with a trace-like message (similar to the changes)
    console.log('\nTest 3: Logging an Error object with a trace-like message...');
    const testId3 = Math.random().toString(36).substring(7);
    await errorLogger.logError(new Error('Twitter login - After isLoggedInquery'), {
      context: 'twitter_login_after_auth',
      testId: testId3,
      timestamp: new Date().toISOString()
    });
    console.log('Trace-like error logged');
    
    // Wait for logs to be written
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check if logs were written
    console.log('\nChecking if logs were written...');
    const db = mongoose.connection.db;
    
    const log1 = await db.collection('error_logs').findOne({ 'metadata.testId': testId1 });
    console.log('Test 1 (Real error):', log1 ? 'FOUND' : 'NOT FOUND');
    
    const log2 = await db.collection('error_logs').findOne({ 'metadata.testId': testId2 });
    console.log('Test 2 (String message):', log2 ? 'FOUND' : 'NOT FOUND');
    
    const log3 = await db.collection('error_logs').findOne({ 'metadata.testId': testId3 });
    console.log('Test 3 (Trace-like error):', log3 ? 'FOUND' : 'NOT FOUND');
    
    if (log1) console.log('Test 1 message:', log1.message);
    if (log2) console.log('Test 2 message:', log2.message);
    if (log3) console.log('Test 3 message:', log3.message);
    
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    process.exit(0);
  }
}

testErrorObjectLogging();
