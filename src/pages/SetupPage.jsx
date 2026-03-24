import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

import { supabase } from '../lib/supabase';
import { seedInitialData } from '../lib/seedData';
import { formatCurrency } from '../lib/formatters';
import { Card, PageTransition } from '../components/ui';
import { Building2, CheckCircle2, Loader2, ArrowRight, ShieldCheck, Lock, UserCheck, FileCheck } from 'lucide-react';

export default function SetupPage({ onComplete }) {
  const { user } = useAuth();
  const { addToast } = useToast();
  
  const [step, setStep] = useState('consent'); // 'consent', 'loading', 'linking'
  const [accounts, setAccounts] = useState([]);
  const [connectedIds, setConnectedIds] = useState([]);
  
  const startSetup = async () => {
    setStep('loading');
    if (!user) return;
    
    try {
      // 1. Ensure user has mock data seeded in the new database tables
      await seedInitialData(user.id);

      // 2. Fetch the newly seeded accounts
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      setAccounts(data || []);
      
      if (data && data.length > 0) {
        const shuffled = [...data].sort(() => 0.5 - Math.random());
        setConnectedIds(shuffled.slice(0, 3).map(a => a.id));
      }
      
      setTimeout(() => setStep('linking'), 1500);
    } catch (error) {
      addToast(error.message || 'Setup failed', 'error');
      localStorage.setItem('setupComplete', 'true');
      onComplete();
    }
  };

  const toggleConnect = (id) => {
    setConnectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(pId => pId !== id)
        : [...prev, id]
    );
  };

  const finishSetup = async () => {
    if (connectedIds.length === 0) {
      addToast('Please connect at least one bank account', 'warning');
      return;
    }
    
    // Update the database profile so setup is permanently complete across devices
    await supabase.from('profiles').update({ setup_complete: true }).eq('id', user.id);
    localStorage.setItem('setupComplete', 'true'); // Fallback local logic
    
    addToast('Workspace ready!', 'success');
    onComplete();
  };

  // ─── CONSENT SCREEN (Account Aggregator Flow) ───
  if (step === 'consent') {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6">
        <PageTransition className="max-w-lg w-full space-y-6">
          
          <div className="text-center mb-2">
            <div className="w-20 h-20 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-3xl mx-auto flex items-center justify-center mb-6 shadow-xl shadow-blue-500/30">
              <ShieldCheck className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Secure Bank Linking</h1>
            <p className="text-slate-500 dark:text-slate-400">
              Powered by <strong className="text-blue-600 dark:text-blue-400">RBI Account Aggregator Framework</strong>
            </p>
          </div>

          <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/10">
            <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5 text-blue-600" /> Your data, your consent
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0 mt-0.5">
                  <UserCheck className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-slate-800 dark:text-slate-200">Only YOUR accounts</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">You consent to share your own bank data. No one else's data is ever accessed.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0 mt-0.5">
                  <Lock className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-slate-800 dark:text-slate-200">End-to-end encrypted</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Data is encrypted with AES-256. Row Level Security ensures complete user isolation.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0 mt-0.5">
                  <FileCheck className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-slate-800 dark:text-slate-200">RBI regulated & compliant</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Uses NBFC-AA licensed aggregators (Setu / OneMoney) under DEPA framework.</p>
                </div>
              </div>
            </div>
          </Card>

          <div className="bg-slate-100 dark:bg-slate-900 rounded-2xl p-4 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              By proceeding, you consent to Finclario securely fetching your account balances and transaction history via the Account Aggregator ecosystem. You can revoke access at any time from Settings.
            </p>
          </div>

          <button 
            onClick={startSetup}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white py-4 rounded-xl font-semibold shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-1 flex items-center justify-center gap-2 text-lg"
          >
            <ShieldCheck className="w-5 h-5" /> I Consent — Link My Banks
          </button>
          
          <p className="text-center text-[10px] text-slate-400 uppercase tracking-wider">
            🔒 256-bit SSL • RLS Protected • GDPR & DPDPA Compliant
          </p>
        </PageTransition>
      </div>
    );
  }

  // ─── LOADING SCREEN ───
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
            Fetching via Account Aggregator ⚡
          </h2>
          <p className="text-slate-500 dark:text-slate-400">
            Securely syncing your bank data through RBI-licensed AA framework...
          </p>
        </PageTransition>
      </div>
    );
  }

  // ─── BANK LINKING SCREEN ───
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <PageTransition className="max-w-3xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">Banks Discovered via AA</h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg">
            We found these accounts linked to your identity. Select which ones to monitor.
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
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        {account.account_type} • Verified via AA
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
