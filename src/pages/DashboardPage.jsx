import React, { useState } from 'react';
import { useSupabaseData } from '../hooks/useSupabaseData';
import { formatCurrency, formatDate, getCategoryColor, getCategoryEmoji } from '../lib/formatters';
import { Card, PageTransition, Skeleton } from '../components/ui';
import { TrendingUp, ArrowUpRight, ArrowDownRight, CreditCard, Building2, Plus, Server } from 'lucide-react';
import AddBankModal from '../components/AddBankModal';

export default function DashboardPage({ onNavigate }) {
  const { accounts, transactions, loading } = useSupabaseData();
  const [showAddBank, setShowAddBank] = useState(false);

  // Get connected banks from localStorage
  const activeAccounts = accounts;
  const activeTransactions = transactions;
  
  const totalBalance = activeAccounts.reduce((sum, acc) => sum + (Number(acc.balance) || 0), 0);
  
  // Quick stats
  const thisMonthTransactions = activeTransactions.filter(t => {
    const d = new Date(t.created_at);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  
  const monthlyIncome = thisMonthTransactions
    .filter(t => t.type === 'credit')
    .reduce((sum, t) => sum + Number(t.amount), 0);
    
  const monthlySpent = thisMonthTransactions
    .filter(t => t.type === 'debit')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const recentTxns = activeTransactions.slice(0, 10);

  if (loading && accounts.length === 0) {
    return (
      <PageTransition className="space-y-6">
        <Skeleton className="h-48 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1,2,3].map(i => <Skeleton key={i} className="h-32" />)}
        </div>
        <Skeleton className="h-[400px] w-full" />
      </PageTransition>
    );
  }

  return (
    <PageTransition className="space-y-8">
      
      {/* Hero Section */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Total Net Worth Card */}
        <div className="col-span-1 lg:col-span-2 relative overflow-hidden rounded-3xl bg-gradient-animated text-white p-5 md:p-8 shadow-2xl shadow-blue-900/20 group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 transition-transform group-hover:scale-110 duration-700"></div>
          
          <div className="relative z-10">
            <p className="text-white/80 font-medium mb-1.5 flex items-center gap-2 text-sm md:text-base">
              <Building2 className="w-4 h-4 md:w-5 md:h-5" /> Total Net Worth
            </p>
            <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 md:mb-8">
              {formatCurrency(totalBalance)}
            </h2>
            
            <div className="flex flex-wrap gap-3 md:gap-8">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 md:p-4 border border-white/20 flex-1 min-w-[140px]">
                <p className="text-white/70 text-[10px] md:text-sm font-medium flex items-center gap-1 mb-1">
                  <ArrowUpRight className="w-3 h-3 md:w-4 md:h-4 text-mint" /> IN (This Month)
                </p>
                <p className="text-lg md:text-xl font-bold">{formatCurrency(monthlyIncome)}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 md:p-4 border border-white/20 flex-1 min-w-[140px]">
                <p className="text-white/70 text-[10px] md:text-sm font-medium flex items-center gap-1 mb-1">
                  <ArrowDownRight className="w-3 h-3 md:w-4 md:h-4 text-red-400" /> OUT (This Month)
                </p>
                <p className="text-lg md:text-xl font-bold">{formatCurrency(monthlySpent)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Action / Summary */}
        <Card className="col-span-1 border-2 border-dashed border-slate-300 dark:border-slate-700 bg-transparent dark:bg-transparent shadow-none hover:border-blue-500 hover:shadow-none flex flex-col items-center justify-center text-center p-8">
          <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
            <TrendingUp className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">You're doing great!</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Your savings rate is looking healthy this month. Keep it up!
          </p>
        </Card>
      </section>

      {/* Connected Bank Cards */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Connected Accounts</h3>
          <div className="flex gap-2">
            <button onClick={() => onNavigate && onNavigate('bankaa')} className="flex items-center gap-1.5 text-sm font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-full transition-colors">
              <Server className="w-4 h-4 text-emerald-500" /> Link via Setu AA
            </button>
            <button onClick={() => setShowAddBank(true)} className="flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-full transition-colors hidden sm:flex">
              <Plus className="w-4 h-4" /> Add Manual Bank
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeAccounts.map(account => (
            <Card key={account.id} className="cursor-pointer group flex flex-col justify-between h-[160px] overflow-hidden relative">
              <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10 transition-transform group-hover:scale-150 duration-500" style={{ backgroundColor: account.color }}></div>
              
              <div className="flex justify-between items-start z-10">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm"
                    style={{ backgroundColor: account.color }}
                  >
                    {account.bank_name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white leading-tight">{account.bank_name}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                      •••• {(account.masked_number || account.account_number || '0000').split('-').pop()}
                    </p>
                  </div>
                </div>
                <CreditCard className="text-slate-400 w-5 h-5 group-hover:text-blue-500 transition-colors" />
              </div>
              
              <div className="z-10 mt-auto">
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-1">Available Balance</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {formatCurrency(account.balance)}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Recent Transactions */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Recent Transactions</h3>
          <button onClick={() => onNavigate && onNavigate('transactions')} className="text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
            View All →
          </button>
        </div>

        <Card className="p-0 overflow-hidden">
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {recentTxns.length === 0 ? (
              <div className="p-8 text-center text-slate-500">No recent transactions found.</div>
            ) : (
              recentTxns.map((txn) => (
                <div key={txn.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-2xl shadow-inner group-hover:scale-105 transition-transform">
                      {getCategoryEmoji(txn.category)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">{txn.merchant_name || txn.merchant}</p>
                      <div className="flex items-center gap-2 text-xs font-medium mt-1">
                        <span className="text-slate-500">{formatDate(txn.created_at)}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                        <span 
                          className="px-2 py-0.5 rounded-md text-white whitespace-nowrap"
                          style={{ backgroundColor: txn.accounts?.color || '#333' }}
                        >
                          {txn.accounts?.bank_name}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className={`font-bold text-lg ${
                      txn.type?.toLowerCase() === 'credit' 
                        ? 'text-mint dark:text-emerald-400' 
                        : 'text-slate-900 dark:text-white'
                    }`}>
                      {txn.type?.toLowerCase() === 'credit' ? '+' : '-'}{formatCurrency(txn.amount)}
                    </p>
                    <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full inline-block mt-1 ${getCategoryColor(txn.category)}`}>
                      {txn.category}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </section>
      <AddBankModal isOpen={showAddBank} onClose={() => setShowAddBank(false)} />
    </PageTransition>
  );
}
