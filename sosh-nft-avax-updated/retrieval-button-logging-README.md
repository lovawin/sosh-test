# NFT Retrieval Button Enhanced Logging

This project enhances the logging for the NFT retrieval button functionality to help diagnose why the button may not be appearing for certain NFTs.

## Problem Statement

Users have reported issues with the "Retrieve" button not appearing on their NFT listings even when the sale has expired. The button should appear when all three conditions are met:

1. The user is viewing their own profile page (`isLoggedInProfile = true`)
2. The sale has expired (`isExpired = true`)
3. The user is the original seller of the NFT (`isUserSeller = true`)

However, it's difficult to determine which of these conditions is failing without detailed logging.

## Solution

We've implemented enhanced logging in the frontend to capture detailed information about each of these conditions:

### 1. Enhanced Frontend Logging

The `postCard.js` component now logs detailed information about:

- **Time Information**: Precise timestamps and time comparisons to debug the `isExpired` condition
- **Address Comparison**: Detailed address information to debug the `isUserSeller` condition
- **URL Parameters**: URL and query parameter information to debug the `isLoggedInProfile` condition
- **Component State**: Component rendering information to ensure the button is being rendered correctly

### 2. Diagnostic Script

A specialized diagnostic script (`check-retrieval-button-logs.js`) has been created to analyze the logs and identify patterns or issues:

```bash
# Run the script for a specific token
node check-retrieval-button-logs.js --token=12 --verbose

# Run the script for a specific user
node check-retrieval-button-logs.js --user=0x7411e7942f4c8271d4e636429f374997fdaede17 --verbose

# Run the script for the last 14 days
node check-retrieval-button-logs.js --days=14 --verbose
```

## Implementation Details

### Enhanced Logging in `postCard.js`

The enhanced logging in `postCard.js` includes:

```javascript
// Log detailed information about button visibility
marketplaceLogger.logRetrievalButtonVisibility(data?.token_id, {
  // Basic visibility conditions
  isLoggedInProfile,
  isExpired,
  isApprove,
  isUserSeller,
  shouldShowRetrieveButton: isLoggedInProfile && isExpired && isUserSeller,
  
  // Enhanced debugging information
  currentTime: new Date().toISOString(),
  currentTimeMs: now,
  endTime: data?.endTime ? new Date(data.endTime * 1000).toISOString() : null,
  endTimeMs: endTimeMs,
  endTimeUnix: data?.endTime,
  timeUntilExpiryMs: timeUntilExpiry,
  isExpiredByDirectTimeComparison: isExpiredByTime,
  
  // Sale information
  saleId: data?.saleId,
  saleStatus: data?.status,
  
  // User and seller information
  userAddress: userAddressLower,
  sellerAddress: sellerAddressLower,
  addressesMatch: addressesMatch,
  
  // URL context
  currentUrl: window.location.href,
  hasOwnerParam: ownerParam !== null,
  ownerParamValue: ownerParam,
  
  // Component props
  linkableProp: linkable,
  isLoggedInProfileProp: isLoggedInProfile,
  
  // DOM rendering information
  componentMounted: true,
  renderTimestamp: new Date().toISOString()
});
```

### Diagnostic Script Features

The `check-retrieval-button-logs.js` script provides:

1. **Summary Statistics**: Counts of logs by type and visibility status
2. **Condition Analysis**: Breakdown of which conditions are failing and how often
3. **URL Parameter Analysis**: Analysis of the `owner` parameter in the URL
4. **Address Comparison Analysis**: Analysis of user and seller address comparisons
5. **Token-specific Analysis**: Detailed analysis of logs for each token
6. **Recommendations**: Suggestions for fixing the most common issues

## How to Use

### Running the Diagnostic Script

```bash
# Basic usage
node check-retrieval-button-logs.js

# Filter by token ID
node check-retrieval-button-logs.js --token=12

# Filter by user address
node check-retrieval-button-logs.js --user=0x7411e7942f4c8271d4e636429f374997fdaede17

# Show detailed logs
node check-retrieval-button-logs.js --verbose

# Look at logs from the last 14 days
node check-retrieval-button-logs.js --days=14
```

### Interpreting the Results

The script output includes:

1. **Summary by Event Type**: Counts of different log types
2. **Retrieval Button Visibility Analysis**: Analysis of button visibility conditions
3. **Data Property Validation Analysis**: Analysis of data properties needed for the button
4. **Ownership Check Analysis**: Analysis of NFT ownership checks
5. **Token-specific Analysis**: Detailed analysis for each token
6. **Recommendations**: Suggestions for fixing the most common issues

### Common Issues and Solutions

1. **`isLoggedInProfile = false`**:
   - Ensure the user is viewing their own profile page
   - Check that the URL includes the `?owner=true` parameter
   - Verify the `isLoggedInProfile` prop is being passed correctly

2. **`isExpired = false`**:
   - Check the sale's end time calculation
   - Verify the current time comparison logic
   - Look for timezone issues

3. **`isUserSeller = false`**:
   - Ensure the user's wallet address matches the seller address (case-insensitive)
   - Verify the seller address is being correctly retrieved from the blockchain

## Deployment

See the [Deployment Guide](./retrieval-button-logging-deployment-guide.md) for instructions on deploying these changes to production.
