/**
 * Retrieval Button Visibility Logs Diagnostic Script
 *
 * This script analyzes marketplace logs specifically related to the NFT retrieval button
 * visibility to identify why the button may not be appearing for certain NFTs.
 *
 * Usage:
 *   node check-retrieval-button-logs.js [--days=7] [--token=tokenId] [--user=userAddress]
 *
 * Options:
 *   --days=N     : Look at logs from the last N days (default: 7)
 *   --token=ID   : Filter logs for a specific token ID
 *   --user=ADDR  : Filter logs for a specific user address
 *   --verbose    : Show detailed log entries
 */

require('dotenv').config();
const { MongoClient } = require('mongodb');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

// Parse command line arguments
const argv = yargs(hideBin(process.argv))
  .option('days', {
    type: 'number',
    description: 'Number of days to look back',
    default: 7
  })
  .option('token', {
    type: 'string',
    description: 'Filter by token ID'
  })
  .option('user', {
    type: 'string',
    description: 'Filter by user address'
  })
  .option('verbose', {
    type: 'boolean',
    description: 'Show detailed log entries',
    default: false
  })
  .help()
  .alias('help', 'h')
  .argv;

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_CONNECTION_STRING || 'mongodb://localhost:27017';
const DB_NAME = process.env.NODE_ENV === 'production' ? 'sosh' : 'soshnew1';
const COLLECTION_NAME = 'marketplace_logs';

