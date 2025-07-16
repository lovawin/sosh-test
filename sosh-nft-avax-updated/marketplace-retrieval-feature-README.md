# NFT Retrieval Feature

## Overview

The NFT Retrieval feature allows users to reclaim their NFTs from expired listings on the marketplace. When a user lists an NFT for sale, the NFT is transferred to the marketplace contract. If the listing expires without a sale, the user can now retrieve their NFT back to their wallet with a simple click.

## Problem Solved

Previously, when a listing expired, the NFT would remain in the marketplace contract, preventing the user from creating a new listing or otherwise using their NFT. This required manual intervention from administrators to return the NFT to the original owner.

With this new feature, users can self-service the retrieval of their NFTs from expired listings, improving the user experience and reducing the need for administrative support.

## Implementation Details

### Frontend Changes

1. **UI Component**: A "Retrieve" button is displayed in place of the "List/Sell" button when:
   - The user is the original seller of the NFT
   - The marketplace contract is the current owner of the NFT
   - The listing has expired (endTime < current time)

2. **User Flow**:
   - User navigates to their profile page
   - For expired listings, they see a "Retrieve" button
   - Clicking the button initiates a blockchain transaction to return the NFT
   - Upon successful completion, the NFT is returned to the user's wallet

### Backend/Smart Contract Integration

The feature leverages the existing `finalizeExpiredSale` function in the SoshMarketplace smart contract:

```solidity
function finalizeExpiredSale(uint256 saleId) external nonReentrant whenNotPaused {
    ReserveSale storage sale = reserveSale[saleId];
    require(sale.status == SaleStatus.Open, "Sosh: Sale not open");
    require(sale.endTime < _getCurrentTimestamp(), "Sosh: Sale is still active");
    
    // No buyer or direct sale - return NFT to seller
    try IERC721(nftContractAddress).safeTransferFrom(address(this), sale.seller, sale.tokenId) {
        sale.status = SaleStatus.Closed;
        emit SaleClosed(saleId, address(0), sale.seller, 0);
    } catch Error(string memory reason) {
        sale.status = SaleStatus.Closed;
        emit SaleTransferFailed(saleId, reason);
    } catch {
        sale.status = SaleStatus.Closed;
        emit SaleTransferFailed(saleId, "unknown error");
    }
}
```

This function:
1. Verifies the sale is open and has expired
2. Transfers the NFT back to the original seller
3. Updates the sale status to "Closed"
4. Emits appropriate events for logging

### Logging and Error Handling

The implementation includes comprehensive logging and error handling:

1. **Logging**:
   - Retrieval attempts are logged with timestamp and user information
   - Successful retrievals are logged with transaction details
   - Failed retrievals are logged with detailed error information

2. **Error Handling**:
   - Smart contract errors are caught and displayed to the user
   - Network issues are handled gracefully
   - UI provides clear feedback on the retrieval status

## How to Use

### As a User

1. Navigate to your profile page
2. Look for NFTs with expired listings (these will show a "Retrieve" button)
3. Click the "Retrieve" button
4. Confirm the transaction in your wallet (MetaMask, etc.)
5. Wait for the transaction to complete
6. The NFT will be returned to your wallet

### For Testing

A test script is provided to verify the functionality:

```bash
# Set your private key as an environment variable
export PRIVATE_KEY=your_private_key_here

# Run the test script
node test-retrieve-nft.js

# Optionally specify a specific sale ID
node test-retrieve-nft.js 123
```

The test script will:
1. Find all expired listings for your address
2. Display them in a table
3. Allow you to test the retrieval process
4. Verify the NFT is returned to your wallet

## Technical Notes

- The feature requires the user to be the original seller of the NFT
- The listing must be in an "Open" status and the end time must have passed
- The marketplace contract must be the current owner of the NFT
- Gas fees apply for the retrieval transaction
- The retrieval process is irreversible - once retrieved, the listing cannot be reactivated

## Future Enhancements

Potential future enhancements to this feature could include:

1. Automatic retrieval of expired NFTs after a certain period
2. Batch retrieval of multiple expired NFTs in a single transaction
3. Email notifications when listings expire and NFTs are available for retrieval
4. Integration with a gas price oracle to optimize transaction costs
