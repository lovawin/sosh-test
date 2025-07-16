const { ethers, upgrades } = require('hardhat');
require("dotenv").config();
const {
    SOSH_TREASURY
  } = process.env;

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log('Deployer address', deployer.address);

  const SOSH_TREASURY_PROXY_ADDRESS_TO_UPGRADE = SOSH_TREASURY;

  // Load the swapper contract
  const soshTreasury = await ethers.getContractFactory('SoshTreasury');

  const soshTreasuryProxyContract = await upgrades.upgradeProxy(
    SOSH_TREASURY_PROXY_ADDRESS_TO_UPGRADE,
    soshTreasury,
    { kind: 'uups' }
  );

  // Waiting till the transaction is completed.
  await soshTreasuryProxyContract.waitForDeployment();

  const soshTreasuryImplContractAddress =
    await upgrades.erc1967.getImplementationAddress(
      soshTreasuryProxyContract.target
    );

  // Print the addresses
  console.log(
    'Sosh contract is upgraded successfully.',
    '\n',
    'Proxy contract address:',
    soshTreasuryProxyContract.target,
    '\n',
    'Implementation contract address:',
    soshTreasuryImplContractAddress
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
