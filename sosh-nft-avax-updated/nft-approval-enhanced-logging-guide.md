# NFT Approval Enhanced Logging Guide

This document describes the enhanced logging and diagnostic tools implemented to troubleshoot issues with the NFT marketplace approval process.

## Overview

When a user attempts to list an NFT for sale, they must first approve the marketplace contract to transfer their NFT. This approval process involves a blockchain transaction that can sometimes fail for various reasons. The enhanced logging and diagnostic tools described in this document are designed to help identify and resolve these issues.

## Recent Issue

A user recently encountered an error when trying to approve the marketplace to list their NFT (token ID 12). The error message was:

```
Transaction has been reverted by the EVM:
{
  "blockHash": "0x89780093699ea144a0cd8f824025ae5afe1a909d0bb14ea01cc91f55ccad22c1",
  "blockNumber": 39459478,
  "contractAddress": null,
  "cumulativeGasUsed": 31669,
  "effectiveGasPrice": 2500000001,
  "from": "0x7411e7942f4c8271d4e636429f374997fdaede17",
  "gasUsed": 31669,
  "logsBloom": "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
  "status": false,
  "to": "0x4b94a3361031c3839db0f22e202c138f1bccbc13",
  "transactionHash": "0x3415f6e42e6104de7e5c62edf2dcd59f6ea761a848b1b97c6db7569ffc2da3e4",
  "transactionIndex": 0,
  "type": "0x2",
  "events": {}
}
```

To better diagnose and fix such issues, we've implemented enhanced logging and a diagnostic script.

## Enhanced Logging Implementation

We've added comprehensive logging to the NFT approval process to capture detailed information at key decision points:

### 1. Frontend Logging Enhancements

The `marketplaceLogger.js` file in the frontend has been updated with new logging methods:

```javascript
// Log detailed information about the NFT retrieval button visibility decision
async logRetrievalButtonVisibility(tokenId, visibilityData = {}) {
  await this.logEvent('RETRIEVAL_BUTTON_VISIBILITY', {
    timestamp: new Date().toISOString(),
    level: 'INFO',
    tokenId,
    ...visibilityData
  });
}

// Log data property validation for retrieval functionality
async logDataPropertyValidation(tokenId, dataProperties = {}) {
  await this.logEvent('DATA_PROPERTY_VALIDATION', {
    timestamp: new Date().toISOString(),
    level: 'INFO',
    tokenId,
    ...dataProperties
  });
}

// Log ownership check results from getApprove function
async logOwnershipCheck(tokenId, ownershipData = {}) {
  await this.logEvent('OWNERSHIP_CHECK', {
    timestamp: new Date().toISOString(),
    level: 'INFO',
    tokenId,
    ...ownershipData
  });
}
```

### 2. Backend Logging Enhancements

The `marketplaceLogger.js` file in the backend has been updated with corresponding methods:

```javascript
async logRetrievalButtonVisibility(userId, tokenId, visibilityData = {}) {
  await this.initPromise;
  const logData = {
    type: 'RETRIEVAL_BUTTON_VISIBILITY',
    userId,
    tokenId,
    ...visibilityData,
    timestamp: new Date().toISOString()
  };

  this.logger.info(formatMarketplaceLog(logData));
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[MARKETPLACE] Retrieval button visibility for token ${tokenId}: ${JSON.stringify(visibilityData)}`);
  }
}

