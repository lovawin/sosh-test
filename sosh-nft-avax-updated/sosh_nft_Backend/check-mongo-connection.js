/**
 * MongoDB Connection Check Script
 * 
 * This script checks the MongoDB connection and verifies that the marketplace logs collection
 * exists and is accessible. It also checks the SSH tunnel to ensure it's working correctly.
 * 
 * Usage: node check-mongo-connection.js
 */

require('dotenv').config();
const { MongoClient } = require('mongodb');
const http = require('http');

// Configuration
const MONGODB_URI = process.env.MONGODB_CONNECTION_STRING || 'mongodb://localhost:27017';
const DB_NAME = process.env.NODE_ENV === 'production' ? 'sosh' : 'soshnew1';
const MONGO_EXPRESS_URL = 'http://localhost:8500';

/**
 * Check MongoDB connection
 */
async function checkMongoConnection() {
  console.log('\n=== Checking MongoDB Connection ===');
  console.log(`MongoDB URI: ${MONGODB_URI}`);
  console.log(`Database: ${DB_NAME}`);
  
  const client = new MongoClient(MONGODB_URI);
  
  try {
    console.log('Connecting to MongoDB...');
    await client.connect();
    console.log('✅ Successfully connected to MongoDB');
    
    // Get server info
    const adminDb = client.db('admin');
    const serverInfo = await adminDb.command({ serverStatus: 1 });
    
    console.log('\nMongoDB Server Info:');
    console.log(`Version: ${serverInfo.version}`);
    console.log(`Uptime: ${Math.floor(serverInfo.uptime / 86400)} days, ${Math.floor((serverInfo.uptime % 86400) / 3600)} hours`);
    console.log(`Connections: ${serverInfo.connections.current} current, ${serverInfo.connections.available} available`);
    
    // Check database
    const db = client.db(DB_NAME);
    const collections = await db.listCollections().toArray();
    
    console.log(`\nDatabase '${DB_NAME}' has ${collections.length} collections:`);
    collections.forEach(collection => {
      console.log(`- ${collection.name}`);
    });
    
    // Check marketplace_logs collection
    const hasMarketplaceLogs = collections.some(c => c.name === 'marketplace_logs');
    if (hasMarketplaceLogs) {
      console.log('\n✅ marketplace_logs collection exists');
      
      // Check collection stats
      const stats = await db.collection('marketplace_logs').stats();
      console.log(`Collection size: ${Math.floor(stats.size / 1024)} KB`);
      console.log(`Document count: ${stats.count}`);
      
      // Check for recent logs
      const recentLogs = await db.collection('marketplace_logs')
        .find()
        .sort({ timestamp: -1 })
        .limit(5)
        .toArray();
      
      if (recentLogs.length > 0) {
        console.log(`\nFound ${recentLogs.length} recent logs:`);
        recentLogs.forEach((log, index) => {
          console.log(`\nLog ${index + 1}:`);
          console.log(`Type: ${log.type}`);
          console.log(`Timestamp: ${log.timestamp}`);
          console.log(`TokenId: ${log.tokenId || log.metadata?.tokenId || 'N/A'}`);
        });
        
        // Check for approval logs specifically
        const approvalLogs = recentLogs.filter(log => 
          log.type === 'APPROVAL_ATTEMPT' || 
          log.type === 'APPROVAL_RESULT' || 
          (log.type === 'TRANSACTION_ERROR' && log.operation === 'APPROVAL')
        );
        
        if (approvalLogs.length > 0) {
          console.log(`\nFound ${approvalLogs.length} recent approval-related logs`);
        } else {
          console.log('\n⚠️ No recent approval-related logs found');
        }
      } else {
        console.log('\n⚠️ No recent logs found in marketplace_logs collection');
      }
      
      // Check for indexes
      const indexes = await db.collection('marketplace_logs').indexes();
      console.log(`\nCollection has ${indexes.length} indexes:`);
      indexes.forEach(index => {
        console.log(`- ${index.name}: ${JSON.stringify(index.key)}`);
      });
      
      // Check if there's a TTL index
      const ttlIndex = indexes.find(index => index.expireAfterSeconds !== undefined);
      if (ttlIndex) {
        console.log(`\n✅ TTL index found: ${ttlIndex.name}, expires after ${ttlIndex.expireAfterSeconds} seconds`);
      } else {
        console.log('\n⚠️ No TTL index found on marketplace_logs collection');
      }
    } else {
      console.log('\n❌ marketplace_logs collection does not exist');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error);
    return false;
  } finally {
    await client.close();
    console.log('\nMongoDB connection closed');
  }
}

/**
 * Check SSH tunnel and Mongo Express
 */
function checkMongoExpress() {
  console.log('\n=== Checking Mongo Express SSH Tunnel ===');
  console.log(`Mongo Express URL: ${MONGO_EXPRESS_URL}`);
  
  return new Promise((resolve) => {
    http.get(MONGO_EXPRESS_URL, (res) => {
      const { statusCode } = res;
      
      console.log(`Status Code: ${statusCode}`);
      
      if (statusCode === 200) {
        console.log('✅ Mongo Express is accessible via SSH tunnel');
        resolve(true);
      } else {
        console.log(`❌ Mongo Express returned status code ${statusCode}`);
        resolve(false);
      }
      
      // Consume response data to free up memory
      res.resume();
    }).on('error', (err) => {
      console.error('❌ Error connecting to Mongo Express:', err.message);
      console.log('\nPossible causes:');
      console.log('1. SSH tunnel is not active');
      console.log('2. Mongo Express is not running');
      console.log('3. Mongo Express is running on a different port');
      console.log('\nTo establish SSH tunnel, run:');
      console.log('ssh -i "../taurien" -L 8500:localhost:8500 taurien@3.216.178.231');
      resolve(false);
    });
  });
}

/**
 * Run all checks
 */
async function runChecks() {
  console.log('=== MongoDB Connection and SSH Tunnel Check ===');
  
  // Check MongoDB connection
  const mongoConnectionOk = await checkMongoConnection();
  
  // Check Mongo Express SSH tunnel
  const mongoExpressOk = await checkMongoExpress();
  
  // Print summary
  console.log('\n=== Check Summary ===');
  console.log(`MongoDB Connection: ${mongoConnectionOk ? '✅ OK' : '❌ Failed'}`);
  console.log(`Mongo Express SSH Tunnel: ${mongoExpressOk ? '✅ OK' : '❌ Failed'}`);
  
  if (!mongoConnectionOk || !mongoExpressOk) {
    console.log('\n=== Troubleshooting Recommendations ===');
    
    if (!mongoConnectionOk) {
      console.log('- Check MongoDB connection string in environment variables');
      console.log('- Verify MongoDB server is running');
      console.log('- Check network connectivity to MongoDB server');
    }
    
    if (!mongoExpressOk) {
      console.log('- Verify SSH tunnel is active and correctly configured');
      console.log('- Check if Mongo Express is running on the server');
      console.log('- Ensure port 8500 is being forwarded correctly');
      console.log('- Try restarting the SSH tunnel with:');
      console.log('  ssh -i "../taurien" -L 8500:localhost:8500 taurien@3.216.178.231');
    }
  }
}

// Run the checks
runChecks().catch(console.error);
