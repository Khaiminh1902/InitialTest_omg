import React, { useState } from 'react';
import './TransactionForm.css';
import { createWallet } from '../api/blockchain.api';
import { formatAmount, truncateHash } from '../utils/formatters';

const WalletPanel = ({ selectedWallet, balance, onRefreshBlockchain, onWalletChange, onNotify }) => {
  const [creating, setCreating] = useState(false);
  const [refreshingBalance, setRefreshingBalance] = useState(false);
  const [error, setError] = useState('');
  const [copiedField, setCopiedField] = useState('');
  const wallet = selectedWallet;
  const walletLabel = wallet?.publicKey ? truncateHash(wallet.publicKey, 10) : 'No wallet selected';

  const handleCreateWallet = async () => {
    setCreating(true);
    setError('');

    try {
      const walletData = await createWallet();
      onWalletChange(walletData);
      onNotify({
        type: 'success',
        title: 'Wallet Created',
        message: 'A new wallet has been generated and selected.',
      });
    } catch (err) {
      const message = err.message || 'Failed to create wallet';
      setError(message);
      onNotify({ type: 'error', title: 'Wallet creation failed', message });
    } finally {
      setCreating(false);
    }
  };

  const handleRefreshBalance = async () => {
    if (!wallet?.publicKey) {
      return;
    }

    setRefreshingBalance(true);
    setError('');

    try {
      await onRefreshBlockchain();
      onNotify({
        type: 'info',
        title: 'Balance Refreshed',
        message: 'The selected wallet balance is up to date.',
      });
    } catch (err) {
      const message = err.message || 'Failed to refresh balance';
      setError(message);
      onNotify({ type: 'error', title: 'Balance refresh failed', message });
    } finally {
      setRefreshingBalance(false);
    }
  };

  const handleCopy = async (value, fieldName, copiedKey) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(copiedKey);
      window.setTimeout(() => setCopiedField(''), 1500);
      onNotify({ type: 'info', title: 'Copied', message: `${fieldName} copied to clipboard.` });
    } catch (copyError) {
      setError('Unable to copy to clipboard');
    }
  };

  return (
    <div className="transaction-form">
      <h2 className="panel-title">Wallet Studio</h2>
      <p className="panel-subtitle">Generate a key pair, keep it selected, and refresh the balance on demand.</p>

      <div className="wallet-status-card">
        <span className="wallet-status-label">Selected Wallet</span>
        <strong>{walletLabel}</strong>
      </div>

      <button type="button" className="submit-button" onClick={handleCreateWallet} disabled={creating}>
        {creating ? 'Creating Wallet...' : 'Create Wallet'}
      </button>

      {error ? <div className="form-message error">{error}</div> : null}

      <div className="wallet-note">Tip: copy your keys before leaving the page.</div>

      {wallet && (
        <div className="form-group">
          <label>Public Key</label>
          <div className="value-row">
            <div className="field-value hash">{wallet.publicKey}</div>
            <button
              type="button"
              className="copy-button"
              onClick={() => handleCopy(wallet.publicKey, 'Public key', 'publicKey')}
            >
              {copiedField === 'publicKey' ? 'Copied!' : 'Copy'}
            </button>
          </div>

          <label>Private Key</label>
          <div className="value-row">
            <div className="field-value hash">{wallet.privateKey}</div>
            <button
              type="button"
              className="copy-button"
              onClick={() => handleCopy(wallet.privateKey, 'Private key', 'privateKey')}
            >
              {copiedField === 'privateKey' ? 'Copied!' : 'Copy'}
            </button>
          </div>

          <label>Balance</label>
          <div className="value-row">
            <div className="field-value">{formatAmount(balance)}</div>
            <button
              type="button"
              className="copy-button"
              onClick={() => handleCopy(String(balance), 'Balance', 'balance')}
              disabled={!wallet}
            >
              {copiedField === 'balance' ? 'Copied!' : 'Copy'}
            </button>
            <button
              type="button"
              className="copy-button"
              onClick={handleRefreshBalance}
              disabled={refreshingBalance}
            >
              {refreshingBalance ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletPanel;
