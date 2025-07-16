const { MongoClient } = require('mongodb');

async function verifyLogInMongoDB(error) {
    const client = new MongoClient('mongodb://localhost:27017', {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });

    try {
        await client.connect();
        console.log('Connected to MongoDB to verify log...');
        
        const db = client.db('soshnew1');
        const collection = db.collection('system_logs');
        
        // Wait a moment for the log to be written
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Find the most recent log entry
        const log = await collection.findOne(
            { message: error.message },
            { sort: { timestamp: -1 } }
        );
        
        if (log) {
            console.log('Found log entry in MongoDB:');
            console.log(JSON.stringify(log, null, 2));
            return true;
        } else {
            console.log('No matching log entry found');
            return false;
        }
    } catch (error) {
        console.error('Error verifying log:', error);
        return false;
    } finally {
        await client.close();
    }
}

async function runTest() {
    console.log('Starting error logging test...');
    
    const errorLogger = require('./app/logging/handlers/errorLogger');
    console.log('Error logger module loaded');
    
    console.log('Waiting for logger to initialize...');
    try {
        await errorLogger.initPromise;
        console.log('Logger initialization complete');
        
        console.log('Testing error logging...');
        const testError = new Error('Test error for MongoDB logging');
        await errorLogger.logError(testError, {
            context: 'test',
            operation: 'test_logging',
            timestamp: new Date().toISOString()
        });
        
        console.log('Error logged successfully');
        
        // Verify the log was written to MongoDB
        const verified = await verifyLogInMongoDB(testError);
        if (verified) {
            console.log('Successfully verified log entry in MongoDB');
        } else {
            throw new Error('Could not verify log entry in MongoDB');
        }
        
    } catch (error) {
        console.error('Error during test:', error);
        throw error;
    }
}

// Run test and keep process alive until complete
runTest()
    .then(() => {
        console.log('Test completed successfully');
        process.exit(0);
    })
    .catch(error => {
        console.error('Test failed:', error);
        process.exit(1);
    });
