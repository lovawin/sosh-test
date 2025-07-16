# Marketplace Approval Fix Deployment Guide

This guide outlines the steps to deploy the marketplace approval fix to the production environment. The fix involves updating contract addresses in both the frontend and backend configurations.

## Changes Made

1. Updated the NFT contract address to `0x7CA1eA6d19A1df7d17fEaF0eA9a1dEFA0e37f894` in:
   - Frontend: `frontend/src/common/config721.js`

2. Updated the Marketplace contract address to `0x25ad5b58a78c1cC1aF3C83607448D0D203158F06` in:
   - Frontend: `frontend/src/common/config721MarketPlace.js`
   - Backend: `sosh_nft_Backend/config/prod/dev.env`

3. Updated the Treasury address to `0x6B93d11526086B43E93c0B6AD7375d8105Ce562A` in:
   - Backend: `sosh_nft_Backend/config/prod/dev.env`

4. Updated the Admin address to `0xDBca3Ea7E2A3aE047d1775954226B71Ad60179C2` in:
   - Backend: `sosh_nft_Backend/config/prod/dev.env`

## Deployment Steps

### Backend Deployment

1. Copy the updated backend configuration file to the production server:

```bash
scp -i "../taurien" sosh-nft-avax-updated/sosh_nft_Backend/config/prod/dev.env taurien@3.216.178.231:backend-update/config/prod/dev.env
```

2. Restart the backend container to apply the changes:

```bash
ssh -i "../taurien" taurien@3.216.178.231 "sudo docker restart sosh-backend-app"
```

### Frontend Deployment

1. Build the frontend:

```bash
cd sosh-nft-avax-updated/frontend
npm run build
```

2. Create a tarball of the build directory:

```bash
cd sosh-nft-avax-updated/frontend
tar -czf build.tar.gz build
```

3. Copy the build tarball to the production server:

```bash
scp -i "../taurien" sosh-nft-avax-updated/frontend/build.tar.gz taurien@3.216.178.231:frontend-update/
```

4. Extract the build tarball on the production server:

```bash
ssh -i "../taurien" taurien@3.216.178.231 "cd frontend-update && tar -xzf build.tar.gz"
```

5. Restart the frontend container to apply the changes:

```bash
ssh -i "../taurien" taurien@3.216.178.231 "sudo docker restart frontend-update-sosh-nft-fe-1"
```

## Verification

After deploying the changes, verify that the marketplace approval functionality is working correctly by:

1. Logging into the application
2. Navigating to your profile page
3. Selecting an NFT to list for sale
4. Setting the sale parameters (price, start time, expiration time)
5. Clicking "Approve Marketplace"
6. Confirming the transaction in MetaMask
7. Verifying that the approval is successful and no error message is displayed

If any issues are encountered, check the marketplace logs in the MongoDB database using the mongo-express interface at `https://www.soshnft.io/api` or by tunneling into the mongo-express interface using:

```bash
ssh -i "../taurien" -L 8500:localhost:8500 taurien@3.216.178.231
```

Then navigate to `http://localhost:8500` in your browser and check the `marketplace_logs` collection for any error messages.
