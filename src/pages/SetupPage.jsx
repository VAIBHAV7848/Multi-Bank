import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

import { seedDatabase } from '../lib/seedData';
import { formatCurrency } from '../lib/formatters';
import { Card, PageTransition } from '../components/ui';
import { Building2, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';

export default function SetupPage({ onComplete }) {
  const { user } = useAuth();
  const { addToast } = useToast();
  
  const [step, setStep] = useState('loading'); // 'loading', 'linking', 'done'
  const [accounts, setAccounts] = useState([]);
  const [connectedIds, setConnectedIds] = useState([]);
  
  useEffect(() => {
    const initializeSetup = async () => {
      if (!user) return;
      
      try {
        setStep('loading');
        
        // Ensure data exists
        const { success } = await seedDatabase(user.id);
        if (success) {
          // Fetch the created accounts to show available banks
          const data = JSON.parse(localStorage.getItem('mockAccounts') || '[]');
          
          setAccounts(data);
          
          // Pre-connect 3 random accounts for demo
          if (data && data.length > 0) {
            const shuffled = [...data].sort(() => 0.5 - Math.random());
            setConnectedIds(shuffled.slice(0, 3).map(a => a.id));
          }
          
          setTimeout(() => {
            setStep('linking');
          }, 1500); // Artificial delay to show the nice loading screen
        }
      } catch (error) {
        addToast(error.message || 'Setup failed', 'error');
      }
    };
    
    initializeSetup();
  }, [user, addToast]);

  const toggleConnect = (id) => {
    setConnectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(pId => pId !== id)
        : [...prev, id]
    );
  };

  const finishSetup = () => {
    if (connectedIds.length === 0) {
      addToast('Please connect at least one bank account', 'warning');
      return;
    }
    
    // Save preferences to local storage
    localStorage.setItem('connectedBanks', JSON.stringify(connectedIds));
    localStorage.setItem('setupComplete', 'true');
    
    addToast('Workspace ready!', 'success');
    onComplete();
  };

  if (step === 'loading') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-6">
        <PageTransition className="flex flex-col items-center max-w-md w-full text-center">
          <div className="w-20 h-20 mb-8 relative">
            <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-4 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-full animate-pulse blur-sm"></div>
            <div className="absolute inset-4 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-full"></div>
          </div>
          
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-500 dark:from-white dark:to-slate-400 mb-4">
            Setting up your workspace ⚡
          </h2>
          <p className="text-slate-500 dark:text-slate-400">
            We're preparing your secure financial environment and syncing historical data...
          </p>
        </PageTransition>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <PageTransition className="max-w-3xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">Link Your Bank Accounts</h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg">
            Connect your accounts securely to see all your finances in one place.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {accounts.map((account) => {
            const isConnected = connectedIds.includes(account.id);
            return (
              <div 
                key={account.id}
                onClick={() => toggleConnect(account.id)}
                className={`relative p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 group ${
                  isConnected 
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10 shadow-md shadow-blue-500/10' 
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-lg'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm"
                      style={{ backgroundColor: account.color }}
                    >
                      {account.bank_name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">{account.bank_name}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                        {account.account_number}
                      </p>
                    </div>
                  </div>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                    isConnected ? 'bg-blue-500 text-white' : 'border-2 border-slate-300 dark:border-slate-600 text-transparent'
                  }`}>
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                </div>
                
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-end">
                  <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Balance</span>
                  <span className="text-lg font-bold text-slate-900 dark:text-white">
                    {formatCurrency(account.balance)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-center pt-8">
          <button
            onClick={finishSetup}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-1 flex items-center gap-2 group"
          >
            Continue to Dashboard
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </PageTransition>
    </div>
  );
}
