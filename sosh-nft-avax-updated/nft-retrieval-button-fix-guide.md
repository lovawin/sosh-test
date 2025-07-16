# NFT Retrieval Button Fix Guide

## Issue Description

The "Retrieve" button was not appearing in the UI at https://www.soshnft.io/my-profile?owner=true for expired NFT listings. The button should appear when:

1. The user is the seller of the NFT
2. The listing has expired
3. The NFT marketplace contract is the current owner of the NFT

## Root Cause

The issue was identified in the backend code. The `appconfig.js` file was missing the `MARKETPLACE_PROXY_ADDRESS` property, which was causing the error:

```
This contract object doesn't have address set yet, please set an address first.
```

This error occurred because the backend was trying to use `appconfig.MARKETPLACE_PROXY_ADDRESS` in the marketplace.js file, but this property was not defined in the appconfig.js file.

## Fix Implementation

1. Added the `MARKETPLACE_PROXY_ADDRESS` property to the appconfig.js file:

```javascript
MARKETPLACE_PROXY_ADDRESS: process.env.MARKETPLACE_PROXY_ADDRESS,
```

2. Deployed the updated appconfig.js file to the production server:

```bash
scp -i "../taurien" sosh-nft-avax-updated/sosh_nft_Backend/config/appconfig.js taurien@3.216.178.231:backend-update/config/appconfig.js
```

3. Restarted the backend service:

```bash
ssh -i "../taurien" taurien@3.216.178.231 "sudo docker restart sosh-backend-app"
```

## Verification

After deploying the fix, the "Retrieve" button should now appear for expired NFT listings where the user is the seller and the NFT marketplace contract is the current owner of the NFT.

To verify the fix:
1. Log in to https://www.soshnft.io/my-profile?owner=true with the account that has expired NFT listings
2. Check if the "Retrieve" button appears for the expired NFT listings
3. Test the "Retrieve" button to ensure it works correctly

## Technical Details

- NFT Contract Address: 0x7CA1eA6d19A1df7d17fEaF0eA9a1dEFA0e37f894
- NFT Implementation Address: 0xb86C57E455F714a5F456CaF0AFBf6da1161dB69e
- Marketplace Proxy Address: 0x25ad5b58a78c1cC1aF3C83607448D0D203158F06
- Marketplace Implementation Address: 0x4d7BbCf22d663d69E02fc88d65dbA73D1bB9e711
- Token ID: 1
- User Wallet Address: 0x7411e7942f4C8271D4E636429f374997fdaede17
