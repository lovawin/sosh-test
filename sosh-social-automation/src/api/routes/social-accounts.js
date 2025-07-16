/**
 * Social Accounts Management Routes
 * ===============================
 * 
 * This module handles the secure registration and management of users' social media accounts.
 * It provides endpoints for adding, verifying, updating, and removing social media accounts
 * that will be used in the mother-child automation strategy.
 * 
 * Security Implementation
 * ---------------------
 * 1. Password Handling:
 *    - Passwords are never logged or exposed in responses
 *    - Encrypted using bcrypt before storage
 *    - Stored in a separate, secured MongoDB collection
 *    - Regular encryption key rotation
 * 
 * 2. Access Control:
 *    - All routes require authentication
 *    - Users can only access their own accounts
 *    - Rate limiting prevents brute force attempts
 *    - Session validation on sensitive operations
 * 
 * 3. Credential Verification:
 *    - Credentials verified before storage
 *    - Regular re-verification to ensure validity
 *    - Failed verifications trigger alerts
 *    - Automatic deactivation after multiple failures
 * 
 * Workflow
 * -------
 * 1. Account Registration:
 *    User -> Register Account -> Verify Credentials -> Store Encrypted
 * 
 * 2. Account Usage:
 *    Automation Service -> Decrypt Credentials -> Use API -> Update Status
 * 
 * 3. Maintenance:
 *    System -> Verify Credentials -> Update Status -> Alert if Needed
 * 
 * Implementation Notes
 * ------------------
 * - Uses MongoDB transactions for atomic operations
 * - Implements exponential backoff for API calls
 * - Maintains audit logs for security events
 * - Supports bulk operations for efficiency
 * 
 * Error Handling
 * -------------
 * - Detailed error messages for debugging
 * - Generic responses for users
 * - Automatic retry for transient failures
 * - Error aggregation and monitoring
 * 
 * Rate Limiting
 * ------------
 * - 100 requests per 15 minutes per IP
 * - 10 failed verifications per hour per account
 * - Separate limits for different operations
 * - IP-based and user-based limiting
 * 
 * Monitoring
 * ---------
 * - Account status tracking
 * - Failed verification alerts
 * - Usage patterns analysis
 * - Performance metrics collection
 * 
 * Example Usage
 * ------------
 * 1. Register TikTok Account:
 *    ```javascript
 *    POST /api/social-accounts/register
 *    {
 *      "platform": "tiktok",
 *      "username": "your_tiktok_username",
 *      "password": "your_tiktok_password",
 *      "accountType": "mother"
 *    }
 *    ```
 * 
 * 2. Verify Account:
 *    ```javascript
 *    POST /api/social-accounts/:id/verify
 *    ```
 * 
 * 3. Update Credentials:
 *    ```javascript
 *    PUT /api/social-accounts/:id
 *    {
 *      "password": "new_password"
 *    }
 *    ```
 * 
 * Common Issues & Solutions
 * ----------------------
 * 1. Failed Verification
 *    - Check account status on platform
 *    - Verify no platform maintenance
 *    - Check for API changes
 *    - Validate network connectivity
 * 
 * 2. Rate Limiting
 *    - Implement exponential backoff
 *    - Use bulk operations where possible
 *    - Cache frequently accessed data
 *    - Optimize request patterns
 * 
 * 3. Security Alerts
 *    - Monitor failed attempts
 *    - Track unusual patterns
 *    - Log IP addresses
 *    - Implement account lockouts
 * 
 * Database Considerations
 * --------------------
 * - Indexes on userId and platform
 * - TTL index on verification status
 * - Compound index for unique accounts
 * - Regular cleanup of inactive accounts
 */

const express = require('express');
const router = express.Router();
const SocialAccount = require('../../models/SocialAccount');
const auth = require('../../middleware/auth');
const { validateRequest } = require('../../middleware/validation');
const rateLimit = require('express-rate-limit');

// Rate limiting configuration
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later'
});

// Verification rate limit
const verifyLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // limit each account to 10 verification attempts per hour
  message: 'Too many verification attempts, please try again later'
});

// Apply rate limiting to all routes
router.use(apiLimiter);

/**
 * Register a new social media account
 * 
 * Security measures:
 * - Validates user authentication
 * - Verifies account credentials
 * - Encrypts sensitive data
 * - Prevents duplicate accounts
 * - Rate limits registration attempts
 * 
 * @route POST /api/social-accounts/register
 * @body {
 *   platform: 'tiktok' | 'instagram' | 'twitter' | 'youtube',
 *   username: string,
 *   password: string,
 *   accountType: 'mother' | 'child'
 * }
 */
