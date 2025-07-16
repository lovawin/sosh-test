# Twitter OAuth Diagnostic Tools

This directory contains diagnostic tools to help identify the exact cause of the Twitter OAuth session issue.

## Background

The application is experiencing an issue with Twitter OAuth authentication. When users try to mint an NFT for a Twitter post, they are redirected to a callback URL where the following error occurs:

```
{"status":"server_error","message":"Failed to find request token in session"}
```

This error suggests that the OAuth request token is not being properly stored or retrieved from the session during the OAuth flow.

## Diagnostic Approach

To identify the exact cause of this issue with 100% certainty, we've created diagnostic tools that:

1. Trace the session through the entire OAuth flow
2. Log detailed information about the session at each step
3. Compare different middleware configurations to isolate the issue

## Diagnostic Scripts

### 1. `test-twitter-oauth-session.js`

This script simulates a configuration with session middleware initialized BEFORE JWT middleware. It includes:

- Detailed session logging at each step of the OAuth flow
- Both Passport-based and manual OAuth implementations
- Explicit session saving to ensure session data is persisted

### 2. `test-twitter-oauth-session-jwt-first.js`

This script simulates the current configuration with JWT middleware initialized BEFORE session middleware. It includes the same features as the first script but with the middleware order reversed.

### 3. `run-twitter-oauth-diagnostic.js`

This script runs both diagnostic servers simultaneously and logs their output to separate files for easy comparison.

## How to Use

1. Run the diagnostic script:

```bash
node run-twitter-oauth-diagnostic.js
```

2. Open both diagnostic servers in your browser:
   - Session First: http://localhost:3003
   - JWT First: http://localhost:3004

3. For each server:
   - Click on "Login with Twitter (Manual)" or "Login with Twitter (Passport)"
   - Complete the Twitter OAuth flow
   - Check the terminal output and log files for detailed session information

4. Compare the results to identify the exact cause of the issue.

## What to Look For

When comparing the logs, pay special attention to:

1. **Session IDs**: Do they change between the initial request and the callback?
2. **Session Data**: Is the OAuth request token properly stored in the session?
3. **Cookie Handling**: Are cookies being properly set and sent with subsequent requests?
4. **Middleware Order Effects**: Does the order of middleware initialization affect session handling?

## Expected Results

If the middleware order is the cause of the issue, we expect to see:

- In the session-first configuration: The session is properly maintained throughout the OAuth flow, and the request token is available in the callback.
- In the JWT-first configuration: The session ID changes or the session data is lost between the initial request and the callback.

## Log Files

Detailed logs are written to the `diagnostic-logs` directory:
- `session-first.log`: Logs for the session-first configuration
- `jwt-first.log`: Logs for the JWT-first configuration

## Next Steps

After identifying the exact cause of the issue:

1. If the middleware order is confirmed as the cause, reorder the middleware in `app.js` to initialize the session middleware before the JWT middleware.
2. If another issue is identified, address that specific issue.
3. Test the fix in the production environment to ensure it resolves the issue.

## Additional Notes

The current `app.js` file has the JWT middleware before the session middleware:

```javascript
// Add JWT middleware
app.use(jwt({ secret: JWT_SECRET, algorithms: ['HS256'] })
  .unless({
    // ... paths
  }));

// Load and log the requester user
app.use(async (req, res, next) => {
  // ... user loading
});

// Configure session middleware AFTER JWT
app.use(
  expresssession({
    // ... session configuration
  }),
);
```

If the diagnostic tests confirm that the middleware order is causing the issue, we should modify `app.js` to initialize the session middleware before the JWT middleware:

```javascript
// Configure session middleware FIRST
app.use(
  expresssession({
    // ... session configuration
  }),
);

// Add JWT middleware AFTER session
app.use(jwt({ secret: JWT_SECRET, algorithms: ['HS256'] })
  .unless({
    // ... paths
  }));

// Load and log the requester user
app.use(async (req, res, next) => {
  // ... user loading
});
```

This change would ensure that the session is available for all routes, including the Twitter OAuth flow.
