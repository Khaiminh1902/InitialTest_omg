/**
 * Returns true when the provided value is a non-empty string after trimming.
 */
export const isNonEmptyString = (value) =>
  typeof value === 'string' && value.trim().length > 0;

/**
 * Returns true when the value parses to a finite, positive number.
 */
export const isPositiveNumber = (value) => {
  const n = parseFloat(value);
  return !isNaN(n) && isFinite(n) && n > 0;
};

/**
 * Clamps a number between min and max (inclusive).
 */
export const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

/**
 * Deep-clones a JSON-serialisable object.
 */
export const deepClone = (obj) => JSON.parse(JSON.stringify(obj));

/**
 * Groups an array of transactions by block index.
 */
export const groupTransactionsByBlock = (chain = []) =>
  chain.reduce((acc, block, index) => {
    acc[index] = block.transactions || [];
    return acc;
  }, {});

/**
 * Calculates the current wallet balance from the in-memory blockchain payload.
 */
export const calculateWalletBalance = (chain = [], address = '') => {
  if (!address) {
    return 0;
  }

  return chain.reduce((total, block) => {
    const transactions = Array.isArray(block.transactions) ? block.transactions : [];

    return transactions.reduce((runningTotal, transaction) => {
      let nextTotal = runningTotal;

      if (transaction.fromAddress === address) {
        nextTotal -= Number(transaction.amount) || 0;
      }

      if (transaction.toAddress === address) {
        nextTotal += Number(transaction.amount) || 0;
      }

      return nextTotal;
    }, total);
  }, 0);
};

/**
 * Validates the transaction form and returns field-level messages.
 */
export const validateTransactionForm = ({ fromAddress, toAddress, amount }) => {
  const errors = {};
  const normalizedFrom = fromAddress.trim();
  const normalizedTo = toAddress.trim();
  const parsedAmount = parseFloat(amount);

  if (!normalizedFrom) {
    errors.fromAddress = 'Sender address is required.';
  }

  if (!normalizedTo) {
    errors.toAddress = 'Recipient address is required.';
  }

  if (normalizedFrom && normalizedTo && normalizedFrom === normalizedTo) {
    errors.toAddress = 'Sender and recipient must be different.';
  }

  if (!amount && amount !== 0) {
    errors.amount = 'Amount is required.';
  } else if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
    errors.amount = 'Amount must be greater than zero.';
  }

  return errors;
};
