/**
 * Comprehensive Logging System Test
 * 
 * @description Tests all logging functionality across different collections
 * including edge cases, error scenarios, and verification steps
 */

const logging = require('./app/logging');
const dbConnection = require('./app/services/dbConnection');
const MongoTransport = require('./app/logging/transports/mongoTransport');

async function verifyCollection(db, collectionName) {
  const collection = db.collection(collectionName);
  const results = { name: collectionName, issues: [] };
  
  try {
    // Check collection existence and count
    const count = await collection.countDocuments();
    results.count = count;
    console.log(`\n${collectionName}:`);
    console.log(`- Document count: ${count}`);

    // Check indexes
    const indexes = await collection.indexes();
    results.indexes = indexes;
    console.log('- Indexes:', indexes.map(idx => ({
      name: idx.name,
      fields: idx.key,
      expireAfter: idx.expireAfterSeconds
    })));

    // Verify TTL index exists
    const ttlIndex = indexes.find(idx => idx.expireAfterSeconds);
    if (!ttlIndex) {
      results.issues.push('Missing TTL index');
    }

    // Check latest documents
    if (count > 0) {
      const latest = await collection.find()
        .sort({ timestamp: -1 })
        .limit(3)
        .toArray();
      
      // Verify timestamp field
      const hasTimestamp = latest.every(doc => doc.timestamp);
      if (!hasTimestamp) {
        results.issues.push('Missing timestamp field');
      }

      // Verify required fields based on collection type
      const requiredFields = {
        error_logs: ['message', 'level', 'stack', 'type'],
        api_logs: ['method', 'url', 'status', 'duration'],
        auth_logs: ['userId', 'type', 'success'],
        db_logs: ['operation', 'collection', 'duration'],
        job_logs: ['jobId', 'jobType', 'status'],
        blockchain_logs: ['transactionHash', 'type', 'status'],
        security_logs: ['type', 'severity', 'details'],
        system_logs: ['type', 'metrics']
      };

      const fields = requiredFields[collectionName];
      if (fields) {
        const missingFields = fields.filter(field => 
          !latest.every(doc => doc[field] !== undefined)
        );
        if (missingFields.length > 0) {
          results.issues.push(`Missing required fields: ${missingFields.join(', ')}`);
        }
      }

      // Check data types
      latest.forEach((doc, i) => {
        if (!(doc.timestamp instanceof Date)) {
          results.issues.push(`Invalid timestamp type in document ${i}`);
        }
      });

      // Check for sensitive data
      const sensitivePatterns = [
        /password/i,
        /secret/i,
        /token/i,
        /key/i,
        /auth/i,
        /credit/i,
        /ssn/i
      ];

      const sensitiveCheck = (obj, path = '') => {
        for (const [key, value] of Object.entries(obj)) {
          const fullPath = path ? `${path}.${key}` : key;
          if (typeof value === 'string' && 
              sensitivePatterns.some(pattern => pattern.test(key)) &&
              value !== '********') {
            results.issues.push(`Unmasked sensitive data in ${fullPath}`);
          }
          if (value && typeof value === 'object') {
            sensitiveCheck(value, fullPath);
          }
        }
      };

      latest.forEach(doc => sensitiveCheck(doc));

      // Store sample documents
      results.samples = latest;
    }

    // Check index usage
    const indexStats = await collection.aggregate([
      { $indexStats: {} }
    ]).toArray();
    results.indexStats = indexStats;

    // Check collection stats
    const stats = await collection.stats();
    results.stats = {
      size: stats.size,
      avgObjSize: stats.avgObjSize,
      storageSize: stats.storageSize,
      totalIndexSize: stats.totalIndexSize
    };

  } catch (error) {
    results.issues.push(`Verification error: ${error.message}`);
  }

  return results;
}

