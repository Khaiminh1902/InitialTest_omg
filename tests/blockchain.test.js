const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('crypto');
const fs = require('fs/promises');

const { Blockchain, Transaction } = require('../models/blockchain');
const persistenceService = require('../services/persistence.service');

const originalStatePath = process.env.BLOCKCHAIN_STATE_PATH;

test.beforeEach(async () => {
  process.env.BLOCKCHAIN_STATE_PATH = `${process.cwd()}/tests/.tmp-blockchain.json`;
  await persistenceService.clear();
});

test.afterEach(async () => {
  if (originalStatePath === undefined) {
    delete process.env.BLOCKCHAIN_STATE_PATH;
  } else {
    process.env.BLOCKCHAIN_STATE_PATH = originalStatePath;
  }
  await persistenceService.clear();
});

test('rejects unsigned transactions', () => {
  const chain = new Blockchain(1, 10);
  const tx = new Transaction('wallet-a', 'wallet-b', 25);

  assert.throws(() => chain.addTransaction(tx), /signature/i);
});

test('persists and restores blockchain state', async () => {
  const chain = new Blockchain(1, 10);
  const tx = new Transaction('wallet-a', 'wallet-b', 25);
  tx.signature = 'signature-placeholder';
  chain.addTransaction(tx);

  await persistenceService.save(chain);
  const restored = await persistenceService.load();

  assert.ok(restored);
  assert.equal(restored.chain.length, 1);
  assert.equal(restored.pendingTransactions.length, 1);
  assert.equal(restored.pendingTransactions[0].amount, 25);
});

test('signed transactions verify successfully', () => {
  const chain = new Blockchain(1, 10);
  const { privateKey } = crypto.generateKeyPairSync('ec', { namedCurve: 'secp256k1' });
  const tx = new Transaction('', 'wallet-b', 25);

  tx.signTransaction(privateKey);

  assert.equal(tx.isValid(), true);
  assert.doesNotThrow(() => chain.addTransaction(tx));
});

test('mining rewards accumulate for the same address', () => {
  const chain = new Blockchain(1, 10);

  chain.minePendingTransactions('miner-a');
  chain.minePendingTransactions('miner-a');

  assert.equal(chain.getBalanceOfAddress('miner-a'), 20);
  assert.equal(chain.chain.length, 3);
});

test('restores from backup if the primary state file is corrupted', async () => {
  const chain = new Blockchain(1, 10);
  const tx = new Transaction('wallet-a', 'wallet-b', 25);
  tx.signature = 'signature-placeholder';
  chain.addTransaction(tx);

  await persistenceService.save(chain);
  await fs.writeFile(`${process.cwd()}/tests/.tmp-blockchain.json`, '{not-valid-json');

  const restored = await persistenceService.load();

  assert.ok(restored);
  assert.equal(restored.pendingTransactions.length, 1);
});
