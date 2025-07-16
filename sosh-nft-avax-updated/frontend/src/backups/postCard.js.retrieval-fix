import React, { useCallback, useEffect, useState } from "react";
import PropTypes from "prop-types";

import { StyledPostCard } from "./style";
import { Link, useLocation } from "react-router-dom";
import Routes from "constants/routes";

import { deleteAsset, likeAsset } from "services/assetsServices";
import { apiHandler } from "services/axios";
import marketplaceLogger from "services/marketplaceLogger";
import errorLogger from "services/errorLogger";
import { retrieveBid } from "common/helpers/nftMarketPlaceFunctions";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { contactInstance } from "../../../common/methodInstance";
import getAxiosInst from "services/axios";
import { getLocalStorageItem } from "common/helpers/localStorageHelpers";
import { STORAGES } from "constants/appConstants";
import LikeButton from "components/likeButton";
import ShareButton from "components/shareButton";
import DeleteButton from "components/deleteButton";
import EllipsedText from "components/EllipsedText";
import ImageComponent from "components/ImageComponent";
import { openConfirmModal } from "store/commonStore/actionCreator";
import ThreeDotIcon from "assets/icons/threeDotIcon";
import ModalForSellNFT from "components/ModalForSellNFT/ModalForSellNFT";
import CustomButton from "components/CustomButton";
import { setLoading, unSetLoading } from "store/Actions/data";
import { CUSTOM_TOKEN_ADDRESS_721_MARKET_PLACE } from "common/config721MarketPlace";
import EditIcon from "assets/icons/editIcon";

