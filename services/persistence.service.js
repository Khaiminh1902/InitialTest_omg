/**
 * Persistence service for the assessment blockchain demo.
 *
 * Storage format:
 * {
 *   "chain": [
 *     {
 *       "timestamp": 1710000000000,
 *       "transactions": [],
 *       "previousHash": "0",
 *       "nonce": 0,
 *       "hash": "..."
 *     }
 *   ],
 *   "pendingTransactions": [
 *     {
 *       "fromAddress": "wallet-a",
 *       "toAddress": "wallet-b",
 *       "amount": 25,
 *       "timestamp": 1710000000000,
 *       "signature": ""
 *     }
 *   ],
 *   "difficulty": 2,
 *   "miningReward": 100
 * }
 */

const fs = require("fs/promises");
const path = require("path");
const logger = require("../utils/logger");
const { Blockchain, Block, Transaction } = require("../models/blockchain");
const STATE_VERSION = 2;

const getStatePath = () =>
  process.env.BLOCKCHAIN_STATE_PATH || path.join(process.cwd(), "blockchain.json");
const getBackupStatePath = () => `${getStatePath()}.bak`;
const getTempStatePath = () => `${getStatePath()}.tmp`;

const hydrateTransaction = (tx = {}) => {
  const restoredTx = new Transaction(tx.fromAddress ?? null, tx.toAddress, tx.amount);
  restoredTx.timestamp = tx.timestamp || restoredTx.timestamp;
  restoredTx.signature = tx.signature || restoredTx.signature;
  return restoredTx;
};

const hydrateBlock = (entry = {}) => {
  const restored = new Block(
    entry.timestamp || Date.now(),
    (entry.transactions || []).map(hydrateTransaction),
    entry.previousHash || "0"
  );
  restored.nonce = entry.nonce || 0;
  restored.hash = entry.hash || restored.calculateHash();
  return restored;
};

const normalizeState = (state) => {
  if (!state || typeof state !== 'object') {
    return null;
  }

  const chain = Array.isArray(state.chain) ? state.chain : [];
  const pendingTransactions = Array.isArray(state.pendingTransactions) ? state.pendingTransactions : [];
  const difficulty = Number.isFinite(Number(state.difficulty)) ? Number(state.difficulty) : 2;
  const miningReward = Number.isFinite(Number(state.miningReward)) ? Number(state.miningReward) : 100;

  return {
    version: Number.isFinite(Number(state.version)) ? Number(state.version) : 1,
    chain,
    pendingTransactions,
    difficulty,
    miningReward,
  };
};

/**
 * Reads and parses a state file from disk.
 *
 * @param {string} filePath - Path to the JSON state file.
 * @returns {Promise<object|null>}
 */
const readStateFile = async (filePath) => {
  const raw = await fs.readFile(filePath, "utf8");
  return normalizeState(JSON.parse(raw));
};

/**
 * Serialize the current blockchain state and write it to disk.
 *
 * @param {Blockchain} blockchain - The blockchain instance to persist.
 * @returns {Promise<void>}
 */
const save = async (blockchain) => {
  try {
    const payload = {
      version: STATE_VERSION,
      savedAt: new Date().toISOString(),
      chain: blockchain.chain,
      pendingTransactions: blockchain.pendingTransactions,
      difficulty: blockchain.difficulty,
      miningReward: blockchain.miningReward,
    };

    await fs.mkdir(path.dirname(getStatePath()), { recursive: true });
    await fs.writeFile(getTempStatePath(), JSON.stringify(payload, null, 2));
    await fs.copyFile(getTempStatePath(), getBackupStatePath());
    await fs.rename(getTempStatePath(), getStatePath());
    logger.info(`Persisted blockchain state to ${getStatePath()}`);
  } catch (error) {
    logger.error(`Failed to persist blockchain state: ${error.message}`);
    throw error;
  }
};

/**
 * Load the persisted blockchain state from disk if it exists.
 *
 * @returns {Promise<Blockchain|null>}
 */
const load = async () => {
  try {
    let normalized = await readStateFile(getStatePath());

    if (!normalized) {
      logger.warn("Persisted blockchain state was empty; starting fresh.");
      return null;
    }

    const blockchain = new Blockchain(normalized.difficulty, normalized.miningReward);
    blockchain.chain = normalized.chain.map(hydrateBlock);
    blockchain.pendingTransactions = normalized.pendingTransactions.map(hydrateTransaction);

    if (!blockchain.isChainValid()) {
      logger.warn("Persisted blockchain state was invalid; starting fresh.");
      return null;
    }

    logger.info("Restored blockchain state from disk");
    return blockchain;
  } catch (error) {
    if (error.code === "ENOENT") {
      try {
        const normalized = await readStateFile(getBackupStatePath());
        const blockchain = new Blockchain(normalized.difficulty, normalized.miningReward);
        blockchain.chain = normalized.chain.map(hydrateBlock);
        blockchain.pendingTransactions = normalized.pendingTransactions.map(hydrateTransaction);
        logger.warn("Primary blockchain state file was missing; restored from backup.");
        return blockchain;
      } catch (backupError) {
        if (backupError.code === "ENOENT") {
          return null;
        }
      }

      return null;
    }

    try {
      const normalized = await readStateFile(getBackupStatePath());
      const blockchain = new Blockchain(normalized.difficulty, normalized.miningReward);
      blockchain.chain = normalized.chain.map(hydrateBlock);
      blockchain.pendingTransactions = normalized.pendingTransactions.map(hydrateTransaction);
      logger.warn("Primary blockchain state file was unreadable; restored from backup.");
      return blockchain;
    } catch (backupError) {
      if (backupError.code !== "ENOENT") {
        logger.warn(`Unable to load backup blockchain state: ${backupError.message}`);
      }
    }

    logger.warn(`Unable to load persisted blockchain state: ${error.message}`);
    return null;
  }
};

/**
 * Delete the persisted blockchain state file if it exists.
 *
 * @returns {Promise<void>}
 */
const clear = async () => {
  try {
    await fs.unlink(getStatePath());
  } catch (error) {
    if (error.code !== "ENOENT") {
      logger.warn(`Unable to clear persisted blockchain state: ${error.message}`);
    }
  }

  try {
    await fs.unlink(getBackupStatePath());
  } catch (error) {
    if (error.code !== "ENOENT") {
      logger.warn(`Unable to clear backup blockchain state: ${error.message}`);
    }
  }

  try {
    await fs.unlink(getTempStatePath());
  } catch (error) {
    if (error.code !== "ENOENT") {
      logger.warn(`Unable to clear temporary blockchain state: ${error.message}`);
    }
  }
};

module.exports = { save, load, clear };
