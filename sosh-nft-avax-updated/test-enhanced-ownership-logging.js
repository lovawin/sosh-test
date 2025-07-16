/**
 * Test Enhanced Ownership Logging
 * 
 * This script tests the enhanced logging added to the marketplace.js file
 * to help identify why the currentOwner field is not being set correctly.
 */

const axios = require('axios');
const fs = require('fs');
const Web3 = require('web3');

// Configuration
const TOKEN_ID = 1;
const API_BASE_URL = 'https://www.soshnft.io';
const API_ENDPOINT = `/api/V1/marketplace/sale-info/${TOKEN_ID}`;
const USER_WALLET_ADDRESS = '0x7411e7942f4C8271D4E636429f374997fdaede17'; // The wallet address of the user
const NFT_CONTRACT_ADDRESS = '0x7CA1eA6d19A1df7d17fEaF0eA9a1dEFA0e37f894';
const MARKETPLACE_PROXY_ADDRESS = '0x25ad5b58a78c1cC1aF3C83607448D0D203158F06';

