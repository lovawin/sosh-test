const { ethers, upgrades } = require('hardhat');
require('dotenv').config();

const {
  SOSH_NFT,
  SOSH_TREASURY,
  PRIMARY_SALE_FEE,
  SECONDARY_SALE_FEE,
  UPPERCAP_PRIMARY_SALE_FEE,
  UPPERCAP_SECONDARY_SALE_FEE
} = process.env;

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log('Deployer address', deployer.address);

  // Loading the Swapper contract before deploying.
  const Sosh = await ethers.getContractFactory('SoshMarketplace');

  const soshProxyContract = await upgrades.deployProxy(
    Sosh,
    [
      SOSH_NFT,
      SOSH_TREASURY,
      PRIMARY_SALE_FEE,
      SECONDARY_SALE_FEE,
      UPPERCAP_PRIMARY_SALE_FEE,
      UPPERCAP_SECONDARY_SALE_FEE
    ],
    { kind: 'uups', initializer: 'initialize' }
  );

  // Waiting till the transaction is completed.
  await soshProxyContract.waitForDeployment();

  const soshImplContractAddress =
    await upgrades.erc1967.getImplementationAddress(
      soshProxyContract.target
    );

  // Print the addresses
  console.log(
    'Sosh contract is deployed successfully.',
    '\n',
    'Proxy contract address:',
    soshProxyContract.target,
    '\n',
    'Implementation contract address:',
    soshImplContractAddress
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
