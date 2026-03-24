import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
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
      
      // Fetch accounts (RLS ensures we only get user's accounts)
      const { data: accountsData, error: accountsError } = await supabase
        .from('accounts')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (accountsError) throw accountsError;
      
      // Fetch transactions
      const { data: txData, error: txError } = await supabase
        .from('transactions')
        .select(`
          *,
          accounts (
            bank_name,
            color
          )
        `)
        .order('created_at', { ascending: false });
        
      if (txError) throw txError;
      
      setAccounts(accountsData || []);
      setTransactions(txData || []);
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
    
    // Set up auto-refresh every 60 seconds
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
