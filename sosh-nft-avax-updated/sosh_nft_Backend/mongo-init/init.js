db = db.getSiblingDB('admin');

// Create the user in admin database first
db.createUser({
  user: 'soshadmin',
  pwd: 'VHUCTYXRTFYGJYFUTVHVYU',
  roles: [
    { role: 'root', db: 'admin' }
  ]
});

db.auth('soshadmin', 'VHUCTYXRTFYGJYFUTVHVYU');

// Switch to sosh database and ensure the user has access
db = db.getSiblingDB('sosh');

// Create collections with indexes
db.error_logs.createIndex({ timestamp: -1 });
db.error_logs.createIndex({ level: 1 });
db.error_logs.createIndex({ type: 1 });

db.api_logs.createIndex({ timestamp: -1 });
db.api_logs.createIndex({ method: 1 });
db.api_logs.createIndex({ status: 1 });
db.api_logs.createIndex({ url: 1 });

db.auth_logs.createIndex({ timestamp: -1 });
db.auth_logs.createIndex({ userId: 1 });
db.auth_logs.createIndex({ type: 1 });
db.auth_logs.createIndex({ success: 1 });

db.db_logs.createIndex({ timestamp: -1 });
db.db_logs.createIndex({ operation: 1 });
db.db_logs.createIndex({ collection: 1 });

db.job_logs.createIndex({ timestamp: -1 });
db.job_logs.createIndex({ jobId: 1 });
db.job_logs.createIndex({ jobType: 1 });
db.job_logs.createIndex({ type: 1 });

db.blockchain_logs.createIndex({ timestamp: -1 });
db.blockchain_logs.createIndex({ transactionHash: 1 });
db.blockchain_logs.createIndex({ blockNumber: 1 });
db.blockchain_logs.createIndex({ type: 1 });

db.security_logs.createIndex({ timestamp: -1 });
db.security_logs.createIndex({ type: 1 });
db.security_logs.createIndex({ severity: 1 });
db.security_logs.createIndex({ userId: 1 });

db.system_logs.createIndex({ timestamp: -1 });
db.system_logs.createIndex({ type: 1 });
db.system_logs.createIndex({ service: 1 });

// Set up TTL indexes for log rotation
const TTL_DAYS = 30; // Keep logs for 30 days
const collections = [
  'error_logs',
  'api_logs',
  'auth_logs',
  'db_logs',
  'job_logs',
  'blockchain_logs',
  'security_logs',
  'system_logs'
];

collections.forEach(collection => {
  db[collection].createIndex(
    { timestamp: 1 },
    { expireAfterSeconds: TTL_DAYS * 24 * 60 * 60 }
  );
});