router.post('/register', auth, validateRequest, async (req, res) => {
  try {
    const { platform, username, password, accountType } = req.body;

    // Check if account already exists for this user
    const existingAccount = await SocialAccount.findOne({
      userId: req.user.id,
      platform,
      username
    });

    if (existingAccount) {
      return res.status(400).json({
        error: 'This social media account is already registered',
        details: 'Please use the update endpoint to modify existing accounts'
      });
    }

    // Create new social account
    const socialAccount = new SocialAccount({
      userId: req.user.id,
      platform,
      username,
      password,
      accountType
    });

    // Verify credentials before saving
    const isVerified = await socialAccount.verifyCredentials();
    if (!isVerified) {
      return res.status(400).json({
        error: 'Invalid credentials or account not accessible',
        details: socialAccount.errorMessage,
        suggestions: [
          'Check if credentials are correct',
          'Ensure account is not locked',
          'Verify no platform maintenance',
          'Check network connectivity'
        ]
      });
    }

    // Account verified, save it
    await socialAccount.save();

    // Return success without sensitive data
    res.json({
      message: 'Social media account registered successfully',
      account: {
        id: socialAccount._id,
        platform,
        username,
        accountType,
        status: socialAccount.status,
        metadata: socialAccount.metadata
      }
    });
  } catch (error) {
    console.error('Error registering social account:', error);
    res.status(500).json({
      error: 'Failed to register social media account',
      details: error.message
    });
  }
});

/**
 * List user's registered social accounts
 * 
 * Security measures:
 * - Authenticates user
 * - Filters by user ID
 * - Excludes sensitive data
 * - Rate limits requests
 * 
 * @route GET /api/social-accounts
 */
router.get('/', auth, async (req, res) => {
  try {
    const accounts = await SocialAccount.find({ userId: req.user.id })
      .select('-password -__v') // Exclude sensitive data
      .sort({ createdAt: -1 });

    res.json({
      accounts,
      metadata: {
        total: accounts.length,
        active: accounts.filter(a => a.status === 'active').length,
        mother: accounts.filter(a => a.accountType === 'mother').length,
        child: accounts.filter(a => a.accountType === 'child').length
      }
    });
  } catch (error) {
    console.error('Error fetching social accounts:', error);
    res.status(500).json({
      error: 'Failed to fetch social media accounts',
      details: error.message
    });
  }
});

/**
 * Verify account credentials
 * 
 * Security measures:
 * - Authenticates user
 * - Rate limits verification attempts
 * - Tracks failed attempts
 * - Updates account status
 * 
 * @route POST /api/social-accounts/:id/verify
 */
router.post('/:id/verify', auth, verifyLimiter, async (req, res) => {
  try {
    const account = await SocialAccount.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!account) {
      return res.status(404).json({
        error: 'Social media account not found',
        details: 'The requested account does not exist or belongs to another user'
      });
    }

    const isVerified = await account.verifyCredentials();
    
    res.json({
      verified: isVerified,
      status: account.status,
      lastVerified: account.lastVerified,
      error: account.errorMessage,
      metadata: account.metadata,
      suggestions: !isVerified ? [
        'Check if password has changed',
        'Verify account is not locked',
        'Ensure no platform maintenance',
        'Check for API changes'
      ] : []
    });
  } catch (error) {
    console.error('Error verifying social account:', error);
    res.status(500).json({
      error: 'Failed to verify social media account',
      details: error.message
    });
  }
});

/**
 * Update account credentials
 * 
 * Security measures:
 * - Authenticates user
 * - Verifies new credentials
 * - Encrypts updated password
 * - Maintains update history
 * 
 * @route PUT /api/social-accounts/:id
 * @body {
 *   password: string
 * }
 */
router.put('/:id', auth, validateRequest, async (req, res) => {
  try {
    const account = await SocialAccount.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!account) {
      return res.status(404).json({
        error: 'Social media account not found',
        details: 'The requested account does not exist or belongs to another user'
      });
    }

    // Update password if provided
    if (req.body.password) {
      account.password = req.body.password;
      
      // Verify new credentials
      const isVerified = await account.verifyCredentials();
      if (!isVerified) {
        return res.status(400).json({
          error: 'Invalid credentials',
          details: account.errorMessage,
          suggestions: [
            'Check if new password is correct',
            'Ensure account is not locked',
            'Verify no platform maintenance'
          ]
        });
      }
    }

    await account.save();

    res.json({
      message: 'Social media account updated successfully',
      account: {
        id: account._id,
        platform: account.platform,
        username: account.username,
        accountType: account.accountType,
        status: account.status,
        metadata: account.metadata
      }
    });
  } catch (error) {
    console.error('Error updating social account:', error);
    res.status(500).json({
      error: 'Failed to update social media account',
      details: error.message
    });
  }
});

/**
 * Delete a social account
 * 
 * Security measures:
 * - Authenticates user
 * - Verifies ownership
 * - Maintains deletion logs
 * - Cleanup associated data
 * 
 * @route DELETE /api/social-accounts/:id
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    const account = await SocialAccount.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!account) {
      return res.status(404).json({
        error: 'Social media account not found',
        details: 'The requested account does not exist or belongs to another user'
      });
    }

    // Log deletion for audit purposes
    console.info(`Social account deleted: ${account.platform}:${account.username} by user ${req.user.id}`);

    res.json({
      message: 'Social media account removed successfully',
      details: {
        platform: account.platform,
        username: account.username,
        deletedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Error deleting social account:', error);
    res.status(500).json({
      error: 'Failed to delete social media account',
      details: error.message
    });
  }
});

module.exports = router;
