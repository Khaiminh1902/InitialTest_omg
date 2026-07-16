import React, { useEffect, useState } from 'react';
import './App.css';

import BlockchainViewer from './components/BlockchainViewer';
import TransactionForm from './components/TransactionForm';
import WalletPanel from './components/WalletPanel';
import StatsPanel from './components/StatsPanel';
import Header from './components/Header';
import NotificationCenter from './components/NotificationCenter';

import useBlockchain from './hooks/useBlockchain';
import useNotifications from './hooks/useNotifications';
import { mineBlock } from './api/blockchain.api';
import { calculateWalletBalance } from './utils/helpers';
import { loadStoredWallet, saveStoredWallet } from './utils/walletStorage';

function App() {
  const { chain, stats, loading, refreshing, error, refresh } = useBlockchain();
  const { notifications, notify, dismiss } = useNotifications();
  const [isMining, setIsMining] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState(() => loadStoredWallet());
  const selectedWalletBalance = calculateWalletBalance(
    chain?.chain || [],
    selectedWallet?.publicKey || ''
  );

  useEffect(() => {
    saveStoredWallet(selectedWallet);
  }, [selectedWallet]);

  const handleMine = async () => {
    setIsMining(true);

    try {
      const rewardAddress = selectedWallet?.publicKey || 'miner1';
      const response = await mineBlock(rewardAddress);
      await refresh();
      notify({
        type: 'success',
        title: 'Block Mined',
        message: response.message || 'The pending transactions were mined successfully.',
      });
    } catch (err) {
      notify({
        type: 'error',
        title: 'Mining failed',
        message: err.message || 'The block could not be mined.',
      });
    } finally {
      setIsMining(false);
    }
  };

  if (loading) {
    return (
      <div className="app-loading">
        <div className="spinner"></div>
        <p>Loading Blockchain...</p>
      </div>
    );
  }

  return (
    <div className="App">
      <NotificationCenter notifications={notifications} onDismiss={dismiss} />
      <Header />
      <div className="app-container">
        {error && (
          <div className="error-banner">
            <p>{error}</p>
            <button type="button" className="inline-action-button" onClick={refresh} disabled={refreshing}>
              {refreshing ? 'Retrying...' : 'Retry'}
            </button>
          </div>
        )}

        <div className="main-content">
          <div className="left-panel">
            <StatsPanel
              stats={stats}
              onMine={handleMine}
              isMining={isMining}
              selectedWallet={selectedWallet}
            />
            <WalletPanel
              selectedWallet={selectedWallet}
              balance={selectedWalletBalance}
              onRefreshBlockchain={refresh}
              onWalletChange={setSelectedWallet}
              onNotify={notify}
            />
            <TransactionForm
              selectedWallet={selectedWallet}
              onTransactionAdded={refresh}
              onNotify={notify}
            />
          </div>

          <div className="right-panel">
            <BlockchainViewer blockchain={chain} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
