# Marketplace Logging Diagnostics

This directory contains diagnostic tools for troubleshooting issues with the NFT marketplace logging system. These tools can help identify why marketplace logs might not be appearing in Mongo Express.

## Quick Start

To run all diagnostic tests at once, use the diagnostics runner:

```bash
node run-marketplace-diagnostics.js
```

This will run all the diagnostic scripts and provide a comprehensive report of the results, along with recommendations for fixing any issues found.

## Available Diagnostic Tools

### 1. MongoDB Connection Check

**Script:** `check-mongo-connection.js`

**Purpose:** Checks the MongoDB connection and verifies that the marketplace_logs collection exists and is accessible. Also checks the SSH tunnel to ensure it's working correctly.

**Usage:**
```bash
node check-mongo-connection.js
```

**What it checks:**
- MongoDB connection status
- Server information
- Database and collection existence
- Recent logs in the marketplace_logs collection
- Collection indexes and TTL settings
- SSH tunnel to Mongo Express

### 2. Backend Marketplace Logging Test

**Script:** `test-marketplace-logging.js`

**Purpose:** Tests the backend marketplace logging functionality by directly using the marketplaceLogger and making HTTP requests to the logging endpoint.

**Usage:**
```bash
node test-marketplace-logging.js
```

**What it tests:**
- Direct logger calls to marketplaceLogger
- HTTP endpoint calls to simulate frontend requests
- Verification that logs are stored in MongoDB

### 3. Frontend Integration Check

**Script:** `check-frontend-integration.js`

**Purpose:** Analyzes the frontend code to find where approval operations are handled and verifies that logging methods are called.

**Usage:**
```bash
node check-frontend-integration.js
```

**What it checks:**
- Files with marketplace-related code
- Files with approval-related code
- Files with logger-related code
- Whether approval operations have proper error handling
- Whether approval failures are logged correctly

### 4. Frontend Marketplace Logger Test

**Script:** `frontend/test-marketplace-logger.js`

**Purpose:** Tests the frontend marketplace logger implementation by directly calling its methods and verifying that requests are sent to the backend.

**Usage:**
```bash
cd frontend
node test-marketplace-logger.js
```

**What it tests:**
- Approval workflow (attempt, result, error)
- Listing workflow (attempt, result)
- Request formatting and sending

### 5. Marketplace Logs Analysis

**Script:** `check-marketplace-logs.js`

**Purpose:** Analyzes existing marketplace logs to identify patterns in failed transactions, particularly focusing on approval and listing failures.

**Usage:**
```bash
node check-marketplace-logs.js [--days=7] [--user=userId] [--token=tokenId] [--verbose] [--failures]
```

**Options:**
- `--days=N`: Look at logs from the last N days (default: 7)
- `--user=ID`: Filter logs for a specific user ID
- `--token=ID`: Filter logs for a specific token ID
- `--verbose`: Show detailed log entries
- `--failures`: Show only failures

**What it analyzes:**
- Summary of event types
- Approval and listing success/failure rates
- Transaction errors by operation type
- Users with multiple failures
- Tokens with multiple failures
- Common error messages
- Transaction flow patterns

## Troubleshooting Common Issues

### 1. MongoDB Connection Issues

If the MongoDB connection check fails:
- Verify that the MongoDB server is running
- Check the MongoDB connection string in environment variables
- Ensure network connectivity to the MongoDB server
- Check if the marketplace_logs collection exists

### 2. SSH Tunnel Issues

If the SSH tunnel check fails:
- Verify that the SSH tunnel is active and correctly configured
- Check if Mongo Express is running on the server
- Ensure port 8500 is being forwarded correctly
- Try restarting the SSH tunnel with:
  ```
  ssh -i "../taurien" -L 8500:localhost:8500 taurien@3.216.178.231
  ```

### 3. Backend Logging Issues

If the backend logging tests fail:
- Check the marketplaceLogger implementation for errors
- Verify that the MongoDB transport is properly configured
- Check if the backend API server is running
- Verify that the marketplace logging routes are properly registered

### 4. Frontend Integration Issues

If the frontend integration check fails:
- Add proper error handling for approval operations
- Import the marketplaceLogger in files that handle approvals
- Call logApprovalResult(tokenId, false, { error }) when approvals fail
- Call logTransactionError(tokenId, error, "APPROVAL") for transaction errors

## Next Steps

After running the diagnostics:

1. Review the detailed output of each test
2. Fix any issues identified by the tests
3. Run the tests again to verify the fixes
4. If all tests pass but the issue persists, consider checking:
   - Browser console for frontend errors
   - Backend server logs for API errors
   - Network requests in browser developer tools
