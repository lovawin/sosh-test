/**
 * ABI Loading Diagnostic Script
 * 
 * This script checks if the ABI files are being loaded correctly and tests
 * contract interactions to verify the ABI is working properly.
 */

const Web3 = require('web3');
const fs = require('fs');
const path = require('path');
const appconfig = require('./sosh_nft_Backend/config/appconfig');

// Initialize Web3 with the provider
const web3 = new Web3(new Web3.providers.HttpProvider(appconfig.INFURA_URL));

// Paths to ABI files
const marketplaceAbiPath = path.join(__dirname, 'sosh_nft_Backend/app/ABI/contract.sale.abi.json');
const nftAbiPath = path.join(__dirname, 'sosh_nft_Backend/app/ABI/contract.nft.json');

// Token ID to check
const tokenId = 1;

// Function to load and validate ABI files
async function checkAbiFiles() {
    console.log('=== ABI File Validation ===');
    
    // Check if marketplace ABI file exists
    if (fs.existsSync(marketplaceAbiPath)) {
        console.log(`✅ Marketplace ABI file exists at: ${marketplaceAbiPath}`);
        
        // Load and validate marketplace ABI
        try {
            const marketplaceABI = JSON.parse(fs.readFileSync(marketplaceAbiPath, 'utf8'));
            console.log(`✅ Marketplace ABI loaded successfully with ${marketplaceABI.length} entries`);
            
            // Check for reserveSale function in ABI
            const reserveSaleFunction = marketplaceABI.find(entry => 
                entry.name === 'reserveSale' && entry.type === 'function');
            
            if (reserveSaleFunction) {
                console.log('✅ reserveSale function found in marketplace ABI');
                console.log('Function outputs:', JSON.stringify(reserveSaleFunction.outputs, null, 2));
                
                // Check if minBidIncrement field exists in outputs
                const minBidIncrementOutput = reserveSaleFunction.outputs.find(output => 
                    output.name === 'minBidIncrement');
                
                if (minBidIncrementOutput) {
                    console.log('✅ minBidIncrement field found in reserveSale outputs');
                } else {
                    console.log('❌ minBidIncrement field NOT found in reserveSale outputs');
                }
            } else {
                console.log('❌ reserveSale function NOT found in marketplace ABI');
            }
        } catch (error) {
            console.error('❌ Error parsing marketplace ABI file:', error);
        }
    } else {
        console.error(`❌ Marketplace ABI file NOT found at: ${marketplaceAbiPath}`);
    }
    
    // Check if NFT ABI file exists
    if (fs.existsSync(nftAbiPath)) {
        console.log(`✅ NFT ABI file exists at: ${nftAbiPath}`);
        
        // Load and validate NFT ABI
        try {
            const nftABI = JSON.parse(fs.readFileSync(nftAbiPath, 'utf8'));
            console.log(`✅ NFT ABI loaded successfully with ${nftABI.length} entries`);
            
            // Check for ownerOf function in ABI
            const ownerOfFunction = nftABI.find(entry => 
                entry.name === 'ownerOf' && entry.type === 'function');
            
            if (ownerOfFunction) {
                console.log('✅ ownerOf function found in NFT ABI');
            } else {
                console.log('❌ ownerOf function NOT found in NFT ABI');
            }
        } catch (error) {
            console.error('❌ Error parsing NFT ABI file:', error);
        }
    } else {
        console.error(`❌ NFT ABI file NOT found at: ${nftAbiPath}`);
    }
}

// Function to test contract interactions
async function testContractInteractions() {
    console.log('\n=== Contract Interaction Tests ===');
    
    try {
        // Load ABIs
        const marketplaceABI = JSON.parse(fs.readFileSync(marketplaceAbiPath, 'utf8'));
        const nftABI = JSON.parse(fs.readFileSync(nftAbiPath, 'utf8'));
        
        // Create contract instances
        const marketplaceContract = new web3.eth.Contract(
            marketplaceABI,
            appconfig.MARKETPLACE_PROXY_ADDRESS
        );
        
        const nftContract = new web3.eth.Contract(
            nftABI,
            appconfig.tokenAddress
        );
        
        console.log('Contract addresses:');
        console.log(`- Marketplace: ${appconfig.MARKETPLACE_PROXY_ADDRESS}`);
        console.log(`- NFT: ${appconfig.tokenAddress}`);
        
        // Test NFT ownerOf function
        try {
            console.log(`\nTesting NFT.ownerOf(${tokenId})...`);
            const owner = await nftContract.methods.ownerOf(tokenId).call();
            console.log(`✅ NFT.ownerOf(${tokenId}) = ${owner}`);
            
            // Check if the marketplace is the owner
            const isMarketplaceOwner = owner.toLowerCase() === appconfig.MARKETPLACE_PROXY_ADDRESS.toLowerCase();
            console.log(`- Is marketplace the owner? ${isMarketplaceOwner ? 'Yes' : 'No'}`);
        } catch (error) {
            console.error(`❌ Error calling NFT.ownerOf(${tokenId}):`, error.message);
        }
        
        // Test marketplace saleIdTracker function
        try {
            console.log('\nTesting Marketplace.saleIdTracker()...');
            const saleCount = await marketplaceContract.methods.saleIdTracker().call();
            console.log(`✅ Marketplace.saleIdTracker() = ${saleCount}`);
        } catch (error) {
            console.error('❌ Error calling Marketplace.saleIdTracker():', error.message);
        }
        
        // Test marketplace reserveSale function
        try {
            console.log(`\nTesting Marketplace.reserveSale(1)...`);
            const sale = await marketplaceContract.methods.reserveSale(1).call();
            console.log('✅ Marketplace.reserveSale(1) returned:');
            console.log(JSON.stringify(sale, null, 2));
            
            // Check if minBidIncrement field exists in the response
            if ('minBidIncrement' in sale) {
                console.log('✅ minBidIncrement field found in response');
            } else {
                console.log('❌ minBidIncrement field NOT found in response');
            }
        } catch (error) {
            console.error('❌ Error calling Marketplace.reserveSale(1):', error.message);
        }
    } catch (error) {
        console.error('❌ Error in contract interaction tests:', error);
    }
}

// Main function
async function main() {
    console.log('Starting ABI loading diagnostic...\n');
    
    // Check ABI files
    await checkAbiFiles();
    
    // Test contract interactions
    await testContractInteractions();
    
    console.log('\nABI loading diagnostic completed.');
}

// Run the main function
main().catch(error => {
    console.error('Error in main function:', error);
});
