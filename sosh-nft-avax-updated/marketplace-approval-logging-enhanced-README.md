# Enhanced Marketplace Approval Logging

This document describes the enhanced logging system implemented to help diagnose issues with NFT marketplace approvals and listings.

## Overview

We've enhanced the logging system to provide more detailed information about the NFT marketplace approval and listing processes. This will help identify the root cause of issues such as the "Failed to Approve" error that occurs when users try to list their NFTs for sale.

## Changes Made

1. **Enhanced `marketplaceLogger.js`**:
   - Added more detailed environment information collection
   - Added timestamp standardization
   - Added log level support (INFO, WARN, ERROR)
   - Added new logging methods for validation errors, time configuration, and contract calls
   - Improved error detail capture for transaction errors

2. **Enhanced Approval Process in `postCard.js`**:
   - Added detailed pre-approval state logging
   - Added current approval status checking and logging
   - Added transaction details logging
   - Added post-approval verification
   - Enhanced error handling with detailed error information capture

3. **Enhanced Listing Process in `ModalForSellNFT.jsx`**:
   - Added time configuration logging
   - Added detailed validation error logging
   - Added contract call details logging
   - Enhanced error handling with detailed error information capture
   - Added transaction result verification

4. **Added Diagnostic Script**:
   - Created `check-approval-logs.js` to query and display marketplace approval logs in a readable format

## Using the Enhanced Logging System

### Running the Diagnostic Script

To check marketplace approval logs, run the following command:

```bash
node sosh_nft_Backend/check-approval-logs.js [options]
```

Options:
- `--token-id <id>`: Filter logs by token ID
- `--limit <number>`: Limit the number of logs to display (default: 20)
- `--detailed`: Show detailed log information
- `--include-listing`: Include listing-related logs
- `--help`: Show help message

Examples:

```bash
# Check the most recent approval logs
node sosh_nft_Backend/check-approval-logs.js

# Check detailed approval logs for a specific token
node sosh_nft_Backend/check-approval-logs.js --token-id 12 --detailed

# Check both approval and listing logs for a specific token
node sosh_nft_Backend/check-approval-logs.js --token-id 12 --include-listing
```

### Interpreting the Logs

The logs are organized by token ID and displayed in reverse chronological order (newest first). Each log entry includes:

- Timestamp
- Log level (INFO, WARN, ERROR)
- Event type (APPROVAL_ATTEMPT, APPROVAL_RESULT, etc.)
- Token ID
- User address
- Marketplace address
- Transaction hash (if available)
- Error details (if applicable)

In detailed mode, additional information is displayed:
- Context information
- Environment details
- Transaction details
- Error stack traces

### Common Issues and Their Log Signatures

1. **NFT Already Owned by Marketplace**:
   - Look for logs with type `APPROVAL_SKIPPED` and reason `MARKETPLACE_ALREADY_OWNER`

2. **Approval Transaction Failure**:
   - Look for logs with type `APPROVAL_RESULT` and `success: false`
   - Check the error message and transaction details

3. **Approval Verification Failure**:
   - Look for logs with type `APPROVAL_VERIFICATION_FAILED`
   - This indicates the approval transaction appeared successful but verification failed

4. **Validation Errors During Listing**:
   - Look for logs with type `VALIDATION_ERROR`
   - Common validation types: `START_TIME_TOO_SOON`, `DURATION_TOO_SHORT`, `DURATION_TOO_LONG`

## Troubleshooting Steps

If a user reports a "Failed to Approve" error:

1. Run the diagnostic script with the user's token ID:
   ```bash
   node sosh_nft_Backend/check-approval-logs.js --token-id <token_id> --detailed
   ```

2. Check if there are any `APPROVAL_ATTEMPT` logs for the token:
   - If not, the approval process may not have started correctly

3. Check if there are any `APPROVAL_RESULT` logs:
   - If `success: false`, examine the error details
   - Common errors include insufficient gas, contract reverts, or network issues

4. Check if there are any `APPROVAL_VERIFICATION_FAILED` logs:
   - This indicates the approval transaction was successful but verification failed
   - This could be due to a race condition or contract state inconsistency

5. If the approval was successful but listing failed:
   - Run the script with the `--include-listing` flag
   - Check for validation errors or transaction errors during the listing process

## Next Steps

If the enhanced logging doesn't provide enough information to diagnose the issue:

1. Consider adding more logging points in the contract interaction code
2. Add contract event listeners to capture on-chain events related to approvals
3. Implement a transaction simulation step before sending transactions to detect potential failures
4. Add a retry mechanism for failed approvals with exponential backoff

## Deployment

The enhanced logging system has been deployed to production. No additional configuration is needed to use the enhanced logging.

## Monitoring

To monitor approval failures in real-time:

1. Set up alerts for logs with type `APPROVAL_RESULT` and `success: false`
2. Track the ratio of successful to failed approvals over time
3. Monitor for patterns in error messages or user addresses

This will help identify systemic issues versus isolated incidents.
