import React, { useState, useMemo } from 'react';
import { useSupabaseData } from '../hooks/useSupabaseData';
import { formatCurrency, formatDate, getCategoryColor, getCategoryEmoji } from '../lib/formatters';
import { Card, PageTransition, Skeleton } from '../components/ui';
import { Search, Filter, ChevronLeft, ChevronRight, Download } from 'lucide-react';

export default function TransactionsPage() {
  const { accounts, transactions, loading } = useSupabaseData();
  
  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBank, setSelectedBank] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [dateRange, setDateRange] = useState('all'); // all, 7d, 30d, 90d
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // Derived data
  const connectedBankIds = JSON.parse(localStorage.getItem('connectedBanks') || '[]');
  const activeTransactions = transactions.filter(t => connectedBankIds.includes(t.account_id));
  
  // Default available categories from data
  const availableCategories = useMemo(() => {
    const cats = new Set(activeTransactions.map(t => t.category));
    return Array.from(cats).sort();
  }, [activeTransactions]);

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    let result = activeTransactions;

    // Search filter
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(t => 
        t.merchant.toLowerCase().includes(lowerSearch) || 
        t.category.toLowerCase().includes(lowerSearch)
      );
    }

    // Bank filter
    if (selectedBank !== 'all') {
      result = result.filter(t => t.account_id === selectedBank);
    }

    // Category filter
    if (selectedCategory !== 'all') {
      result = result.filter(t => t.category === selectedCategory);
    }

    // Date filter
    if (dateRange !== 'all') {
      const now = new Date();
      const cutoff = new Date();
      
      if (dateRange === '7d') cutoff.setDate(now.getDate() - 7);
      else if (dateRange === '30d') cutoff.setDate(now.getDate() - 30);
      else if (dateRange === '90d') cutoff.setDate(now.getDate() - 90);
      
      result = result.filter(t => new Date(t.created_at) >= cutoff);
    }

    return result;
  }, [activeTransactions, searchTerm, selectedBank, selectedCategory, dateRange]);

  // Pagination logic
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const currentTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Summary stats for filtered results
  const totalFilteredDebit = filteredTransactions
    .filter(t => t.type === 'debit')
    .reduce((sum, t) => sum + Number(t.amount), 0);
    
  const totalFilteredCredit = filteredTransactions
    .filter(t => t.type === 'credit')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  // Auto reset page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedBank, selectedCategory, dateRange]);

  if (loading && transactions.length === 0) {
    return (
      <PageTransition className="space-y-6">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-[600px] w-full" />
      </PageTransition>
    );
  }

  return (
    <PageTransition className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">All Transactions</h2>
          <p className="text-slate-500 text-sm mt-1">
            Showing {filteredTransactions.length} of {activeTransactions.length} total entries
          </p>
        </div>
        <button className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-medium px-4 py-2 rounded-xl transition-colors shadow-sm">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {/* Filters Bar */}
      <Card className="p-4 flex flex-col xl:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search merchants, categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap gap-3 xl:w-auto">
          <div className="relative flex-1 sm:flex-none min-w-[140px]">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
            <select
              value={selectedBank}
              onChange={(e) => setSelectedBank(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 pl-9 pr-8 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 font-medium text-sm"
            >
              <option value="all">All Banks</option>
              {accounts.filter(a => connectedBankIds.includes(a.id)).map(acc => (
                <option key={acc.id} value={acc.id}>{acc.bank_name}</option>
              ))}
            </select>
          </div>
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="flex-1 sm:flex-none min-w-[140px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-4 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 font-medium text-sm"
          >
            <option value="all">All Categories</option>
            {availableCategories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="flex-1 sm:flex-none min-w-[140px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-4 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 font-medium text-sm"
          >
            <option value="all">All Time</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
        </div>
      </Card>

      {/* Transactions Table */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                <th className="py-4 px-6 font-semibold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Date</th>
                <th className="py-4 px-6 font-semibold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Merchant / Details</th>
                <th className="py-4 px-6 font-semibold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Category</th>
                <th className="py-4 px-6 font-semibold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Bank</th>
                <th className="py-4 px-6 font-semibold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {currentTransactions.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-slate-500">
                    No transactions match your filters.
                  </td>
                </tr>
              ) : (
                currentTransactions.map(txn => (
                  <tr key={txn.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors group">
                    <td className="py-4 px-6 whitespace-nowrap text-sm font-medium text-slate-600 dark:text-slate-400">
                      {formatDate(txn.created_at)}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shadow-inner text-xl">
                          {getCategoryEmoji(txn.category)}
                        </div>
                        <span className="font-bold text-slate-900 dark:text-white">{txn.merchant}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className={`text-xs uppercase font-bold px-2.5 py-1 rounded-full ${getCategoryColor(txn.category)}`}>
                        {txn.category}
                      </span>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                       <span 
                          className="px-2.5 py-1 rounded-md text-white text-xs font-bold"
                          style={{ backgroundColor: txn.accounts?.color || '#333' }}
                        >
                          {txn.accounts?.bank_name}
                        </span>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap text-right">
                      <p className={`font-bold ${
                        txn.type === 'credit' 
                          ? 'text-mint dark:text-emerald-400' 
                          : 'text-slate-900 dark:text-white'
                      }`}>
                        {txn.type === 'credit' ? '+' : '-'}{formatCurrency(txn.amount)}
                      </p>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer & Pagination */}
        <div className="bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800 p-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          <div className="flex gap-4 text-sm">
            <div className="flex flex-col">
              <span className="text-slate-500 text-xs uppercase font-semibold">Total In</span>
              <span className="font-bold text-mint dark:text-emerald-400">{formatCurrency(totalFilteredCredit)}</span>
            </div>
            <div className="w-px bg-slate-200 dark:bg-slate-700"></div>
            <div className="flex flex-col">
              <span className="text-slate-500 text-xs uppercase font-semibold">Total Out</span>
              <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(totalFilteredDebit)}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-500">
              Page <span className="font-bold text-slate-900 dark:text-white">{currentPage}</span> of {Math.max(1, totalPages)}
            </span>
            <div className="flex gap-2">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Next page"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </Card>
      
    </PageTransition>
  );
}