async logDataPropertyValidation(userId, tokenId, dataProperties = {}) {
  await this.initPromise;
  const logData = {
    type: 'DATA_PROPERTY_VALIDATION',
    userId,
    tokenId,
    ...dataProperties,
    timestamp: new Date().toISOString()
  };

  this.logger.info(formatMarketplaceLog(logData));
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[MARKETPLACE] Data property validation for token ${tokenId}: ${JSON.stringify(dataProperties)}`);
  }
}

async logOwnershipCheck(userId, tokenId, ownershipData = {}) {
  await this.initPromise;
  const logData = {
    type: 'OWNERSHIP_CHECK',
    userId,
    tokenId,
    ...ownershipData,
    timestamp: new Date().toISOString()
  };

  this.logger.info(formatMarketplaceLog(logData));
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[MARKETPLACE] Ownership check for token ${tokenId}: ${JSON.stringify(ownershipData)}`);
  }
}
```

### 3. Component Logging Integration

The `postCard.js` component has been updated to use these new logging methods at key decision points:

```javascript
// Log data properties relevant to retrieval button
marketplaceLogger.logDataPropertyValidation(data?.token_id, {
  hasEndTime: !!data?.endTime,
  endTimeValue: data?.endTime,
  endTimeFormatted: data?.endTime ? new Date(data.endTime * 1000).toISOString() : null,
  currentTime: new Date().toISOString(),
  isExpired: hasExpired,
  saleId: data?.saleId,
  saleStatus: data?.status
});

// Log isLoggedInProfile state
marketplaceLogger.logRetrievalButtonVisibility(data?.token_id, {
  isLoggedInProfile,
  userAddress: address,
  sellerAddress: data?.seller,
  isUserSeller: address?.toLowerCase() === data?.seller?.toLowerCase()
});

// Log ownership check
marketplaceLogger.logOwnershipCheck(data?.token_id, {
  currentOwner: owner,
  marketplaceAddress: CUSTOM_TOKEN_ADDRESS_721_MARKET_PLACE,
  isMarketplaceOwner: owner.toLowerCase() === CUSTOM_TOKEN_ADDRESS_721_MARKET_PLACE.toLowerCase(),
  saleStatus: data?.status,
  saleId: data?.saleId
});

// Log final button visibility decision
marketplaceLogger.logRetrievalButtonVisibility(data?.token_id, {
  isLoggedInProfile,
  isExpired,
  isApprove,
  shouldShowRetrieveButton: isLoggedInProfile && isExpired,
  currentTime: new Date().toISOString(),
  endTime: data?.endTime ? new Date(data.endTime * 1000).toISOString() : null,
  saleId: data?.saleId,
  saleStatus: data?.status
});
```

## Diagnostic Script

The `nft-retrieval-button-diagnostic.js` script provides a comprehensive analysis of a specific NFT to determine why the "Retrieve" button may not be appearing or functioning correctly.

### Usage

```bash
node nft-retrieval-button-diagnostic.js <tokenId> [userAddress]
```

Example:
```bash
node nft-retrieval-button-diagnostic.js 12 0x7411e7942f4c8271d4e636429f374997fdaede17
```

### Features

1. **Sale Information**: Displays detailed information about all sales associated with the specified NFT token ID.
2. **Ownership Check**: Verifies the current owner of the NFT and checks if it's owned by the marketplace.
3. **User Validation**: If a user address is provided, checks if the user is the seller of any sales.
4. **Button Visibility Analysis**: Analyzes whether the "Retrieve" button should be visible based on the UI logic.
5. **Retrieval Eligibility**: Checks if the NFT is eligible for retrieval based on the contract requirements.
6. **Recommendations**: Provides specific recommendations for resolving any issues.

### Example Output

```
=== NFT Retrieval Button Diagnostic for Token #12 ===
Searching through 123 sales for token #12...

Found 1 sales for token #12:
┌─────────┬────────┬──────────────────────────────────────────────┬───────────────────────────────────────────┬──────────┬─────────┬──────────┬────────────┬────────────────────────────┬────────────────────────────┬──────────┐
│ (index) │ saleId │                   seller                     │                  buyer                     │ askPrice │ tokenId │ saleType │   status   │         startTime          │          endTime           │ isExpired │
├─────────┼────────┼──────────────────────────────────────────────┼───────────────────────────────────────────┼──────────┼─────────┼──────────┼────────────┼────────────────────────────┼────────────────────────────┼──────────┤
│    0    │   42   │ '0x7411e7942f4c8271d4e636429f374997fdaede17' │ '0x0000000000000000000000000000000000000000' │   '0.1'  │   '12'  │ 'Direct' │   'Open'   │ '2025-04-10T12:00:00.000Z' │ '2025-04-13T12:00:00.000Z' │   true   │
└─────────┴────────┴──────────────────────────────────────────────┴───────────────────────────────────────────┴──────────┴─────────┴──────────┴────────────┴────────────────────────────┴────────────────────────────┴──────────┘

