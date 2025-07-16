const errorLogger = require('./app/logging/handlers/errorLogger');
const dbConnection = require('./app/services/dbConnection');
const MongoTransport = require('./app/logging/transports/mongoTransport');
const { createLogger } = require('./app/logging/config/logConfig');

async function testErrorLogging() {
  console.log('\n=== Starting Error Logging Test ===\n');

  try {
    // Check Transport and MongoTransport modules
    console.log('Checking modules...');
    const Transport = require('winston-transport');
    console.log('\nTransport module:');
    console.log('Transport type:', typeof Transport);
    console.log('Transport prototype:', Transport.prototype);
    console.log('Transport constructor:', Transport.constructor?.name);
    
    console.log('\nMongoTransport module:');
    console.log('MongoTransport type:', typeof MongoTransport);
    console.log('MongoTransport prototype:', MongoTransport.prototype);
    console.log('MongoTransport constructor:', MongoTransport.constructor?.name);
    console.log('MongoTransport instance of Transport:', MongoTransport instanceof Transport);
    console.log('MongoTransport keys:', Object.keys(MongoTransport));

    // Try creating a transport directly
    console.log('\nTrying to create transport directly...');
    try {
      const transport = new MongoTransport({ collection: 'test_logs' });
      console.log('Transport created successfully');
      console.log('Transport properties:', {
        collection: transport.collection,
        isConnected: transport.isConnected,
        hasDb: !!transport.db,
        name: transport.name,
        database: transport.database
      });

      // Wait for connection
      console.log('\nWaiting for transport connection...');
      try {
        await transport.connectionPromise;
        console.log('Transport connection successful');
        console.log('Updated transport properties:', {
          collection: transport.collection,
          isConnected: transport.isConnected,
          hasDb: !!transport.db,
          name: transport.name,
          database: transport.database
        });
      } catch (connError) {
        console.error('Transport connection failed:', connError);
        console.error('Connection error details:', {
          message: connError.message,
          stack: connError.stack,
          code: connError.code,
          name: connError.name
        });
      }
    } catch (error) {
      console.error('Failed to create transport:', error);
    }

    // Test database connection first
    console.log('Testing database connection...');
    const connection = await dbConnection.getConnection();
    console.log('Database connection successful');
    console.log('Connection state:', connection.connection.readyState);
    console.log('Database:', connection.connection.name);
    console.log('Host:', connection.connection.host);
    console.log('Port:', connection.connection.port);

    // Get logger transports info
    console.log('\nChecking logger configuration...');
    await errorLogger.initPromise;  // Wait for logger to be initialized
    if (errorLogger.logger) {
      const transports = errorLogger.logger.transports;
      console.log('Number of transports:', transports.length);
      transports.forEach((transport, index) => {
        console.log(`Transport ${index + 1}:`, {
          name: transport.constructor.name,
          level: transport.level,
          collection: transport.collection,
          isConnected: transport.isConnected
        });
      });
    } else {
      console.log('Logger not initialized');
    }

    // Test error logging
    console.log('\nTesting error logging...');
    const testError = new Error('Test error message');
    await errorLogger.logError(testError, {
      context: 'test',
      metadata: {
        test: true,
        timestamp: new Date().toISOString()
      }
    });

    console.log('Error logged successfully');
    
    // Wait to ensure log is written
    console.log('\nWaiting for log to be written...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Check collections
    const collections = await connection.connection.db.listCollections().toArray();
    console.log('\nAvailable collections:', collections.map(c => c.name));

    console.log('\n=== Test Completed Successfully ===');

  } catch (error) {
    console.error('\n=== Test Failed ===');
    console.error('Error:', error);
    console.error('Stack:', error.stack);
  } finally {
    process.exit(0);
  }
}

// Run the test
testErrorLogging().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
