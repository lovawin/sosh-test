const { createLogger } = require('./app/logging/config/logConfig');
const MongoTransport = require('./app/logging/transports/mongoTransport');
const dbConnection = require('./app/services/dbConnection');

async function testMongoLogging() {
  console.log('\n=== Starting MongoDB Logging Test ===\n');

  try {
    // Step 1: Test database connection
    console.log('Step 1: Testing database connection...');
    const connection = await dbConnection.getConnection();
    console.log('✓ Database connection successful');
    console.log('Connection state:', connection.connection.readyState);
    console.log('Database:', connection.connection.name);

    // Step 2: Create test logger
    console.log('\nStep 2: Creating test logger...');
    const logger = createLogger('test');
    console.log('✓ Logger created');
    
    // Step 3: Verify transports
    console.log('\nStep 3: Verifying logger transports...');
    const transports = logger.transports;
    console.log('Number of transports:', transports.length);
    transports.forEach((transport, index) => {
      console.log(`Transport ${index + 1}:`, {
        name: transport.constructor.name,
        level: transport.level,
        handleExceptions: transport.handleExceptions
      });
    });

    // Step 4: Send test logs
    console.log('\nStep 4: Sending test logs...');
    const testMessages = [
      {
        level: 'info',
        message: 'Test info message',
        type: 'TEST_INFO',
        metadata: { testId: 'info-' + Date.now() }
      },
      {
        level: 'error',
        message: 'Test error message',
        type: 'TEST_ERROR',
        metadata: { testId: 'error-' + Date.now() }
      },
      {
        level: 'warn',
        message: 'Test warning message',
        type: 'TEST_WARN',
        metadata: { testId: 'warn-' + Date.now() }
      }
    ];

    // Send logs with delay between each
    for (const msg of testMessages) {
      console.log(`\nSending ${msg.level} message:`, msg);
      logger[msg.level](msg.message, msg.metadata);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Step 5: Verify MongoDB collections
    console.log('\nStep 5: Verifying MongoDB collections...');
    const db = connection.connection.db;
    const collections = await db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name));

    // Wait to ensure all logs are written
    console.log('\nWaiting for logs to be written...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    console.log('\n=== Test Completed Successfully ===');
    console.log('Check mongo-express for the following collections:');
    console.log('- system_logs (or the configured collection name)');
    console.log('\nIf collections are missing, check:');
    console.log('1. MongoDB transport initialization');
    console.log('2. Write permissions');
    console.log('3. Collection creation permissions');

  } catch (error) {
    console.error('\n=== Test Failed ===');
    console.error('Error:', error);
    console.error('Stack:', error.stack);
  } finally {
    // Clean exit
    process.exit(0);
  }
}

// Run the test
testMongoLogging().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
