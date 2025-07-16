/* eslint-disable max-len */
/* eslint-disable consistent-return */
const WEB3 = require("web3");
const ethers = require("ethers");
const fs = require("fs");
const path = require("path");
const AWS = require("aws-sdk");
const {
  INFURA_URL,
  ORDER_FULLFILLED_HASH,
  NewINFURA_URL,
  privateKey,
  adminAddress,
  OPENSEA_SEAPORT_ADDRESS,
  LOOKSRARE_ADDRESS,
  ERC20tokenAddress,
  TakerBid,
  TreasuryAddress,
  tokenAddress,
  endpoint,
  region,
  secretName,
} = require("../../config/appconfig");
const redis = require("../services/redis").getClient();
const saveBlock = require("../models/blockNumber");
const User = require("../models/User");
const Assets = require("../models/Assets");
const { SaleTransactions } = require("../models/SaleTransaction");
const logger = require("../services/logger");

const { distributeErc20 } = require("../job_queue/add_task");

const MARKETPLACE = {
  OPENSEA: "OPENSEA",
  LOOKSRARE: "LOOKSRARE",
};

const configKeys = {
  maxSaleDuration: "maxSaleDuration",
  minSaleDuration: "minSaleDuration",
  minTimeDifference: "minTimeDifference",
  extensionDuration: "extensionDuration",
};

const getWeb3HTTPProvider = (isMainnet) =>
  new WEB3.providers.HttpProvider(isMainnet ? INFURA_URL : INFURA_URL);

const web3Instance = new WEB3(getWeb3HTTPProvider(true));

const awsSecretManagerclient = new AWS.SecretsManager({
  endpoint: endpoint,
  region: region,
});

const getSecrets = async () => {
  const response = new Promise((resolve, reject) => {
    awsSecretManagerclient.getSecretValue(
      { SecretId: secretName },
      (err, result) => {
        if (err) {
          logger.error(`Error while fetching privateKey: ${err}`);
          reject(err);
        }
        if (result) {
          const secrets_resp = JSON.parse(result.SecretString);
          const private_key = secrets_resp.PRIVATE_KEY;
          resolve(private_key);
        }
      }
    );
  });
  return response;
};

const setABIForContract = async (address) => {
  const fileName = `../ABI/contract.${address}.json`;
  const filePath = path.join(__dirname, fileName);

  logger.debug(`fileName :${fileName}`);

  if (!fs.existsSync(filePath)) {
    throw Error(`ABI file ${fileName} does not exist!`);
  }
  const abiAsStr = fs.readFileSync(filePath);
  await redis.set(`contract${address}`, abiAsStr);
};

const getABIForContract = async (address) => {
  const data = await redis.get(`contract${address}`);
  return JSON.parse(data);
};

const getWeb3ContractInstance = async (address) => {
  const abi = await getABIForContract(address);
  return new web3Instance.eth.Contract(abi, address);
};

const getBlockNumber = async () => {
  const currentBlockNumInNetwork = await web3Instance.eth.getBlockNumber();
  return currentBlockNumInNetwork;
};

const getSaleDetails = async (saleId) => {
  const abi = await getABIForContract("sale.abi");
  const contractInstance = new web3Instance.eth.Contract(
    abi,
    "0x47C30E8c049011dF542151C919D546D0D97C82C9"
  );
  try {
    const result = await contractInstance.methods.reserveSale(saleId).call();
    return result;
  } catch (error) {
    console.error("Error calling contract function:", error);
    throw error;
  }
};

const weiConverter = (number) => WEB3.utils.toWei(number);

const checkAndSaveSaleTransactionsInDB = async (
  transactionHash,
  eventParams
) => {
  const receipt = await web3Instance.eth.getTransactionReceipt(transactionHash);
  await Promise.all(
    receipt.logs.map(async (log) => {
      const isOpenseaSale = log.topics.includes(ORDER_FULLFILLED_HASH);
      const isLooksRareSale = log.topics.includes(TakerBid);
      let update_obj = null;
      if (isOpenseaSale || isLooksRareSale) {
        update_obj = {
          ...log,
          type: "Sale",
          tokenId: eventParams?.tokenId,
          marketplace: isOpenseaSale
            ? MARKETPLACE.OPENSEA
            : MARKETPLACE.LOOKSRARE,
        };

        const savedTransactons = await SaleTransactions.create(update_obj);
        logger.info(
          `Found sale transaction for Marketplace: ${savedTransactons?.marketplace}, 
          TransactionHash: ${savedTransactons?.transactionHash}`
        );
      }
    })
  );
};

