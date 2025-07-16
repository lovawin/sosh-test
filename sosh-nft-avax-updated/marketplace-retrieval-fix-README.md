# NFT Retrieval Button Fix

## Problem Description

Users were experiencing issues with the "Retrieve" button for NFTs that had expired listings. The button was appearing for users who were viewing their own profile and had expired NFT listings, but it wasn't checking if the current user was actually the original seller of the NFT. This could lead to confusion and failed transactions when users tried to retrieve NFTs they didn't originally list.

The issue was identified in the logs where the transaction was being reverted by the EVM when a user who wasn't the original seller tried to retrieve an NFT.

## Root Cause

The root cause was that the UI was only checking two conditions to display the "Retrieve" button:
1. `isLoggedInProfile` - Whether the user is viewing their own profile
2. `isExpired` - Whether the sale has expired

It was missing a critical check:
3. `isUserSeller` - Whether the current user is the original seller of the NFT

## Solution

The fix involved three main changes:

1. **Added a state variable to track seller status**:
   ```javascript
   const [isUserSeller, setIsUserSeller] = useState(false);
   ```

2. **Added a useEffect hook to check if the current user is the seller**:
   ```javascript
   useEffect(() => {
     // Check if the user is the seller of the NFT
     const userIsSeller = address && data?.seller && 
       address.toLowerCase() === data?.seller.toLowerCase();
     
     setIsUserSeller(userIsSeller);
     
     // Log the seller check
     marketplaceLogger.logRetrievalButtonVisibility(data?.token_id, {
       isLoggedInProfile,
       userAddress: address,
       sellerAddress: data?.seller,
       isUserSeller: userIsSeller
     });
     
     console.log("Seller check:", {
       userAddress: address,
       sellerAddress: data?.seller,
       isUserSeller: userIsSeller
     });
   }, [isLoggedInProfile, address, data?.token_id, data?.seller]);
   ```

3. **Updated the button rendering logic to include the seller check**:
   ```javascript
   {isLoggedInProfile && isExpired && isUserSeller && (
     <CustomButton
       color="gradient"
       className="follow-button"
       $fontSize="0.8rem"
       onClick={handleRetrieveNFT}
       disabled={isRetrieving}
     >
       {isRetrieving ? "Retrieving..." : "Retrieve"}
     </CustomButton>
   )}
   ```

4. **Added a check in the `handleRetrieveNFT` function to prevent non-sellers from retrieving NFTs**:
   ```javascript
   // Verify that the current user is the seller of the NFT
   if (!isUserSeller) {
     toast.error("Only the original seller can retrieve this NFT");
     return;
   }
   ```

5. **Updated the logging to include the seller check**:
   ```javascript
   marketplaceLogger.logRetrievalButtonVisibility(data?.token_id, {
     isLoggedInProfile,
     isExpired,
     isApprove,
     isUserSeller,
     shouldShowRetrieveButton: isLoggedInProfile && isExpired && isUserSeller,
     currentTime: new Date().toISOString(),
     endTime: data?.endTime ? new Date(data.endTime * 1000).toISOString() : null,
     saleId: data?.saleId,
     saleStatus: data?.status
   });
   ```

## Benefits

1. **Improved User Experience**: Users will only see the "Retrieve" button if they are actually the original seller of the NFT, reducing confusion.

2. **Reduced Failed Transactions**: By preventing non-sellers from attempting to retrieve NFTs, we reduce the number of failed transactions and error messages.

3. **Enhanced Security**: Only the rightful seller can retrieve their NFT, ensuring proper ownership management.

4. **Better Logging**: The enhanced logging will make it easier to diagnose any future issues with the retrieval process.

## Testing

To test this fix:

1. Log in as a user who has listed an NFT for sale
2. Wait for the listing to expire
3. Verify that the "Retrieve" button appears
4. Log in as a different user
5. Navigate to the expired NFT
6. Verify that the "Retrieve" button does not appear

## Future Improvements

1. Consider adding a visual indicator or tooltip to explain why the "Retrieve" button is available or not available.
2. Implement a notification system to alert users when their listings expire and are ready for retrieval.
3. Add more detailed error messages to help users understand why a retrieval might fail.
