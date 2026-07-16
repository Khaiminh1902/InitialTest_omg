import React, { useState } from 'react';
import './TransactionForm.css';
import { addTransaction, signTransaction } from '../api/blockchain.api';
import { validateTransactionForm } from '../utils/helpers';
import { truncateHash } from '../utils/formatters';

const TransactionForm = ({ selectedWallet, onTransactionAdded, onNotify }) => {
  const [formData, setFormData] = useState({
    fromAddress: '',
    toAddress: '',
    amount: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const selectedWalletLabel = selectedWallet?.publicKey
    ? truncateHash(selectedWallet.publicKey, 10)
    : 'None';

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors((current) => ({ ...current, [e.target.name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = validateTransactionForm(formData);

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      onNotify({
        type: 'error',
        title: 'Invalid transaction',
        message: 'Fix the validation errors before submitting.',
      });
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      let signedFromAddress = formData.fromAddress.trim();
      let signature = 'signature-placeholder';
      const isSelectedWalletSender =
        selectedWallet?.publicKey &&
        signedFromAddress === selectedWallet.publicKey &&
        selectedWallet.privateKey;

      if (isSelectedWalletSender) {
        const signed = await signTransaction(
          signedFromAddress,
          formData.toAddress.trim(),
          formData.amount,
          selectedWallet.privateKey
        );
        signedFromAddress = signed.fromAddress;
        signature = signed.signature;
      }

      const response = await addTransaction(
        signedFromAddress,
        formData.toAddress.trim(),
        formData.amount,
        signature
      );
      setFormData({ fromAddress: '', toAddress: '', amount: '' });
      await onTransactionAdded();
      onNotify({
        type: 'success',
        title: 'Transaction Added',
        message: isSelectedWalletSender
          ? 'The transaction was signed and added to the pending pool.'
          : (response.message || 'The transaction is now pending mining.'),
      });
    } catch (err) {
      onNotify({
        type: 'error',
        title: 'Transaction failed',
        message: err.message || 'Failed to add transaction.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="transaction-form">
      <h2 className="panel-title">Create Transaction</h2>

      <form onSubmit={handleSubmit}>
        <p className="panel-subtitle">Queue a pending transaction, validate it locally, and mine it into the next block.</p>

        <div className="wallet-status-card compact">
          <span className="wallet-status-label">Selected Sender</span>
          <strong>{selectedWalletLabel}</strong>
          <span className="wallet-helper-copy">
            {selectedWallet?.publicKey
              ? 'Transactions from the selected wallet are signed automatically.'
              : 'Without a selected wallet, transactions use the demo signature path.'}
          </span>
          {selectedWallet?.publicKey ? (
            <button
              type="button"
              className="copy-button"
              onClick={() => setFormData((current) => ({ ...current, fromAddress: selectedWallet.publicKey }))}
            >
              Use Wallet
            </button>
          ) : null}
        </div>

        <div className="form-group">
          <label htmlFor="fromAddress">From Address</label>
          <input
            type="text"
            id="fromAddress"
            name="fromAddress"
            value={formData.fromAddress}
            onChange={handleChange}
            placeholder="e.g., wallet-public-key"
            required
          />
          {errors.fromAddress ? <div className="field-error">{errors.fromAddress}</div> : null}
        </div>

        <div className="form-group">
          <label htmlFor="toAddress">To Address</label>
          <input
            type="text"
            id="toAddress"
            name="toAddress"
            value={formData.toAddress}
            onChange={handleChange}
            placeholder="e.g., wallet-public-key"
            required
          />
          {errors.toAddress ? <div className="field-error">{errors.toAddress}</div> : null}
        </div>

        <div className="form-group">
          <label htmlFor="amount">Amount</label>
          <input
            type="number"
            id="amount"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            placeholder="e.g., 100"
            step="0.01"
            min="0"
            required
          />
          {errors.amount ? <div className="field-error">{errors.amount}</div> : null}
        </div>

        <button type="submit" className="submit-button" disabled={loading}>
          {loading ? 'Sending Transaction...' : 'Add Transaction'}
        </button>
      </form>
    </div>
  );
};

export default TransactionForm;