const checkTxn = async (transactionHash, type) => {
  const receipt = await web3Instance.eth.getTransactionReceipt(transactionHash);
  const detailsArray = [];
  if (receipt && receipt.logs) {
    for (const log of receipt.logs) {
      try {
        // Parse log using interface
        const abi = await getABIForContract("sale.abi");
        const iface = new ethers.utils.Interface(abi);
        const parsedLog = iface.parseLog({
          data: log.data,
          topics: log.topics,
        });
        
        if (parsedLog) {
          const { args } = parsedLog;
          if (type === "saleCreated") {
            const data = await getSaleDetails(Number(args.saleId));
            const details = {
              seller: data.seller,
              buyer: data.buyer,
              askPrice: data.askPrice,
              receivedPrice: data.receivedPrice,
              tokenId: data.tokenId,
              saleType: data.saleType,
              status: data.status,
              startTime: data.startTime,
              endTime: data.endTime,
              saleId: args.saleId.toString(),
            };
            detailsArray.push(details);
          }
          if(type === "purchase"){
            const data = await getSaleDetails(Number(args.saleId));
            const details = {
              seller: data.seller,
              buyer: data.buyer,
              askPrice: data.askPrice,
              receivedPrice: data.receivedPrice,
              tokenId: data.tokenId,
              saleType: data.saleType,
              status: data.status,
              startTime: data.startTime,
              endTime: data.endTime,
              saleId: args.saleId.toString(),
            };
            detailsArray.push(details);
          }
          if(type === "auction"){
            const data = await getSaleDetails(Number(args.auctionId));
            const details = {
              seller: data.seller,
              buyer: args.bidder.toString(),
              askPrice: data.askPrice,
              receivedPrice: data.receivedPrice,
              tokenId: data.tokenId,
              saleType: data.saleType,
              status: data.status,
              startTime: data.startTime,
              endTime: data.endTime,
              saleId: args.auctionId.toString(),
              amount: args.amount.toString(),
              assetEndTime: args.endTime.toString(),
            };
            detailsArray.push(details);
          }
        }
      } catch (error) {
        console.error('Error processing log:', error);
      }
    }
  }

  return detailsArray;
};



const getSellerAndTokenIdForOpenseaSale = async (logs) => {
  const { offerer, offer, consideration } = logs;
  let isSoshNFT = false;
  let amount = ethers.BigNumber.from("0");
  let tokenId;
  let ERC20;
  offer.map(async (data) => {
    const checkSoshNFT = data.includes(tokenAddress);
    const data_obj = { ...data };
    if (checkSoshNFT) {
      isSoshNFT = true;
      tokenId = data_obj.identifier;
    }
  });
  consideration.map(async (data) => {
    const isTransferToTreasury = data.includes(TreasuryAddress);
    const checkSoshNFT = data.includes(tokenAddress);
    const data_obj = { ...data };
    if (checkSoshNFT) {
      isSoshNFT = true;
      tokenId = data_obj.identifier;
    }
    if (isTransferToTreasury) {
      ERC20 = data_obj.token;
      amount = amount.add(data_obj.amount);
    }
  });

  const return_obj = {
    seller: offerer,
    tokenId: tokenId.toString(),
    amount: amount.toString(),
    ERC20,
    isSoshNFT,
  };

  return return_obj;
};

const getSellerAndTokenIdForLooksrareSale = async (logs) => {
  const { maker, tokenId, price, currency } = logs;

  return {
    seller: maker,
    tokenId: tokenId.toString(),
    amount: price.toString(),
    ERC20: currency,
  };
};

