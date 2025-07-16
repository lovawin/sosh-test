/**
 * Frontend Retrieval Fix
 * 
 * This script fixes the issue with the "Retrieve" button not appearing
 * for expired NFT listings on the profile page.
 * 
 * The fix addresses the following potential issues:
 * 1. Missing saleId in the data object
 * 2. Incorrect expiration detection
 * 3. Improper ownership verification
 */

// Import required modules
const fs = require('fs');
const path = require('path');

// Paths to the files we need to modify
const postCardPath = path.join(__dirname, 'frontend', 'src', 'components', 'myProfileComponents', 'postCards', 'postCard.js');
const nftMarketPlaceFunctionsPath = path.join(__dirname, 'frontend', 'src', 'common', 'helpers', 'nftMarketPlaceFunctions.js');

// Read the current files
console.log('Reading current files...');
const postCardContent = fs.readFileSync(postCardPath, 'utf8');
const nftMarketPlaceFunctionsContent = fs.readFileSync(nftMarketPlaceFunctionsPath, 'utf8');

// Create backup files
console.log('Creating backup files...');
fs.writeFileSync(`${postCardPath}.bak`, postCardContent);
fs.writeFileSync(`${nftMarketPlaceFunctionsPath}.bak`, nftMarketPlaceFunctionsContent);

// Fix 1: Ensure saleId is properly handled in the PostCard component
console.log('Applying fix for saleId handling in PostCard component...');

// Look for the useEffect that checks for expiration
const expirationCheckRegex = /useEffect\(\s*\(\)\s*=>\s*\{\s*const timer\s*=\s*setInterval\(\s*\(\)\s*=>\s*\{[\s\S]*?setIsExpired\([\s\S]*?\)[\s\S]*?\}\s*,\s*1000\s*\);[\s\S]*?return\s*\(\)\s*=>\s*clearInterval\(timer\);[\s\S]*?\}\s*,\s*\[.*?\]\s*\);/;

// Updated version with improved expiration check and saleId verification
const updatedExpirationCheck = `useEffect(() => {
    const timer = setInterval(() => {
      const timeLeftData = calculateTimeLeft();
      setTimeLeft(timeLeftData);
      
      // Check if the listing has expired
      const now = new Date().getTime();
      const end = new Date(data?.endTime * 1000).getTime();
      
      // Make sure we have both endTime and saleId before showing the Retrieve button
      if (end < now && data?.endTime && data?.saleId) {
        console.log("Listing expired for token ID:", data?.token_id, "Sale ID:", data?.saleId);
        setIsExpired(true);
      } else {
        if (!data?.endTime) {
          console.log("Missing endTime for token ID:", data?.token_id);
        }
        if (!data?.saleId) {
          console.log("Missing saleId for token ID:", data?.token_id);
        }
        setIsExpired(false);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [data?.startTime, data?.endTime, data?.saleId, calculateTimeLeft, data?.token_id]);`;

// Replace the expiration check
let updatedPostCardContent = postCardContent.replace(expirationCheckRegex, updatedExpirationCheck);

// Fix 2: Update the handleRetrieveNFT function to better handle saleId
console.log('Updating handleRetrieveNFT function...');

// Look for the handleRetrieveNFT function
const handleRetrieveNFTRegex = /const handleRetrieveNFT = useCallback\(async \(\) => \{[\s\S]*?\}\s*,\s*\[.*?\]\s*\);/;

