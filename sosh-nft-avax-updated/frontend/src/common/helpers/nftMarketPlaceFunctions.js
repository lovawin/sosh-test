import Web3 from "web3";
import { toast } from "react-toastify";
import { marketPlaceInstance } from "common/methodInstance";
import { ethers } from "ethers";
import axios from "axios";
import getAxiosInst from "services/axios";
import { getLocalStorageItem } from "common/helpers/localStorageHelpers";
import { STORAGES } from "constants/appConstants";
import marketplaceLogger from "services/marketplaceLogger";
import errorLogger from "services/errorLogger";

export const buyNFT = async (saleId, amount, address) => {
  console.log("amount,saleId", amount, saleId);
  try {
    const Contract = marketPlaceInstance();
    const result = await Contract.methods.buyNFT(saleId).send({
      from: address,
      value: amount,
    });

    console.log("NFT purchase transaction receipt:", result);
    toast.success("NFT purchase successful!");
    return result;
  } catch (error) {
    console.error("Error in buyNFT function:", error);
    
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
        'BUY_NFT',
        { 
          saleId,
          amount: Web3.utils.fromWei(amount.toString(), 'ether'),
          userAddress: address
        }
      );
      
      // Also log to error logs
      errorLogger.logError(error, {
        type: 'MARKETPLACE_TRANSACTION_ERROR',
        subType: 'BUY_NFT',
        context: {
          tokenId,
          saleId,
          amount: Web3.utils.fromWei(amount.toString(), 'ether'),
          userAddress: address,
          operation: 'BUY_NFT'
        }
      });
    }
    
    toast.error(`${error.message}`);
    throw error;
  }
};

export const placeBidNFT = async (saleId, amount, address) => {
  console.log("saleId from palce BID", saleId, amount, address);
  try {
    const Contract = marketPlaceInstance();
    const result = await Contract.methods
      .placeBid(saleId)
      .send({ from: address, value: Web3.utils.toWei(amount, "ether") });
    console.log("Bid placement transaction receipt:", result);
    toast.success("Bid placed successfully!");
    return result;
  } catch (error) {
    console.error("Error in placeBidNFT function:", error);
    
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
        'PLACE_BID',
        { 
          saleId,
          amount,
          userAddress: address
        }
      );
      
      // Also log to error logs
      errorLogger.logError(error, {
        type: 'MARKETPLACE_TRANSACTION_ERROR',
        subType: 'PLACE_BID',
        context: {
          tokenId,
          saleId,
          amount,
          userAddress: address,
          operation: 'PLACE_BID'
        }
      });
    }
    
    toast.error(`${error.message}`);
    throw error;
  }
};

export const finalizeBid = async (saleId, address) => {
  console.log("saleId from finalize BID", saleId);
  try {
    const Contract = marketPlaceInstance();
    const result = await Contract.methods
      .finalizeAuction(saleId)
      .send({ from: address });

    console.log("finalize BID:", result);
    toast.success("BID finalized successfully!");
    return result;
  } catch (error) {
    console.error("Error in finalize BID function:", error);
    
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
        'FINALIZE_AUCTION',
        { 
          saleId,
          userAddress: address
        }
      );
      
      // Also log to error logs
      errorLogger.logError(error, {
        type: 'MARKETPLACE_TRANSACTION_ERROR',
        subType: 'FINALIZE_AUCTION',
        context: {
          tokenId,
          saleId,
          userAddress: address,
          operation: 'FINALIZE_AUCTION'
        }
      });
    }
    
    toast.error(`${error.message}`);
    throw error;
  }
};

