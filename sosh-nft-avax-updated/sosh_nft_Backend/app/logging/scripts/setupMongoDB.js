/**
 * MongoDB Setup Script
 * 
 * @description Verifies connection to MongoDB and ensures logging collection exists
 */

const { MongoClient } = require('mongodb');
require('dotenv').config({ path: 'config/prod/dev.env' });

async function setupMongoDB() {
  console.log('Verifying MongoDB connection...');

  const url = process.env.MONGODB_CONNECTION_STRING || 'mongodb://soshadmin:VHUCTYXRTFYGJYFUTVHVYU@mongodb:27017/sosh';
  const dbName = url.split('/').pop();
  const collectionName = 'system_logs';
  let client;

  try {
    client = await MongoClient.connect(url);
    console.log('Successfully connected to MongoDB');

    const db = client.db(dbName);
    
    // Check if collection exists, if not create it
    const collections = await db.listCollections({ name: collectionName }).toArray();
    if (collections.length === 0) {
      console.log(`Creating collection: ${collectionName}`);
      await db.createCollection(collectionName);
      
      // Create indexes for better query performance
      const collection = db.collection(collectionName);
      await collection.createIndex({ timestamp: -1 });
      await collection.createIndex({ level: 1 });
      await collection.createIndex({ type: 1 });
      console.log('Created indexes for logging collection');
    } else {
      console.log(`Collection ${collectionName} already exists`);
    }

    // Verify we can write to the collection
    const testLog = {
      timestamp: new Date(),
      level: 'info',
      message: 'Test log entry',
      type: 'SETUP_TEST'
    };

    await db.collection(collectionName).insertOne(testLog);
    console.log('Successfully verified write access to logging collection');

    // Clean up test log
    await db.collection(collectionName).deleteOne({ type: 'SETUP_TEST' });

    console.log('MongoDB logging setup completed successfully');
  } catch (error) {
    console.error('Error setting up MongoDB logging:', error);
    throw error;
  } finally {
    if (client) {
      await client.close();
    }
  }
}

// Run setup if called directly
if (require.main === module) {
  setupMongoDB().catch(error => {
    console.error('Setup failed:', error);
    process.exit(1);
  });
}

module.exports = setupMongoDB;