function PostCard({ data, linkable = true, isLoggedInProfile, onDelete }) {
  console.log("data from Post Card", data);
  const [cardData, setCardData] = useState(data || {});
  const [isEditable, setIsEditable] = useState(false);

  const { isLogin, address } = useSelector((state) => state.login);
  const [isApprove, setIsApprove] = useState(false);
  const [isLikeUpdating, setIsLikeUpdating] = useState(false);
  const [isDeleteInProgress, setIsDeleteInProgress] = useState(false);
  const [isEditPrice, setIsEditPrice] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const [isRetrieving, setIsRetrieving] = useState(false);
  const [isUserSeller, setIsUserSeller] = useState(false);
  const dispatch = useDispatch();
  const calculateTimeLeft = useCallback(() => {
    const now = new Date().getTime();
    const start = new Date(data?.startTime * 1000).getTime();
    const end = new Date(data?.endTime * 1000).getTime();
    let timeLeft = {};
    let message = "";

    if (start > now) {
      const difference = start - now;

      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
      message = "Sales start in";
    } else if (end > now) {
      const difference = end - now;
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };

      message = "Sale ends in";
    }

    // setPrevMessage(message);

    return { timeLeft, message };
  }, [data?.endTime, data?.startTime]);

  // Function to fetch sale data and verify NFT retrieval eligibility from the backend API
  const fetchSaleData = useCallback(async (tokenId) => {
    if (!tokenId) return;
    
    try {
      console.log("Fetching sale data for token ID:", tokenId);
      
      // Check if the user has a valid token before making the request
      const token = getLocalStorageItem(STORAGES.token);
      const hasToken = !!token;
      
      // Log authentication status
      await marketplaceLogger.logAuthStatus(tokenId, hasToken, hasToken ? 'present' : 'missing', {
        operation: 'fetchSaleData',
        endpoint: `/api/V1/marketplace/sale-info/${tokenId}`,
        timestamp: new Date().toISOString()
      });
      
      if (!token) {
        console.warn("No authentication token found for sale data fetch");
        // Early return if no token is found to prevent unauthorized requests
        return;
      }
      
      // Create axios instance with authentication
      const axiosWithAuth = getAxiosInst({ withAuth: true });
      
      // Get request headers for logging
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': token ? 'Bearer ********' : undefined // Mask token for security
      };
      
      // Log the API request with detailed information
      const requestStartTime = Date.now();
      await marketplaceLogger.logApiRequest(
        `/api/V1/marketplace/sale-info/${tokenId}`,
        'GET',
        headers,
        {},
        tokenId,
        {
          userAddress: address,
          timestamp: new Date().toISOString()
        }
      );
      
      // Call the backend API to get sale information with authentication
      const response = await axiosWithAuth.get(`/api/V1/marketplace/sale-info/${tokenId}`);
      const requestDuration = Date.now() - requestStartTime;
      
      // Log the API response with detailed information
      await marketplaceLogger.logApiResponse(
        `/api/V1/marketplace/sale-info/${tokenId}`,
        response.status,
        response.data,
        response.headers,
        tokenId,
        requestDuration,
        {
          userAddress: address,
          timestamp: new Date().toISOString()
        }
      );
      
      // Check if the request was successful
      if (response.data.status === 'success') {
        const saleData = response.data.data;
        console.log("Sale data from API:", saleData);
        
        // Handle the case where the NFT is owned by the marketplace but no active sale is found
        if (saleData.isOwnedByMarketplace) {
          console.log("NFT is owned by marketplace but no active sale found");
          
          // Log this special case with enhanced details
          await marketplaceLogger.logEvent('MARKETPLACE_OWNED_NFT', {
            tokenId,
            currentOwner: saleData.currentOwner,
            seller: saleData.seller,
            isMarketplaceOwner: true,
            userAddress: address,
            timestamp: new Date().toISOString()
          });
          
          // Update the card data with the information we have
          setCardData(prevData => ({
            ...prevData,
            saleId: saleData.saleId,
            endTime: saleData.endTime, // This is set to a past time in the backend
            status: saleData.status,    // This is set to '1' (Open) in the backend
            seller: saleData.seller     // This is the original seller from blockchain events
          }));
          
          // Log the data for debugging with enhanced details
          await marketplaceLogger.logDataPropertyValidation(tokenId, {
            saleId: saleData.saleId,
            endTime: saleData.endTime,
            endTimeFormatted: saleData.endTime ? new Date(saleData.endTime * 1000).toISOString() : null,
            seller: saleData.seller,
            status: saleData.status,
            isOwnedByMarketplace: true,
            currentOwner: saleData.currentOwner,
            userAddress: address,
            isUserSeller: address && saleData.seller ? address.toLowerCase() === saleData.seller.toLowerCase() : false,
            timestamp: new Date().toISOString()
          });
        } else {
          // Normal case - we have complete sale data
          // Update the card data with sale information
          setCardData(prevData => ({
            ...prevData,
            saleId: saleData.saleId,
            endTime: saleData.endTime,
            startTime: saleData.startTime,
            seller: saleData.seller,
            status: saleData.status
          }));
          
          // Log the sale data for debugging with enhanced details
          await marketplaceLogger.logDataPropertyValidation(tokenId, {
            saleId: saleData.saleId,
            endTime: saleData.endTime,
            endTimeFormatted: saleData.endTime ? new Date(saleData.endTime * 1000).toISOString() : null,
            startTime: saleData.startTime,
            startTimeFormatted: saleData.startTime ? new Date(saleData.startTime * 1000).toISOString() : null,
            seller: saleData.seller,
            status: saleData.status,
            isOwnedByMarketplace: saleData.isOwnedByMarketplace,
            currentOwner: saleData.currentOwner,
            userAddress: address,
            isUserSeller: address && saleData.seller ? address.toLowerCase() === saleData.seller.toLowerCase() : false,
            timestamp: new Date().toISOString()
          });
        }
        
        // After getting the sale data, verify NFT retrieval eligibility if the user is logged in
        if (isLogin && address) {
          await verifyNftRetrievalEligibility(tokenId, address);
        }
      } else {
        console.warn("API returned non-success status:", response.data);
        
        // Log the API error with enhanced details
        await marketplaceLogger.logEvent('API_ERROR', {
          tokenId,
          endpoint: `/api/V1/marketplace/sale-info/${tokenId}`,
          status: response.data.status,
          message: response.data.message,
          userAddress: address,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error("Error fetching sale data from API:", error);
      
      // Get detailed error information
      const errorDetails = {
        message: error.message,
        name: error.name,
        stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined
      };
      
      // Add response details if available
      if (error.response) {
        errorDetails.response = {
          status: error.response.status,
          statusText: error.response.statusText,
          headers: error.response.headers,
          data: error.response.data
        };
      }
      
      // Add request details if available
      if (error.config) {
        errorDetails.request = {
          url: error.config.url,
          method: error.config.method,
          headers: error.config.headers,
          baseURL: error.config.baseURL
        };
      }
      
      // Log the error to both logging systems with enhanced details
      await marketplaceLogger.logApiResponse(
        `/api/V1/marketplace/sale-info/${tokenId}`,
        error.response?.status || 0,
        error.response?.data || { status: 'error', message: error.message },
        error.response?.headers || {},
        tokenId,
        null,
        {
          error: errorDetails,
          userAddress: address,
          timestamp: new Date().toISOString()
        }
      );
      
      // Also log to error logs with enhanced details
      errorLogger.logError(error, {
        type: 'API_ERROR',
        subType: 'FETCH_SALE_DATA',
        context: {
          tokenId,
          endpoint: `/api/V1/marketplace/sale-info/${tokenId}`,
          userAddress: address,
          errorDetails
        }
      });
    }
  }, [isLogin, address]);
  
  // Function to verify NFT retrieval eligibility using the backend API
  const verifyNftRetrievalEligibility = useCallback(async (tokenId, userAddress) => {
    if (!tokenId || !userAddress) return;
    
    try {
      console.log("Verifying NFT retrieval eligibility for token ID:", tokenId);
      
      // Check if the user has a valid token before making the request
      const token = getLocalStorageItem(STORAGES.token);
      const hasToken = !!token;
      
      // Log authentication status with enhanced details
      await marketplaceLogger.logAuthStatus(tokenId, hasToken, hasToken ? 'present' : 'missing', {
        operation: 'verifyNftRetrievalEligibility',
        endpoint: `/api/V1/marketplace/verify-nft/${tokenId}`,
        userAddress,
        timestamp: new Date().toISOString()
      });
      
      if (!token) {
        console.warn("No authentication token found for NFT retrieval eligibility check");
        return;
      }
      
      // Create axios instance with authentication
      const axiosWithAuth = getAxiosInst({ withAuth: true });
      
      // Get request headers for logging
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': token ? 'Bearer ********' : undefined // Mask token for security
      };
      
      // Prepare query parameters
      const params = { address: userAddress };
      
      // Log the API request with detailed information
      const requestStartTime = Date.now();
      await marketplaceLogger.logApiRequest(
        `/api/V1/marketplace/verify-nft/${tokenId}`,
        'GET',
        headers,
        params,
        tokenId,
        {
          userAddress,
          timestamp: new Date().toISOString()
        }
      );
      
      // Call the backend API to verify NFT retrieval eligibility with authentication
      const response = await axiosWithAuth.get(`/api/V1/marketplace/verify-nft/${tokenId}?address=${userAddress}`);
      const requestDuration = Date.now() - requestStartTime;
      
      // Log the API response with detailed information
      await marketplaceLogger.logApiResponse(
        `/api/V1/marketplace/verify-nft/${tokenId}`,
        response.status,
        response.data,
        response.headers,
        tokenId,
        requestDuration,
        {
          userAddress,
          timestamp: new Date().toISOString()
        }
      );
      
      // Check if the request was successful
      if (response.data.status === 'success') {
        const verificationData = response.data.data;
        console.log("NFT verification data from API:", verificationData);
        
        // Update state based on verification results
        setIsExpired(verificationData.hasExpired);
        setIsUserSeller(verificationData.isOriginalSeller);
        
        // Log the verification result with enhanced details
        await marketplaceLogger.logVerificationResponse(tokenId, verificationData.isEligibleForRetrieval, {
          userAddress,
          isMarketplaceOwner: verificationData.isMarketplaceOwner,
          isOriginalSeller: verificationData.isOriginalSeller,
          hasExpired: verificationData.hasExpired,
          currentOwner: verificationData.currentOwner,
          originalSeller: verificationData.originalSeller,
          saleId: verificationData.saleId,
          endTime: verificationData.endTime,
          endTimeFormatted: verificationData.endTime ? new Date(verificationData.endTime * 1000).toISOString() : null,
          timestamp: new Date().toISOString()
        });
        
        // Log detailed button visibility information with enhanced details
        await marketplaceLogger.logRetrievalButtonVisibility(tokenId, {
          isLoggedInProfile,
          userAddress,
          sellerAddress: verificationData.originalSeller,
          isUserSeller: verificationData.isOriginalSeller,
          isExpired: verificationData.hasExpired,
          isMarketplaceOwner: verificationData.isMarketplaceOwner,
          shouldShowRetrieveButton: isLoggedInProfile && verificationData.hasExpired && verificationData.isOriginalSeller && verificationData.isMarketplaceOwner,
          verificationSource: 'backend',
          stateVariables: {
            isExpired: isExpired,
            isUserSeller: isUserSeller,
            isLoggedInProfile: isLoggedInProfile
          },
          stateAfterUpdate: {
            isExpired: verificationData.hasExpired,
            isUserSeller: verificationData.isOriginalSeller,
            isLoggedInProfile: isLoggedInProfile
          },
          timestamp: new Date().toISOString()
        });
      } else {
        console.warn("Verification API returned non-success status:", response.data);
        
        // Log the API error with enhanced details
        await marketplaceLogger.logApiResponse(
          `/api/V1/marketplace/verify-nft/${tokenId}`,
          response.status,
          response.data,
          response.headers,
          tokenId,
          requestDuration,
          {
            userAddress,
            error: {
              status: response.data.status,
              message: response.data.message
            },
            timestamp: new Date().toISOString()
          }
        );
      }
    } catch (error) {
      console.error("Error verifying NFT retrieval eligibility:", error);
      
      // Get detailed error information
      const errorDetails = {
        message: error.message,
        name: error.name,
        stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined
      };
      
      // Add response details if available
      if (error.response) {
        errorDetails.response = {
          status: error.response.status,
          statusText: error.response.statusText,
          headers: error.response.headers,
          data: error.response.data
        };
      }
      
      // Add request details if available
      if (error.config) {
        errorDetails.request = {
          url: error.config.url,
          method: error.config.method,
          headers: error.config.headers,
          baseURL: error.config.baseURL
        };
      }
      
      // Log the error to both logging systems with enhanced details
      await marketplaceLogger.logApiResponse(
        `/api/V1/marketplace/verify-nft/${tokenId}`,
        error.response?.status || 0,
        error.response?.data || { status: 'error', message: error.message },
        error.response?.headers || {},
        tokenId,
        null,
        {
          error: errorDetails,
          userAddress,
          timestamp: new Date().toISOString()
        }
      );
      
      // Also log to error logs with enhanced details
      errorLogger.logError(error, {
        type: 'API_ERROR',
        subType: 'VERIFY_NFT_ELIGIBILITY',
        context: {
          tokenId,
          userAddress,
          endpoint: `/api/V1/marketplace/verify-nft/${tokenId}`,
          errorDetails
        }
      });
    }
  }, [isLoggedInProfile]);

  useEffect(() => {
    const timer = setInterval(() => {
      const timeLeftData = calculateTimeLeft();
      setTimeLeft(timeLeftData);
      
      // Log that we're using backend verification instead of frontend calculation
      marketplaceLogger.logEvent('BACKEND_VERIFICATION_ENABLED', {
        tokenId: data?.token_id,
        source: 'backend_verification',
        message: 'Frontend is delegating NFT retrieval eligibility verification to backend API',
        verificationEndpoint: `/api/V1/marketplace/verify-nft/${data?.token_id}`,
        timestamp: new Date().toISOString()
      });
      
    }, 1000);

    return () => clearInterval(timer);
  }, [data.startTime, data.endTime, calculateTimeLeft, data?.token_id]);

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  const location = useLocation();

  useEffect(() => {
    if (
      location?.search?.includes("sale=true") &&
      timeLeft?.message === "Sales start in"
    ) {
      setIsEditable(true);
    } else {
      setIsEditable(false);
    }
  }, [location?.search, timeLeft?.message]);
  console.log(location, "LOCATION   ");
  const [showModal, setShowModal] = useState(false);

  const handleClose = () => {
    setShowModal(false);
  };

  console.log("timeLeft", timeLeft);

  useEffect(() => {
    setCardData(data);
  }, [data]);

  // Fetch sale data from the blockchain when the component mounts
  useEffect(() => {
    if (data?.token_id) {
      fetchSaleData(data.token_id);
    }
  }, [data?.token_id, fetchSaleData]);

  const startDeleteProgress = useCallback(() => {
    setIsDeleteInProgress(true);
  }, []);
  const stopDeleteProgress = useCallback(() => {
    setIsDeleteInProgress(false);
  }, []);

  const startLikeUpdate = useCallback(() => {
    setIsLikeUpdating(true);
  }, []);

  const stopLikeUpdate = useCallback(() => {
    setIsLikeUpdating(false);
  }, []);
  
  const handleRetrieveNFT = useCallback(async () => {
    if (!isLogin) {
      toast("Please Connect Wallet");
      return;
    }
    
    // Verify that the current user is the seller of the NFT
    if (!isUserSeller) {
      toast.error("Only the original seller can retrieve this NFT");
      return;
    }
    
    setIsRetrieving(true);
    dispatch(setLoading());
    
    try {
      console.log("Starting NFT retrieval process for token:", data?.token_id);
      console.log("User address:", address);
      
      // Log retrieval attempt
      await marketplaceLogger.logEvent('RETRIEVAL_ATTEMPT', {
        tokenId: data?.token_id,
        userAddress: address,
        timestamp: new Date().toISOString()
      });
      
      // Get the sale ID from the data
      // Note: This assumes the sale ID is available in the data object
      // You may need to adjust this based on your data structure
      const saleId = data?.saleId;
      
      if (!saleId) {
        throw new Error("Sale ID not found for this NFT");
      }
      
      // Call the retrieveBid function from nftMarketPlaceFunctions.js
      const result = await retrieveBid(saleId, address);
      
      console.log("NFT retrieval transaction result:", result);
      
      // Log retrieval success
      await marketplaceLogger.logEvent('RETRIEVAL_SUCCESS', {
        tokenId: data?.token_id,
        saleId: saleId,
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
  }, [address, data, dispatch, isLogin, isUserSeller]);

  const likeAndDislikeAsset = () => {
    if (!isLogin) {
      toast("Please Connect Wallet");
      return true;
    }
    startLikeUpdate();

    apiHandler(() => likeAsset(cardData?._id, !cardData?.liked), {
      onSuccess: (data) => {
        setCardData((prevState) => ({
          ...prevState,
          liked: data?.asset?.liked,
          likedBy: data?.asset?.likedBy,
        }));
      },
      onError: () => {
        toast("Failed to like NFT", {
          type: "error",
        });
      },
      final: () => {
        stopLikeUpdate();
      },
    });
  };

  const handleDelete = useCallback(
    async (id, tokenId) => {
      startDeleteProgress();
      try {
        const burn = await contactInstance()
          .methods.burnToken()
          .call({ from: address });
        console.log(burn, "burn");
        apiHandler(() => deleteAsset(id), {
          onSuccess: (data) => {
            onDelete && onDelete(cardData?._id, data);
            toast("Asset Deleted", {
              type: "success",
            });
          },
        });
      } catch (err) {
        console.error(err);
        toast("Failed to delete NFT", {
          type: "error",
        });
      } finally {
        stopDeleteProgress();
      }
    },
    [address, startDeleteProgress, stopDeleteProgress, cardData, onDelete]
  );

  const deleteClickHandler = useCallback(() => {
    startDeleteProgress();
    dispatch(
      openConfirmModal({
        onConfirm: () => handleDelete(cardData?._id, cardData?.token_id),
        onCancel: stopDeleteProgress,
        message: "Are you sure you want to delete this NFT?",
        confirmLabel: "Delete",
        type: "delete",
      })
    );
  }, [
    dispatch,
    handleDelete,
    startDeleteProgress,
    stopDeleteProgress,
    cardData,
  ]);
  const getApprove = useCallback(async () => {
    try {
      console.log("data Resign", data, data?.token_id);

      // First check if the marketplace already owns the NFT
      const owner = await contactInstance()
        .methods.ownerOf(data?.token_id)
        .call();
      
      // Log ownership check
      marketplaceLogger.logOwnershipCheck(data?.token_id, {
        currentOwner: owner,
        marketplaceAddress: CUSTOM_TOKEN_ADDRESS_721_MARKET_PLACE,
        isMarketplaceOwner: owner.toLowerCase() === CUSTOM_TOKEN_ADDRESS_721_MARKET_PLACE.toLowerCase(),
        saleStatus: data?.status,
        saleId: data?.saleId
      });
      
      // If marketplace already owns the NFT, no need to approve
      if (owner.toLowerCase() === CUSTOM_TOKEN_ADDRESS_721_MARKET_PLACE.toLowerCase()) {
        console.log("Marketplace already owns this NFT, no need to approve");
        setIsApprove(false);
        
        // Check if the listing has expired
        const now = new Date().getTime();
        const end = new Date(data?.endTime * 1000).getTime();
        if (end < now && data?.endTime) {
          setIsExpired(true);
        }
        
        return;
      }

      const getApproval = await contactInstance()
        .methods.getApproved(data?.token_id)
        .call({ from: address });

      console.log(getApproval, address, data, "burn for get approve");
      if (
        getApproval !== address &&
        getApproval !== CUSTOM_TOKEN_ADDRESS_721_MARKET_PLACE
      ) {
        setIsApprove(true);
      }
    } catch (err) {
      console.error(err);
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
  }, [address, data]);
  // Check if the current user is the seller of the NFT
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

  useEffect(() => {
    console.log("data access", data);
  }, [data]);
  const handleApprove = useCallback(async () => {
    try {
      dispatch(setLoading());

      // Log detailed pre-approval state
      console.log("Starting approval process for token:", data?.token_id);
      console.log("User address:", address);
      console.log("Marketplace address:", CUSTOM_TOKEN_ADDRESS_721_MARKET_PLACE);

      // Check ownership first
      const owner = await contactInstance()
        .methods.ownerOf(data?.token_id)
        .call();
      
      console.log("Current token owner:", owner);
      
      // If marketplace already owns the NFT, skip approval
      if (owner.toLowerCase() === CUSTOM_TOKEN_ADDRESS_721_MARKET_PLACE.toLowerCase()) {
        console.log("Marketplace already owns this NFT, skipping approval");
        
        // Log this situation
        await marketplaceLogger.logEvent('APPROVAL_SKIPPED', {
          tokenId: data?.token_id,
          reason: 'MARKETPLACE_ALREADY_OWNER',
          marketplaceAddress: CUSTOM_TOKEN_ADDRESS_721_MARKET_PLACE,
          userAddress: address,
          owner: owner
        });
        
        window.location.reload();
        return;
      }

      // Check current approval status
      const currentApproval = await contactInstance()
        .methods.getApproved(data?.token_id)
        .call();
      
      console.log("Current approval status:", currentApproval);

      // Log approval attempt with extended details
      await marketplaceLogger.logApprovalAttempt(
        data?.token_id,
        CUSTOM_TOKEN_ADDRESS_721_MARKET_PLACE,
        { 
          userAddress: address,
          owner: owner,
          currentApproval: currentApproval,
          timestamp: new Date().toISOString()
        }
      );

      const Contract = contactInstance();

      console.log("Sending approval transaction...");
      const approve = await Contract.methods
        .approve(CUSTOM_TOKEN_ADDRESS_721_MARKET_PLACE, data?.token_id)
        .send({ from: address });

      console.log("Approval transaction result:", approve);
      console.log("Transaction hash:", approve.transactionHash);
      
      // Log approval success with extended details
      await marketplaceLogger.logApprovalResult(
        data?.token_id,
        true,
        { 
          transactionHash: approve.transactionHash,
          marketplaceAddress: CUSTOM_TOKEN_ADDRESS_721_MARKET_PLACE,
          gasUsed: approve.gasUsed,
          blockNumber: approve.blockNumber,
          events: JSON.stringify(approve.events),
          timestamp: new Date().toISOString()
        }
      );
      
      // Verify approval was successful
      const verifyApproval = await contactInstance()
        .methods.getApproved(data?.token_id)
        .call();
      
      console.log("Verification - approved address after transaction:", verifyApproval);
      
      if (verifyApproval.toLowerCase() !== CUSTOM_TOKEN_ADDRESS_721_MARKET_PLACE.toLowerCase()) {
        console.warn("Approval verification failed - approved address doesn't match marketplace");
        await marketplaceLogger.logEvent('APPROVAL_VERIFICATION_FAILED', {
          tokenId: data?.token_id,
          expectedApproval: CUSTOM_TOKEN_ADDRESS_721_MARKET_PLACE,
          actualApproval: verifyApproval
        });
      }
      
      if (approve) {
        window.location.reload();
      }
    } catch (err) {
      console.error("Approval error:", err);
      
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
      
      console.error("Detailed error information:", errorDetails);
      
      // Log approval failure with extended details
      await marketplaceLogger.logApprovalResult(
        data?.token_id,
        false,
        { 
          error: errorDetails,
          timestamp: new Date().toISOString()
        }
      );
      
      // Log transaction error with extended details
      await marketplaceLogger.logTransactionError(
        data?.token_id,
        err,
        'APPROVAL',
        { 
          marketplaceAddress: CUSTOM_TOKEN_ADDRESS_721_MARKET_PLACE,
          userAddress: address,
          errorDetails: errorDetails,
          timestamp: new Date().toISOString()
        }
      );
      
      // Also log to error logs with extended details
      errorLogger.logError(err, {
        type: 'MARKETPLACE_TRANSACTION_ERROR',
        subType: 'APPROVAL',
        context: {
          tokenId: data?.token_id,
          marketplaceAddress: CUSTOM_TOKEN_ADDRESS_721_MARKET_PLACE,
          userAddress: address,
          errorDetails: errorDetails,
          timestamp: new Date().toISOString()
        }
      });
      
      toast("Failed to Approve! " + (err.message || "Unknown error"), {
        type: "error",
      });
      dispatch(unSetLoading());
    } finally {
      dispatch(unSetLoading());
    }
  }, [address, data, dispatch]);

    // Log final button visibility decision with enhanced details
    useEffect(() => {
      // Calculate time details for debugging
      const now = new Date().getTime();
      const endTimeMs = data?.endTime ? new Date(data.endTime * 1000).getTime() : null;
      const timeUntilExpiry = endTimeMs ? endTimeMs - now : null;
      const isExpiredByTime = endTimeMs ? now > endTimeMs : false;
      
      // Get URL parameters for debugging
      const urlParams = new URLSearchParams(window.location.search);
      const ownerParam = urlParams.get('owner');
      
      // Enhanced address comparison
      const userAddressLower = address ? address.toLowerCase() : null;
      const sellerAddressLower = data?.seller ? data?.seller.toLowerCase() : null;
      const addressesMatch = userAddressLower && sellerAddressLower ? 
        userAddressLower === sellerAddressLower : false;
      
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
      
      // Also log to console in development for immediate feedback
      if (process.env.NODE_ENV !== 'production') {
        console.log('Retrieve Button Visibility Check:', {
          tokenId: data?.token_id,
          isLoggedInProfile,
          isExpired,
          isUserSeller,
          shouldShow: isLoggedInProfile && isExpired && isUserSeller,
          userAddress: address,
          sellerAddress: data?.seller,
          endTime: data?.endTime ? new Date(data.endTime * 1000).toISOString() : null,
          currentUrl: window.location.href,
          ownerParam
        });
      }
    }, [isLoggedInProfile, isExpired, isApprove, isUserSeller, data?.token_id, data?.endTime, data?.saleId, data?.status, data?.seller, address, linkable]);

  useEffect(() => {
    getApprove();
  }, [getApprove]);

  return (
    <StyledPostCard>
      <div className="post-image-wrapper">
        <ImageComponent
          src={cardData?.image}
          alt={cardData?.name}
          aspectRatio={1.18}
        />

        <img
          alt={cardData?.platform_type}
          className="social-image"
          src={`/img/${cardData?.platform_type?.toLowerCase()}.svg`}
        />

        {linkable && (
          <Link
            className="post-link"
            to={`${Routes.nftDetail}/${data._id}`}
          ></Link>
        )}
      </div>
      <div className="details-container">
        <div className="info-wrapper">
          <p className="name">{cardData?.name}</p>
          <p className="desc">
            <EllipsedText text={cardData?.description} maxLength={30} />
          </p>
        </div>

        {/* <span className="icon-wrap">
          <MenuKebabIcon />
        </span> */}
        {/* <CustomDropDown
          toggleElement={
            <div className="menu-icon-wrap">
              <MenuKebabIcon />
            </div>
          }
          menuItems={[
            {
              label: "Share NFT",
              icon: ShareIcon,
              // action: shareClickHandler,
            },
            {
              label: "Delete NFT",
              icon: ShareIcon,
              // action: shareClickHandler,
            },
          ]}
        /> */}
        {isApprove && (
          <CustomButton
            onClick={() => handleApprove()}
            color="gradient"
            className="follow-button"
            $fontSize="0.8rem"
          >
            Approve Marketplace
          </CustomButton>
        )}
      </div>
      <div className="actions-container">
        <hr style={{ color: "gray" }} />

        <ShareButton
          text={cardData.name}
          longText={cardData.description}
          link={`${window?.location?.origin}${Routes.nftDetail}/${cardData._id}`}
        />

        <LikeButton
          isLiked={cardData?.liked}
          count={cardData?.likedBy?.length}
          onClick={likeAndDislikeAsset}
          loading={isLikeUpdating}
          disabled={isLikeUpdating}
        />

        {isLoggedInProfile && (
          <DeleteButton
            loading={isDeleteInProgress}
            onClick={deleteClickHandler}
          />
        )}

        {/* {isLoggedInProfile && !isApprove && (
          <div className="three-dot" onClick={() => setShowModal(true)}>
            <ThreeDotIcon />
          </div>
        )} */}
        {isLoggedInProfile && !isApprove && !isExpired && (
          <CustomButton
            color="gradient"
            className="follow-button"
            $fontSize="0.8rem"
            onClick={() => setShowModal(true)}
          >
            List / Sell
          </CustomButton>
        )}
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
        {isLoggedInProfile && isEditable && (
          <div
            className="edit-icon"
            style={{
              top: !isApprove ? "-25px" : "-78px",
            }}
            onClick={() => {
              setIsEditPrice(true);
              setShowModal(true);
            }}
          >
            <EditIcon className="icon" />
          </div>
        )}
      </div>
      <ModalForSellNFT
        name={cardData?.name}
        token_id={data.token_id}
        showModal={showModal}
        isEditPrice={isEditPrice}
        handleClose={handleClose}
        data={data}
      />
    </StyledPostCard>
  );
}
/*  */
export default PostCard;

PostCard.propTypes = {
  data: PropTypes.object,
  linkable: PropTypes.bool,
  onDelete: PropTypes.func,
};
