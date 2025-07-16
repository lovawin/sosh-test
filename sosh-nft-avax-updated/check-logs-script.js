/**
 * Script to check marketplace logs for ownership-related entries
 */

const fs = require('fs');

// Connect to MongoDB
const { MongoClient } = require('mongodb');
const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const database = client.db('sosh_nft');
    const collection = database.collection('marketplace_logs');
    
    // Query for logs related to ownership
    const query = {
      $or: [
        { type: 'OWNERSHIP_CHECK' },
        { type: 'TOKEN_OWNERSHIP_CHECK' },
        { type: 'OWNERSHIP_CHECK_RESULT' },
        { type: 'OWNERSHIP_CHECK_ERROR' },
        { type: 'DATA_PROPERTY_VALIDATION' }
      ]
    };
    
    // Find the documents
    const cursor = collection.find(query).sort({ timestamp: -1 }).limit(20);
    const results = await cursor.toArray();
    
    console.log(`Found ${results.length} ownership-related logs`);
    
    // Count logs with specific fields
    const currentOwnerLogs = results.filter(log => log.currentOwner).length;
    const isMarketplaceOwnerLogs = results.filter(log => log.isMarketplaceOwner !== undefined).length;
    const currentOwnerExistsLogs = results.filter(log => log.currentOwnerExists !== undefined).length;
    
    console.log(`Logs with currentOwner field: ${currentOwnerLogs}`);
    console.log(`Logs with isMarketplaceOwner field: ${isMarketplaceOwnerLogs}`);
    console.log(`Logs with currentOwnerExists field: ${currentOwnerExistsLogs}`);
    
    // Write results to file
    fs.writeFileSync('/tmp/marketplace-logs.json', JSON.stringify(results, null, 2));
    console.log('Logs saved to /tmp/marketplace-logs.json');
    
  } finally {
    await client.close();
  }
}

run().catch(console.dir);
