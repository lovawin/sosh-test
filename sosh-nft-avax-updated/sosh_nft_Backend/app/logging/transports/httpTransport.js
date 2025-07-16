/**
 * HTTP Transport for Winston
 * 
 * @description Custom Winston transport that writes logs to mongo-express via HTTP
 */

const Transport = require('winston-transport');
const http = require('http');
const https = require('https');

class HttpTransport extends Transport {
  constructor(opts) {
    super(opts);
    
    console.log('Initializing HTTP Transport with config:', {
      host: opts.host,
      port: opts.port,
      database: opts.database,
      collection: opts.collection
    });
    
    // Get configuration from options or environment variables
    this.host = opts.host || 'sosh-backend-app';
    this.port = opts.port || 8500; // Default to 8500 since mongo-express is mapped to 8500:8081
    this.database = opts.database || process.env.LOG_HTTP_DB || 'soshnew1';
    this.collection = opts.collection || process.env.LOG_HTTP_COLLECTION || 'system_logs';
    
    // Handle credentials
    const username = opts.username || process.env.LOG_HTTP_USERNAME || 'admin';
    const password = opts.password || process.env.LOG_HTTP_PASSWORD || 'pass';
    
    if (!this.host) {
      throw new Error('HTTP Transport requires host configuration');
    }
    
    if (username && password) {
      this.auth = 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64');
    }
    
    this.maxRetries = opts.maxRetries || 5;
    this.retryDelay = opts.retryDelay || 3000; // 3 seconds between retries
    this.timeout = opts.timeout || 15000; // 15 seconds timeout
    
    // Initialize connection state
    this.isConnected = false;
    this.sessionCookie = null;
    this.csrfToken = null;
    
    console.log('Starting connection test to mongo-express...');
    this.connectionPromise = this.testConnection().catch(error => {
      console.error('Initial connection test failed:', error);
      throw error;
    });
  }

