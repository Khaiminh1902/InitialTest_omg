const crypto = require('crypto');
const config = require('../config');
const logger = require('../utils/logger');
const persistenceService = require('../services/persistence.service');
const { Blockchain, Block, Transaction } = require('./blockchain');

let blockchain = new Blockchain(
  config.blockchain.difficulty,
  config.blockchain.miningReward
);
let initializationPromise = null;

const seedDemoData = () => {
  if (!config.demoData.enabled) {
    return;
  }

  for (const { from, to, amount } of config.demoData.transactions) {
    const demoTx = new Transaction(from, to, amount);
    const { privateKey } = crypto.generateKeyPairSync('ec', { namedCurve: 'secp256k1' });
    demoTx.signTransaction(privateKey);
    blockchain.addTransaction(demoTx);
  }

  if (blockchain.pendingTransactions.length > 0) {
    blockchain.minePendingTransactions(config.blockchain.initialMinerAddress);
    logger.info('Seeded demo blockchain data');
  }
};

const initializeBlockchain = async () => {
  if (initializationPromise) {
    return initializationPromise;
  }

  initializationPromise = (async () => {
  const restored = await persistenceService.load();

    if (restored) {
      blockchain = restored;
      logger.info('Loaded persisted blockchain state');
      return blockchain;
    }

    seedDemoData();
    if (blockchain.pendingTransactions.length > 0) {
      await persistenceService.save(blockchain);
    }

    return blockchain;
  })();

  return initializationPromise;
};

const getBlockchain = () => blockchain;

module.exports = {
  getBlockchain,
  initializeBlockchain,
  Blockchain,
  Block,
  Transaction,
};