export const retrieveBid = async (saleId, address) => {
  console.log("Starting retrieveBid function with saleId:", saleId, "address:", address);
  await marketplaceLogger.logEvent('RETRIEVE_BID_START', {
    saleId,
    userAddress: address,
    source: 'backend_verification',
    timestamp: new Date().toISOString()
  });
  
  if (!saleId) {
    const error = new Error("Sale ID is required for NFT retrieval");
    console.error(error);
    errorLogger.logError(error, {
      type: 'MARKETPLACE_VALIDATION_ERROR',
      subType: 'MISSING_SALE_ID',
      context: {
        userAddress: address,
        operation: 'RETRIEVE_BID'
      }
    });
    throw error;
  }
  
  try {
    // First, get the token ID from the sale ID
    const Contract = marketPlaceInstance();
    let tokenId;
    
    try {
      const saleInfo = await Contract.methods.reserveSale(saleId).call();
      tokenId = saleInfo.tokenId;
      
      console.log("Got token ID from sale:", tokenId);
      await marketplaceLogger.logEvent('RETRIEVE_BID_GOT_TOKEN_ID', {
        saleId,
        tokenId,
        userAddress: address,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      console.error("Could not get token ID from sale:", err);
      throw new Error("Failed to get token ID from sale. Please try again.");
    }
    
    // Verify NFT retrieval eligibility using the backend API
    console.log("Verifying NFT retrieval eligibility with backend for token ID:", tokenId);
    await marketplaceLogger.logEvent('RETRIEVE_BID_VERIFICATION_REQUEST', {
      tokenId,
      saleId,
      userAddress: address,
      timestamp: new Date().toISOString()
    });
    
    // Check if the user has a valid token before making the request
    const token = getLocalStorageItem(STORAGES.token);
    if (!token) {
      const error = new Error("You need to be logged in to retrieve your NFT");
      console.error(error);
      await marketplaceLogger.logEvent('RETRIEVE_BID_AUTH_ERROR', {
        tokenId,
        saleId,
        error: 'No authentication token found',
        userAddress: address,
        timestamp: new Date().toISOString()
      });
      toast.error(error.message);
      throw error;
    }

    try {
      // Call the backend API to verify NFT retrieval eligibility with authentication
      const axiosWithAuth = getAxiosInst({ withAuth: true });
      const response = await axiosWithAuth.get(`/api/V1/marketplace/verify-nft/${tokenId}?address=${address}`);
      
      // Check if the request was successful
      if (response.data.status !== 'success') {
        throw new Error("Verification API returned non-success status");
      }
      
      const verificationData = response.data.data;
      console.log("NFT verification data from API:", verificationData);
      
      // Log the verification result
      await marketplaceLogger.logEvent('RETRIEVE_BID_VERIFICATION_RESULT', {
        tokenId,
        saleId,
        isEligibleForRetrieval: verificationData.isEligibleForRetrieval,
        isMarketplaceOwner: verificationData.isMarketplaceOwner,
        isOriginalSeller: verificationData.isOriginalSeller,
        hasExpired: verificationData.hasExpired,
        userAddress: address,
        timestamp: new Date().toISOString()
      });
      
      // Check if the NFT is eligible for retrieval
      if (!verificationData.isEligibleForRetrieval) {
        let reason = "NFT is not eligible for retrieval";
        
        if (!verificationData.isMarketplaceOwner) {
          reason = "NFT is not owned by the marketplace contract";
        } else if (!verificationData.isOriginalSeller) {
          reason = "You are not the original seller of this NFT";
        } else if (!verificationData.hasExpired) {
          reason = "Sale has not expired yet";
        }
        
        const error = new Error(reason);
        console.error(error);
        throw error;
      }
    } catch (verificationError) {
      console.error("Error verifying NFT retrieval eligibility:", verificationError);
      
      // Check if it's an authentication error
      if (verificationError.response && verificationError.response.status === 401) {
        console.error("Authentication failed when verifying NFT retrieval eligibility");
        await marketplaceLogger.logEvent('RETRIEVE_BID_AUTH_ERROR', {
          tokenId,
          saleId,
          error: 'Authentication failed with 401 status',
          userAddress: address,
          timestamp: new Date().toISOString()
        });
        
        // Prompt the user to log in again
        toast.error("Please log in again to retrieve your NFT");
      }
      
      // Log verification error
      await marketplaceLogger.logEvent('RETRIEVE_BID_VERIFICATION_ERROR', {
        tokenId,
        saleId,
        error: verificationError.message,
        status: verificationError.response?.status,
        userAddress: address,
        timestamp: new Date().toISOString()
      });
      
      // Also log to error logs
      errorLogger.logError(verificationError, {
        type: 'MARKETPLACE_VALIDATION_ERROR',
        subType: 'VERIFICATION_ERROR',
        context: {
          tokenId,
          saleId,
          userAddress: address,
          status: verificationError.response?.status
        }
      });
      
      throw verificationError;
    }
    
    // If we get here, the NFT is eligible for retrieval
    console.log("NFT is eligible for retrieval. Calling finalizeExpiredSale for saleId:", saleId);
    await marketplaceLogger.logEvent('RETRIEVE_BID_TRANSACTION_START', {
      saleId,
      tokenId,
      userAddress: address,
      timestamp: new Date().toISOString()
    });
    
    const result = await Contract.methods
      .finalizeExpiredSale(saleId)
      .send({ from: address });

    console.log("Retrieval transaction result:", result);
    await marketplaceLogger.logEvent('RETRIEVE_BID_TRANSACTION_SUCCESS', {
      saleId,
      tokenId,
      transactionHash: result.transactionHash,
      blockNumber: result.blockNumber,
      gasUsed: result.gasUsed,
      userAddress: address,
      timestamp: new Date().toISOString()
    });
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
    
    toast.error(`${error.message}`);
    throw error;
  }
};

export const createSale = async (saleData, address) => {
  try {
    // console.log(
    //   " ethers.utils.parseEther(saleData.price),-------------",
    //   ethers.utils.parseEther(saleData.askPrice)
    // );

    console.log(
      'Web3.utils.toWei(amount, "ether")',
      Web3.utils.toWei(saleData?.askPrice)
    );
    console.log("saleData:-------", saleData, "address:", address);

    const Contract = marketPlaceInstance();
    const result = await Contract.methods

      .createSale(
        saleData.saleType,
        saleData.tokenID,
        Web3.utils.toWei(saleData?.askPrice),
        saleData.startTime,
        saleData.endTime
      )
      .send({
        from: address,
      });
    console.log("Bid placement transaction receipt:", result);
    toast.success("Sale created successfully!");
    return result;
  } catch (error) {
    console.error("Error in createSale function:", error);
    
    // Log transaction error
    await marketplaceLogger.logTransactionError(
      saleData.tokenID,
      error,
      'CREATE_SALE',
      { 
        tokenId: saleData.tokenID,
        saleType: saleData.saleType,
        price: saleData.askPrice,
        startTime: saleData.startTime,
        endTime: saleData.endTime,
        userAddress: address
      }
    );
    
    // Also log to error logs
    errorLogger.logError(error, {
      type: 'MARKETPLACE_TRANSACTION_ERROR',
      subType: 'CREATE_SALE',
      context: {
        tokenId: saleData.tokenID,
        saleType: saleData.saleType,
        price: saleData.askPrice,
        startTime: saleData.startTime,
        endTime: saleData.endTime,
        userAddress: address,
        operation: 'CREATE_SALE'
      }
    });
    
    toast.error(`${error.message}`);
    throw error;
  }
};

export const updateSale = async (saleId, formData, address) => {
  try {
    console.log("saleId", saleId, formData, address);
    const Contract = marketPlaceInstance();
    const result = await Contract.methods

      .updateSale(
        saleId,

        Web3.utils.toWei(formData?.askPrice),
        formData.startTime,
        formData.endTime
      )
      .send({
        from: address,
      });
    console.log("Bid placement transaction receipt:", result);
    toast.success("Sale update successfully!");
    return result;
  } catch (error) {
    console.error("Error in createSale function:", error);
    
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
        'UPDATE_SALE',
        { 
          saleId,
          price: formData.askPrice,
          startTime: formData.startTime,
          endTime: formData.endTime,
          userAddress: address
        }
      );
      
      // Also log to error logs
      errorLogger.logError(error, {
        type: 'MARKETPLACE_TRANSACTION_ERROR',
        subType: 'UPDATE_SALE',
        context: {
          tokenId,
          saleId,
          price: formData.askPrice,
          startTime: formData.startTime,
          endTime: formData.endTime,
          userAddress: address,
          operation: 'UPDATE_SALE'
        }
      });
    }
    
    toast.error(`${error.message}`);
    throw error;
  }
};
