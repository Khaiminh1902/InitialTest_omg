import React from 'react';
import './BlockchainViewer.css';
import { formatAddress, formatAmount, formatTimestamp, truncateHash } from '../utils/formatters';

const BlockchainViewer = ({ blockchain }) => {
  if (!blockchain || !blockchain.chain) {
    return (
      <div className="blockchain-viewer">
        <p>Loading blockchain data...</p>
      </div>
    );
  }

  return (
    <div className="blockchain-viewer">
      <h2 className="panel-title">Blockchain ({blockchain.length} blocks)</h2>

      <div className="blocks-container">
        {blockchain.chain.map((block, index) => (
          <div key={index} className="block-card">
            <div className="block-header">
              <span className="block-number">Block #{index}</span>
              {index === 0 && <span className="genesis-badge">Genesis</span>}
            </div>

            <div className="block-content">
              <div className="block-meta-grid">
                <div className="block-field">
                  <span className="field-label">Hash</span>
                  <span className="field-value hash" title={block.hash}>
                    {truncateHash(block.hash, 12)}
                  </span>
                </div>

                <div className="block-field">
                  <span className="field-label">Previous Hash</span>
                  <span className="field-value hash" title={block.previousHash || 'N/A'}>
                    {truncateHash(block.previousHash || 'N/A', 12)}
                  </span>
                </div>

                <div className="block-field">
                  <span className="field-label">Timestamp</span>
                  <span className="field-value">{formatTimestamp(block.timestamp)}</span>
                </div>

                <div className="block-field">
                  <span className="field-label">Nonce</span>
                  <span className="field-value">{block.nonce}</span>
                </div>

                <div className="block-field">
                  <span className="field-label">Transaction Count</span>
                  <span className="field-value">{block.transactions?.length || 0}</span>
                </div>
              </div>

              {block.transactions && block.transactions.length > 0 && (
                <details className="transactions-list">
                  <summary className="transactions-header">
                    View Transactions ({block.transactions.length})
                  </summary>
                  {block.transactions.map((tx, txIndex) => (
                    <div key={txIndex} className="transaction-item">
                      <div className="tx-flow">
                        <div className="tx-from">
                          <span className="tx-label">From</span>
                          <span className="tx-address" title={formatAddress(tx.fromAddress)}>
                            {truncateHash(formatAddress(tx.fromAddress), 12)}
                          </span>
                        </div>
                        <div className="tx-arrow">→</div>
                        <div className="tx-to">
                          <span className="tx-label">To</span>
                          <span className="tx-address" title={tx.toAddress}>
                            {truncateHash(tx.toAddress, 12)}
                          </span>
                        </div>
                      </div>
                      <div className="tx-amount">{formatAmount(tx.amount)}</div>
                    </div>
                  ))}
                </details>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BlockchainViewer;
