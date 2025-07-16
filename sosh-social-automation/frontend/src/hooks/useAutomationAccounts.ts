import { useState, useEffect } from 'react';
import { type ChildAccount } from '../types/account';
import { automationAccountsProvider } from '../services/ai-content/automationAccountsProvider';

interface UseAutomationAccountsReturn {
  data: ChildAccount[];
  loading: boolean;
  error: string | null;
  updateConfig: (accountId: string, config: ChildAccount['automationConfig']) => Promise<void>;
}

/**
 * A specialized hook for AI automation accounts
 * Uses a dedicated data provider to keep automation functionality isolated
 */
export const useAutomationAccounts = (): UseAutomationAccountsReturn => {
  const [data, setData] = useState<ChildAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        setLoading(true);
        console.log('useAutomationAccounts: fetching accounts');
        const accounts = await automationAccountsProvider.getAccounts();
        console.log('useAutomationAccounts: received accounts', accounts);
        setData(accounts);
        setError(null);
      } catch (err) {
        console.error('useAutomationAccounts: error fetching accounts', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch automation accounts');
      } finally {
        setLoading(false);
      }
    };

    fetchAccounts();
  }, []);

  const updateConfig = async (accountId: string, config: ChildAccount['automationConfig']) => {
    try {
      await automationAccountsProvider.updateAutomationConfig(accountId, config);
      // Refresh accounts after update
      const accounts = await automationAccountsProvider.getAccounts();
      setData(accounts);
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update automation config');
    }
  };

  return {
    data,
    loading,
    error,
    updateConfig
  };
};
