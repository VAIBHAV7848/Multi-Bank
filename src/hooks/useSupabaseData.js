import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export function useSupabaseData() {
  const { session } = useAuth();
  const { addToast } = useToast();
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastSynced, setLastSynced] = useState(null);

  useEffect(() => {
    if (!session?.user?.id) {
      setLoading(false);
      return;
    }

    async function fetchData() {
      try {
        setLoading(true);
        const userId = session.user.id;

        // Fetch accounts
        const { data: accountsData, error: accountsError } = await supabase
          .from('accounts')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (accountsError) throw accountsError;

        // Fetch transactions
        const { data: transactionsData, error: transactionsError } = await supabase
          .from('transactions')
          .select(`
            *,
            accounts (
              bank_name,
              account_type,
              color
            )
          `)
          .eq('user_id', userId)
          .order('date', { ascending: false })
          .limit(100);

        if (transactionsError) throw transactionsError;

        setAccounts(accountsData || []);
        setTransactions(transactionsData || []);
        setLastSynced(new Date());
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
        addToast('Failed to sync data with server', 'error');
      } finally {
        setLoading(false);
      }
    }

    fetchData();

    // Set up realtime subscriptions
    const accountsSub = supabase
      .channel('accounts_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'accounts', filter: `user_id=eq.${session.user.id}` }, fetchData)
      .subscribe();

    const transactionsSub = supabase
      .channel('transactions_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions', filter: `user_id=eq.${session.user.id}` }, fetchData)
      .subscribe();

    return () => {
      supabase.removeChannel(accountsSub);
      supabase.removeChannel(transactionsSub);
    };
  }, [session?.user?.id, addToast]);

  return { accounts, transactions, loading, error, lastSynced, refetch: () => setLastSynced(new Date(0)) }; // trigger refetch by changing something if needed, but here's just basic return
}
