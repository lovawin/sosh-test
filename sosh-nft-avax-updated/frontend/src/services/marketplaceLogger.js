/**
 * Frontend Marketplace Logger Service
 * 
 * @description Handles marketplace event logging from frontend to backend logging system
 * 
 * This logger focuses on UI events and user interactions rather than blockchain state.
 * For blockchain state verification, the backend API endpoints should be used.
 */

import getAxiosInst from "./axios";
import errorLogger from "./errorLogger";

const API_SUB_ENDPOINT = "/log/marketplace";
const API_LOG_ENDPOINT = "/log/api";
const AUTH_LOG_ENDPOINT = "/log/auth";

class MarketplaceLogger {
constructor() {
    this.axios = getAxiosInst({ withAuth: true });
  }

  /**
   * Log a marketplace event to the backend
   * @param {string} eventType - Type of marketplace event
   * @param {Object} eventData - Event data
   */
  async logEvent(eventType, eventData = {}) {
    try {
      const logData = {
        timestamp: new Date().toISOString(),
        level: 'INFO',
        type: eventType,
        source: 'frontend',
        ...eventData,
        context: {
          url: window.location.href,
          userAgent: navigator.userAgent,
          ip: null, // Will be filled by backend
          headers: null, // Will be filled by backend
          ...eventData.context
        }
      };

      // Clean up undefined values
      Object.keys(logData).forEach(key => 
        logData[key] === undefined && delete logData[key]
      );

      // Send to backend logging endpoint
      await this.axios.post(API_SUB_ENDPOINT, logData);
      
      // Log to console in development
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[MARKETPLACE] ${eventType}:`, eventData);
      }
    } catch (loggingError) {
      // Fallback to console if logging fails
      console.error('Failed to log marketplace event:', loggingError);
      console.info('Original event:', eventType, eventData);
      
      // Log the error through the error logger
      errorLogger.logError(loggingError, {
        type: 'MARKETPLACE_LOGGING_ERROR',
        context: {
          eventType,
          eventData
        }
      });
    }
  }

  /**
   * Log an API request to both marketplace_logs and api_logs collections
   * @param {string} endpoint - API endpoint being called
   * @param {string} method - HTTP method (GET, POST, etc.)
   * @param {Object} headers - Request headers
   * @param {Object} params - Request parameters or body
   * @param {string} tokenId - NFT token ID (if applicable)
   * @param {Object} details - Additional details
   */
  async logApiRequest(endpoint, method, headers = {}, params = {}, tokenId = null, details = {}) {
    try {
      // Create log data for marketplace logs
      const logData = {
        timestamp: new Date().toISOString(),
        level: 'INFO',
        type: 'API_REQUEST',
        source: 'frontend',
        endpoint,
        method,
        tokenId,
        // Mask authorization header if present
        headers: headers ? {
          ...headers,
          authorization: headers.authorization ? '********' : undefined
        } : null,
        params,
        ...details,
        context: {
          url: window.location.href,
          userAgent: navigator.userAgent,
          ...details.context
        }
      };

      // Clean up undefined values
      Object.keys(logData).forEach(key => 
        logData[key] === undefined && delete logData[key]
      );

      // Send to marketplace logging endpoint
      await this.axios.post(API_SUB_ENDPOINT, logData);
      
      // Also send to API logging endpoint
      try {
        await this.axios.post(API_LOG_ENDPOINT, {
          ...logData,
          source: 'marketplace_frontend'
        });
      } catch (apiLogError) {
        console.error('Failed to log to API logs:', apiLogError);
      }
      
      // Log to console in development
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[API REQUEST] ${method} ${endpoint}:`, {
          tokenId,
          params: JSON.stringify(params).substring(0, 200) + (JSON.stringify(params).length > 200 ? '...' : '')
        });
      }
    } catch (loggingError) {
      // Fallback to console if logging fails
      console.error('Failed to log API request:', loggingError);
      
      // Log the error through the error logger
      errorLogger.logError(loggingError, {
        type: 'API_REQUEST_LOGGING_ERROR',
        context: {
          endpoint,
          method,
          tokenId
        }
      });
    }
  }

  /**
   * Log an API response to both marketplace_logs and api_logs collections
   * @param {string} endpoint - API endpoint that was called
   * @param {number} status - HTTP status code
   * @param {Object} responseData - Response data
   * @param {Object} responseHeaders - Response headers
   * @param {string} tokenId - NFT token ID (if applicable)
   * @param {number} duration - Request duration in milliseconds
   * @param {Object} details - Additional details
   */
  async logApiResponse(endpoint, status, responseData = {}, responseHeaders = {}, tokenId = null, duration = null, details = {}) {
    try {
      // Create log data for marketplace logs
      const logData = {
        timestamp: new Date().toISOString(),
        level: status >= 400 ? 'ERROR' : 'INFO',
        type: 'API_RESPONSE',
        source: 'frontend',
        endpoint,
        status,
        tokenId,
        duration,
        // Include a safe version of the response data (avoid logging sensitive info)
        responseData: responseData ? {
          status: responseData.status,
          message: responseData.message,
          hasData: !!responseData.data,
          dataType: responseData.data ? typeof responseData.data : null,
          isArray: Array.isArray(responseData.data)
        } : null,
        responseHeaders,
        ...details,
        context: {
          url: window.location.href,
          userAgent: navigator.userAgent,
          ...details.context
        }
      };

      // Clean up undefined values
      Object.keys(logData).forEach(key => 
        logData[key] === undefined && delete logData[key]
      );

      // Send to marketplace logging endpoint
      await this.axios.post(API_SUB_ENDPOINT, logData);
      
      // Also send to API logging endpoint
      try {
        await this.axios.post(API_LOG_ENDPOINT, {
          ...logData,
          source: 'marketplace_frontend'
        });
      } catch (apiLogError) {
        console.error('Failed to log to API logs:', apiLogError);
      }
      
      // Log to console in development
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[API RESPONSE] ${endpoint} (${status}):`, {
          tokenId,
          duration,
          responseData: responseData ? {
            status: responseData.status,
            message: responseData.message
          } : null
        });
      }
    } catch (loggingError) {
      // Fallback to console if logging fails
      console.error('Failed to log API response:', loggingError);
      
      // Log the error through the error logger
      errorLogger.logError(loggingError, {
        type: 'API_RESPONSE_LOGGING_ERROR',
        context: {
          endpoint,
          status,
          tokenId
        }
      });
    }
  }

  /**
   * Log authentication status to both marketplace_logs and auth_logs collections
   * @param {string} tokenId - NFT token ID (if applicable)
   * @param {boolean} hasToken - Whether the user has an authentication token
   * @param {string} tokenStatus - Token status (valid, invalid, expired, etc.)
   * @param {Object} details - Additional details
   */
  async logAuthStatus(tokenId = null, hasToken = false, tokenStatus = null, details = {}) {
    try {
      // Create log data for marketplace logs
      const logData = {
        timestamp: new Date().toISOString(),
        level: hasToken ? 'INFO' : 'WARN',
        type: 'AUTH_STATUS',
        source: 'frontend',
        tokenId,
        hasToken,
        tokenStatus,
        ...details,
        context: {
          url: window.location.href,
          userAgent: navigator.userAgent,
          ...details.context
        }
      };

      // Clean up undefined values
      Object.keys(logData).forEach(key => 
        logData[key] === undefined && delete logData[key]
      );

      // Send to marketplace logging endpoint
      await this.axios.post(API_SUB_ENDPOINT, logData);
      
      // Also send to auth logging endpoint
      try {
        await this.axios.post(AUTH_LOG_ENDPOINT, {
          ...logData,
          source: 'marketplace_frontend'
        });
      } catch (authLogError) {
        console.error('Failed to log to auth logs:', authLogError);
      }
      
      // Log to console in development
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[AUTH STATUS] TokenID ${tokenId}:`, {
          hasToken,
          tokenStatus
        });
      }
    } catch (loggingError) {
      // Fallback to console if logging fails
      console.error('Failed to log auth status:', loggingError);
      
      // Log the error through the error logger
      errorLogger.logError(loggingError, {
        type: 'AUTH_STATUS_LOGGING_ERROR',
        context: {
          tokenId,
          hasToken,
          tokenStatus
        }
      });
    }
  }

  /**
   * Log detailed information about the current browser environment
   * @returns {Object} Environment information
   */
  getEnvironmentInfo() {
    const env = {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      vendor: navigator.vendor,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
      url: window.location.href,
      referrer: document.referrer,
      timestamp: new Date().toISOString()
    };
    
    // Try to get network information if available
    if (navigator.connection) {
      env.connection = {
        effectiveType: navigator.connection.effectiveType,
        downlink: navigator.connection.downlink,
        rtt: navigator.connection.rtt,
        saveData: navigator.connection.saveData
      };
    }
    
    return env;
  }

  /**
   * Log an NFT listing attempt with enhanced details
   * @param {string} tokenId - NFT token ID
   * @param {Object} details - Additional details
   */
  async logListingAttempt(tokenId, details = {}) {
    const environmentInfo = this.getEnvironmentInfo();
    await this.logEvent('LISTING_ATTEMPT', {
      tokenId,
      environment: environmentInfo,
      ...details,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Log an NFT approval attempt with enhanced details
   * @param {string} tokenId - NFT token ID
   * @param {string} marketplaceAddress - Marketplace contract address
   * @param {Object} details - Additional details
   */
  async logApprovalAttempt(tokenId, marketplaceAddress, details = {}) {
    const environmentInfo = this.getEnvironmentInfo();
    await this.logEvent('APPROVAL_ATTEMPT', {
      tokenId,
      marketplaceAddress,
      environment: environmentInfo,
      ...details,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Log an NFT approval result with enhanced details
   * @param {string} tokenId - NFT token ID
   * @param {boolean} success - Whether the approval was successful
   * @param {Object} details - Additional details
   */
  async logApprovalResult(tokenId, success, details = {}) {
    await this.logEvent('APPROVAL_RESULT', {
      timestamp: new Date().toISOString(),
      level: success ? 'INFO' : 'ERROR',
      tokenId,
      success,
      ...details
    });
  }

  /**
   * Log an NFT listing result with enhanced details
   * @param {string} tokenId - NFT token ID
   * @param {string} saleId - Sale ID
   * @param {boolean} success - Whether the listing was successful
   * @param {Object} details - Additional details
   */
  async logListingResult(tokenId, saleId, success, details = {}) {
    await this.logEvent('LISTING_RESULT', {
      timestamp: new Date().toISOString(),
      level: success ? 'INFO' : 'ERROR',
      tokenId,
      saleId,
      success,
      ...details
    });
  }

  /**
   * Log an NFT purchase attempt with enhanced details
   * @param {string} saleId - Sale ID
   * @param {string} tokenId - NFT token ID
   * @param {Object} details - Additional details
   */
  async logPurchaseAttempt(saleId, tokenId, details = {}) {
    const environmentInfo = this.getEnvironmentInfo();
    await this.logEvent('PURCHASE_ATTEMPT', {
      saleId,
      tokenId,
      environment: environmentInfo,
      ...details,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Log an NFT purchase result with enhanced details
   * @param {string} saleId - Sale ID
   * @param {string} tokenId - NFT token ID
   * @param {boolean} success - Whether the purchase was successful
   * @param {Object} details - Additional details
   */
  async logPurchaseResult(saleId, tokenId, success, details = {}) {
    await this.logEvent('PURCHASE_RESULT', {
      timestamp: new Date().toISOString(),
      level: success ? 'INFO' : 'ERROR',
      saleId,
      tokenId,
      success,
      ...details
    });
  }

  /**
   * Log an NFT bid attempt with enhanced details
   * @param {string} saleId - Sale ID
   * @param {string} tokenId - NFT token ID
   * @param {string} amount - Bid amount
   * @param {Object} details - Additional details
   */
  async logBidAttempt(saleId, tokenId, amount, details = {}) {
    const environmentInfo = this.getEnvironmentInfo();
    await this.logEvent('BID_ATTEMPT', {
      saleId,
      tokenId,
      amount,
      environment: environmentInfo,
      ...details,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Log an NFT bid result with enhanced details
   * @param {string} saleId - Sale ID
   * @param {string} tokenId - NFT token ID
   * @param {string} amount - Bid amount
   * @param {boolean} success - Whether the bid was successful
   * @param {Object} details - Additional details
   */
  async logBidResult(saleId, tokenId, amount, success, details = {}) {
    await this.logEvent('BID_RESULT', {
      timestamp: new Date().toISOString(),
      level: success ? 'INFO' : 'ERROR',
      saleId,
      tokenId,
      amount,
      success,
      ...details
    });
  }

  /**
   * Log a transaction error with enhanced details
   * @param {string} tokenId - NFT token ID
   * @param {Error} error - Error object
   * @param {string} operation - Operation that failed (e.g., 'APPROVAL', 'LISTING')
   * @param {Object} details - Additional details
   */
  async logTransactionError(tokenId, error, operation, details = {}) {
    // Extract detailed error information
    const errorDetails = {
      message: error.message,
      code: error.code,
      name: error.name,
      stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined
    };
    
    // If there's transaction data in the error, capture it
    if (error.transaction) {
      errorDetails.transaction = {
        from: error.transaction.from,
        to: error.transaction.to,
        data: error.transaction.data,
        gas: error.transaction.gas
      };
    }
    
    // If there's receipt data, capture it
    if (error.receipt) {
      errorDetails.receipt = {
        status: error.receipt.status,
        gasUsed: error.receipt.gasUsed,
        blockNumber: error.receipt.blockNumber,
        transactionHash: error.receipt.transactionHash
      };
    }
    
    await this.logEvent('TRANSACTION_ERROR', {
      timestamp: new Date().toISOString(),
      level: 'ERROR',
      type: 'TRANSACTION_ERROR',
      tokenId,
      operation,
      error: errorDetails,
      ...details
    });
  }
  
  /**
   * Log validation errors during the listing process
   * @param {string} tokenId - NFT token ID
   * @param {string} validationType - Type of validation that failed
   * @param {Object} details - Additional details about the validation
   */
  async logValidationError(tokenId, validationType, details = {}) {
    await this.logEvent('VALIDATION_ERROR', {
      timestamp: new Date().toISOString(),
      level: 'WARN',
      tokenId,
      validationType,
      ...details
    });
  }
  
  /**
   * Log time configuration values used during validation
   * @param {string} tokenId - NFT token ID
   * @param {Object} timeConfig - Time configuration values
   */
  async logTimeConfig(tokenId, timeConfig) {
    await this.logEvent('TIME_CONFIG', {
      timestamp: new Date().toISOString(),
      level: 'INFO',
      tokenId,
      timeConfig
    });
  }
  
  /**
   * Log detailed information about a contract call
   * @param {string} tokenId - NFT token ID
   * @param {string} method - Contract method being called
   * @param {Object} params - Parameters passed to the method
   * @param {Object} details - Additional details
   */
  async logContractCall(tokenId, method, params, details = {}) {
    await this.logEvent('CONTRACT_CALL', {
      timestamp: new Date().toISOString(),
      level: 'INFO',
      tokenId,
      method,
      params,
      ...details
    });
  }

  /**
   * Log detailed information about the NFT retrieval button visibility decision
   * This focuses on UI state rather than blockchain state
   * @param {string} tokenId - NFT token ID
   * @param {Object} visibilityData - Data about why the button is/isn't visible
   */
  async logRetrievalButtonVisibility(tokenId, visibilityData = {}) {
    await this.logEvent('RETRIEVAL_BUTTON_VISIBILITY', {
      timestamp: new Date().toISOString(),
      level: 'INFO',
      tokenId,
      source: 'frontend_ui',
      ...visibilityData,
      uiState: {
        url: window.location.href,
        urlParams: new URLSearchParams(window.location.search).toString(),
        hasOwnerParam: new URLSearchParams(window.location.search).has('owner'),
        ownerParamValue: new URLSearchParams(window.location.search).get('owner'),
        pathname: window.location.pathname,
        componentRendered: true,
        renderTimestamp: new Date().toISOString()
      }
    });
  }

  /**
   * Log data property validation for retrieval functionality
   * This focuses on the data structure rather than blockchain state
   * @param {string} tokenId - NFT token ID
   * @param {Object} dataProperties - Properties of the data object
   */
  async logDataPropertyValidation(tokenId, dataProperties = {}) {
    await this.logEvent('DATA_PROPERTY_VALIDATION', {
      timestamp: new Date().toISOString(),
      level: 'INFO',
      tokenId,
      source: 'frontend_ui',
      ...dataProperties,
      uiContext: {
        componentName: 'postCard',
        dataAvailable: true,
        validationTimestamp: new Date().toISOString()
      }
    });
  }

  /**
   * Log ownership check results from getApprove function
   * This is a UI-focused log that doesn't rely on blockchain state
   * @param {string} tokenId - NFT token ID
   * @param {Object} ownershipData - Data about ownership check
   */
  async logOwnershipCheck(tokenId, ownershipData = {}) {
    await this.logEvent('OWNERSHIP_CHECK', {
      timestamp: new Date().toISOString(),
      level: 'INFO',
      tokenId,
      source: 'frontend_ui',
      ...ownershipData,
      uiContext: {
        componentName: 'postCard',
        checkTimestamp: new Date().toISOString()
      }
    });
  }
  
  /**
   * Log user interaction with the retrieval button
   * @param {string} tokenId - NFT token ID
   * @param {string} action - The action taken (click, hover, etc.)
   * @param {Object} details - Additional details
   */
  async logRetrievalButtonInteraction(tokenId, action, details = {}) {
    await this.logEvent('RETRIEVAL_BUTTON_INTERACTION', {
      timestamp: new Date().toISOString(),
      level: 'INFO',
      tokenId,
      action,
      source: 'frontend_ui',
      ...details,
      uiContext: {
        url: window.location.href,
        urlParams: new URLSearchParams(window.location.search).toString(),
        interactionTimestamp: new Date().toISOString()
      }
    });
  }
  
  /**
   * Log API verification request for NFT retrieval eligibility
   * @param {string} tokenId - NFT token ID
   * @param {string} endpoint - API endpoint used
   * @param {Object} details - Additional details
   */
  async logVerificationRequest(tokenId, endpoint, details = {}) {
    await this.logEvent('VERIFICATION_REQUEST', {
      timestamp: new Date().toISOString(),
      level: 'INFO',
      tokenId,
      endpoint,
      source: 'frontend_ui',
      ...details,
      uiContext: {
        url: window.location.href,
        requestTimestamp: new Date().toISOString()
      }
    });
  }
  
  /**
   * Log API verification response for NFT retrieval eligibility
   * @param {string} tokenId - NFT token ID
   * @param {boolean} isEligible - Whether the NFT is eligible for retrieval
   * @param {Object} details - Additional details
   */
  async logVerificationResponse(tokenId, isEligible, details = {}) {
    await this.logEvent('VERIFICATION_RESPONSE', {
      timestamp: new Date().toISOString(),
      level: 'INFO',
      tokenId,
      isEligible,
      source: 'frontend_ui',
      ...details,
      uiContext: {
        url: window.location.href,
        responseTimestamp: new Date().toISOString()
      }
    });
  }
}

// Export singleton instance
export default new MarketplaceLogger();
