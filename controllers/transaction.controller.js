const { getBlockchain, Transaction } = require('../models');
const persistenceService = require('../services/persistence.service');
const { sendSuccess, sendCreated, sendError } = require('../utils/response');
const { isValidAddress, isValidAmount, sanitizeAddress, sanitizeAmount } = require('../utils/validator');

const addTransaction = async (req, res, next) => {
  try {
    const blockchain = getBlockchain();
    const { fromAddress, toAddress, amount, signature } = req.body;

    if (!isValidAddress(fromAddress) || !isValidAddress(toAddress)) {
      return sendError(res, 'Invalid wallet address format', 400);
    }

    if (!isValidAmount(amount)) {
      return sendError(res, 'Amount must be a positive number', 400);
    }

    const transaction = new Transaction(
      sanitizeAddress(fromAddress),
      sanitizeAddress(toAddress),
      sanitizeAmount(amount)
    );

    transaction.signature = typeof signature === "string" && signature.trim().length > 0
      ? signature.trim()
      : "signature-placeholder";

    blockchain.addTransaction(transaction);
    await persistenceService.save(blockchain);

    sendCreated(res, {
      message: "Transaction added to the pending pool.",
      transaction,
    });
  } catch (err) {
    next(err);
  }
};

const getPendingTransactions = (req, res) => {
  const blockchain = getBlockchain();
  sendSuccess(res, {
    pendingTransactions: blockchain.pendingTransactions,
    count: blockchain.pendingTransactions.length,
  });
};

const getAllTransactions = (req, res) => {
  const blockchain = getBlockchain();
  const transactions = blockchain.getAllTransactions();
  sendSuccess(res, { transactions, count: transactions.length });
};

module.exports = { addTransaction, getPendingTransactions, getAllTransactions };
