require('dotenv').config();
const mongoose = require('mongoose');
const Web3 = require('web3');
const Redis = require('ioredis');
const jwt = require('jsonwebtoken');

// User Schema
const UserSchema = new mongoose.Schema({
  wallet_address: {
    type: String,
    unique: true,
    required: true,
    lowercase: true,
  },
  name: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    unique: true,
  },
  last_login_date: {
    type: Date,
  }
});

const Users = mongoose.model('Users', UserSchema);

// Configuration object
const config = {
  MONGODB_CONNECTION_STRING: process.env.MONGODB_CONNECTION_STRING,
  JWT_SECRET: process.env.JWT_SECRET || 'IAMSECRETKEY0',
  REDIS_HOST: process.env.REDIS_HOST || 'sosh_redis_db',
  REDIS_PORT: process.env.REDIS_PORT || 6379,
  INFURA_URL: process.env.INFURA_URL || process.env.NewINFURA_URL || 'https://api.avax-test.network/ext/bc/C/rpc'
};

// JWT functions
async function signJwt(userId) {
  return jwt.sign({ id: userId }, config.JWT_SECRET, { expiresIn: '8h' });
}

async function verifyJwt(token) {
  return jwt.verify(token, config.JWT_SECRET);
}
const os = require('os');
const dns = require('dns');
const { promisify } = require('util');
const dnsLookup = promisify(dns.lookup);