// Updated version with better error handling and logging
const updatedHandleRetrieveNFT = `const handleRetrieveNFT = useCallback(async () => {
    if (!isLogin) {
      toast("Please Connect Wallet");
      return;
    }
    
    // Check if we have a saleId
    if (!data?.saleId) {
      toast.error("Sale ID not found for this NFT. Cannot retrieve.");
      console.error("Missing saleId for token:", data?.token_id);
      return;
    }
    
    setIsRetrieving(true);
    dispatch(setLoading());
    
    try {
      console.log("Starting NFT retrieval process for token:", data?.token_id);
      console.log("Sale ID:", data?.saleId);
      console.log("User address:", address);
      
      // Log retrieval attempt
      await marketplaceLogger.logEvent('RETRIEVAL_ATTEMPT', {
        tokenId: data?.token_id,
        saleId: data?.saleId,
        userAddress: address,
        timestamp: new Date().toISOString()
      });
      
      // Call the retrieveBid function from nftMarketPlaceFunctions.js
      const result = await retrieveBid(data?.saleId, address);
      
      console.log("NFT retrieval transaction result:", result);
      
      // Log retrieval success
      await marketplaceLogger.logEvent('RETRIEVAL_SUCCESS', {
        tokenId: data?.token_id,
        saleId: data?.saleId,
        userAddress: address,
        transactionHash: result.transactionHash,
        timestamp: new Date().toISOString()
      });
      
      toast.success("NFT retrieved successfully!");
      
      // Refresh the page to update the UI
      window.location.reload();
    } catch (err) {
      console.error("Retrieval error:", err);
      
      // Extract detailed error information
      const errorDetails = {
        message: err.message,
        code: err.code,
        stack: err.stack,
        name: err.name
      };
      
      // If there's transaction data in the error, capture it
      if (err.transaction) {
        errorDetails.transaction = {
          from: err.transaction.from,
          to: err.transaction.to,
          data: err.transaction.data,
          gas: err.transaction.gas
        };
      }
      
      // If there's receipt data, capture it
      if (err.receipt) {
        errorDetails.receipt = {
          status: err.receipt.status,
          gasUsed: err.receipt.gasUsed,
          blockNumber: err.receipt.blockNumber,
          transactionHash: err.receipt.transactionHash
        };
      }
      
      // Log retrieval failure
      await marketplaceLogger.logEvent('RETRIEVAL_FAILURE', {
        tokenId: data?.token_id,
        saleId: data?.saleId,
        userAddress: address,
        error: errorDetails,
        timestamp: new Date().toISOString()
      });
      
      // Also log to error logs
      errorLogger.logError(err, {
        type: 'MARKETPLACE_TRANSACTION_ERROR',
        subType: 'RETRIEVE_NFT',
        context: {
          tokenId: data?.token_id,
          saleId: data?.saleId,
          userAddress: address,
          errorDetails: errorDetails,
          timestamp: new Date().toISOString()
        }
      });
      
      toast.error("Failed to retrieve NFT: " + (err.message || "Unknown error"));
    } finally {
      setIsRetrieving(false);
      dispatch(unSetLoading());
    }
  }, [address, data, dispatch, isLogin]);`;

// Replace the handleRetrieveNFT function
updatedPostCardContent = updatedPostCardContent.replace(handleRetrieveNFTRegex, updatedHandleRetrieveNFT);

// Fix 3: Update the getApprove function to better handle ownership verification
console.log('Updating getApprove function...');

// Look for the getApprove function
const getApproveRegex = /const getApprove = useCallback\(async \(\) => \{[\s\S]*?\}\s*,\s*\[.*?\]\s*\);/;

// Updated version with better ownership verification
const updatedGetApprove = `const getApprove = useCallback(async () => {
    try {
      console.log("Checking approval status for token:", data?.token_id);

      // First check if the marketplace already owns the NFT
      const owner = await contactInstance()
        .methods.ownerOf(data?.token_id)
        .call();
      
      console.log("Current owner of token:", owner);
      
      // If marketplace already owns the NFT, no need to approve
      if (owner.toLowerCase() === CUSTOM_TOKEN_ADDRESS_721_MARKET_PLACE.toLowerCase()) {
        console.log("Marketplace already owns this NFT, no need to approve");
        setIsApprove(false);
        
        // Check if the listing has expired
        const now = new Date().getTime();
        const end = new Date(data?.endTime * 1000).getTime();
        if (end < now && data?.endTime && data?.saleId) {
          console.log("Listing expired for token ID:", data?.token_id, "Sale ID:", data?.saleId);
          setIsExpired(true);
        }
        
        return;
      }

      const getApproval = await contactInstance()
        .methods.getApproved(data?.token_id)
        .call({ from: address });

      console.log("Approval status:", getApproval);
      console.log("User address:", address);
      console.log("Marketplace address:", CUSTOM_TOKEN_ADDRESS_721_MARKET_PLACE);
      
      if (
        getApproval !== address &&
        getApproval !== CUSTOM_TOKEN_ADDRESS_721_MARKET_PLACE
      ) {
        setIsApprove(true);
      }
    } catch (err) {
      console.error("Error checking approval status:", err);
      // Log error to both logging systems
      errorLogger.logError(err, {
        type: 'MARKETPLACE_TRANSACTION_ERROR',
        subType: 'GET_APPROVAL_CHECK',
        context: {
          tokenId: data?.token_id,
          userAddress: address
        }
      });
    }
  }, [address, data]);`;

