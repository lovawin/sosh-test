/**
 * Marketplace Routes
 * 
 * @description Routes for handling marketplace operations
 */

const express = require('express');
const router = express.Router();
const { marketplaceLogger, errorLogger } = require('../logging');
const Web3 = require('web3');
const appconfig = require('../../config/appconfig');

// Initialize Web3 with the provider
const web3 = new Web3(new Web3.providers.HttpProvider(appconfig.INFURA_URL));

// Load marketplace ABI
let marketplaceABI;
try {
  marketplaceABI = require('../ABI/contract.sale.abi.json');
} catch (error) {
  console.error('Failed to load marketplace ABI:', error);
  marketplaceABI = [];
}

// Create contract instance
const marketplaceContract = new web3.eth.Contract(
  marketplaceABI,
  appconfig.MARKETPLACE_PROXY_ADDRESS
);

/**
 * @route GET /api/V1/marketplace/sale-info/:tokenId
 * @description Get sale information for a specific token ID
 */
router.get('/sale-info/:tokenId', async (req, res) => {
  const tokenId = req.params.tokenId;
  const userId = req.user?.id;
  
  // Log the request
  await marketplaceLogger.logEvent('SALE_INFO_REQUEST', {
    tokenId,
    userId,
    timestamp: new Date().toISOString(),
    ip: req.ip,
    headers: {
      'user-agent': req.get('user-agent'),
      'x-forwarded-for': req.get('x-forwarded-for')
    }
  });
  
  try {
    // Log the blockchain query attempt
    await marketplaceLogger.logEvent('BLOCKCHAIN_QUERY', {
      type: 'GET_SALE_COUNT',
      tokenId,
      userId,
      timestamp: new Date().toISOString()
    });
    
    // Get the total number of sales
    const saleCount = await marketplaceContract.methods.saleIdTracker().call();
    
    // Initialize sale data
    let saleData = null;
    
    // Loop through sales to find the one for this token
    for (let i = 1; i <= saleCount; i++) {
      try {
        // Log each sale check
        await marketplaceLogger.logEvent('BLOCKCHAIN_QUERY', {
          type: 'CHECK_SALE',
          saleId: i,
          tokenId,
          userId,
          timestamp: new Date().toISOString()
        });
        
        const sale = await marketplaceContract.methods.reserveSale(i).call();
        
        // Check if this sale is for our token - convert both to strings for comparison
        if (sale.tokenId.toString() === tokenId.toString()) {
          saleData = {
            saleId: i,
            tokenId: sale.tokenId,
            seller: sale.seller,
            askPrice: web3.utils.fromWei(sale.askPrice, 'ether'),
            startTime: sale.startTime,
            endTime: sale.endTime,
            status: sale.status,
            saleType: sale.saleType
          };
          
          // Log the found sale
          await marketplaceLogger.logEvent('SALE_INFO_RESULT', {
            found: true,
            saleId: i,
            tokenId,
            saleData,
            userId,
            timestamp: new Date().toISOString()
          });
          
          break;
        }
      } catch (error) {
        // Log error checking this sale
        await marketplaceLogger.logEvent('SALE_CHECK_ERROR', {
          saleId: i,
          tokenId,
          error: {
            message: error.message,
            code: error.code,
            name: error.name
          },
          userId,
          timestamp: new Date().toISOString()
        });
        
        // Also log to error logs
        await errorLogger.logError(error, {
          context: {
            operation: 'CHECK_SALE',
            saleId: i,
            tokenId,
            userId
          }
        });
        
        console.error(`Error checking sale ${i}:`, error);
        // Continue to next sale
      }
    }
    
    if (!saleData) {
      // Log that no sale was found
      await marketplaceLogger.logEvent('SALE_INFO_RESULT', {
        found: false,
        tokenId,
        userId,
        timestamp: new Date().toISOString()
      });
      
        // Try to get the owner of the token to check if it's owned by the marketplace
        try {
          // Log the token address for debugging
          console.log("NFT Contract Address:", appconfig.tokenAddress);
          
          // Ensure the token address is set
          if (!appconfig.tokenAddress) {
            throw new Error("NFT contract address is not set in appconfig");
          }
          
          const nftContract = new web3.eth.Contract(
            require('../ABI/contract.nft.json'),
            appconfig.tokenAddress
          );
          
          const owner = await nftContract.methods.ownerOf(tokenId).call();
          const isMarketplaceOwner = owner.toLowerCase() === appconfig.MARKETPLACE_PROXY_ADDRESS.toLowerCase();
        
        await marketplaceLogger.logEvent('TOKEN_OWNERSHIP_CHECK', {
          tokenId,
          currentOwner: owner,
          marketplaceAddress: appconfig.MARKETPLACE_PROXY_ADDRESS,
          isMarketplaceOwner,
          timestamp: new Date().toISOString()
        });
        
        // If the marketplace owns the token but no sale was found, it might be an expired listing
        if (isMarketplaceOwner) {
          // We need to find the original seller by checking past events
          try {
            // Get past transfer events to find who transferred the NFT to the marketplace
            const pastEvents = await marketplaceContract.getPastEvents('SaleCreated', {
              filter: { tokenId: tokenId },
              fromBlock: 0,
              toBlock: 'latest'
            });
            
            // Sort events by block number in descending order to get the most recent one
            pastEvents.sort((a, b) => b.blockNumber - a.blockNumber);
            
            let originalSeller = null;
            let saleId = null;
            let endTime = Math.floor(Date.now() / 1000) - 1; // Default to a past time
            
            if (pastEvents.length > 0) {
              // Get the most recent SaleCreated event
              const latestEvent = pastEvents[0];
              originalSeller = latestEvent.returnValues.seller;
              saleId = latestEvent.returnValues.saleId;
              
              // Try to get the sale details to get the end time
              try {
                const saleDetails = await marketplaceContract.methods.reserveSale(saleId).call();
                endTime = saleDetails.endTime;
              } catch (saleError) {
                console.error(`Error getting sale details for saleId ${saleId}:`, saleError);
              }
              
              await marketplaceLogger.logEvent('FOUND_ORIGINAL_SELLER', {
                tokenId,
                originalSeller,
                saleId,
                endTime,
                timestamp: new Date().toISOString()
              });
            } else {
              // If no events found, try another approach - check transfer events from NFT contract
              const nftContract = new web3.eth.Contract(
                require('../ABI/contract.nft.json'),
                appconfig.tokenAddress
              );
              
              const transferEvents = await nftContract.getPastEvents('Transfer', {
                filter: { tokenId: tokenId, to: appconfig.MARKETPLACE_PROXY_ADDRESS },
                fromBlock: 0,
                toBlock: 'latest'
              });
              
              transferEvents.sort((a, b) => b.blockNumber - a.blockNumber);
              
              if (transferEvents.length > 0) {
                // The 'from' address in the most recent Transfer event to the marketplace is likely the seller
                originalSeller = transferEvents[0].returnValues.from;
                
                await marketplaceLogger.logEvent('FOUND_SELLER_FROM_TRANSFER', {
                  tokenId,
                  originalSeller,
                  timestamp: new Date().toISOString()
                });
              }
            }
            
            return res.status(200).json({
              status: 'success',
              data: {
                tokenId: tokenId.toString(),
                isOwnedByMarketplace: true,
                currentOwner: owner,
                // Set these fields to help the frontend determine if it's an expired listing
                endTime: endTime,
                status: '1', // Open status
                seller: originalSeller,
                saleId: saleId
              }
            });
          } catch (eventError) {
            console.error('Error getting past events:', eventError);
            await errorLogger.logError(eventError, {
              context: {
                operation: 'GET_PAST_EVENTS',
                tokenId,
                userId
              }
            });
            
            // Even if we couldn't get the seller, still return what we know
            return res.status(200).json({
              status: 'success',
              data: {
                tokenId: tokenId.toString(),
                isOwnedByMarketplace: true,
                currentOwner: owner,
                // Set these fields to help the frontend determine if it's an expired listing
                endTime: Math.floor(Date.now() / 1000) - 1, // Set to a past time
                status: '1', // Open status
                seller: null // We couldn't determine the seller
              }
            });
          }
        }
      } catch (error) {
        console.error('Error checking token ownership:', error);
        await errorLogger.logError(error, {
          context: {
            operation: 'CHECK_TOKEN_OWNERSHIP',
            tokenId,
            userId
          }
        });
      }
      
      return res.status(404).json({
        status: 'error',
        message: 'No sale found for this token ID',
        tokenId
      });
    }
    
    // Check if the NFT is owned by the marketplace contract
    try {
      // Ensure the token address is set
      if (!appconfig.tokenAddress) {
        throw new Error("NFT contract address is not set in appconfig");
      }
      
      const nftContract = new web3.eth.Contract(
        require('../ABI/contract.nft.json'),
        appconfig.tokenAddress
      );
      
      const owner = await nftContract.methods.ownerOf(tokenId).call();
      
      // Force case-insensitive comparison to ensure accurate matching
      const marketplaceAddress = appconfig.MARKETPLACE_PROXY_ADDRESS.toLowerCase();
      const ownerAddress = owner.toLowerCase();
      const isMarketplaceOwner = ownerAddress === marketplaceAddress;
      
      await marketplaceLogger.logEvent('TOKEN_OWNERSHIP_CHECK', {
        tokenId,
        currentOwner: owner,
        marketplaceAddress: appconfig.MARKETPLACE_PROXY_ADDRESS,
        ownerAddressLower: ownerAddress,
        marketplaceAddressLower: marketplaceAddress,
        isMarketplaceOwner,
        timestamp: new Date().toISOString()
      });
      
      // Add the isOwnedByMarketplace field to the sale data
      saleData.isOwnedByMarketplace = isMarketplaceOwner;
      saleData.currentOwner = owner; // Include the current owner address in the response
      
      // Log detailed ownership information to help diagnose retrieval button issues
      await marketplaceLogger.logOwnershipCheck(userId, tokenId, {
        currentOwner: owner,
        marketplaceAddress: appconfig.MARKETPLACE_PROXY_ADDRESS,
        ownerAddressLower: ownerAddress,
        marketplaceAddressLower: marketplaceAddress,
        isMarketplaceOwner,
        saleId: saleData.saleId,
        saleStatus: saleData.status,
        endTime: saleData.endTime,
        seller: saleData.seller,
        currentOwnerFieldSet: !!saleData.currentOwner,
        timestamp: new Date().toISOString()
      });
      
      // Debug logging to verify the currentOwner field is being set
      console.log('DEBUG - Setting currentOwner field:', {
        tokenId,
        owner,
        ownerAddressLower: ownerAddress,
        marketplaceAddressLower: marketplaceAddress,
        isMarketplaceOwner,
        saleDataAfterSet: JSON.stringify(saleData)
      });
      
      // Double-check the ownership and log the result
      if (isMarketplaceOwner) {
        console.log(`DEBUG - NFT ${tokenId} is owned by the marketplace contract`);
      } else {
        console.log(`DEBUG - NFT ${tokenId} is NOT owned by the marketplace contract`);
        console.log(`DEBUG - Current owner: ${owner}`);
        console.log(`DEBUG - Marketplace address: ${appconfig.MARKETPLACE_PROXY_ADDRESS}`);
      }
      
      // Log the ownership check result
      await marketplaceLogger.logEvent('OWNERSHIP_CHECK_RESULT', {
        tokenId,
        currentOwner: owner,
        isMarketplaceOwner,
        saleId: saleData.saleId,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error checking token ownership:', error);
      await errorLogger.logError(error, {
        context: {
          operation: 'CHECK_TOKEN_OWNERSHIP',
          tokenId,
          userId
        }
      });
      
      // Set isOwnedByMarketplace to false if there was an error
      saleData.isOwnedByMarketplace = false;
      saleData.currentOwner = null; // Set currentOwner to null if there was an error
      
      // Log the error in ownership check
      await marketplaceLogger.logEvent('OWNERSHIP_CHECK_ERROR', {
        tokenId,
        userId,
        error: {
          message: error.message,
          code: error.code,
          name: error.name
        },
        saleId: saleData.saleId,
        currentOwnerFieldSet: !!saleData.currentOwner,
        timestamp: new Date().toISOString()
      });
    }
    
    // Log the final response data before sending
    console.log('DEBUG - Final response data:', JSON.stringify(saleData, null, 2));
    
    // Log detailed data property validation for retrieval button
    await marketplaceLogger.logDataPropertyValidation(userId, tokenId, {
      isOwnedByMarketplace: saleData.isOwnedByMarketplace,
      currentOwner: saleData.currentOwner,
      currentOwnerExists: !!saleData.currentOwner,
      saleId: saleData.saleId,
      status: saleData.status,
      endTime: saleData.endTime,
      seller: saleData.seller,
      timestamp: new Date().toISOString()
    });
    
    // Log the response to the marketplace logger
    await marketplaceLogger.logEvent('SALE_INFO_RESPONSE', {
      tokenId,
      isOwnedByMarketplace: saleData.isOwnedByMarketplace,
      currentOwner: saleData.currentOwner,
      currentOwnerExists: !!saleData.currentOwner,
      saleId: saleData.saleId,
      timestamp: new Date().toISOString()
    });
    
    // Return the sale data
    res.status(200).json({
      status: 'success',
      data: saleData
    });
  } catch (error) {
    // Log the error
    await marketplaceLogger.logEvent('SALE_INFO_ERROR', {
      tokenId,
      error: {
        message: error.message,
        code: error.code,
        name: error.name,
        stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined
      },
      userId,
      timestamp: new Date().toISOString()
    });
    
    // Also log to error logs
    await errorLogger.logError(error, {
      context: {
        operation: 'GET_SALE_INFO',
        tokenId,
        userId,
        endpoint: '/marketplace/sale-info/' + tokenId
      }
    });
    
    console.error('Failed to get sale information:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get sale information',
      error: process.env.NODE_ENV === 'production' ? error.message : error
    });
  }
});

/**
 * @route GET /api/V1/marketplace/verify-nft/:tokenId
 * @description Verify NFT ownership and retrieval eligibility
 */
router.get('/verify-nft/:tokenId', async (req, res) => {
  const tokenId = req.params.tokenId;
  const userId = req.user?.id;
  const userAddress = req.query.address;
  
  if (!userAddress) {
    return res.status(400).json({
      status: 'error',
      message: 'User address is required',
      tokenId
    });
  }
  
  // Log the request
  await marketplaceLogger.logEvent('NFT_VERIFICATION_REQUEST', {
    tokenId,
    userId,
    userAddress,
    timestamp: new Date().toISOString(),
    ip: req.ip,
    headers: {
      'user-agent': req.get('user-agent'),
      'x-forwarded-for': req.get('x-forwarded-for')
    }
  });
  
  try {
    // Ensure the token address is set
    if (!appconfig.tokenAddress) {
      throw new Error("NFT contract address is not set in appconfig");
    }
    
    // Create NFT contract instance
    const nftContract = new web3.eth.Contract(
      require('../ABI/contract.nft.json'),
      appconfig.tokenAddress
    );
    
    // Check current owner of the NFT
    let currentOwner;
    let isMarketplaceOwner = false;
    
    try {
      currentOwner = await nftContract.methods.ownerOf(tokenId).call();
      isMarketplaceOwner = currentOwner.toLowerCase() === appconfig.MARKETPLACE_PROXY_ADDRESS.toLowerCase();
      
      // Log ownership check
      await marketplaceLogger.logEvent('NFT_OWNERSHIP_CHECK', {
        tokenId,
        currentOwner,
        marketplaceAddress: appconfig.MARKETPLACE_PROXY_ADDRESS,
        isMarketplaceOwner,
        userAddress,
        timestamp: new Date().toISOString()
      });
      
      // If the marketplace doesn't own the NFT, it's not eligible for retrieval
      if (!isMarketplaceOwner) {
        return res.status(200).json({
          status: 'success',
          data: {
            isEligibleForRetrieval: false,
            reason: 'NOT_OWNED_BY_MARKETPLACE',
            currentOwner,
            marketplaceAddress: appconfig.MARKETPLACE_PROXY_ADDRESS
          }
        });
      }
    } catch (ownerError) {
      console.error('Error checking NFT ownership:', ownerError);
      await errorLogger.logError(ownerError, {
        context: {
          operation: 'CHECK_NFT_OWNERSHIP',
          tokenId,
          userId,
          userAddress
        }
      });
      
      // Continue with verification but mark as not marketplace owner
      isMarketplaceOwner = false;
      currentOwner = null;
      
      await marketplaceLogger.logEvent('NFT_OWNERSHIP_CHECK_ERROR', {
        tokenId,
        error: {
          message: ownerError.message,
          code: ownerError.code,
          name: ownerError.name
        },
        userAddress,
        timestamp: new Date().toISOString()
      });
      
      // If we can't verify ownership, return early with an error
      return res.status(200).json({
        status: 'success',
        data: {
          isEligibleForRetrieval: false,
          reason: 'OWNERSHIP_CHECK_FAILED',
          error: ownerError.message
        }
      });
    }
    
    // Find the original seller by checking past events
    let originalSeller = null;
    let saleId = null;
    let endTime = null;
    
    try {
      // Get past transfer events to find who transferred the NFT to the marketplace
      const pastEvents = await marketplaceContract.getPastEvents('SaleCreated', {
        filter: { tokenId: tokenId },
        fromBlock: 0,
        toBlock: 'latest'
      });
      
      // Sort events by block number in descending order to get the most recent one
      pastEvents.sort((a, b) => b.blockNumber - a.blockNumber);
      
      if (pastEvents.length > 0) {
        // Get the most recent SaleCreated event
        const latestEvent = pastEvents[0];
        originalSeller = latestEvent.returnValues.seller;
        saleId = latestEvent.returnValues.saleId;
        
        // Try to get the sale details to get the end time
        try {
          const saleDetails = await marketplaceContract.methods.reserveSale(saleId).call();
          endTime = saleDetails.endTime;
          
          // Log successful retrieval of sale details
          await marketplaceLogger.logEvent('NFT_SALE_DETAILS_RETRIEVED', {
            tokenId,
            saleId,
            endTime,
            timestamp: new Date().toISOString()
          });
        } catch (saleError) {
          console.error(`Error getting sale details for saleId ${saleId}:`, saleError);
          
          // Log the error but continue with verification
          await marketplaceLogger.logEvent('NFT_SALE_DETAILS_ERROR', {
            tokenId,
            saleId,
            error: {
              message: saleError.message,
              code: saleError.code,
              name: saleError.name
            },
            timestamp: new Date().toISOString()
          });
          
          // Set a default end time in the past to allow retrieval of stuck NFTs
          endTime = Math.floor(Date.now() / 1000) - 86400; // 24 hours ago
        }
        
        await marketplaceLogger.logEvent('NFT_FOUND_ORIGINAL_SELLER', {
          tokenId,
          originalSeller,
          saleId,
          endTime,
          timestamp: new Date().toISOString()
        });
      } else {
        // If no events found, try another approach - check transfer events from NFT contract
        const transferEvents = await nftContract.getPastEvents('Transfer', {
          filter: { tokenId: tokenId, to: appconfig.MARKETPLACE_PROXY_ADDRESS },
          fromBlock: 0,
          toBlock: 'latest'
        });
        
        transferEvents.sort((a, b) => b.blockNumber - a.blockNumber);
        
        if (transferEvents.length > 0) {
          // The 'from' address in the most recent Transfer event to the marketplace is likely the seller
          originalSeller = transferEvents[0].returnValues.from;
          
          await marketplaceLogger.logEvent('NFT_FOUND_SELLER_FROM_TRANSFER', {
            tokenId,
            originalSeller,
            timestamp: new Date().toISOString()
          });
        }
      }
    } catch (eventError) {
      console.error('Error getting past events:', eventError);
      await errorLogger.logError(eventError, {
        context: {
          operation: 'GET_PAST_EVENTS_FOR_VERIFICATION',
          tokenId,
          userId,
          userAddress
        }
      });
    }
    
    // Check if the user is the original seller
    const isOriginalSeller = originalSeller && userAddress.toLowerCase() === originalSeller.toLowerCase();
    
    // Check if the sale has expired
    const now = Math.floor(Date.now() / 1000);
    const hasExpired = endTime && now > endTime;
    
    // Log detailed verification data
    await marketplaceLogger.logEvent('NFT_VERIFICATION_DETAILS', {
      tokenId,
      userAddress,
      originalSeller,
      isOriginalSeller,
      endTime,
      now,
      hasExpired,
      isMarketplaceOwner,
      timestamp: new Date().toISOString()
    });
    
    // Log the verification result
    await marketplaceLogger.logEvent('NFT_VERIFICATION_RESULT', {
      tokenId,
      isMarketplaceOwner,
      originalSeller,
      userAddress,
      isOriginalSeller,
      endTime,
      currentTime: now,
      hasExpired,
      isEligibleForRetrieval: isMarketplaceOwner && isOriginalSeller && hasExpired,
      timestamp: new Date().toISOString()
    });
    
    // Return the verification result
    return res.status(200).json({
      status: 'success',
      data: {
        isEligibleForRetrieval: isMarketplaceOwner && isOriginalSeller && hasExpired,
        isMarketplaceOwner,
        isOriginalSeller,
        hasExpired,
        currentOwner,
        originalSeller,
        saleId,
        endTime
      }
    });
  } catch (error) {
    console.error('Error verifying NFT eligibility:', error);
    
    // Log the error
    await marketplaceLogger.logEvent('NFT_VERIFICATION_ERROR', {
      tokenId,
      userAddress,
      error: {
        message: error.message,
        code: error.code,
        name: error.name,
        stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined
      },
      timestamp: new Date().toISOString()
    });
    
    // Also log to error logs
    await errorLogger.logError(error, {
      context: {
        operation: 'VERIFY_NFT_ELIGIBILITY',
        tokenId,
        userId,
        userAddress,
        endpoint: '/marketplace/verify-nft/' + tokenId
      }
    });
    
    // Try to provide a meaningful response even in case of error
    // This helps the frontend handle the error gracefully
    return res.status(200).json({
      status: 'success',
      data: {
        isEligibleForRetrieval: false,
        reason: 'VERIFICATION_ERROR',
        error: error.message,
        // Include any partial data we might have gathered before the error
        isMarketplaceOwner: typeof isMarketplaceOwner !== 'undefined' ? isMarketplaceOwner : false,
        isOriginalSeller: typeof isOriginalSeller !== 'undefined' ? isOriginalSeller : false,
        hasExpired: typeof hasExpired !== 'undefined' ? hasExpired : false,
        currentOwner: typeof currentOwner !== 'undefined' ? currentOwner : null,
        originalSeller: typeof originalSeller !== 'undefined' ? originalSeller : null
      }
    });
  }
});

module.exports = router;
