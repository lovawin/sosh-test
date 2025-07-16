/**
 * OAuth State Store Service
 * 
 * This service provides functionality to store and retrieve OAuth state parameters
 * using Redis as a storage backend. This helps maintain state across OAuth redirects
 * and provides protection against CSRF attacks.
 */

const crypto = require('crypto');
const redisService = require('../utils/redis_service');
const logging = require('../logging');

class OAuthStateStore {
  /**
   * Generate a unique state parameter for OAuth flow
   * @returns {string} A random hex string to use as state parameter
   */
  generateState() {
    return crypto.randomBytes(32).toString('hex');
  }
  
  /**
   * Store OAuth data with state parameter as key
   * @param {string} state - The state parameter to use as key
   * @param {Object} data - The OAuth data to store (tokens, etc.)
   * @param {number} expiresIn - Time in seconds until the data expires (default: 10 minutes)
   * @returns {Promise<string>} The state parameter
   */
  async storeState(state, data, expiresIn = 600) {
    try {
      const client = await redisService.getClient();
      const key = `oauth:state:${state}`;
      const serializedData = JSON.stringify(data);
      
      logging.oauthLogger.logTokenOperation('store_state', {
        state,
        dataKeys: Object.keys(data),
        expiresIn
      });
      
      await client.set(key, serializedData, 'EX', expiresIn);
      return state;
    } catch (error) {
      logging.oauthLogger.logOAuthError(error, {
        operation: 'store_state',
        state
      });
      throw error;
    }
  }
  
  /**
   * Retrieve OAuth data using state parameter
   * @param {string} state - The state parameter used as key
   * @returns {Promise<Object|null>} The stored OAuth data or null if not found
   */
  async getState(state) {
    try {
      const client = await redisService.getClient();
      const key = `oauth:state:${state}`;
      
      logging.oauthLogger.logTokenOperation('get_state', {
        state
      });
      
      const data = await client.get(key);
      if (!data) {
        logging.oauthLogger.logOAuthError(new Error('State not found'), {
          operation: 'get_state',
          state
        });
        return null;
      }
      
      // Delete after retrieval (one-time use)
      await client.del(key);
      
      logging.oauthLogger.logTokenOperation('state_retrieved', {
        state,
        dataKeys: Object.keys(JSON.parse(data))
      });
      
      return JSON.parse(data);
    } catch (error) {
      logging.oauthLogger.logOAuthError(error, {
        operation: 'get_state',
        state
      });
      return null;
    }
  }
}

module.exports = new OAuthStateStore();
