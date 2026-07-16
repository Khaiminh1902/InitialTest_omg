const crypto = require("crypto");
const { Transaction } = require("../models/blockchain");

/**
 * Signs a transaction payload with the provided PEM private key.
 *
 * @param {{
 *   fromAddress: string,
 *   toAddress: string,
 *   amount: number|string,
 *   privateKey: string,
 * }} payload - Transaction fields and the signing key.
 * @returns {{ fromAddress: string, signature: string, transaction: Transaction }}
 */
const signTransactionPayload = ({ fromAddress, toAddress, amount, privateKey }) => {
  const transaction = new Transaction(fromAddress, toAddress, amount);
  transaction.signTransaction(privateKey);

  const derivedPublicKey = crypto
    .createPublicKey(privateKey)
    .export({ type: "spki", format: "der" })
    .toString("hex");

  if (fromAddress && fromAddress.trim() !== derivedPublicKey) {
    throw new Error("The provided private key does not match the sender address.");
  }

  return {
    fromAddress: derivedPublicKey,
    signature: transaction.signature,
    transaction,
  };
};

module.exports = { signTransactionPayload };
