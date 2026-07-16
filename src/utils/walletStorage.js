const STORAGE_KEY = 'blockchain-demo:selected-wallet';

/**
 * Restores the last selected wallet from localStorage.
 *
 * @returns {{ publicKey: string, privateKey: string } | null}
 */
export const loadStoredWallet = () => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);

    if (!parsed?.publicKey || !parsed?.privateKey) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
};

/**
 * Persists the selected wallet for later browser refreshes.
 *
 * @param {{ publicKey: string, privateKey: string } | null} wallet - Wallet to persist.
 * @returns {void}
 */
export const saveStoredWallet = (wallet) => {
  try {
    if (!wallet) {
      window.localStorage.removeItem(STORAGE_KEY);
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(wallet));
  } catch {
    // Ignore storage failures and keep the in-memory wallet usable.
  }
};
