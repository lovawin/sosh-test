# Sosh

This project contains Three main contracts 
1. SoshNFT.sol
2. SoshMarketplace.sol
3. SoshTreasury.sol

Try running some of the following tasks:

```shell
npx hardhat help
GAS_REPORT=true npx hardhat test
npx hardhat node
```
Add env file in the root folder with the following variables
- File name: .env
```
INFURA_URL=
DEPLOYER_PRIVATE_KEY=
ETHERSCAN_API_KEY=
NAME_FOR_NFT=
SYMBOL_FOR_NFT=
SOSH_MARKET=
SOSH_NFT=
SOSH_TREASURY=
WETH_ADDRESS=
USDT_ADDRESS=
PRIMARY_SALE_FEE=
SECONDARY_SALE_FEE=
SUPER_ADMIN_ADDRESS=
```
## To test 

- SoshNFT.sol
```shell
npx hardhat test test/SoshNFT.test.js
```
- SoshMarketplace.sol
```shell
npx hardhat test test/SoshMarkeplace.test.js
```
- SoshTreasury.sol
```shell
npx hardhat test test/SoshTreasury.test.js
```
## To deploy or upgrade

- SoshNFT.sol
```shell
npx hardhat run scripts/deploy_soshNft.js
npx hardhat run scripts/upgrade_soshNft.js
```
- SoshMarkeplace.sol
```
npx hardhat run scripts/deploy_soshMarketplace.js
npx hardhat run scripts/upgrade_soshMarketplace.js
```
- SoshTreasury.sol
```
npx hardhat run scripts/deploy_soshTreasury.js
npx hardhat run scripts/upgrade_soshTreasury.js
```
## To verify

```
npx hardhat verify <CONTRACT_ADDRESS> <CONSTRUCTOR_INPUTS> --network matic
```