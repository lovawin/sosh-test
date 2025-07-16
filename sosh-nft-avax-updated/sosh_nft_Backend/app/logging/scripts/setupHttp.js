/**
 * HTTP Setup Script
 * 
 * @description Verifies connection to mongo-express server and ensures logging collection exists
 */

const http = require('http');

async function setupHttp() {
  console.log('Verifying HTTP connection...');

  const auth = 'Basic ' + Buffer.from('admin:pass').toString('base64');

  const options = {
    hostname: '3.216.178.231',
    port: 8086,
    path: '/',
    method: 'GET',
    headers: {
      'Authorization': auth
    }
  };

  try {
    // First verify server is accessible
    await new Promise((resolve, reject) => {
      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          console.log('Response data:', data);
          if (res.statusCode === 200) {
            console.log('Successfully connected to mongo-express server');
            resolve();
          } else {
            reject(new Error(`Server check failed with status ${res.statusCode}: ${data}`));
          }
        });
      });

      req.on('error', (error) => {
        console.error('Network error during server check:', error);
        reject(error);
      });

      req.end();
    });

    // Now verify we can access the sosh database
    const dbOptions = {
      hostname: '3.216.178.231',
      port: 8086,
      path: '/db/sosh',
      method: 'GET',
      headers: {
        'Authorization': auth
      }
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

      req.end();
    });

    // Finally, verify/create the logging collection
    const collectionOptions = {
      hostname: '3.216.178.231',
      port: 8086,
      path: '/db/sosh/collections',
      method: 'GET',
      headers: {
        'Authorization': auth
      }
    };

    await new Promise((resolve, reject) => {
      const req = http.request(collectionOptions, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          if (res.statusCode === 200) {
            console.log('Successfully verified collection access');
            resolve();
          } else if (res.statusCode === 404 || res.statusCode === 302) {
            // Collection doesn't exist or we got redirected, create it
            const createReq = http.request({
              hostname: '3.216.178.231',
              port: 8086,
              path: '/db/sosh/addCollection',
              method: 'POST',
              headers: {
                'Authorization': auth,
                'Content-Type': 'application/x-www-form-urlencoded'
              }
            }, (createRes) => {
              if (createRes.statusCode === 200 || createRes.statusCode === 302) {
                console.log('Successfully created logging collection');
                resolve();
              } else {
                reject(new Error(`Failed to create collection: ${createRes.statusCode}`));
              }
            });
            createReq.on('error', reject);
            const formData = 'collection=system_logs';
            createReq.setHeader('Content-Length', Buffer.byteLength(formData));
            createReq.end(formData);
          } else {
            reject(new Error(`Collection verification failed with status ${res.statusCode}: ${data}`));
          }
        });
      });

      req.on('error', (error) => {
        console.error('Network error during collection verification:', error);
        reject(error);
      });

      req.end();
    });

    console.log('HTTP setup completed successfully');
  } catch (error) {
    console.error('Error setting up HTTP:', error);
    throw error;
  }
}

// Run setup if called directly
if (require.main === module) {
  setupHttp().catch(error => {
    console.error('Setup failed:', error);
    process.exit(1);
  });
}

module.exports = setupHttp;