const getCreatorOfTokenId = async (tokenId) => {
  const asset = await Assets.findOne({ tokenId }).populate("creator_id");
  if (!asset) {
    throw new Error(`Asset associated to given ${tokenId} not found`);
  }

  return asset?.creator_id?.wallet_address;
};

const getFundsReceiverAndShare = async (logs, marketplace) => {
  let saleInfo;
  if (marketplace === MARKETPLACE.OPENSEA) {
    saleInfo = await getSellerAndTokenIdForOpenseaSale({ ...logs.args });
    if (!saleInfo.isSoshNFT) {
      return null;
    }
  } else if (marketplace === MARKETPLACE.LOOKSRARE) {
    saleInfo = await getSellerAndTokenIdForLooksrareSale({ ...logs.args });

    const royaltyAmount = ethers.BigNumber.from(saleInfo.amount)
      .mul(ethers.BigNumber.from("50"))
      .div(ethers.BigNumber.from("10000"));
    saleInfo.amount = royaltyAmount.toString();
  }

  const { seller, tokenId, amount, ERC20 } = saleInfo;

  const royaltyAmount = ethers.BigNumber.from(amount);

  const userDetails = await User.findOne({ wallet_address: seller }).populate(
    "ref_by"
  );

  let adminRoyalty = royaltyAmount;

  const receivers = [adminAddress];
  const amounts = [adminRoyalty];

  const creator = await getCreatorOfTokenId(tokenId);

  if (creator) {
    const creatorShare = royaltyAmount
      .mul(ethers.BigNumber.from("10"))
      .div(ethers.BigNumber.from("100"));

    adminRoyalty = royaltyAmount.sub(creatorShare);

    receivers.push(creator);
    amounts.push(creatorShare);
    amounts[0] = adminRoyalty;
  }

  const referrer = userDetails?.ref_by?.wallet_address;
  if (referrer) {
    const referalAmount = royaltyAmount
      .mul(ethers.BigNumber.from("10"))
      .div(ethers.BigNumber.from("100"));
    adminRoyalty = adminRoyalty.sub(referalAmount);
    // Create web3.js middleware that signs transactions locally

    receivers.push(referrer);
    amounts.push(referalAmount);
    amounts[0] = adminRoyalty;
  }
  return {
    receivers,
    amounts,
    ERC20,
  };
};

const distributeEtherFromTreasury = async (receivers, amounts, account) => {
  const web3 = web3Instance;
  const treasuryContract = await getWeb3ContractInstance(TreasuryAddress);

  const gas = await treasuryContract.methods
    .distributeEther(receivers, amounts)
    .estimateGas({
      from: account,
      value: "0",
    });

  const txn = await treasuryContract.methods
    .distributeEther(receivers, amounts)
    .send({
      from: account,
      gas,
      gasPrice: await web3.eth.getGasPrice(),
    });
  logger.info(
    `Referral distribution Transaction completed for TransactionHash: ${txn?.transactionHash}`
  );
};

const distributeERC20FromTreasury = async (
  receivers,
  amounts,
  account,
  ERC20
) => {
  const web3 = web3Instance;
  const treasuryContract = await getWeb3ContractInstance(TreasuryAddress);

  const gas = await treasuryContract.methods
    .distributeToken(ERC20, receivers, amounts)
    .estimateGas({
      from: account,
      value: "0",
    });

  const txn = await treasuryContract.methods
    .distributeToken(ERC20, receivers, amounts)
    .send({
      from: account,
      gas,
      gasPrice: await web3.eth.getGasPrice(),
    });
  logger.info(
    `Referral distribution Transaction completed for TransactionHash: ${txn?.transactionHash} ERC20: ${ERC20}`
  );
};
const distributeAmount = async function (logs, marketplace) {
  const sharesData = await getFundsReceiverAndShare({ ...logs }, marketplace);
  if (!sharesData) {
    return null;
  }
  const { receivers, amounts, ERC20 } = sharesData;

  const PRIVATEKEY = await getSecrets();

  await web3Instance.eth.accounts.wallet.add(PRIVATEKEY);
  const account = web3Instance.eth.accounts.wallet[0].address;
  if (!ERC20 || (!amounts && !receivers)) {
    return {
      message: "Data to distribute amount is not sufficient",
      data: sharesData,
    };
  }
  //  start ether tranactions
  if (ERC20 === ethers.constants.AddressZero) {
    distributeEtherFromTreasury(receivers, amounts, account);
    return {
      message: "Ethers transactions initiated",
      data: sharesData,
    };
  }
  //  end for ether tranactions

  distributeErc20(receivers, amounts, account, ERC20);
  return {
    message: "ERC20 transactions initiated",
    data: sharesData,
  };
};