async function testLoggingSystem() {
  console.log('\n=== Starting Comprehensive Logging System Test ===\n');

  try {
    // Test 1: Transport Module Verification
    console.log('\nTest 1: Verifying Transport Module...');
    const Transport = require('winston-transport');
    console.log('- Transport type:', typeof Transport);
    console.log('- MongoTransport instanceof Transport:', MongoTransport.prototype instanceof Transport);

    // Test 2: Database Connection
    console.log('\nTest 2: Testing Database Connection...');
    const connection = await dbConnection.getConnection();
    console.log('- Connection state:', connection.connection.readyState);
    console.log('- Database:', connection.connection.name);
    console.log('- Host:', connection.connection.host);

    // Test 3: Logging System Initialization
    console.log('\nTest 3: Initializing Logging System...');
    await logging.initializeLogging();

    // Test 4: Error Logging (including edge cases)
    console.log('\nTest 4: Testing Error Logging...');
    const testCases = [
      // Standard error
      new Error('Test error message'),
      // Error with custom properties
      Object.assign(new Error('Custom error'), { code: 'CUSTOM_ERROR' }),
      // Error with circular reference
      (() => {
        const err = new Error('Circular error');
        err.self = err;
        return err;
      })(),
      // Error with large stack trace
      (() => {
        function generateDeepStack() {
          try {
            generateDeepStack();
          } catch (e) {
            return e;
          }
        }
        return generateDeepStack();
      })(),
      // Non-error object
      { message: 'Not an error', type: 'custom' }
    ];

    for (const error of testCases) {
      await logging.errorLogger.logError(error, {
        context: 'test',
        metadata: { test: true, timestamp: new Date() }
      });
    }

    // Test 5: API Logging (various HTTP methods and statuses)
    console.log('\nTest 5: Testing API Logging...');
    const httpMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'];
    const statusCodes = [200, 201, 400, 401, 403, 404, 500];

    for (const method of httpMethods) {
      for (const status of statusCodes) {
        await logging.apiLogger.logRequest({
          method,
          url: '/api/test',
          headers: {
            'user-agent': 'test-script',
            'content-type': 'application/json',
            'authorization': 'Bearer test-token'
          },
          body: { test: true },
          ip: '127.0.0.1'
        });

        await logging.apiLogger.logResponse({
          method,
          url: '/api/test',
          statusCode: status,
          duration: Math.random() * 1000,
          responseSize: 1024
        });
      }
    }

    // Test 6: Authentication Logging (success and failure cases)
    console.log('\nTest 6: Testing Authentication Logging...');
    const authScenarios = [
      { success: true, method: 'password' },
      { success: false, method: 'password', error: 'Invalid credentials' },
      { success: true, method: 'oauth', provider: 'google' },
      { success: false, method: 'oauth', provider: 'twitter', error: 'Token expired' },
      { success: true, method: 'jwt' },
      { success: false, method: 'jwt', error: 'Invalid token' }
    ];

    for (const scenario of authScenarios) {
      await logging.authLogger.logLogin(
        { id: 'test-user', email: 'test@example.com' },
        scenario.success,
        scenario.error ? new Error(scenario.error) : null
      );
    }

    // Test 7: Job Queue Logging (different job types and states)
    console.log('\nTest 7: Testing Job Queue Logging...');
    const jobTypes = ['EMAIL', 'SYNC', 'BACKUP', 'PROCESS'];
    const jobStates = ['queued', 'processing', 'completed', 'failed'];

    for (const type of jobTypes) {
      const jobId = `job-${Date.now()}-${type}`;
      
      await logging.jobLogger.logJobStart(jobId, type, { priority: 'high' });
      
      if (Math.random() > 0.5) {
        await logging.jobLogger.logJobComplete(jobId, type, { duration: 1000 });
      } else {
        await logging.jobLogger.logJobFailed(jobId, type, new Error('Random failure'));
      }

      await logging.jobLogger.logQueueMetrics(type, {
        waiting: Math.floor(Math.random() * 100),
        active: Math.floor(Math.random() * 20),
        completed: Math.floor(Math.random() * 1000)
      });
    }

    // Test 8: Blockchain Logging (various transaction types)
    console.log('\nTest 8: Testing Blockchain Logging...');
    const txTypes = ['TRANSFER', 'MINT', 'BURN', 'APPROVE', 'SWAP'];
    const networks = ['mainnet', 'testnet', 'local'];

    for (const type of txTypes) {
      for (const network of networks) {
        const txHash = `0x${Math.random().toString(36).substring(2)}`;
        
        await logging.blockchainLogger.logTransaction(txHash, type, {
          network,
          from: `0x${Math.random().toString(36).substring(2)}`,
          to: `0x${Math.random().toString(36).substring(2)}`,
          value: Math.random() * 10,
          gas: Math.floor(Math.random() * 1000000)
        });

        await logging.blockchainLogger.logGasUsage(
          txHash,
          Math.floor(Math.random() * 1000000),
          Math.floor(Math.random() * 100),
          Math.random() * 0.1
        );
      }
    }

    // Test 9: Security Logging (various security events)
    console.log('\nTest 9: Testing Security Logging...');
    const securityEvents = [
      { type: 'LOGIN_ATTEMPT', severity: 'info' },
      { type: 'BRUTE_FORCE_DETECTED', severity: 'warn' },
      { type: 'INVALID_TOKEN', severity: 'warn' },
      { type: 'PERMISSION_DENIED', severity: 'warn' },
      { type: 'SQL_INJECTION_ATTEMPT', severity: 'error' }
    ];

    for (const event of securityEvents) {
      await logging.securityLogger.logSecurityEvent(event.type, {
        ip: '192.168.1.1',
        userId: 'test-user',
        resource: '/api/sensitive-data',
        attempt: Math.floor(Math.random() * 5)
      }, event.severity);
    }

    // Test 10: System Logging (various metrics and states)
    console.log('\nTest 10: Testing System Logging...');
    await logging.systemLogger.logResourceMetrics();
    
    const services = ['api', 'worker', 'scheduler', 'cache'];
    const states = ['starting', 'running', 'degraded', 'stopped'];

    for (const service of services) {
      for (const state of states) {
        await logging.systemLogger.logServiceStatus(service, state, {
          uptime: Math.floor(Math.random() * 86400),
          memory: Math.floor(Math.random() * 1024),
          cpu: Math.random() * 100
        });
      }
    }

    // Test 11: Basic Collection Creation Test
    console.log('\nTest 11: Basic Collection Creation Test...');
    
    // Create one log entry in each collection
    await Promise.all([
      logging.errorLogger.logError(new Error('Test error')),
      logging.apiLogger.logRequest({
        method: 'GET',
        url: '/test',
        headers: { 'test': 'true' }
      }),
      logging.authLogger.logLogin({ id: 'test-user' }, true),
      logging.jobLogger.logJobStart('test-job', 'TEST', {}),
      logging.blockchainLogger.logTransaction('0xtest', 'TEST', {}),
      logging.securityLogger.logSecurityEvent('TEST', {}),
      logging.systemLogger.logResourceMetrics()
    ]);

    console.log('Basic test completed - All collections should be created');

    // Wait for logs to be written
    console.log('\nWaiting for logs to be written...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Test 12: Verification
    console.log('\nTest 12: Verifying Logs...');
    const db = connection.connection.db;
    const collections = await db.listCollections().toArray();
    const logCollections = collections
      .map(c => c.name)
      .filter(name => name.endsWith('_logs'));

    console.log('Log collections found:', logCollections);

    // Verify each collection
    const verificationResults = {};
    for (const collectionName of logCollections) {
      verificationResults[collectionName] = await verifyCollection(db, collectionName);
    }

    // Final Report
    console.log('\n=== Test Results ===');
    
    // Collection Statistics
    console.log('\nCollection Statistics:');
    let totalIssues = 0;
    Object.values(verificationResults).forEach(result => {
      console.log(`\n${result.name}:`);
      console.log(`- Documents: ${result.count}`);
      console.log(`- Indexes: ${result.indexes.length}`);
      console.log(`- Storage size: ${(result.stats.storageSize / 1024 / 1024).toFixed(2)} MB`);
      console.log(`- Average document size: ${(result.stats.avgObjSize / 1024).toFixed(2)} KB`);
      if (result.issues.length > 0) {
        console.log('- Issues:');
        result.issues.forEach(issue => console.log(`  * ${issue}`));
        totalIssues += result.issues.length;
      }
    });

    // Performance Metrics
    console.log('\nPerformance Metrics:');
    console.log(`- Total issues found: ${totalIssues}`);

    // Storage Analysis
    const totalStorageSize = Object.values(verificationResults)
      .reduce((sum, result) => sum + (result.stats?.storageSize || 0), 0);
    console.log('\nStorage Analysis:');
    console.log(`- Total storage used: ${(totalStorageSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`- Estimated daily growth: ${(totalStorageSize / 30 / 1024 / 1024).toFixed(2)} MB/day`);

    // Recommendations
    console.log('\nRecommendations:');
    if (totalIssues > 0) {
      console.log('1. Address identified issues in collections');
    }
    console.log('2. Monitor storage growth and adjust TTL if needed');
    console.log('3. Review index usage statistics for optimization');
    console.log('4. Set up monitoring for collection sizes and growth rates');

    // Verification Steps
    console.log('\nVerification Steps:');
    console.log('1. Check mongo-express interface to verify collections');
    console.log('2. Verify TTL indexes are working (documents should expire after 30 days)');
    console.log('3. Confirm all sensitive data is properly masked');
    console.log('4. Verify log rotation is working in file-based logs');
    console.log('5. Monitor system performance impact');
    console.log('6. Set up alerts for:');
    console.log('   - Collection size thresholds');
    console.log('   - High latency in log writing');
    console.log('   - Failed log attempts');
    console.log('   - Missing required fields');
    console.log('   - Index efficiency issues');

  } catch (error) {
    console.error('\n=== Test Failed ===');
    console.error('Error:', error);
    console.error('Stack:', error.stack);
  } finally {
    process.exit(0);
  }
}

// Run the test
testLoggingSystem().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
