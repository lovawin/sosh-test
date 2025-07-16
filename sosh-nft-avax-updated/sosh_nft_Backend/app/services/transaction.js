const _ = require('lodash');
const Web3 = require('web3');
const { ethers } = require('ethers');
const AWS = require('aws-sdk');
const saveBlock = require('../models/blockNumber');
const { SaleTransactions } = require('../models/SaleTransaction');
const user = require('../models/User');
const tokenABI = require('../ABI/contract.0x86F94BFD40232EcAF697676189dC627e6C89D701.json');
const logger = require('./logger');
const NewINFURA_URL = require('../../config/appconfig');
// const MarketplaceABI = require('../ABI/contract.json');
const OpenseaABI = require('../ABI/contract.0xD112466471b5438C1ca2D218694200e49d81D047.json');
const treasury = require('../ABI/contract.0x712D994C2D6eeDa2594abEa4074EC46027Af0145.json');

const web = new Web3(NewINFURA_URL.NewINFURA_URL);

const {
  endpoint,
  region,
  secretName,
} = NewINFURA_URL;

const contractInstance = new web.eth.Contract(
  tokenABI,
  NewINFURA_URL.tokenAddress,
);
const client = new AWS.SecretsManager({ endpoint: endpoint, region: region });

const saveAllSaleTransaction = async function () {
  try {
    const lastBlockSaved = await saveBlock.findOne();
    const toBlock = await web.eth.getBlockNumber();

    let fromBlock = toBlock;
    if (!lastBlockSaved) {
      fromBlock = lastBlockSaved.fromBlock;
    }

    const TransferEvents = await contractInstance.getPastEvents('Transfer', {
      fromBlock: '16023024', // fromBlock.fromBlock,
      toBlock: '16023026', // toBlock,
    });

    TransferEvents.map(async (transferEvent) => {
      const receipt = await web.eth.getTransactionReceipt(
        transferEvent.transactionHash,
      );

      receipt.logs.map(async (log) => {
        // const isSale = log.topics.includes(NewINFURA_URL.TakerBid);
        const isSale = log.topics.includes(NewINFURA_URL.ORDER_FULLFILLED_HASH);

        if (isSale) {
          const update_obj = {
            ...log,
            type: 'Sale',
          };
          const savedTransactons = await SaleTransactions.create(update_obj);
          logger.info(
            `Found a sale of nft, ${JSON.stringify(savedTransactons)}`,
          );
        }
      });
    });

    lastBlockSaved.fromBlock = toBlock;
    await lastBlockSaved.save();
  } catch (error) {
    logger.error(error);
  }
};

const distributeFunds = async function () {
  try {
    const saleTransactions = await SaleTransactions.find({
      isChecked: false,
    });

    await Promise.all(
      saleTransactions.map(async (transaction) => {
        const value = new ethers.utils.Interface(OpenseaABI).parseLog({
          data: transaction.data,
          topics: transaction.topics,
        });
        console.log('transaction logs', JSON.stringify(value.args));
        // await distributeAmount(value);
        // eslint-disable-next-line no-param-reassign
        transaction.isChecked = true;
        await transaction.save();
        return transaction;
      }),
    );
  } catch (error) {
    logger.error(error);
  }
};

const getlogsReturnArgumentsFor = (value) => {
  // eslint-disable-next-line no-shadow
  const argsOmit = value.args.map((value, index) => index.toString());

  let args = _.omit({ ...value.args }, argsOmit);
  args = _.mapValues(args, (val) => val.toString());
  return args;
};

const distributeAmount = async function (logs) {
  try {
    const returnArgs = getlogsReturnArgumentsFor(logs);
    logger.info(`Distribute amount called for ${JSON.stringify(returnArgs)}`);
    const fromAddress = '0x0c7668f650da814a99d631d272e9cd1e7521ebab'; // returnArgs.maker
    const toAddress = returnArgs.taker;
    const amount = returnArgs.price;

    const royaltyAmount = ethers.BigNumber.from(amount)
      .mul(ethers.BigNumber.from('10'))
      .div(ethers.BigNumber.from('100'));
    let referalAmount = royaltyAmount
      .mul(ethers.BigNumber.from('20'))
      .div(ethers.BigNumber.from('100'));
    let royaltyPrice = royaltyAmount.sub(referalAmount);
    royaltyPrice = royaltyPrice.toString();
    referalAmount = referalAmount.toString();

    const web3 = new Web3(NewINFURA_URL.INFURA_URL);

    await web3.eth.accounts.wallet.add(NewINFURA_URL.privateKey);

    // const { TreasuryAddress, adminAddress } = NewINFURA_URL;
    const account = web3.eth.accounts.wallet[0].address;
    const treasuryContract = await new web3.eth.Contract(
      treasury,
      NewINFURA_URL.TreasuryAddress,
    );
    const userDetails = await user
      .findOne({ wallet_address: fromAddress })
      .populate('ref_by');

    let receivers = [NewINFURA_URL.adminAddress];
    let amounts = [royaltyAmount];

    if (userDetails?.ref_by?.wallet_address) {
      // Create web3.js middleware that signs transactions locally
      receivers = [NewINFURA_URL.adminAddress, toAddress];
      amounts = [royaltyPrice, referalAmount];
    }

    const gas = await treasuryContract.methods
      .distributeToken(NewINFURA_URL.ERC20tokenAddress, receivers, amounts)
      .estimateGas({
        from: account,
        value: '0',
      });

    const txn = await treasuryContract.methods
      .distributeToken(NewINFURA_URL.ERC20tokenAddress, receivers, amounts)
      .send({
        from: account,
        gas,
        gasPrice: await web3.eth.getGasPrice(),
      });
    logger.info(
      `Referral distribution Transaction completed for TransactionHash: ${txn?.transactionHash}`,
    );
  } catch (error) {
    logger.error(error);
  }
};

const getSecrets = async () => {
  const response = await new Promise((resolve, reject) => {
    client.getSecretValue({ SecretId: secretName }, (err, result) => {
      if (err) logger.error(new Date(), 'to get error mesage ', err);
      if (result) {
        const privateKeys = result.SecretString.PRIVATE_KEY;
      }
    });
  });
  // return JSON.parse(response);
};

module.exports = {
  saveAllSaleTransaction,
  distributeFunds,
};