const processPastEvents = async (eventType, address, fromBlock, toBlock) => {
  const latestBlock = await web3Instance.eth.getBlockNumber();
  if (parseInt(toBlock, 10) > parseInt(latestBlock, 10)) {
    // eslint-disable-next-line no-param-reassign
    toBlock = latestBlock;
  }
  logger.info(
    `getPastEvents for ${eventType} from block: ${fromBlock} to block: ${toBlock}, range: ${
      toBlock - fromBlock
    }`
  );

  const web3ContractInst = await getWeb3ContractInstance(address);
  const transferEvents = await web3ContractInst.getPastEvents(eventType, {
    fromBlock,
    toBlock,
  });
  logger.info(
    `pastEvent ${eventType}~~~~~~~~~~~~~~~~~~~~~~~~${transferEvents.length}`
  );

  const transferTransactionHash = [];
  transferEvents.map(async (transferEvent) => {
    const transaction = await SaleTransactions.findOne({
      transactionHash: transferEvent.transactionHash,
    });
    if (
      transaction ||
      transferTransactionHash.includes(transferEvent?.transactionHash)
    )
      return null;
    transferTransactionHash.push(transferEvent?.transactionHash);
    await checkAndSaveSaleTransactionsInDB(transferEvent.transactionHash, {
      ...transferEvent.returnValues,
    });
  });
  // );

  const lastBlockSaved = await saveBlock.findOne();
  if (lastBlockSaved) {
    lastBlockSaved.blockNumber = toBlock;
    await lastBlockSaved.save();
  } else {
    await saveBlock.create({
      blockNumber: toBlock,
    });
  }
  return true;
};

const parseLogs = async (marketplace_address, transaction) => {
  try {
    return new ethers.utils.Interface(
      await getABIForContract(marketplace_address)
    ).parseLog({
      data: transaction.data,
      topics: transaction.topics,
    });
  } catch (error) {
    logger.error(`not a log for ${marketplace_address}, error: ${error}`);
    return null;
  }
};

const processFundsDistribution = async () => {
  const saleTransactions = await SaleTransactions.find({
    isChecked: false,
  });
  logger.info(
    `process for funds distribution started for ${saleTransactions.length} transactions...............`
  );
  const data = await Promise.all(
    saleTransactions.map(async (transaction) => {
      const { marketplace } = transaction;

      const market_address =
        marketplace === MARKETPLACE.OPENSEA
          ? OPENSEA_SEAPORT_ADDRESS
          : LOOKSRARE_ADDRESS;

      const log = await parseLogs(market_address, transaction);
      const obj = await distributeAmount(log, marketplace);
      // eslint-disable-next-line no-param-reassign
      transaction.isChecked = true;
      await transaction.save();
      return obj;
    })
  );
  return data;
};

const setConfig = async () => {
  await redis.set(configKeys.maxSaleDuration, "86400");
  await redis.set(configKeys.minSaleDuration, "60");
  await redis.set(configKeys.minTimeDifference, "15");
  await redis.set(configKeys.extensionDuration, "120");
};

const getConfig = async () => {
  try {
    const config = {};
    for (const key in configKeys) {
      config[key] = await redis.get(configKeys[key]);
    }
    return config;
  } catch (error) {
    console.error("Error getting configuration:", error);
  }
};

module.exports = {
  processPastEvents,
  processFundsDistribution,
  weiConverter,
  getBlockNumber,
  setABIForContract,
  distributeERC20FromTreasury,
  distributeEtherFromTreasury,
  setConfig,
  getConfig,
  checkTxn,
};
