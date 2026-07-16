import React from 'react';
import './StatsPanel.css';
import { formatAmount, truncateHash } from '../utils/formatters';

const StatsPanel = ({ stats, onMine, isMining, selectedWallet }) => {
  if (!stats) return null;

  const statItems = [
    { label: 'Blocks', value: stats.chainLength },
    { label: 'Pending', value: stats.pendingTransactions },
    { label: 'Mining Reward', value: formatAmount(stats.miningReward) },
    { label: 'Difficulty', value: stats.difficulty },
    { label: 'Wallet Count', value: stats.walletCount ?? 'N/A' },
    { label: 'Latest Hash', value: truncateHash(stats.latestBlockHash, 10), emphasis: 'hash' },
  ];

  return (
    <div className="stats-panel">
      <div className="stats-panel-header">
        <div>
          <h2 className="panel-title">Network Snapshot</h2>
          <p className="panel-subtitle">Current chain health, mining configuration, and activity.</p>
        </div>
        <div className={`chain-status-pill ${stats.isValid ? 'valid' : 'invalid'}`}>
          {stats.isValid ? 'Chain Valid' : 'Chain Invalid'}
        </div>
      </div>

      <div className="stats-grid">
        {statItems.map((item) => (
          <div key={item.label} className={`stat-item ${item.emphasis || ''}`}>
            <div className="stat-label">{item.label}</div>
            <div className="stat-value">{item.value}</div>
          </div>
        ))}
      </div>

      <div className="mining-panel">
        <div>
          <div className="stat-label">Reward Address</div>
          <div className="mining-address">
            {selectedWallet?.publicKey ? truncateHash(selectedWallet.publicKey, 12) : 'miner1'}
          </div>
        </div>
        <button className="mine-button" onClick={onMine} disabled={isMining}>
          {isMining ? 'Mining...' : 'Mine Block'}
        </button>
      </div>

      {isMining ? (
        <div className="inline-spinner-row">
          <span className="small-spinner" />
          <span>Proof-of-work is running for the next block.</span>
        </div>
      ) : null}
    </div>
  );
};

export default StatsPanel;
