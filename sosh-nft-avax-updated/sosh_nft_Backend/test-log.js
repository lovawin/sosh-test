const { createLogger } = require('./app/logging/config/logConfig');

async function testLogging() {
  console.log('Starting logging test...');
  
  // Create a test logger
  const logger = createLogger('test');
  
  // Test message
  const testMessage = {
    level: 'info',
    message: 'Test log message',
    timestamp: new Date().toISOString(),
    type: 'TEST',
    metadata: {
      testId: Date.now(),
      environment: 'development'
    }
  };

  console.log('Sending test log message:', testMessage);

  // Send test log
  logger.info(testMessage.message, testMessage.metadata);

  // Keep process alive to allow async operations to complete
  setTimeout(() => {
    console.log('Test completed. Check mongo-express for the log entry.');
    process.exit(0);
  }, 5000);
}

testLogging().catch(error => {
  console.error('Test failed:', error);
  process.exit(1);
});