// Test network connectivity
async function testNetworkConnectivity() {
  console.log('\n🔍 Testing Network Connectivity...');
  try {
    // Test DNS resolution for key services
    const services = [
      'api.avax-test.network',  // Avalanche testnet
      'www.soshnft.io',         // Main application
      'mongodb.com',            // MongoDB
      'infura.io'              // Infura
    ];

    for (const service of services) {
      try {
        const { address } = await dnsLookup(service);
        console.log(`✅ DNS Resolution for ${service}: ${address}`);
      } catch (error) {
        console.error(`❌ DNS Resolution failed for ${service}:`, error.message);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('❌ Network Connectivity Test Failed');
    console.error('Error details:', formatError(error));
    return false;
  }
}

// Monitor memory usage
function logMemoryUsage() {
  const used = process.memoryUsage();
  console.log('\n📊 Memory Usage:');
  for (let key in used) {
    console.log(`${key}: ${Math.round(used[key] / 1024 / 1024 * 100) / 100} MB`);
  }
  console.log(`Free System Memory: ${Math.round(os.freemem() / 1024 / 1024 * 100) / 100} MB`);
}

// Test data
const TEST_DATA = {
  message: 'Please sign this message to connect.',
  signature: '0x29f644a4a9de162e78b42e6d1f4346e9d1b8932b6a65d312b903ff2850f0854e0c8b62e21d4f1db66c8ff7099046a0a40594d25b0c5c8c49d91b5c1f48db5db1b',
  name: 'Test User',
  username: 'testuser',
  email: 'test@example.com',
  referral: ''
};

// Utility function to format errors
function formatError(error) {
  return {
    name: error.name,
    message: error.message,
    stack: error.stack,
    ...(error.code && { code: error.code }),
    ...(error.reason && { reason: error.reason })
  };
}

// Test MongoDB Connection with detailed diagnostics
async function testMongoConnection() {
  console.log('\n🔍 Testing MongoDB Connection...');
  try {
    const mongoUrl = config.MONGODB_CONNECTION_STRING;
    if (!mongoUrl) {
      throw new Error('MongoDB connection string not found in environment variables');
    }

    // Parse MongoDB URL for diagnostics
    const [protocol, rest] = mongoUrl.split('://');
    const [credentials, hostPort] = rest.split('@');
    const [host] = hostPort.split('/');
    
    console.log('MongoDB Configuration:');
    console.log(`Protocol: ${protocol}`);
    console.log(`Host: ${host}`);

    // Test DNS resolution for MongoDB host
    try {
      const { address } = await dnsLookup(host);
      console.log(`MongoDB Host DNS Resolution: ${address}`);
    } catch (error) {
      console.error('MongoDB Host DNS Resolution Failed:', error.message);
    }

    // Attempt connection with timeout and detailed options
    await mongoose.connect(mongoUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 5000,
      connectTimeoutMS: 5000
    });

    // Test basic operations
    console.log('Testing MongoDB Operations:');
    
    // Get server status
    const adminDb = mongoose.connection.db.admin();
    const serverStatus = await adminDb.serverStatus();
    console.log('Server Version:', serverStatus.version);
    console.log('Server Uptime:', Math.round(serverStatus.uptime / 3600), 'hours');
    
    // List collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Available Collections:', collections.map(c => c.name));
    
    // Test write permission
    const testCollection = mongoose.connection.db.collection('test_permissions');
    await testCollection.insertOne({ test: true, timestamp: new Date() });
    await testCollection.deleteOne({ test: true });
    
    console.log('✅ MongoDB Connection: SUCCESS');
    console.log(`Connected to: ${mongoose.connection.name}`);
    
    return true;
  } catch (error) {
    console.error('❌ MongoDB Connection: FAILED');
    console.error('Error details:', formatError(error));
    return false;
  }
}

// Test Redis Connection
async function testRedisConnection() {
  console.log('\n🔍 Testing Redis Connection...');
  try {
    const redis = new Redis({
      host: config.REDIS_HOST,
      port: config.REDIS_PORT
    });

    await redis.ping();
    console.log('✅ Redis Connection: SUCCESS');
    await redis.quit();
    return true;
  } catch (error) {
    console.error('❌ Redis Connection: FAILED');
    console.error('Error details:', formatError(error));
    return false;
  }
}

// Test Web3 Connection and Signature Verification with detailed diagnostics
async function testWeb3Connection() {
  console.log('\n🔍 Testing Web3 Connection and Signature Verification...');
  try {
    // Check INFURA_URL
    if (!config.INFURA_URL) {
      throw new Error('INFURA_URL not found in environment variables');
    }
    console.log('Web3 Provider URL:', config.INFURA_URL);

    // Test DNS resolution for provider
    const providerUrl = new URL(config.INFURA_URL);
    try {
      const { address } = await dnsLookup(providerUrl.hostname);
      console.log(`Provider DNS Resolution: ${address}`);
    } catch (error) {
      console.error('Provider DNS Resolution Failed:', error.message);
    }

    // Initialize Web3
    console.log('Initializing Web3...');
const web3 = new Web3(config.INFURA_URL);
    
    // Test basic connection
    console.log('Testing network connection...');
    const networkId = await web3.eth.net.getId();
    const networkType = await web3.eth.net.getNetworkType();
    console.log(`Network ID: ${networkId}`);
    console.log(`Network Type: ${networkType}`);

    // Get network status
    const isListening = await web3.eth.net.isListening();
    const peerCount = await web3.eth.net.getPeerCount();
    console.log(`Node Listening: ${isListening}`);
    console.log(`Connected Peers: ${peerCount}`);

    // Get latest block to verify chain access
    const latestBlock = await web3.eth.getBlock('latest');
    console.log('Latest Block:', {
      number: latestBlock.number,
      timestamp: new Date(latestBlock.timestamp * 1000).toISOString(),
      transactions: latestBlock.transactions.length
    });

    // Test signature verification
    console.log('\nTesting signature verification...');
    console.log('Message:', TEST_DATA.message);
    console.log('Signature:', TEST_DATA.signature);
    
    const recoveredAddress = await web3.eth.accounts.recover(
      TEST_DATA.message,
      TEST_DATA.signature
    );

    // Validate recovered address format
    if (!web3.utils.isAddress(recoveredAddress)) {
      throw new Error('Recovered address is not a valid Ethereum address');
    }

    // Get address balance to verify chain access
    const balance = await web3.eth.getBalance(recoveredAddress);
    console.log('Recovered address:', recoveredAddress);
    console.log('Address Balance:', web3.utils.fromWei(balance, 'ether'), 'ETH');

    console.log('✅ Web3 Connection: SUCCESS');
    return true;
  } catch (error) {
    console.error('❌ Web3 Connection: FAILED');
    console.error('Error details:', formatError(error));
    return false;
  }
}

// Test User Operations
async function testUserOperations() {
  console.log('\n🔍 Testing User Operations...');
  try {
    // Test user lookup
    let user = await Users.findOne({
      username: TEST_DATA.username
    });

    if (user) {
      console.log('Found existing user:', user.username);
    } else {
      console.log('User not found, testing user creation...');
      
      // Test user creation
      user = new Users({
        wallet_address: '0x0000000000000000000000000000000000000000',
        name: TEST_DATA.name,
        username: TEST_DATA.username,
        email: TEST_DATA.email,
        last_login_date: new Date()
      });

      await user.save();
      console.log('Created new user:', user.username);
    }

    // Test user population
    await user.populate('followers following userAsset', 'username profile_image_url');
    console.log('✅ User Operations: SUCCESS');
    return true;
  } catch (error) {
    console.error('❌ User Operations: FAILED');
    console.error('Error details:', formatError(error));
    return false;
  }
}

// Test JWT Generation and Verification
async function testJWTGeneration() {
  console.log('\n🔍 Testing JWT Generation and Verification...');
  try {
    if (!config.JWT_SECRET) {
      throw new Error('JWT_SECRET not found in environment variables');
    }

    const testUserId = '507f1f77bcf86cd799439011';
    
    // Test token generation
    const token = await signJwt(testUserId);
    console.log('Generated token length:', token.length);
    
    // Test token verification
    const decoded = await verifyJwt(token);
    console.log('Decoded token:', decoded);
    
    if (decoded.id !== testUserId) {
      throw new Error('JWT verification failed - user ID mismatch');
    }
    
    console.log('✅ JWT Generation and Verification: SUCCESS');
    return true;
  } catch (error) {
    console.error('❌ JWT Generation: FAILED');
    console.error('Error details:', formatError(error));
    return false;
  }
}

// Check environment variables
function checkEnvironmentVariables() {
  console.log('\n🔍 Checking Environment Variables...');
  const requiredVars = [
    'MONGODB_CONNECTION_STRING',
    'JWT_SECRET',
    'REDIS_HOST',
    'REDIS_PORT',
    'INFURA_URL'
  ];

  const missing = requiredVars.filter(varName => !config[varName]);
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing.join(', '));
    return false;
  }
  
  console.log('✅ All required environment variables present');
  return true;
}

