# Twitter Link Validation Enhanced Logging

This update adds comprehensive error logging to the Twitter link validation process, focusing on the screenshot capture and S3 upload stages where the "Invalid social media link" error was occurring.

## Changes Made

### 1. Enhanced Puppeteer Screenshot Logging (`app/services/puppetter.js`)

- Added detailed logging for each step of the screenshot process
- Added specific error handling for different failure scenarios
- Included request IDs for correlation across logs
- Ensured browser resources are properly cleaned up on errors

### 2. Enhanced S3 Upload Logging (`app/utils/amazons3.js`)

- Added buffer validation before upload attempts
- Added detailed logging for S3 upload operations
- Included AWS-specific error details in logs
- Added request IDs for correlation across logs

### 3. Enhanced Error Handling in Controller (`app/controllers/social.controller.js`)

- Added more granular error handling for screenshot and S3 upload stages
- Improved error categorization for better diagnostics
- Added more user-friendly error messages
- Enhanced error context for better debugging

### 4. Added Test Scripts

- `test-twitter-link-validation-enhanced.js`: Tests the screenshot and S3 upload processes with enhanced logging
- `run-twitter-link-validation-test.js`: Runner script to execute the tests

## How to Test

1. Run the test script locally:

```bash
node sosh_nft_Backend/run-twitter-link-validation-test.js
```

2. Check MongoDB for new error logs in the `error_logs` collection:

```javascript
db.error_logs.find({context: /twitter_validation/}).sort({timestamp: -1}).limit(10)
```

3. Look for logs with the following contexts:
   - `twitter_screenshot_failure`
   - `twitter_s3_upload_failure`
   - `twitter_validation_screenshot`
   - `twitter_validation_s3_upload`

## Deployment Instructions

1. Back up the original files on the production server:

```bash
ssh -i "../taurien" taurien@3.216.178.231 "cp backend/app/services/puppetter.js backend/app/services/puppetter.js.bak"
ssh -i "../taurien" taurien@3.216.178.231 "cp backend/app/utils/amazons3.js backend/app/utils/amazons3.js.bak"
ssh -i "../taurien" taurien@3.216.178.231 "cp backend/app/controllers/social.controller.js backend/app/controllers/social.controller.js.bak"
```

2. Copy the updated files to the production server:

```bash
scp -i "../taurien" sosh-nft-avax-updated/sosh_nft_Backend/app/services/puppetter.js taurien@3.216.178.231:backend/app/services/puppetter.js
scp -i "../taurien" sosh-nft-avax-updated/sosh_nft_Backend/app/utils/amazons3.js taurien@3.216.178.231:backend/app/utils/amazons3.js
scp -i "../taurien" sosh-nft-avax-updated/sosh_nft_Backend/app/controllers/social.controller.js taurien@3.216.178.231:backend/app/controllers/social.controller.js
```

3. Restart the backend service:

```bash
ssh -i "../taurien" taurien@3.216.178.231 "sudo docker restart sosh-backend-app"
```

4. Copy the test scripts to the production server (optional):

```bash
scp -i "../taurien" sosh-nft-avax-updated/sosh_nft_Backend/test-twitter-link-validation-enhanced.js taurien@3.216.178.231:backend/test-twitter-link-validation-enhanced.js
scp -i "../taurien" sosh-nft-avax-updated/sosh_nft_Backend/run-twitter-link-validation-test.js taurien@3.216.178.231:backend/run-twitter-link-validation-test.js
```

## Monitoring and Verification

1. After deployment, monitor the error logs in MongoDB:

```javascript
db.error_logs.find({
  timestamp: { $gt: ISODate("2025-03-20T00:00:00.000Z") },
  context: /twitter_validation/
}).sort({timestamp: -1})
```

2. Test the Twitter link validation on the production site:
   - Go to https://www.soshnft.io/create-NFT
   - Try to add a Twitter link
   - Check the logs for detailed error information

3. If errors persist, the enhanced logs should provide more specific information about where the failure is occurring.

## Rollback Instructions

If issues arise, you can roll back to the original files:

```bash
ssh -i "../taurien" taurien@3.216.178.231 "cp backend/app/services/puppetter.js.bak backend/app/services/puppetter.js"
ssh -i "../taurien" taurien@3.216.178.231 "cp backend/app/utils/amazons3.js.bak backend/app/utils/amazons3.js"
ssh -i "../taurien" taurien@3.216.178.231 "cp backend/app/controllers/social.controller.js.bak backend/app/controllers/social.controller.js"
ssh -i "../taurien" taurien@3.216.178.231 "sudo docker restart sosh-backend-app"