  async extractCsrfToken(responseData, headers) {
    console.log('Attempting to extract CSRF token from response');
    
    try {
      // Try to find token in HTML meta tag
      if (typeof responseData === 'string') {
        // Look for CSRF token in meta tag
        const metaMatch = responseData.match(/<meta\s+name=["']csrf-token["']\s+content=["']([^"']+)["']/i);
        if (metaMatch) {
          console.log('Found CSRF token in meta tag:', metaMatch[1]);
          return metaMatch[1];
        }

        // Look for CSRF token in a hidden input field
        const inputMatch = responseData.match(/<input\s+type=["']hidden["']\s+name=["']csrf-token["']\s+value=["']([^"']+)["']/i);
        if (inputMatch) {
          console.log('Found CSRF token in hidden input:', inputMatch[1]);
          return inputMatch[1];
        }

        // Try to parse as JSON in case it's a JSON response
        try {
          const jsonData = JSON.parse(responseData);
          if (jsonData._csrf || jsonData.csrf) {
            const token = jsonData._csrf || jsonData.csrf;
            console.log('Found CSRF token in JSON response:', token);
            return token;
          }
        } catch (e) {
          // Not JSON, continue with other methods
        }
      }

      // Check headers for CSRF token
      const csrfHeader = headers['x-csrf-token'] || headers['csrf-token'];
      if (csrfHeader) {
        console.log('Found CSRF token in header:', csrfHeader);
        return csrfHeader;
      }

      // Check cookies for CSRF token
      if (headers['set-cookie']) {
        for (const cookie of headers['set-cookie']) {
          const match = cookie.match(/(?:csrf-token|_csrf)=([^;]+)/i);
          if (match) {
            console.log('Found CSRF token in cookie:', match[1]);
            return match[1];
          }
        }
      }

      console.log('Response data preview:', responseData.substring(0, 500));
      console.log('Headers:', headers);
      console.log('No CSRF token found in response');
      return null;
    } catch (error) {
      console.error('Error extracting CSRF token:', error);
      return null;
    }
  }

  async makeRequest(options, data = null, followRedirect = true) {
    return new Promise((resolve, reject) => {
      console.log('Making request with options:', {
        ...options,
        headers: {
          ...options.headers,
          Authorization: options.headers.Authorization ? '[REDACTED]' : undefined
        }
      });

      // Add session cookie and CSRF token to headers for all requests
      const headers = {
        ...options.headers
      };

      if (this.sessionCookie) {
        headers.Cookie = this.sessionCookie;
      }

      if (this.csrfToken && (options.method === 'POST' || options.method === 'PUT' || options.method === 'DELETE')) {
        headers['csrf-token'] = this.csrfToken;
        headers['x-csrf-token'] = this.csrfToken;
      }

      options.headers = headers;

      const req = http.request(options, async (res) => {
        // Handle redirects
        if (followRedirect && (res.statusCode === 301 || res.statusCode === 302)) {
          const location = res.headers.location;
          if (location) {
            console.log('Following redirect to:', location);
            const redirectUrl = new URL(location.startsWith('http') ? location : `http://${this.host}:${this.port}${location}`);
            const redirectOptions = {
              ...options,
              path: redirectUrl.pathname + redirectUrl.search,
              headers: {
                ...options.headers,
                host: redirectUrl.host
              }
            };
            return this.makeRequest(redirectOptions, data, false)
              .then(resolve)
              .catch(reject);
          }
        }

        // Update session cookie if provided
        const cookies = res.headers['set-cookie'];
        if (cookies && cookies.length > 0) {
          this.sessionCookie = cookies[0].split(';')[0];
          console.log('Session cookie updated:', this.sessionCookie);
        }

        let responseData = '';
        res.on('data', (chunk) => {
          responseData += chunk;
        });

        res.on('end', async () => {
          console.log('Response status code:', res.statusCode);
          console.log('Response headers:', res.headers);
          
          // Log cookies if present
          if (res.headers['set-cookie']) {
            console.log('Received cookies:', res.headers['set-cookie']);
          }

          // Log response preview
          console.log('Response body preview (first 1000 chars):', responseData.substring(0, 1000));

          // Try to extract CSRF token from response
          const token = await this.extractCsrfToken(responseData, res.headers);
          if (token) {
            this.csrfToken = token;
            console.log('CSRF token extracted and saved:', token);
          } else {
            console.log('Failed to extract CSRF token from response');
            console.log('Full response body:', responseData);
          }

          // Success status codes or expected redirects
          if ((res.statusCode >= 200 && res.statusCode < 300) || res.statusCode === 302) {
            resolve({ statusCode: res.statusCode, headers: res.headers, body: responseData });
          } else {
            console.error('Request failed with status:', res.statusCode);
            console.error('Error response body:', responseData);
            reject(new Error(`HTTP Error: ${res.statusCode} - ${responseData}`));
          }
        });
      });

      req.on('error', (error) => {
        console.error('Request error:', error);
        if (error.code === 'ECONNREFUSED') {
          console.error(`Connection refused to ${this.host}:${this.port}`);
          console.error('Please check:');
          console.error('1. Is mongo-express running?');
          console.error('2. Is it accessible at http://localhost:8500/api?');
          console.error('3. Are the Docker containers running?');
          reject(new Error(`Connection refused to ${this.host}:${this.port}. Make sure mongo-express is running and accessible.`));
        } else {
          console.error('Unexpected error:', error);
          console.error('Full error details:', {
            code: error.code,
            message: error.message,
            stack: error.stack
          });
          reject(error);
        }
      });

      req.on('timeout', () => {
        console.error('Request timeout');
        req.destroy();
        reject(new Error(`Request timeout after ${this.timeout}ms`));
      });

      if (data) {
        console.log('Sending request data:', data);
        req.write(data);
      }
      req.end();
    });
  }

  async getCsrfToken() {
    console.log('Getting CSRF token...');
    const options = {
      hostname: this.host,
      port: this.port,
      path: '/api',
      method: 'GET',
      headers: {
        ...(this.auth ? { 'Authorization': this.auth } : {}),
        'Accept': 'text/html,application/json,application/xhtml+xml',
        ...(this.sessionCookie ? { 'Cookie': this.sessionCookie } : {})
      },
      timeout: this.timeout
    };

    try {
      const fullUrl = `http://${this.host}:${this.port}/api`;
      console.log('Making request to get CSRF token:', fullUrl);
      console.log('Request headers:', options.headers);
      
      const response = await this.makeRequest(options);
      console.log('Response received:', {
        statusCode: response.statusCode,
        headers: response.headers,
        bodyPreview: response.body.substring(0, 200) // Preview first 200 chars
      });
      
      // Try to extract token from response
      const token = await this.extractCsrfToken(response.body, response.headers);
      if (!token) {
        console.error('Failed to get CSRF token from API response');
        console.error('Response preview:', {
          status: response.statusCode,
          headers: response.headers,
          body: response.body.substring(0, 500)
        });
        throw new Error('Failed to extract CSRF token from response');
      }
      this.csrfToken = token;
      console.log('Successfully obtained CSRF token:', this.csrfToken);
      
      console.log('Successfully obtained CSRF token:', this.csrfToken);
      return this.csrfToken;
    } catch (error) {
      console.error('Error getting CSRF token:', error);
      if (error.message.includes('404')) {
        console.error('404 error suggests incorrect API path. Check mongo-express configuration.');
      }
      throw error;
    }
  }

  async testConnection() {
    console.log('Testing connection to mongo-express...');
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        console.log(`Connection attempt ${attempt}/${this.maxRetries}`);

        // First get CSRF token
        await this.getCsrfToken();

        // Then test database connection
        const options = {
          hostname: this.host,
          port: this.port,
          path: `/api/db/${this.database}`,
          method: 'GET',
          headers: {
            ...(this.auth ? { 'Authorization': this.auth } : {}),
            'Accept': 'application/json',
            ...(this.sessionCookie ? { 'Cookie': this.sessionCookie } : {}),
            ...(this.csrfToken ? { 'X-CSRF-Token': this.csrfToken } : {})
          },
          timeout: this.timeout
        };

        console.log('Testing database connection:', `http://${this.host}:${this.port}/api/db/${this.database}`);

        const response = await this.makeRequest(options);
        console.log('Successfully connected to mongo-express');
        this.isConnected = true;
        return;

      } catch (error) {
        console.error(`Connection attempt ${attempt}/${this.maxRetries} failed:`, error.message);
        console.error('Error details:', {
          code: error.code,
          message: error.message,
          stack: error.stack
        });

        if (attempt === this.maxRetries) {
          console.error('All connection attempts failed. Last error:', error);
          throw new Error(`Failed to connect after ${this.maxRetries} attempts: ${error.message}`);
        }

        const delay = this.retryDelay * attempt; // Exponential backoff
        console.log(`Waiting ${delay}ms before retry ${attempt + 1}...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  async log(info, callback) {
    try {
      // Wait for initial connection
      if (!this.isConnected) {
        console.log('Waiting for initial connection...');
        await this.connectionPromise;
      }

      // Format document for mongo-express
      const document = {
        timestamp: new Date(),
        level: info.level,
        message: info.message,
        type: info.type || 'GENERAL',
        source: info.source || 'backend',
        metadata: {
          ...info,
          level: undefined,
          message: undefined,
          type: undefined,
          source: undefined
        }
      };

      // Clean up metadata
      if (Object.keys(document.metadata).length === 0) {
        delete document.metadata;
      }

      // Make request with retry logic
      for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
        try {
          const data = JSON.stringify(document);
          const path = `/api/db/${this.database}/collection/${this.collection}/insert`;
          const csrfParam = this.csrfToken ? `?_csrf=${encodeURIComponent(this.csrfToken)}` : '';
          const options = {
            hostname: this.host,
            port: this.port,
            path: path + csrfParam,
            method: 'POST',
            headers: {
              ...(this.auth ? { 'Authorization': this.auth } : {}),
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'Content-Length': Buffer.byteLength(data),
              ...(this.sessionCookie ? { 'Cookie': this.sessionCookie } : {}),
              ...(this.csrfToken ? { 'X-CSRF-Token': this.csrfToken } : {})
            },
            timeout: this.timeout
          };

          await this.makeRequest(options, data);

          // Success - emit logged event and call callback
          setImmediate(() => {
            this.emit('logged', info);
          });
          callback();
          return;

        } catch (error) {
          console.error(`Attempt ${attempt} failed:`, error.message);
          
          // If we get a CSRF error, try to get a new token
          if (error.message.includes('csrf') || error.message.includes('403')) {
            console.log('CSRF token may have expired, attempting to get new token...');
            try {
              await this.getCsrfToken();
              continue; // Retry with new token
            } catch (tokenError) {
              console.error('Failed to get new CSRF token:', tokenError);
            }
          }
          
          if (attempt === this.maxRetries) {
            throw error;
          }
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, this.retryDelay));
        }
      }
    } catch (error) {
      console.error('Error writing to HTTP endpoint:', error);
      callback(error);
    }
  }
}

module.exports = HttpTransport;
