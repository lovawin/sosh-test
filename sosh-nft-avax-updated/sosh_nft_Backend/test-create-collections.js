const logging = require('./app/logging');
const dbConnection = require('./app/services/dbConnection');

async function createCollections() {
  console.log('Initializing logging system...');
  await logging.initializeLogging();

  console.log('Creating test entries in each collection...');
  
  // Create collections one at a time
  console.log('Creating error_logs collection...');
  await logging.errorLogger.logError(new Error('Test error'));
  
  console.log('Creating api_logs collection...');
  await logging.apiLogger.logRequest({
    method: 'GET',
    url: '/test',
    headers: { 'test': 'true' }
  });
  
  console.log('Creating auth_logs collection...');
  await logging.authLogger.logLogin({ id: 'test-user' }, true);
  
  console.log('Creating job_logs collection...');
  await logging.jobLogger.logJobStart('test-job', 'TEST', {});
  
  console.log('Creating blockchain_logs collection...');
  await logging.blockchainLogger.logTransaction('0xtest', 'TEST', {});
  
  console.log('Creating security_logs collection...');
  await logging.securityLogger.logSecurityEvent('TEST', {});
  
  console.log('Creating system_logs collection...');
  await logging.systemLogger.logResourceMetrics();

  console.log('Waiting for logs to be written...');
  await new Promise(resolve => setTimeout(resolve, 2000));

  const db = (await dbConnection.getConnection()).connection.db;
  const collections = await db.listCollections().toArray();
  const logCollections = collections
    .map(c => c.name)
    .filter(name => name.endsWith('_logs'));

  console.log('\nLog collections created:', logCollections);
  process.exit(0);
}

createCollections().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
