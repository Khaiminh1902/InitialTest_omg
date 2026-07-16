import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchDashboard } from '../api/blockchain.api';
import { POLL_INTERVAL_MS } from '../constants';

const useBlockchain = (pollInterval = POLL_INTERVAL_MS) => {
  const [chain, setChain] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const { chainData, statsData } = await fetchDashboard();
      setChain(chainData);
      setStats(statsData);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to connect to the blockchain API.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    intervalRef.current = setInterval(refresh, pollInterval);
    return () => clearInterval(intervalRef.current);
  }, [refresh, pollInterval]);

  return { chain, stats, loading, refreshing, error, refresh };
};

export default useBlockchain;
