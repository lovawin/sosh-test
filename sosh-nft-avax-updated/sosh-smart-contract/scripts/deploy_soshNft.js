const { ethers, upgrades } = require('hardhat');
require('dotenv').config();
const {
  NAME_FOR_NFT,
  SYMBOL_FOR_NFT,
  SOSH_TREASURY,
  SOSH_MARKET,
  BASE_URI,
  ROYALITY_FEE,
  MAX_ROYALITY_FEE,
  MINT_FEE
} = process.env;
async function main() {
  const [deployer] = await ethers.getSigners();
  console.log('Deployer address', deployer.address);

  // Loading the Swapper contract before deploying.
  const Sosh = await ethers.getContractFactory('SoshNFT');

  const nftContract = await upgrades.deployProxy(
    Sosh,
    [
      NAME_FOR_NFT,
      SYMBOL_FOR_NFT,
      SOSH_TREASURY,
      SOSH_MARKET,
      BASE_URI,
      ROYALITY_FEE,
      MAX_ROYALITY_FEE,
      MINT_FEE
    ],
    {
      kind: 'uups',
      initializer: 'initialize',
    }
  );

  // Waiting till the transaction is completed.
  await nftContract.waitForDeployment();

  const nftImplContractAddress =
    await upgrades.erc1967.getImplementationAddress(
      nftContract.target
    );

  // Print the addresses
  console.log(
    'NFT contract is deployed successfully.',
    '\n',
    'Proxy contract address:',
    nftContract.target,
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
