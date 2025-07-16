# Twitter OAuth and Logging Diagnostic Scripts

This directory contains several diagnostic scripts to help identify issues with Twitter OAuth integration and MongoDB logging in the SOSH NFT application.

## Problem Description

When trying to mint an NFT for a Twitter (X) post, the following error occurs:
```
{"status":"server_error","message":"Failed to find request token in session"}
```

This error is not being logged in the MongoDB error_logs collection, and no logs are appearing in any other collections.

## Diagnostic Scripts

### 1. General OAuth and Logging Test

**File:** `test-twitter-oauth-logging.js`

This script tests various components to identify issues with:
1. Session management
2. MongoDB transport
3. Error logging flow
4. Twitter OAuth flow

**How to run:**
```bash
node test-twitter-oauth-logging.js
```

**What it tests:**
- Database connection
- MongoDB transport initialization and logging
- Session configuration and persistence
- Error logging functionality
- Twitter OAuth flow simulation

### 2. Twitter Callback Test

**File:** `test-twitter-callback.js`

This script specifically tests the Twitter OAuth callback route with different session cookie configurations to identify if the cookie path restriction is causing the "Failed to find request token in session" error.

**How to run:**
```bash
node test-twitter-callback.js
```

**What it tests:**
- Session cookie with default path (/)
- Session cookie with restricted path (/api/V1/social)
- Comparison of both configurations to determine if the cookie path is causing the issue

### 3. MongoDB Logging Transport Test

**File:** `test-mongo-logging-transport.js`

This script specifically tests the MongoDB logging transport to ensure it's properly writing logs to the MongoDB collections.

**How to run:**
```bash
node test-mongo-logging-transport.js
```

**What it tests:**
- Database connection
- MongoDB collections
- Direct MongoDB transport logging
- Winston logger creation with MongoDB transport
- Logging handler functionality
- Verification of logs in MongoDB collections

### 4. Twitter OAuth Error Logging Test

**File:** `test-twitter-oauth-error-logging.js`

This script tests the Twitter OAuth flow with explicit error logging to ensure that errors are properly captured and logged to MongoDB.

**How to run:**
```bash
node test-twitter-oauth-error-logging.js
```

**What it tests:**
- Setup and configuration
- OAuth flow with deliberate errors
- Error logging verification
- Checking if errors are properly written to MongoDB

## Interpreting Results

Each script outputs detailed test results in JSON format. Look for:

1. **Success indicators:** Each test reports whether it passed or failed
2. **Error messages:** Detailed error information if a test fails
3. **Comparison results:** Some scripts compare different configurations to identify the root cause

## Potential Solutions

Based on the test results, you may need to:

1. **Fix session configuration:**
   - Change the cookie path from `/api/V1/social` to `/` in `app.js`
   - Update session store configuration

2. **Enhance error logging:**
   - Add explicit error logging in the Twitter OAuth callback route
   - Add error handling for the "Failed to find request token in session" error

3. **Fix MongoDB transport:**
   - Ensure the MongoDB transport is properly initialized
   - Add retry logic for MongoDB connection failures

4. **Add diagnostic logging:**
   - Add logging to track the session state throughout the OAuth flow
   - Log session data at key points to identify where it's being lost

## Next Steps

1. Run all diagnostic scripts to gather comprehensive data
2. Analyze the results to identify the root cause(s)
3. Implement the suggested fixes based on the test results
4. Re-test the Twitter OAuth flow to verify the issue is resolved
