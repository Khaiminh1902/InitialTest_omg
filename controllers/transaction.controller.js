const { getBlockchain, Transaction } = require('../models');
const persistenceService = require('../services/persistence.service');
const { signTransactionPayload } = require('../services/signing.service');
const { sendSuccess, sendCreated, sendError } = require('../utils/response');
const { isValidAddress, isValidAmount, sanitizeAddress, sanitizeAmount } = require('../utils/validator');

const signTransaction = (req, res, next) => {
  try {
    const { fromAddress, toAddress, amount, privateKey } = req.body;

    if (!privateKey || typeof privateKey !== "string") {
      return sendError(res, "A private key is required to sign the transaction.", 400);
    }

    if (!isValidAddress(fromAddress) || !isValidAddress(toAddress)) {
      return sendError(res, 'Invalid wallet address format', 400);
    }

    if (!isValidAmount(amount)) {
      return sendError(res, 'Amount must be a positive number', 400);
    }

    const signed = signTransactionPayload({
      fromAddress: sanitizeAddress(fromAddress),
      toAddress: sanitizeAddress(toAddress),
      amount: sanitizeAmount(amount),
      privateKey,
    });

    sendSuccess(res, {
      message: "Transaction signed successfully.",
      fromAddress: signed.fromAddress,
      signature: signed.signature,
    });
  } catch (err) {
    next(err);
  }
};

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

module.exports = { signTransaction, addTransaction, getPendingTransactions, getAllTransactions };
