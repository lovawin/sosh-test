/**
 * Script to check Twitter OAuth logs after applying the session fix
 * 
 * This script connects to the MongoDB database and queries the logs collection
 * to find logs related to the Twitter OAuth flow, specifically focusing on
 * session management and the new session ID passing mechanism.
 */

const { MongoClient } = require('mongodb');
const appconfig = require('./config/appconfig');

// MongoDB connection string
const uri = appconfig.MONGODB_CONNECTION_STRING;

// Connect to MongoDB
async function checkLogs() {
  console.log('Connecting to MongoDB...');
  const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const database = client.db('sosh_nft');
    const logsCollection = database.collection('logs');

    // Get the most recent logs related to Twitter OAuth
    console.log('\n--- Recent Twitter OAuth Logs ---');
    const recentLogs = await logsCollection
      .find({
        $or: [
          { 'context.action': 'callback_url_with_session' },
          { 'context.action': 'session_id_mismatch' },
          { 'context.action': 'original_session_found' },
          { 'context.action': 'session_merged' }
        ]
      })
      .sort({ timestamp: -1 })
      .limit(20)
      .toArray();

    if (recentLogs.length === 0) {
      console.log('No Twitter OAuth logs found. The fix may not have been triggered yet.');
    } else {
      recentLogs.forEach(log => {
        console.log(`\n[${log.timestamp}] ${log.level}: ${log.message}`);
        console.log('Context:', JSON.stringify(log.context, null, 2));
        console.log('Metadata:', JSON.stringify(log.metadata, null, 2));
      });
    }

    // Check for session errors
    console.log('\n--- Recent Session Errors ---');
    const sessionErrors = await logsCollection
      .find({
        level: 'error',
        message: /session|token/i
      })
      .sort({ timestamp: -1 })
      .limit(10)
      .toArray();

    if (sessionErrors.length === 0) {
      console.log('No session errors found. This is a good sign!');
    } else {
      sessionErrors.forEach(error => {
        console.log(`\n[${error.timestamp}] ${error.level}: ${error.message}`);
        console.log('Context:', JSON.stringify(error.context, null, 2));
        console.log('Metadata:', JSON.stringify(error.metadata, null, 2));
      });
    }

    // Check for successful Twitter OAuth flows
    console.log('\n--- Successful Twitter OAuth Flows ---');
    const successfulFlows = await logsCollection
      .find({
        'context.action': 'session_merged',
        level: 'info'
      })
      .sort({ timestamp: -1 })
      .limit(5)
      .toArray();

    if (successfulFlows.length === 0) {
      console.log('No successful Twitter OAuth flows found yet.');
    } else {
      console.log(`Found ${successfulFlows.length} successful Twitter OAuth flows:`);
      successfulFlows.forEach(flow => {
        console.log(`\n[${flow.timestamp}] Session merged successfully`);
        console.log('Original Session ID:', flow.context.originalSessionID);
        console.log('Current Session ID:', flow.context.currentSessionID);
      });
    }

  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  } finally {
    await client.close();
    console.log('\nDisconnected from MongoDB');
  }
}

// Run the function
checkLogs().catch(console.error);