async function analyzeRetrievalButtonLogs() {
  console.log('Connecting to MongoDB...');
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - argv.days);

    console.log(`Analyzing retrieval button logs from ${startDate.toISOString()} to ${endDate.toISOString()}`);

    // Build query for retrieval button visibility logs
    const query = {
      timestamp: { $gte: startDate.toISOString(), $lte: endDate.toISOString() },
      $or: [
        { type: 'RETRIEVAL_BUTTON_VISIBILITY' },
        { type: 'DATA_PROPERTY_VALIDATION' },
        { type: 'OWNERSHIP_CHECK' }
      ]
    };

    if (argv.token) {
      query.tokenId = argv.token;
      console.log(`Filtering for token: ${argv.token}`);
    }

    if (argv.user) {
      query['userAddress'] = { $regex: new RegExp(argv.user, 'i') };
      console.log(`Filtering for user address: ${argv.user}`);
    }

    // Get all logs matching the query
    const logs = await collection.find(query).sort({ timestamp: -1 }).toArray();

    if (logs.length === 0) {
      console.log('No retrieval button logs found matching the criteria');
      return;
    }

    console.log(`Found ${logs.length} retrieval button related logs`);

    // Group logs by type
    const logsByType = {};
    logs.forEach(log => {
      if (!logsByType[log.type]) {
        logsByType[log.type] = [];
      }
      logsByType[log.type].push(log);
    });

    // Print summary by type
    console.log('\n=== Summary by Event Type ===');
    Object.keys(logsByType).forEach(type => {
      console.log(`${type}: ${logsByType[type].length} events`);
    });

    // Analyze retrieval button visibility logs
    if (logsByType['RETRIEVAL_BUTTON_VISIBILITY']) {
      const visibilityLogs = logsByType['RETRIEVAL_BUTTON_VISIBILITY'];
      console.log(`\n=== Retrieval Button Visibility Analysis (${visibilityLogs.length} logs) ===`);

      // Count logs where button should be visible vs. not visible
      const shouldShowCount = visibilityLogs.filter(log => log.shouldShowRetrieveButton).length;
      const shouldNotShowCount = visibilityLogs.length - shouldShowCount;

      console.log(`Button should be visible: ${shouldShowCount} (${(shouldShowCount / visibilityLogs.length * 100).toFixed(2)}%)`);
      console.log(`Button should not be visible: ${shouldNotShowCount} (${(shouldNotShowCount / visibilityLogs.length * 100).toFixed(2)}%)`);

      // Analyze reasons why button is not visible
      const reasonsNotVisible = {
        notLoggedInProfile: 0,
        notExpired: 0,
        notUserSeller: 0,
        multiple: 0
      };

      visibilityLogs.filter(log => !log.shouldShowRetrieveButton).forEach(log => {
        let reasonCount = 0;
        
        if (log.isLoggedInProfile === false) {
          reasonsNotVisible.notLoggedInProfile++;
          reasonCount++;
        }
        
        if (log.isExpired === false) {
          reasonsNotVisible.notExpired++;
          reasonCount++;
        }
        
        if (log.isUserSeller === false) {
          reasonsNotVisible.notUserSeller++;
          reasonCount++;
        }
        
        if (reasonCount > 1) {
          reasonsNotVisible.multiple++;
        }
      });

      console.log('\nReasons Button Not Visible:');
      console.log(`Not logged in profile: ${reasonsNotVisible.notLoggedInProfile} instances`);
      console.log(`Sale not expired: ${reasonsNotVisible.notExpired} instances`);
      console.log(`User not the seller: ${reasonsNotVisible.notUserSeller} instances`);
      console.log(`Multiple reasons: ${reasonsNotVisible.multiple} instances`);

      // Analyze URL parameters
      const urlAnalysis = {
        hasOwnerParam: 0,
        missingOwnerParam: 0,
        ownerParamTrue: 0,
        ownerParamFalse: 0
      };

      visibilityLogs.forEach(log => {
        if (log.hasOwnerParam) {
          urlAnalysis.hasOwnerParam++;
          if (log.ownerParamValue === 'true') {
            urlAnalysis.ownerParamTrue++;
          } else {
            urlAnalysis.ownerParamFalse++;
          }
        } else {
          urlAnalysis.missingOwnerParam++;
        }
      });

      console.log('\nURL Parameter Analysis:');
      console.log(`Has 'owner' parameter: ${urlAnalysis.hasOwnerParam} instances`);
      console.log(`Missing 'owner' parameter: ${urlAnalysis.missingOwnerParam} instances`);
      console.log(`'owner=true' parameter: ${urlAnalysis.ownerParamTrue} instances`);
      console.log(`'owner=false' parameter: ${urlAnalysis.ownerParamFalse} instances`);

      // Analyze address comparison
      const addressAnalysis = {
        addressesMatch: 0,
        addressesDontMatch: 0,
        missingUserAddress: 0,
        missingSellerAddress: 0
      };

      visibilityLogs.forEach(log => {
        if (!log.userAddress) {
          addressAnalysis.missingUserAddress++;
        } else if (!log.sellerAddress) {
          addressAnalysis.missingSellerAddress++;
        } else if (log.addressesMatch) {
          addressAnalysis.addressesMatch++;
        } else {
          addressAnalysis.addressesDontMatch++;
        }
      });

      console.log('\nAddress Comparison Analysis:');
      console.log(`Addresses match: ${addressAnalysis.addressesMatch} instances`);
      console.log(`Addresses don't match: ${addressAnalysis.addressesDontMatch} instances`);
      console.log(`Missing user address: ${addressAnalysis.missingUserAddress} instances`);
      console.log(`Missing seller address: ${addressAnalysis.missingSellerAddress} instances`);

      // Show detailed logs if verbose
      if (argv.verbose) {
        console.log('\n=== Detailed Visibility Logs ===');
        visibilityLogs.slice(0, 10).forEach((log, index) => {
          console.log(`\n--- Log ${index + 1} ---`);
          console.log(`Timestamp: ${log.timestamp}`);
          console.log(`Token ID: ${log.tokenId}`);
          console.log(`User Address: ${log.userAddress || 'N/A'}`);
          console.log(`Seller Address: ${log.sellerAddress || 'N/A'}`);
          console.log(`Addresses Match: ${log.addressesMatch}`);
          console.log(`Is Logged In Profile: ${log.isLoggedInProfile}`);
          console.log(`Is Expired: ${log.isExpired}`);
          console.log(`Is User Seller: ${log.isUserSeller}`);
          console.log(`Should Show Button: ${log.shouldShowRetrieveButton}`);
          
          if (log.currentUrl) {
            console.log(`Current URL: ${log.currentUrl}`);
          }
          
          if (log.hasOwnerParam !== undefined) {
            console.log(`Has Owner Param: ${log.hasOwnerParam}`);
            console.log(`Owner Param Value: ${log.ownerParamValue}`);
          }
          
          if (log.endTime) {
            console.log(`End Time: ${log.endTime}`);
            console.log(`Current Time: ${log.currentTime}`);
            if (log.timeUntilExpiryMs !== undefined) {
              console.log(`Time Until Expiry (ms): ${log.timeUntilExpiryMs}`);
            }
          }
          
          if (log.saleId) {
            console.log(`Sale ID: ${log.saleId}`);
          }
          
          if (log.saleStatus) {
            console.log(`Sale Status: ${log.saleStatus}`);
          }
        });
        
        if (visibilityLogs.length > 10) {
          console.log(`\n... and ${visibilityLogs.length - 10} more visibility logs`);
        }
      }
    }

    // Analyze data property validation logs
    if (logsByType['DATA_PROPERTY_VALIDATION']) {
      const dataValidationLogs = logsByType['DATA_PROPERTY_VALIDATION'];
      console.log(`\n=== Data Property Validation Analysis (${dataValidationLogs.length} logs) ===`);

      // Count logs with missing or invalid properties
      const missingEndTime = dataValidationLogs.filter(log => !log.hasEndTime).length;
      const invalidEndTime = dataValidationLogs.filter(log => log.hasEndTime && !log.endTimeValue).length;
      const expiredCount = dataValidationLogs.filter(log => log.isExpired).length;

      console.log(`Missing endTime property: ${missingEndTime} instances`);
      console.log(`Invalid endTime value: ${invalidEndTime} instances`);
      console.log(`Expired sales: ${expiredCount} (${(expiredCount / dataValidationLogs.length * 100).toFixed(2)}%)`);

      // Show detailed logs if verbose
      if (argv.verbose) {
        console.log('\n=== Detailed Data Validation Logs ===');
        dataValidationLogs.slice(0, 10).forEach((log, index) => {
          console.log(`\n--- Log ${index + 1} ---`);
          console.log(`Timestamp: ${log.timestamp}`);
          console.log(`Token ID: ${log.tokenId}`);
          console.log(`Has EndTime: ${log.hasEndTime}`);
          console.log(`EndTime Value: ${log.endTimeValue || 'N/A'}`);
          console.log(`EndTime Formatted: ${log.endTimeFormatted || 'N/A'}`);
          console.log(`Current Time: ${log.currentTime}`);
          console.log(`Is Expired: ${log.isExpired}`);
          
          if (log.saleId) {
            console.log(`Sale ID: ${log.saleId}`);
          }
          
          if (log.saleStatus) {
            console.log(`Sale Status: ${log.saleStatus}`);
          }
        });
        
        if (dataValidationLogs.length > 10) {
          console.log(`\n... and ${dataValidationLogs.length - 10} more data validation logs`);
        }
      }
    }

    // Analyze ownership check logs
    if (logsByType['OWNERSHIP_CHECK']) {
      const ownershipLogs = logsByType['OWNERSHIP_CHECK'];
      console.log(`\n=== Ownership Check Analysis (${ownershipLogs.length} logs) ===`);

      // Count ownership check results
      const isMarketplaceOwnerCount = ownershipLogs.filter(log => log.isMarketplaceOwner).length;
      const notMarketplaceOwnerCount = ownershipLogs.length - isMarketplaceOwnerCount;

      console.log(`Marketplace is owner: ${isMarketplaceOwnerCount} (${(isMarketplaceOwnerCount / ownershipLogs.length * 100).toFixed(2)}%)`);
      console.log(`Marketplace is not owner: ${notMarketplaceOwnerCount} (${(notMarketplaceOwnerCount / ownershipLogs.length * 100).toFixed(2)}%)`);

      // Show detailed logs if verbose
      if (argv.verbose) {
        console.log('\n=== Detailed Ownership Check Logs ===');
        ownershipLogs.slice(0, 10).forEach((log, index) => {
          console.log(`\n--- Log ${index + 1} ---`);
          console.log(`Timestamp: ${log.timestamp}`);
          console.log(`Token ID: ${log.tokenId}`);
          console.log(`Current Owner: ${log.currentOwner || 'N/A'}`);
          console.log(`Marketplace Address: ${log.marketplaceAddress || 'N/A'}`);
          console.log(`Is Marketplace Owner: ${log.isMarketplaceOwner}`);
          
          if (log.saleStatus) {
            console.log(`Sale Status: ${log.saleStatus}`);
          }
          
          if (log.saleId) {
            console.log(`Sale ID: ${log.saleId}`);
          }
        });
        
        if (ownershipLogs.length > 10) {
          console.log(`\n... and ${ownershipLogs.length - 10} more ownership logs`);
        }
      }
    }

    // Group logs by token ID to analyze the sequence of events
    console.log('\n=== Token-specific Analysis ===');
    const logsByToken = {};
    logs.forEach(log => {
      if (log.tokenId) {
        if (!logsByToken[log.tokenId]) {
          logsByToken[log.tokenId] = [];
        }
        logsByToken[log.tokenId].push(log);
      }
    });

    // Analyze each token's logs
    Object.entries(logsByToken).forEach(([tokenId, tokenLogs]) => {
      // Sort logs by timestamp
      tokenLogs.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

      // Get the most recent visibility log
      const visibilityLogs = tokenLogs.filter(log => log.type === 'RETRIEVAL_BUTTON_VISIBILITY');
      const latestVisibilityLog = visibilityLogs.length > 0 ? visibilityLogs[visibilityLogs.length - 1] : null;

      if (latestVisibilityLog) {
        console.log(`\nToken #${tokenId} - Latest Visibility Check:`);
        console.log(`Timestamp: ${latestVisibilityLog.timestamp}`);
        console.log(`Should Show Button: ${latestVisibilityLog.shouldShowRetrieveButton}`);
        
        if (!latestVisibilityLog.shouldShowRetrieveButton) {
          console.log('Reasons button is not showing:');
          if (latestVisibilityLog.isLoggedInProfile === false) {
            console.log('- Not on logged-in profile page (isLoggedInProfile = false)');
            if (latestVisibilityLog.currentUrl) {
              console.log(`  URL: ${latestVisibilityLog.currentUrl}`);
            }
            if (latestVisibilityLog.hasOwnerParam !== undefined) {
              console.log(`  Has 'owner' parameter: ${latestVisibilityLog.hasOwnerParam}`);
              console.log(`  'owner' parameter value: ${latestVisibilityLog.ownerParamValue}`);
            }
          }
          
          if (latestVisibilityLog.isExpired === false) {
            console.log('- Sale has not expired (isExpired = false)');
            if (latestVisibilityLog.endTime && latestVisibilityLog.currentTime) {
              console.log(`  End time: ${latestVisibilityLog.endTime}`);
              console.log(`  Current time: ${latestVisibilityLog.currentTime}`);
              if (latestVisibilityLog.timeUntilExpiryMs !== undefined) {
                console.log(`  Time until expiry: ${latestVisibilityLog.timeUntilExpiryMs} ms`);
              }
            }
          }
          
          if (latestVisibilityLog.isUserSeller === false) {
            console.log('- User is not the seller (isUserSeller = false)');
            console.log(`  User address: ${latestVisibilityLog.userAddress || 'N/A'}`);
            console.log(`  Seller address: ${latestVisibilityLog.sellerAddress || 'N/A'}`);
            console.log(`  Addresses match: ${latestVisibilityLog.addressesMatch}`);
          }
        }
      }
    });

    // Provide recommendations
    console.log('\n=== Recommendations ===');

    if (logsByType['RETRIEVAL_BUTTON_VISIBILITY']) {
      const visibilityLogs = logsByType['RETRIEVAL_BUTTON_VISIBILITY'];
      const shouldShowCount = visibilityLogs.filter(log => log.shouldShowRetrieveButton).length;
      
      if (shouldShowCount > 0) {
        console.log('- Some logs indicate the button should be visible. Check if:');
        console.log('  1. The frontend is correctly evaluating the conditions (isLoggedInProfile, isExpired, isUserSeller)');
        console.log('  2. The button rendering logic in postCard.js is working correctly');
        console.log('  3. There are any CSS issues hiding the button');
      }
      
      const notLoggedInProfileCount = visibilityLogs.filter(log => log.isLoggedInProfile === false).length;
      if (notLoggedInProfileCount > 0) {
        console.log('- Many logs show isLoggedInProfile=false. Ensure:');
        console.log('  1. Users are viewing their own profile page (URL should include "?owner=true")');
        console.log('  2. The isLoggedInProfile prop is correctly passed to the PostCard component');
      }
      
      const notExpiredCount = visibilityLogs.filter(log => log.isExpired === false).length;
      if (notExpiredCount > 0) {
        console.log('- Many logs show isExpired=false. Check if:');
        console.log('  1. The endTime calculation is correct');
        console.log('  2. The current time comparison is working properly');
        console.log('  3. There are timezone issues affecting the expiration calculation');
      }
      
      const notUserSellerCount = visibilityLogs.filter(log => log.isUserSeller === false).length;
      if (notUserSellerCount > 0) {
        console.log('- Many logs show isUserSeller=false. Verify:');
        console.log('  1. The user\'s wallet address matches the seller address (case-insensitive)');
        console.log('  2. The seller address is being correctly retrieved from the blockchain');
      }
    }
  } catch (error) {
    console.error('Error analyzing retrieval button logs:', error);
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the analysis
analyzeRetrievalButtonLogs().catch(error => {
  console.error('Error in main function:', error);
  process.exit(1);
});
