import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export function useSupabaseData() {
  const { session } = useAuth();
  const { addToast } = useToast();
  
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastSynced, setLastSynced] = useState(new Date());

  const fetchData = useCallback(async (showToast = false) => {
    if (!session?.user?.id) return;
    
    try {
      setLoading(true);
      
      // Simulate network request
      await new Promise(r => setTimeout(r, 600));

      const accountsData = JSON.parse(localStorage.getItem('mockAccounts') || '[]');
      let txData = JSON.parse(localStorage.getItem('mockTransactions') || '[]');
      
      // Join transactions with account details (like Supabase foreign keys)
      txData = txData.map(t => {
        const acc = accountsData.find(a => a.id === t.account_id);
        return {
          ...t,
          accounts: acc ? { bank_name: acc.bank_name, color: acc.color } : null
        };
      });
      
      setAccounts(accountsData);
      setTransactions(txData);
      setLastSynced(new Date());
      
      if (showToast) {
        addToast('Data synced successfully', 'success');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      addToast(error.message || 'Failed to fetch data', 'error');
    } finally {
      setLoading(false);
    }
  }, [session, addToast]);

  useEffect(() => {
    fetchData();
    
    // Auto-refresh every 60s
    const interval = setInterval(() => {
      fetchData();
    }, 60000);
    
    return () => clearInterval(interval);
  }, [fetchData]);

  return {
    accounts,
    transactions,
    loading,
    lastSynced,
    refetch: () => fetchData(true)
  };
}
