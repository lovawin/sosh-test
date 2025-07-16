# Marketplace Logging System

This document describes the comprehensive logging system for NFT marketplace operations in the SOSH platform. The system is designed to track and analyze NFT listing, approval, purchase, and bidding activities to help identify and resolve issues.

## Overview

The marketplace logging system consists of:

1. **Backend Logging Components**:
   - `marketplaceLogger.js`: A specialized logger for marketplace operations
   - MongoDB collection: `marketplace_logs` for persistent storage
   - Formatter for standardized log format

2. **Frontend Logging Service**:
   - `marketplaceLogger.js`: A service to send marketplace events to the backend

3. **Diagnostic Tools**:
   - `check-marketplace-logs.js`: A script to analyze marketplace logs

## Log Types

The system logs the following types of events:

- **LISTING_ATTEMPT**: When a user attempts to list an NFT for sale
- **APPROVAL_ATTEMPT**: When a user attempts to approve the marketplace contract
- **APPROVAL_RESULT**: The result of an approval attempt (success/failure)
- **LISTING_RESULT**: The result of a listing attempt (success/failure)
- **SALE_CREATED**: When a sale is successfully created
- **PURCHASE_ATTEMPT**: When a user attempts to purchase an NFT
- **PURCHASE_RESULT**: The result of a purchase attempt (success/failure)
- **BID_ATTEMPT**: When a user attempts to place a bid
- **BID_RESULT**: The result of a bid attempt (success/failure)
- **TRANSACTION_ERROR**: Detailed information about blockchain transaction errors

## Using the Marketplace Logger

### Backend Usage

```javascript
const { marketplaceLogger } = require('../logging');

// Log an approval attempt
await marketplaceLogger.logApprovalAttempt(
  userId,
  tokenId,
  marketplaceAddress,
  { additionalDetails: 'value' }
);

// Log an approval result
await marketplaceLogger.logApprovalResult(
  userId,
  tokenId,
  success, // boolean
  { error: errorObject, transactionHash: '0x...' }
);

// Log a listing result
await marketplaceLogger.logListingResult(
  userId,
  tokenId,
  saleId,
  success, // boolean
  { error: errorObject, transactionHash: '0x...' }
);

// Log a transaction error
await marketplaceLogger.logTransactionError(
  userId,
  tokenId,
  errorObject,
  'operation_name',
  { additionalDetails: 'value' }
);
```

### Frontend Usage

```javascript
import marketplaceLogger from '../services/marketplaceLogger';

// Log an approval attempt
await marketplaceLogger.logApprovalAttempt(
  tokenId,
  marketplaceAddress,
  { additionalDetails: 'value' }
);

// Log an approval result
await marketplaceLogger.logApprovalResult(
  tokenId,
  success, // boolean
  { error: errorObject, transactionHash: '0x...' }
);

// Log a listing attempt
await marketplaceLogger.logListingAttempt(
  tokenId,
  { saleType: 'fixed', price: '1.0', startTime: '...', endTime: '...' }
);

// Log a listing result
await marketplaceLogger.logListingResult(
  tokenId,
  saleId,
  success, // boolean
  { error: errorObject, transactionHash: '0x...' }
);
```

## Implementation in NFT Functions

Here's an example of how to implement logging in NFT marketplace functions:

```javascript
// In createSale function
export const createSale = async (saleData, address) => {
  try {
    // Log the attempt
    await marketplaceLogger.logListingAttempt(saleData.tokenID, {
      saleType: saleData.saleType,
      askPrice: saleData.askPrice,
      startTime: saleData.startTime,
      endTime: saleData.endTime
    });
    
    // Check if approval is needed
    const NFTContract = contactInstance();
    const isApproved = await NFTContract.methods.isApprovedForAll(address, Contract._address).call();
    
    if (!isApproved) {
      // Log approval attempt
      await marketplaceLogger.logApprovalAttempt(saleData.tokenID, Contract._address);
      
      try {
        // Approval code...
        
        // Log approval success
        await marketplaceLogger.logApprovalResult(saleData.tokenID, true, {
          txHash: approvalResult.transactionHash
        });
      } catch (approvalError) {
        // Log approval failure
        await marketplaceLogger.logApprovalResult(saleData.tokenID, false, {
          error: approvalError.message
        });
        
        throw approvalError;
      }
    }

    // Existing code...
    
    // Log listing success
    await marketplaceLogger.logListingResult(saleData.tokenID, result.events.SaleCreated.returnValues.saleId, true, {
      txHash: result.transactionHash
    });
    
    return result;
  } catch (error) {
    // Log listing failure
    await marketplaceLogger.logListingResult(saleData?.tokenID, null, false, {
      error: error.message
    });
    
    throw error;
  }
};
```

