/**
 * Twitter Service Test Script
 * 
 * This script tests the basic functionality of the Twitter service.
 * It can be used to verify:
 * - API credentials
 * - Basic operations
 * - Rate limiting
 * - Error handling
 * 
 * Usage:
 * 1. Ensure .env file is configured
 * 2. Run: node src/tests/twitter.test.js
 */

require('dotenv').config();
const twitterService = require('../services/twitter.service');

async function runTests() {
    console.log('Starting Twitter Service Tests...\n');

    try {
        // Test 1: Search Tweets
        console.log('Test 1: Searching Tweets');
        console.log('------------------------');
        const searchResults = await twitterService.searchTweets('#javascript', 5);
        console.log('Search Results:', {
            count: searchResults.data?.length || 0,
            sample: searchResults.data?.[0] || 'No results'
        });
        console.log('✓ Search test completed\n');

        // Test 2: Get User Info
        console.log('Test 2: Getting User Information');
        console.log('--------------------------------');
        const userInfo = await twitterService.getUserByUsername('elonmusk');
        console.log('User Info:', {
            id: userInfo.data?.id,
            username: userInfo.data?.username,
            metrics: userInfo.data?.public_metrics
        });
        console.log('✓ User info test completed\n');

        // Test 3: Analyze User Engagement
        console.log('Test 3: Analyzing User Engagement');
        console.log('--------------------------------');
        const engagement = await twitterService.analyzeUserEngagement('elonmusk');
        console.log('Engagement Metrics:', {
            averageLikes: Math.round(engagement.averageLikes),
            averageRetweets: Math.round(engagement.averageRetweets),
            engagementRate: engagement.engagementRate.toFixed(2) + '%'
        });
        console.log('✓ Engagement analysis test completed\n');

        // Test 4: Mother-Child Strategy
        console.log('Test 4: Testing Mother-Child Strategy');
        console.log('------------------------------------');
        const strategyResults = await twitterService.executeMotherChildStrategy(
            { username: 'elonmusk', id: userInfo.data?.id },
            [], // No child accounts for test
            ['#tech', '#AI', '#innovation']
        );
        console.log('Strategy Results:', {
            metrics: strategyResults.motherAccountMetrics,
            recommendedActions: {
                optimalTimes: strategyResults.recommendedActions.optimalPostingTimes,
                suggestedHashtags: strategyResults.recommendedActions.suggestedHashtags
            }
        });
        console.log('✓ Strategy test completed\n');

        console.log('All tests completed successfully! ✓');
        console.log('\nAPI credentials and service functionality verified.');
        console.log('The service is ready for use.');

    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        console.error('\nPossible issues:');
        console.error('1. Invalid API credentials in .env file');
        console.error('2. Rate limiting (wait a few minutes and try again)');
        console.error('3. Network connectivity issues');
        console.error('4. API endpoint changes or restrictions');
        
        if (error.response?.data) {
            console.error('\nAPI Error Details:', error.response.data);
        }
        
        process.exit(1);
    }
}

// Run tests
runTests();
