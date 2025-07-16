const { getWeb3HTTPProvider, web3Instance } = require('../utils/web3');

const web3Provider = getWeb3HTTPProvider();
const web3 = web3Instance(web3Provider);
const Asset = require('../models/Assets');

const Bulls = require('../utils/Bulls');

const txCheck = new Bulls('tx_verify');

const checkTxStatus = async (data) => {
  try {
    const AssetData = data;
    const txStatus = await web3.eth.getTransactionReceipt(AssetData.mint_tx_hash);
    if (txStatus.status === '0x0') {
      await Asset.remove({ _id: AssetData._id });
    } else if (!txStatus) {
      await txCheck.addQueue(data);
    } else {
      AssetData._doc.txStatus = 'SUCCESS';
      await AssetData.save();
    }
  } catch (e) {
    console.log(`Could not find a transaction for your id! ID you provided was ${data.mint_tx_hash}`);
  }
};

txCheck.processQueue(async (data) => {
  await checkTxStatus(data);
});

module.exports = txCheck;
