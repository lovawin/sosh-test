const { ethers, upgrades } = require('hardhat');
require("dotenv").config();
const {
  SOSH_NFT
} = process.env;

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log('Deployer address', deployer.address);

  const NFT_PROXY_ADDRESS_TO_UPGRADE = SOSH_NFT

  // Load the NFT contract
  const nft = await ethers.getContractFactory('SoshNFT');

  const nftProxyContract = await upgrades.upgradeProxy(
    NFT_PROXY_ADDRESS_TO_UPGRADE,
    nft,
    { kind: 'uups' }
  );

  // Waiting till the transaction is completed.
  await nftProxyContract.waitForDeployment();

  const nftImplContractAddress =
    await upgrades.erc1967.getImplementationAddress(
      nftProxyContract.target
    );

  // Print the addresses
  console.log(
    'NFT contract is upgraded successfully.',
    '\n',
    'Proxy contract address:',
    nftProxyContract.traget,
    '\n',
    'Implementation contract address:',
    nftImplContractAddress
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
