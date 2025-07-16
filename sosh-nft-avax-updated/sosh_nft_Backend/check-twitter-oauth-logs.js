/**
 * Script to check Twitter OAuth logs in MongoDB
 * 
 * This script connects to MongoDB and queries the logs collection
 * to find logs related to the Twitter OAuth flow, focusing on
 * session management and token storage.
 */

const { MongoClient } = require('mongodb');
const appconfig = require('./config/appconfig');

// MongoDB connection string
const mongoUrl = appconfig.MONGODB_CONNECTION_STRING;

// Connect to MongoDB
async function main() {
  console.log('Connecting to MongoDB...');
  const client = new MongoClient(mongoUrl, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    serverSelectionTimeoutMS: 30000,
    connectTimeoutMS: 30000
  });

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db();
    
    // Check available collections
    const collections = await db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name).join(', '));
    
    // Define collections to check
    const logsCollection = db.collection('system_logs');
    const errorLogsCollection = db.collection('error_logs');
    const sessionsCollection = db.collection('sessions');
    
    // Get the most recent session IDs from logs
    const recentSessionIds = await logsCollection
      .find({ 'message.sessionID': { $exists: true } })
      .sort({ timestamp: -1 })
      .limit(10)
      .project({ 'message.sessionID': 1 })
      .toArray();
    
    const uniqueSessionIds = [...new Set(recentSessionIds
      .map(log => log.message?.sessionID)
      .filter(id => id))];
    
    console.log('\n=== Recent Session IDs ===');
    console.log(uniqueSessionIds);
    
    // Check for token storage logs
    console.log('\n=== Token Storage Logs ===');
    const tokenStorageLogs = await logsCollection
      .find({
        $or: [
          { 'message.type': 'SESSION_STATE', 'message.action': 'before_token_store' },
          { 'message.type': 'SESSION_STATE', 'message.action': 'after_token_assign' },
          { 'message.type': 'SESSION_STATE', 'message.action': 'after_request_token_save' },
          { 'message.type': 'TOKEN_OPERATION', 'message.operation': 'token_to_store' },
          { 'message.type': 'TOKEN_OPERATION', 'message.operation': 'twitter_response_data' }
        ]
      })
      .sort({ timestamp: -1 })
      .limit(5)
      .toArray();
    
    tokenStorageLogs.forEach(log => {
      console.log(`[${new Date(log.timestamp).toISOString()}] ${log.message.type} - ${log.message.action || log.message.operation}`);
      console.log('  SessionID:', log.message.sessionID);
      if (log.message.sessionData?.oauth) {
        console.log('  OAuth Token:', log.message.sessionData.oauth.requestToken);
      }
      if (log.message.tokenData?.requestToken) {
        console.log('  Token to Store:', log.message.tokenData.requestToken);
      }
      console.log('---');
    });
    
    // Check for token verification logs
    console.log('\n=== Token Verification Logs ===');
    const tokenVerificationLogs = await logsCollection
      .find({
        $or: [
          { 'message.type': 'TOKEN_OPERATION', 'message.operation': 'verify' },
          { 'message.type': 'SESSION_STATE', 'message.action': 'callback_with_token' }
        ]
      })
      .sort({ timestamp: -1 })
      .limit(5)
      .toArray();
    
    tokenVerificationLogs.forEach(log => {
      console.log(`[${new Date(log.timestamp).toISOString()}] ${log.message.type} - ${log.message.action || log.message.operation}`);
      console.log('  SessionID:', log.message.sessionID);
      if (log.message.tokenData) {
        console.log('  Session Token:', log.message.tokenData.sessionToken);
        console.log('  Query Token:', log.message.tokenData.queryToken);
        console.log('  Match:', log.message.tokenData.match);
      }
      console.log('---');
    });
    
    // Check for error logs
    console.log('\n=== Error Logs ===');
    const errorLogs = await logsCollection
      .find({
        'message.type': 'OAUTH_ERROR',
        'message.operation': { $in: ['token_verification', 'session_diagnostics'] }
      })
      .sort({ timestamp: -1 })
      .limit(5)
      .toArray();
    
    errorLogs.forEach(log => {
      console.log(`[${new Date(log.timestamp).toISOString()}] ${log.message.type} - ${log.message.operation}`);
      console.log('  SessionID:', log.message.sessionID);
      console.log('  Session Exists:', log.message.sessionExists);
      console.log('  Has OAuth:', log.message.hasOAuth);
      if (log.message.sessionKeys) {
        console.log('  Session Keys:', log.message.sessionKeys);
      }
      console.log('---');
    });
    
    // Check session store
    console.log('\n=== Session Store ===');
    const sessions = await sessionsCollection
      .find({})
      .sort({ expires: -1 })
      .limit(5)
      .toArray();
    
    sessions.forEach(session => {
      let sessionData;
      try {
        // Session data might be stored as a string or already as an object
        sessionData = typeof session.session === 'string' 
          ? JSON.parse(session.session) 
          : session.session;
      } catch (e) {
        sessionData = { error: 'Failed to parse session data' };
      }
      
      console.log(`Session ID: ${session._id}`);
      console.log('  Expires:', new Date(session.expires).toISOString());
      console.log('  Has OAuth:', !!sessionData.oauth);
      if (sessionData.oauth) {
        console.log('  OAuth Token:', sessionData.oauth.requestToken);
        console.log('  OAuth Token Secret:', '[REDACTED]');
        console.log('  OAuth Timestamp:', sessionData.oauth.timestamp);
      }
      console.log('  Session Keys:', Object.keys(sessionData));
      console.log('---');
    });
    
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

main().catch(console.error);
