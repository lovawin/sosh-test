# Twitter OAuth Session Fix

## Issue

When trying to mint an NFT for a Twitter post from the https://www.soshnft.io/create-NFT page, users were encountering two errors:

1. First error:
```json
{
  "status": "server_error",
  "message": "Failed to find request token in session"
}
```

2. After fixing the first error, a second error appeared:
```json
{
  "status": "server_error",
  "message": "logging.authLogger.logAuthAttempt is not a function"
}
```

## Root Cause Analysis

After analyzing the logs, we identified two key issues:

1. **OAuth Token Location Mismatch**: The OAuth token was being stored in `req.session['oauth:twitter']` but the code was looking for it in `req.session.oauth`.

   ```javascript
   // Session data from logs
   session: {
     cookie: { ... },
     userid: '67cd1316b38bcba9e2dcb99b',
     oauthRequestId: 'twitter-oauth-1742401618553-z7s6c2km',
     'oauth:twitter': {
       oauth_token: '_GZjJQAAAAABYxzUAAABla86wrk',
       oauth_token_secret: 'wEIVGG4Nfkt1oiEi3RaUnYOjxk8sIE4t'
     }
   }
   ```

2. **Missing Logging Methods**: The `authLogger` was missing the `logAuthAttempt` and `logSocialAuth` methods that were being called in the social controller.

## Solution

We implemented a two-part solution:

### 1. Fixed the OAuth Token Location Issue

We modified the callback route to check for the OAuth token in both possible locations:

```javascript
// Before
if (req.session && req.session.oauth) {
  // Use req.session.oauth
}

// After
if (req.session && (req.session.oauth || req.session['oauth:twitter'])) {
  // Use whichever OAuth data is available
  const oauthData = req.session.oauth || req.session['oauth:twitter'];
  
  // Extract the token from the appropriate location
  const sessionToken = oauthData.requestToken || oauthData.oauth_token;
  // ...
}
```

### 2. Added Missing Logging Methods

We added the missing methods to the `authLogger.js` file:

```javascript
/**
 * Log an authentication attempt
 * @param {string} action - The authentication action (login, register, etc.)
 * @param {object} user - The user object or null if no user
 * @param {boolean} success - Whether the authentication was successful
 * @param {object} metadata - Additional metadata about the authentication
 */
async logAuthAttempt(action, user, success, metadata = {}) {
  await this.initPromise;
  const logData = {
    type: 'AUTH_ATTEMPT',
    action,
    userId: user ? user.id : null,
    success,
    metadata,
    timestamp: new Date().toISOString()
  };

  if (success) {
    this.logger.info(logData);
  } else {
    this.logger.warn(logData);
  }

  if (process.env.NODE_ENV !== 'production') {
    console.log(`[AUTH] ${action} attempt by ${user ? user.id : 'unknown'} - ${success ? 'Success' : 'Failed'}`);
  }
}

/**
 * Log a social authentication event
 * @param {string} provider - The social provider (twitter, facebook, etc.)
 * @param {string} action - The action performed (token_create, info_received, etc.)
 * @param {object} user - The user object
 * @param {boolean} success - Whether the operation was successful
 * @param {object} metadata - Additional metadata about the operation
 */
async logSocialAuth(provider, action, user, success, metadata = {}) {
  // Implementation details...
}

/**
 * Log a session event
 * @param {string} action - The session action (create, destroy, etc.)
 * @param {string} sessionId - The session ID
 * @param {object} user - The user object
 * @param {object} metadata - Additional metadata about the session
 */
async logSession(action, sessionId, user, metadata = {}) {
  // Implementation details...
}
```

## Changes Made

1. Modified `app/routes/twitter.js` to check for the OAuth token in both `req.session.oauth` and `req.session['oauth:twitter']`
2. Added additional logging to track which OAuth data source is being used
3. Made the token extraction logic more flexible to handle different property names
4. Added the missing `logAuthAttempt`, `logSocialAuth`, and `logSession` methods to `app/logging/handlers/authLogger.js`

## Deployment

The changes were deployed to the production server on March 19, 2025:

```bash
# First fix - OAuth token location
scp -i "../taurien" sosh-nft-avax-updated/sosh_nft_Backend/app/routes/twitter.js taurien@3.216.178.231:backend-update/app/routes/twitter.js
ssh -i "../taurien" taurien@3.216.178.231 "sudo docker restart sosh-backend-app"

# Second fix - Missing logging methods
scp -i "../taurien" sosh-nft-avax-updated/sosh_nft_Backend/app/logging/handlers/authLogger.js taurien@3.216.178.231:backend-update/app/logging/handlers/authLogger.js
ssh -i "../taurien" taurien@3.216.178.231 "sudo docker restart sosh-backend-app"
```

## Verification

The Twitter OAuth flow has been successfully tested and verified to be working correctly. Users can now successfully mint NFTs for Twitter posts without encountering any errors.

Verification was completed on March 19, 2025, at approximately 3:45 PM ET.

## Monitoring

Continue monitoring the logs for any session-related issues:

```bash
ssh -i "../taurien" -L 8500:localhost:8500 taurien@3.216.178.231
```

Then navigate to http://localhost:8500 to view the mongo-express interface and check the logs.

## Backups

Backups of the original files were created in:
- `sosh_nft_Backend/backups/twitter.routes.js.bak`
- `sosh_nft_Backend/backups/authLogger.js.bak`
