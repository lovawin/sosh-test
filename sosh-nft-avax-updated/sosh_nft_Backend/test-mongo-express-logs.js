/**
 * Test script to generate logs for mongo-express
 */

const errorLogger = require('./app/logging/handlers/errorLogger');

async function generateTestLogs() {
  try {
    console.log('Generating test logs for mongo-express...');
    
    // Wait for error logger to initialize
    await errorLogger.initPromise;
    console.log('Error logger initialized');
    
    // Generate different types of logs
    console.log('Generating error log...');
    await errorLogger.logError(new Error('Test error for mongo-express'), {
      context: 'mongo_express_test',
      timestamp: new Date().toISOString()
    });
    
    console.log('Generating warning log...');
    await errorLogger.logWarning('Test warning for mongo-express', {
      context: 'mongo_express_test',
      timestamp: new Date().toISOString()
    });
    
    console.log('Generating trace log...');
    await errorLogger.logTrace('Test trace for mongo-express', {
      context: 'mongo_express_test',
      timestamp: new Date().toISOString()
    });
    
    console.log('All test logs generated');
    
  } catch (error) {
    console.error('Error generating test logs:', error);
  } finally {
    // Wait a bit to ensure logs are written
    await new Promise(resolve => setTimeout(resolve, 1000));
    process.exit(0);
  }
}

generateTestLogs();