## Analyzing Marketplace Logs

The `check-marketplace-logs.js` script provides comprehensive analysis of marketplace logs. It can help identify patterns in failed transactions and provide recommendations for improvements.

### Usage

```bash
# Basic usage (looks at logs from the last 7 days)
node check-marketplace-logs.js

# Look at logs from the last 30 days
node check-marketplace-logs.js --days=30

# Filter logs for a specific user
node check-marketplace-logs.js --user=userId

# Filter logs for a specific token
node check-marketplace-logs.js --token=tokenId

# Show detailed log entries
node check-marketplace-logs.js --verbose

# Show only failures
node check-marketplace-logs.js --failures

# Combine options
node check-marketplace-logs.js --days=14 --user=userId --verbose --failures
```

### Analysis Features

The script provides the following analysis:

1. **Summary by Event Type**: Count of each type of event
2. **Approval Results**: Success/failure rates for approval operations
3. **Listing Results**: Success/failure rates for listing operations
4. **Transaction Errors**: Analysis of errors by operation type
5. **Pattern Analysis**: 
   - Users with multiple failures
   - Tokens with multiple failures
   - Common error messages
6. **Transaction Flow Analysis**:
   - Successful approvals followed by failed listings
   - Failed approvals followed by listing attempts
7. **Recommendations**: Suggestions based on the analysis

## Deploying to Production

To deploy the marketplace logging system to the production server:

1. Copy the necessary files to the server:

```bash
scp -i "../taurien" sosh-nft-avax-updated/sosh_nft_Backend/app/logging/handlers/marketplaceLogger.js taurien@3.216.178.231:backend-update/app/logging/handlers/marketplaceLogger.js
scp -i "../taurien" sosh-nft-avax-updated/sosh_nft_Backend/app/logging/formatters/logFormatter.js taurien@3.216.178.231:backend-update/app/logging/formatters/logFormatter.js
scp -i "../taurien" sosh-nft-avax-updated/sosh_nft_Backend/app/logging/config/logConfig.js taurien@3.216.178.231:backend-update/app/logging/config/logConfig.js
scp -i "../taurien" sosh-nft-avax-updated/sosh_nft_Backend/app/logging/index.js taurien@3.216.178.231:backend-update/app/logging/index.js
scp -i "../taurien" sosh-nft-avax-updated/sosh_nft_Backend/app/routes/logging.js taurien@3.216.178.231:backend-update/app/routes/logging.js
scp -i "../taurien" sosh-nft-avax-updated/sosh_nft_Backend/app/app.js taurien@3.216.178.231:backend-update/app/app.js
scp -i "../taurien" sosh-nft-avax-updated/sosh_nft_Backend/check-marketplace-logs.js taurien@3.216.178.231:backend-update/check-marketplace-logs.js
scp -i "../taurien" sosh-nft-avax-updated/frontend/src/services/marketplaceLogger.js taurien@3.216.178.231:frontend-update/src/services/marketplaceLogger.js
```

2. Restart the backend server:

```bash
ssh -i "../taurien" taurien@3.216.178.231 "sudo docker restart sosh-backend-app"
```

3. Rebuild and restart the frontend:

```bash
ssh -i "../taurien" taurien@3.216.178.231 "cd frontend && npm run build && sudo docker restart sosh-frontend-app"
```

## Troubleshooting

If you encounter issues with the marketplace logging system:

1. Check that the MongoDB collection `marketplace_logs` exists
2. Verify that the JWT exclusion for `/api/V1/log/marketplace` is properly configured
3. Check that the frontend service is correctly sending logs to the backend
4. Ensure that the marketplace logger is properly initialized in the backend

## Future Improvements

Potential improvements to the marketplace logging system:

1. Real-time monitoring dashboard for marketplace operations
2. Automated alerts for unusual failure patterns
3. Integration with error tracking services
4. Performance metrics for marketplace operations
5. User-specific logging preferences
