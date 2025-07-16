/* eslint-disable new-cap */
/* eslint-disable no-await-in-loop */
const Web3 = require('web3');
const { ethers } = require('ethers');
const saveBlock = require('../models/blockNumber');
const saveSellTransection = require('../models/transection');
const tokenABI = require('../ABI/rare.json');
const logger = require("./logger");
const NewINFURA_URL = require('../../config/appconfig');
const transection = require('../ABI/contract.json');

const web = new Web3(NewINFURA_URL.NewINFURA_URL);

const contractInstance = new web.eth.Contract(tokenABI, NewINFURA_URL.tokenAddress);

const getAllTrasectionHistory = async function () {
  try {
    const fromBlock = await saveBlock.findOne();
    const toBlock = await web.eth.getBlockNumber();
    console.log("get leaseted block number ", fromBlock, toBlock);
    const TransferEvent = await contractInstance.getPastEvents('Transfer', {
      fromBlock: 15616725,
      toBlock: 15616730,
    });
    for (let i = 0; i < TransferEvent.length; i++) {
      const receipt = await web.eth.getTransactionReceipt(
        TransferEvent[i].transactionHash,
      );
      for (let j = 0; j < receipt.logs.length; j++) {
        for (let k = 0; k < receipt.logs[j].topics.length; k++) {
          if (NewINFURA_URL.TakerBid === receipt.logs[j].topics[k]) {
            const obj = {
              address: receipt.logs[j].address,
              blockHash: receipt.logs[j].blockHash,
              blockNumber: receipt.logs[j].blockNumber,
              data: receipt.logs[j].data,
              logIndex: receipt.logs[j].logIndex,
              removed: receipt.logs[j].removed,
              topics: receipt.logs[j].topics,
              transactionHash: receipt.logs[j].transactionHash,
              transactionIndex: receipt.logs[j].transactionIndex,
              id: receipt.logs[j].id,
              type: "Sale",
            };
            const transectionSave = new saveSellTransection(obj);
            const newTransection = await transectionSave.save();
            console.log("save new sale ", newTransection);
          }
        }
      }
    }
    const updateBlock = await saveBlock.updateOne(
      { _id: fromBlock._id },
      {
        $set: {
          fromBlock: toBlock,
        },
      },
    );
  } catch (error) {
    logger.error(new Date(), error.message);
  }
};

const getAllSaleTrasection = async function () {
  try {
    const getSellTransections = await saveSellTransection.find({ isChecked: false });
    if (getSellTransections.length > 0) {
      getSellTransections.forEach(async (val) => {
        const value = new ethers.utils.Interface(transection)
          .parseLog({ data: val.data, topics: val.topics });

        console.log("get value", value.args.price.toString());
        const updateBlock = await saveSellTransection.updateOne(
          { _id: val._id },
          {
            $set: {
              isChecked: true,
            },
          },
        );
        console.log('djhvufnfv fhkfdbnfdhbfd fbkd f d', updateBlock);
      });
    }
  } catch (error) {
    logger.error(new Date(), error.message);
  }
};

const saveBlockNumber = async function () {
  try {
    const getValue = await saveBlock.findOne();
    const toBlock = await web.eth.getBlockNumber();
    if (getValue) {
      const updateBlock = await saveBlock.updateOne(
        { _id: getValue._id },
        {
          $set: {
            fromBlock: toBlock,
          },
        },
      );
    } else {
      const getLastBlock = await web.eth.getBlockNumber();
      const obj = {
        fromBlock: getLastBlock,
      };
      const blockNumberSave = new saveBlock(obj);
      const blockNumber = await blockNumberSave.save();
    }
  } catch (error) {
    logger.error(new Date(), error.message);
  }
};

const updateDatevalue = async function () {
  try {
    const getValue = await saveBlock.findOne();
    if (getValue) {
      getAllTrasectionHistory();
    } else {
      const getLastBlock = await web.eth.getBlockNumber();
      const obj = {
        fromBlock: getLastBlock,
      };
      const blockNumberSave = new saveBlock(obj);
      const blockNumber = await blockNumberSave.save();
      getAllTrasectionHistory();
    }
  } catch (error) {
    logger.error(new Date(), error.message);
  }
};

module.exports.updateDatevalue = updateDatevalue;
module.exports.saveBlockNumber = saveBlockNumber;
module.exports.getAllSaleTrasection = getAllSaleTrasection;