// Replace the getApprove function
updatedPostCardContent = updatedPostCardContent.replace(getApproveRegex, updatedGetApprove);

// Fix 4: Update the retrieveBid function in nftMarketPlaceFunctions.js
console.log('Updating retrieveBid function in nftMarketPlaceFunctions.js...');

// Look for the retrieveBid function
const retrieveBidRegex = /export const retrieveBid = async \(saleId, address\) => \{[\s\S]*?\};/;

// Updated version with better error handling and logging
const updatedRetrieveBid = `export const retrieveBid = async (saleId, address) => {
  console.log("Starting retrieveBid function with saleId:", saleId, "address:", address);
  
  if (!saleId) {
    const error = new Error("Sale ID is required for NFT retrieval");
    console.error(error);
    throw error;
  }
  
  try {
    const Contract = marketPlaceInstance();
    
    // Get sale info before retrieval
    try {
      const saleInfo = await Contract.methods.reserveSale(saleId).call();
      console.log("Sale info before retrieval:", saleInfo);
      
      // Verify the sale is open and expired
      const now = Math.floor(Date.now() / 1000);
      if (saleInfo.status !== '0') {
        throw new Error("Sale is not in Open status");
      }
      if (parseInt(saleInfo.endTime) > now) {
        throw new Error("Sale has not expired yet");
      }
      if (saleInfo.seller.toLowerCase() !== address.toLowerCase()) {
        throw new Error("You are not the original seller of this NFT");
      }
    } catch (error) {
      console.error("Error checking sale info:", error);
      throw error;
    }
    
    console.log("Calling finalizeExpiredSale for saleId:", saleId);
    const result = await Contract.methods
      .finalizeExpiredSale(saleId)
      .send({ from: address });

    console.log("Retrieval transaction result:", result);
    toast.success("Assets retrieved successfully!");
    return result;
  } catch (error) {
    console.error("Error in retrieveBid function:", error);
    
    // Get token ID from sale ID if possible
    let tokenId = null;
    try {
      const Contract = marketPlaceInstance();
      const saleInfo = await Contract.methods.reserveSale(saleId).call();
      tokenId = saleInfo.tokenId;
    } catch (err) {
      console.error("Could not get token ID from sale:", err);
    }
    
    // Log transaction error
    if (tokenId) {
      await marketplaceLogger.logTransactionError(
        tokenId,
        error,
        'RETRIEVE_BID',
        { 
          saleId,
          userAddress: address
        }
      );
      
      // Also log to error logs
      errorLogger.logError(error, {
        type: 'MARKETPLACE_TRANSACTION_ERROR',
        subType: 'RETRIEVE_BID',
        context: {
          tokenId,
          saleId,
          userAddress: address,
          operation: 'RETRIEVE_BID'
        }
      });
    }
    
    toast.error(\`\${error.message}\`);
    throw error;
  }
};`;

// Replace the retrieveBid function
const updatedNftMarketPlaceFunctionsContent = nftMarketPlaceFunctionsContent.replace(retrieveBidRegex, updatedRetrieveBid);

// Write the updated files
console.log('Writing updated files...');
fs.writeFileSync(postCardPath, updatedPostCardContent);
fs.writeFileSync(nftMarketPlaceFunctionsPath, updatedNftMarketPlaceFunctionsContent);

console.log('Fix applied successfully!');
console.log('Please rebuild the frontend with: cd sosh-nft-avax-updated/frontend && npm run build');
console.log('Then deploy the updated build to the production server.');