Current owner of token #12: 0x0640A2Fbed0a203AD72F975EE80BA650E1D13fbf
Marketplace address: 0x0640A2Fbed0a203AD72F975EE80BA650E1D13fbf
Is owned by marketplace: true

Checking if user 0x7411e7942f4c8271d4e636429f374997fdaede17 is the seller of any sales:
User is seller for 1 sales
┌─────────┬────────┬──────────────────────────────────────────────┬───────────────────────────────────────────┬──────────┬─────────┬──────────┬────────────┬────────────────────────────┬────────────────────────────┬──────────┐
│ (index) │ saleId │                   seller                     │                  buyer                     │ askPrice │ tokenId │ saleType │   status   │         startTime          │          endTime           │ isExpired │
├─────────┼────────┼──────────────────────────────────────────────┼───────────────────────────────────────────┼──────────┼─────────┼──────────┼────────────┼────────────────────────────┼────────────────────────────┼──────────┤
│    0    │   42   │ '0x7411e7942f4c8271d4e636429f374997fdaede17' │ '0x0000000000000000000000000000000000000000' │   '0.1'  │   '12'  │ 'Direct' │   'Open'   │ '2025-04-10T12:00:00.000Z' │ '2025-04-13T12:00:00.000Z' │   true   │
└─────────┴────────┴──────────────────────────────────────────────┴───────────────────────────────────────────┴──────────┴─────────┴──────────┴────────────┴────────────────────────────┴────────────────────────────┴──────────┘

=== Retrieval Button Visibility Analysis ===

Sale #42:
- Is user the seller? true
- Is marketplace the owner? true
- Is sale expired? true
- Is sale open (status 1)? true

Should show button (based on UI logic)? true
Can actually retrieve (based on contract requirements)? true

=== Recommendations ===
✅ All conditions are met for the Retrieve button to appear and function correctly.
   You can manually call finalizeExpiredSale(42) to retrieve the NFT.
```

## Troubleshooting Approval Issues

### Common Approval Errors

1. **Transaction Reverted by EVM**: This error occurs when the blockchain transaction is rejected by the Ethereum Virtual Machine. This can happen for various reasons, such as:
   - Insufficient gas
   - Contract execution error
   - Invalid parameters

2. **User Not Owner**: The user attempting to approve the marketplace is not the owner of the NFT.

3. **Already Approved**: The NFT is already approved for the marketplace.

4. **Network Congestion**: The transaction may fail due to network congestion or high gas prices.

### Using the Logs to Diagnose Issues

When an approval fails, check the logs in the MongoDB database for detailed information:

1. **Check the APPROVAL_ATTEMPT log**: This log contains information about the attempted approval, including the user address, token ID, and marketplace address.

2. **Check the APPROVAL_RESULT log**: This log contains the result of the approval attempt, including any error messages.

3. **Check the TRANSACTION_ERROR log**: This log contains detailed information about any transaction errors, including the error message, error code, and transaction details.

4. **Check the OWNERSHIP_CHECK log**: This log contains information about the NFT's ownership, which can help identify issues with the approval process.

## Accessing Logs

Logs are stored in the MongoDB database in the `marketplace_logs` collection. You can access them using the mongo-express interface or by running the following command:

```bash
ssh -i ../taurien -L 8500:localhost:8500 taurien@3.216.178.231
```

Then navigate to `http://localhost:8500` in your browser and select the `marketplace_logs` collection.

## Integration with Existing Diagnostic Tools

This enhanced logging and diagnostic script complements the existing diagnostic tools described in the `NFT-RETRIEVAL-DIAGNOSTIC-README.md` file. Together, they provide a comprehensive set of tools for troubleshooting issues with the NFT marketplace.
