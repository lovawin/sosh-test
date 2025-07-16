/**
 * InfluxDB Setup Script
 * 
 * @description Verifies connection to InfluxDB and ensures database exists
 */

const http = require('http');

async function setupInfluxDB() {
  console.log('Verifying InfluxDB connection...');

  const options = {
    hostname: '3.216.178.231',
    port: 8086,
    path: '/ping',
    method: 'HEAD',
    headers: {
      'Authorization': 'Basic ' + Buffer.from('admin:pass').toString('base64')
    }
  };

  try {
    // First verify InfluxDB is accessible
    await new Promise((resolve, reject) => {
      const req = http.request(options, (res) => {
        if (res.statusCode === 204) {
          console.log('Successfully connected to InfluxDB');
          resolve();
        } else {
          reject(new Error(`InfluxDB ping failed with status ${res.statusCode}`));
        }
      });

      req.on('error', (error) => {
        console.error('Network error during ping:', error);
        reject(error);
      });

      req.on('response', (res) => {
        console.log('Ping response status:', res.statusCode);
        console.log('Ping response headers:', res.headers);
      });

      req.end();
    });

    // Now verify we can access the database
    const dbOptions = {
      hostname: '3.216.178.231',
      port: 8086,
      path: '/query?db=sosh&u=admin&p=pass&q=SHOW+MEASUREMENTS',
      method: 'GET'
    };

    await new Promise((resolve, reject) => {
      const req = http.request(dbOptions, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          if (res.statusCode === 200) {
            console.log('Successfully verified database access');
            resolve();
          } else {
            reject(new Error(`Database verification failed with status ${res.statusCode}: ${data}`));
          }
        });
      });

      req.on('error', (error) => {
        console.error('Network error during database verification:', error);
        reject(error);
      });

      req.on('response', (res) => {
        console.log('Database verification response status:', res.statusCode);
        console.log('Database verification response headers:', res.headers);
      });

      req.end();
    });

    console.log('InfluxDB setup completed successfully');
  } catch (error) {
    console.error('Error setting up InfluxDB:', error);
    throw error;
  }
}

// Run setup if called directly
if (require.main === module) {
  setupInfluxDB().catch(error => {
    console.error('Setup failed:', error);
    process.exit(1);
  });
}

module.exports = setupInfluxDB;
