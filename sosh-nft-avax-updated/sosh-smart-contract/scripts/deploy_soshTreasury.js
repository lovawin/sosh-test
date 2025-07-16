const { ethers, upgrades } = require('hardhat');
require("dotenv").config();

const {
  SUPER_ADMIN_ADDRESS
} = process.env
async function main() {
  const [deployer] = await ethers.getSigners();
  console.log('Deployer address', deployer.address);

  // Loading the Swapper contract before deploying.
  const Sosh = await ethers.getContractFactory('SoshTreasury');

  const tresauryContract = await upgrades.deployProxy(
    Sosh,
    [SUPER_ADMIN_ADDRESS],
    { kind: 'uups', initializer: 'initialize' }
  );

  // Waiting till the transaction is completed.
  await tresauryContract.waitForDeployment();

  const treasuryImplContractAddress = await upgrades.erc1967.getImplementationAddress(tresauryContract.target);


  // provide access role to the vesting contract

  console.log(
    "Treasury contract is deployed successfully.",
    "\n",
    "treasury contract address:",
    tresauryContract.target,
    "\n Impl contract address:",
    treasuryImplContractAddress
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
