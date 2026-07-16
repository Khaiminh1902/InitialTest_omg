const { getBlockchain } = require('../models');
const { sendSuccess } = require('../utils/response');

const getStats = (req, res) => {
  const blockchain = getBlockchain();
  const allTransactions = blockchain.getAllTransactions();
  const walletAddresses = new Set();

  [...allTransactions, ...blockchain.pendingTransactions].forEach((tx) => {
    if (tx.fromAddress) {
      walletAddresses.add(tx.fromAddress);
    }

    if (tx.toAddress) {
      walletAddresses.add(tx.toAddress);
    }
  });

  sendSuccess(res, {
    chainLength: blockchain.chain.length,
    pendingTransactions: blockchain.pendingTransactions.length,
    totalTransactions: allTransactions.length,
    difficulty: blockchain.difficulty,
    miningReward: blockchain.miningReward,
    walletCount: walletAddresses.size,
    isValid: blockchain.isChainValid(),
    latestBlockHash: blockchain.getLatestBlock().hash,
  });
};

module.exports = { getStats };
