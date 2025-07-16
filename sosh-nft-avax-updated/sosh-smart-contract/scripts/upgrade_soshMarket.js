const { ethers, upgrades } = require('hardhat');
require("dotenv").config();
const {
  SOSH_MARKET
} = process.env;
async function main() {
  const SOSH_MARKET_PROXY_ADDRESS_TO_UPGRADE = SOSH_MARKET;

  // Load the swapper contract
  const sosh = await ethers.getContractFactory('SoshMarketplace');

  // update the proxy's implementation
  const soshProxyContract = await upgrades.upgradeProxy(
    SOSH_MARKET_PROXY_ADDRESS_TO_UPGRADE,
    sosh,
    { kind: 'uups' }
  );

  // Waiting till the transaction is completed.
  await soshProxyContract.waitForDeployment();

  const soshImplContractAddress =
    await upgrades.erc1967.getImplementationAddress(
      soshProxyContract.target
    );

  // Print the addresses
  console.log(
    'Sosh Market contract is upgraded successfully.',
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