// Main test function
async function runTests() {
  console.log('🚀 Starting Login Flow Diagnostic Tests...');
  console.log('==========================================');
  
  // Initial system checks
  logMemoryUsage();
  
  // Test network connectivity
  const networkCheck = await testNetworkConnectivity();
  if (!networkCheck) {
    console.error('❌ Network connectivity check failed. This may affect other tests.');
  }

  // Check environment variables
  const envCheck = checkEnvironmentVariables();
  if (!envCheck) {
    console.error('❌ Environment validation failed. Aborting tests.');
    process.exit(1);
  }

  const results = {
    mongodb: await testMongoConnection(),
    redis: await testRedisConnection(),
    web3: await testWeb3Connection(),
    user: await testUserOperations(),
    jwt: await testJWTGeneration()
  };

  console.log('\n📊 Test Results Summary');
  console.log('==========================================');
  Object.entries(results).forEach(([test, passed]) => {
    console.log(`${test}: ${passed ? '✅ PASSED' : '❌ FAILED'}`);
  });

  // Log memory usage after tests
  logMemoryUsage();

  // Check if any test failed
  const anyFailed = Object.values(results).some(result => !result);
  
  // Cleanup
  await mongoose.connection.close();
  process.exit(anyFailed ? 1 : 0);
}

// Run the tests
runTests().catch(error => {
  console.error('Fatal error:', formatError(error));
  process.exit(1);
});
