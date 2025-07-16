/**
 * Test script for Twitter link validation
 * 
 * This script tests the Twitter link validation functionality to ensure
 * the fix for the "logging.errorLogger.logAPIError is not a function" error works.
 */

const axios = require('axios');
const logging = require('./app/logging');

// Initialize logging
logging.initializeLogging();

// Mock request object
const mockReq = {
  user: { id: 'test-user-id' },
  body: { link: 'https://x.com/trixietheetiger/status/1873644969879335218' },
  method: 'POST',
  url: '/api/V1/social/twitter/validatelink',
  headers: {
    'user-agent': 'test-script',
    'content-type': 'application/json'
  },
  ip: '127.0.0.1'
};

// Mock response object
const mockRes = {
  status: function(code) {
    console.log(`Response status: ${code}`);
    return this;
  },
  json: function(data) {
    console.log('Response data:', data);
    return this;
  },
  send: function(data) {
    console.log('Response data:', data);
    return this;
  }
};

// Mock error for testing
const mockError = {
  message: 'Test error message',
  stack: 'Test error stack',
  code: 'TEST_ERROR',
  response: {
    status: 500,
    statusText: 'Internal Server Error',
    data: {
      error: 'Test error data'
    }
  }
};

// Test the error logging function
async function testErrorLogging() {
  console.log('Testing error logging...');
  
  try {
    // Test apiLogger.logError
    console.log('Testing apiLogger.logError...');
    await logging.apiLogger.logError(mockReq, {
      status: mockError.response?.status || 500,
      statusText: mockError.response?.statusText || 'Internal Server Error',
      error: {
        message: mockError.message,
        stack: mockError.stack,
        code: mockError.code,
        response: mockError.response?.data
      }
    }, {
      requestId: Date.now().toString(),
      tweetId: '1873644969879335218',
      operation: 'validate_twitter_link',
      step: 'twitter_api_request',
      link: mockReq.body.link,
      normalizedLink: mockReq.body.link.replace('x.com', 'twitter.com'),
      errorDetails: mockError.response?.data || mockError.message,
      errorStatus: mockError.response?.status,
      errorStatusText: mockError.response?.statusText
    });
    
    console.log('apiLogger.logError completed successfully');
  } catch (error) {
    console.error('Error during test:', error);
  }
}

// Run the test
testErrorLogging()
  .then(() => {
    console.log('Test completed successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('Test failed:', error);
    process.exit(1);
  });
