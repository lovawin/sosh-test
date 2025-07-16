/**
 * Check Backend Configuration
 * 
 * This script checks what NFT contract address the backend is configured to use
 */

// Load the backend configuration
const appconfig = require('./sosh_nft_Backend/config/appconfig');

console.log('=== Backend Configuration Check ===');
console.log('NFT Contract Address (tokenAddress):', appconfig.tokenAddress);
console.log('Marketplace Proxy Address:', appconfig.MARKETPLACE_PROXY_ADDRESS);
console.log('INFURA URL:', appconfig.INFURA_URL);

// Expected addresses from the task description:
console.log('\n=== Expected Addresses ===');
console.log('Expected NFT Contract Address: 0x7CA1eA6d19A1df7d17fEaF0eA9a1dEFA0e37f894');
console.log('Expected NFT Implementation: 0xb86C57E455F714a5F456CaF0AFBf6da1161dB69e');
console.log('Expected Marketplace Proxy: 0x25ad5b58a78c1cC1aF3C83607448D0D203158F06');
console.log('Expected Marketplace Implementation: 0x4d7BbCf22d663d69E02fc88d65dbA73D1bB9e711');

// Check if addresses match
console.log('\n=== Address Comparison ===');
const expectedNftAddress = '0x7CA1eA6d19A1df7d17fEaF0eA9a1dEFA0e37f894';
const expectedMarketplaceAddress = '0x25ad5b58a78c1cC1aF3C83607448D0D203158F06';

console.log('NFT Address matches expected:', 
  appconfig.tokenAddress && appconfig.tokenAddress.toLowerCase() === expectedNftAddress.toLowerCase());
console.log('Marketplace Address matches expected:', 
  appconfig.MARKETPLACE_PROXY_ADDRESS && appconfig.MARKETPLACE_PROXY_ADDRESS.toLowerCase() === expectedMarketplaceAddress.toLowerCase());

if (!appconfig.tokenAddress) {
  console.log('\n❌ ERROR: tokenAddress is not set in backend configuration!');
} else if (appconfig.tokenAddress.toLowerCase() !== expectedNftAddress.toLowerCase()) {
  console.log('\n⚠️  WARNING: NFT contract address mismatch!');
  console.log('   Backend is using:', appconfig.tokenAddress);
  console.log('   Expected:', expectedNftAddress);
}
