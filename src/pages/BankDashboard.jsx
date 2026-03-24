import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Building2,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Filter,
  Link2,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  IndianRupee,
  TrendingUp,
  TrendingDown,
  Wallet,
  ChevronDown,
  ExternalLink,
  ShieldCheck,
  Landmark,
  BarChart3,
  AlertCircle,
} from 'lucide-react';

// Uses relative paths — works on both localhost (via Vite proxy) and Vercel deployment
const API_BASE = '';

// Format currency in INR
function formatINR(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

// Format date nicely
function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

// Status badge component
function StatusBadge({ status }) {
  const config = {
    PENDING: { color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: Clock, label: 'Pending' },
    APPROVED: { color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', icon: CheckCircle2, label: 'Approved' },
    ACTIVE: { color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', icon: CheckCircle2, label: 'Active' },
    REJECTED: { color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: XCircle, label: 'Rejected' },
    REVOKED: { color: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400', icon: XCircle, label: 'Revoked' },
    EXPIRED: { color: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400', icon: AlertCircle, label: 'Expired' },
  };
  const c = config[status] || config.PENDING;
  const Icon = c.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${c.color}`}>
      <Icon className="w-3.5 h-3.5" />
      {c.label}
    </span>
  );
}

export default function BankDashboard() {
  // State
  const [consentId, setConsentId] = useState(null);
  const [consentStatus, setConsentStatus] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [linkingStep, setLinkingStep] = useState(null); // 'creating' | 'redirecting' | 'polling' | 'fetching' | null
  const [error, setError] = useState(null);
  const [bankFilter, setBankFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const pollingRef = useRef(null);

  // Check URL for returning consent callback
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlConsentId = urlParams.get('consentId') || urlParams.get('id');
    const consent = urlParams.get('consent');

    if (urlConsentId) {
      setConsentId(urlConsentId);
      setLinkingStep('polling');
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname);
    } else if (consent === 'callback') {
      // User returned from Setu redirect but without consentId in URL
      const storedId = localStorage.getItem('setu_consent_id');
      if (storedId) {
        setConsentId(storedId);
        setLinkingStep('polling');
      }
      window.history.replaceState({}, '', window.location.pathname);
    }

    // Or restore from local storage
    const savedData = localStorage.getItem('setu_dashboard_data');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (parsed.accounts?.length) setAccounts(parsed.accounts);
        if (parsed.transactions?.length) setTransactions(parsed.transactions);
        if (parsed.consentId) setConsentId(parsed.consentId);
        if (parsed.consentStatus) setConsentStatus(parsed.consentStatus);
      } catch (e) { /* ignore */ }
    }
  }, []);

  // Poll consent status
  useEffect(() => {
    if (linkingStep !== 'polling' || !consentId) return;

    const pollStatus = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/status?consentId=${consentId}`);
        const data = await res.json();

        if (data.success) {
          setConsentStatus(data.status);

          if (data.status === 'APPROVED' || data.status === 'ACTIVE') {
            clearInterval(pollingRef.current);
            setLinkingStep('fetching');
            fetchTransactions(consentId);
          } else if (data.status === 'REJECTED' || data.status === 'REVOKED' || data.status === 'EXPIRED') {
            clearInterval(pollingRef.current);
            setLinkingStep(null);
            setError(`Consent ${data.status.toLowerCase()}.`);
          }
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    };

    pollStatus();
    pollingRef.current = setInterval(pollStatus, 5000);

    return () => clearInterval(pollingRef.current);
  }, [linkingStep, consentId]);

  // Fetch transactions for approved consent
  const fetchTransactions = async (id) => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/transactions?consentId=${id}`);
      const data = await res.json();

      if (data.success) {
        setAccounts(data.accounts || []);
        setTransactions(data.transactions || []);
        setLinkingStep(null);
        setConsentStatus('APPROVED');
        // Persist data
        localStorage.setItem(
          'setu_dashboard_data',
          JSON.stringify({
            accounts: data.accounts,
            transactions: data.transactions,
            consentId: id,
            consentStatus: 'APPROVED',
          })
        );
      } else {
        setError(data.error || 'Failed to fetch data');
        setLinkingStep(null);
      }
    } catch (err) {
      setError('Network error fetching transactions');
      setLinkingStep(null);
    } finally {
      setLoading(false);
    }
  };

  // Create consent and redirect
  const handleLinkBanks = async () => {
    setError(null);
    setLinkingStep('creating');

    try {
      const res = await fetch(`${API_BASE}/api/consent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          redirectUrl: `${window.location.origin}${window.location.pathname}?consent=callback`,
        }),
      });

      const data = await res.json();

      if (data.success && data.consentId) {
        setConsentId(data.consentId);
        localStorage.setItem('setu_consent_id', data.consentId);
        setConsentStatus('PENDING');

        if (data.redirectURL) {
          setLinkingStep('redirecting');
          // Open in new tab so user stays on app
          window.open(data.redirectURL, '_blank');
          // Start polling immediately
          setLinkingStep('polling');
        } else {
          setLinkingStep('polling');
        }
      } else {
        setError(data.error || 'Consent creation failed');
        setLinkingStep(null);
      }
    } catch (err) {
      setError('Could not connect to server. Is backend running on port 3001?');
      setLinkingStep(null);
    }
  };

  // Reset / relink
  const handleReset = () => {
    localStorage.removeItem('setu_dashboard_data');
    localStorage.removeItem('setu_consent_id');
    setConsentId(null);
    setConsentStatus(null);
    setAccounts([]);
    setTransactions([]);
    setError(null);
    setLinkingStep(null);
    setBankFilter('all');
    setTypeFilter('all');
  };

  // Computed data
  const bankNames = [...new Set(accounts.map((a) => a.bankName).concat(transactions.map((t) => t.bankName)))].filter(Boolean);

  const filteredTxns = transactions.filter((t) => {
    if (bankFilter !== 'all' && t.bankName !== bankFilter) return false;
    if (typeFilter !== 'all' && t.type !== typeFilter) return false;
    return true;
  });

  const totalIncome = filteredTxns
    .filter((t) => t.type === 'CREDIT')
    .reduce((s, t) => s + t.amount, 0);

  const totalSpend = filteredTxns
    .filter((t) => t.type === 'DEBIT')
    .reduce((s, t) => s + t.amount, 0);

  const totalBalance = accounts.reduce((s, a) => s + a.balance, 0);

  const hasData = accounts.length > 0 || transactions.length > 0;

  // ──────────────────────────────────────────────
  // RENDER: No data linked yet
  // ──────────────────────────────────────────────
  if (!hasData && !linkingStep) {
    return (
      <div className="space-y-6 animate-fade-in">
        {/* Hero Card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 p-8 md:p-12 text-white">
          <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-56 h-56 bg-violet-400/10 rounded-full translate-y-1/3 -translate-x-1/3 blur-2xl"></div>

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-8">
            <div className="flex-1 space-y-4">
              <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm font-medium">
                <ShieldCheck className="w-4 h-4" />
                RBI Regulated • Account Aggregator
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
                Link Your Bank Accounts
              </h1>
              <p className="text-blue-100 text-lg max-w-lg leading-relaxed">
                Securely connect your bank accounts via Setu's Account Aggregator framework. View balances, transactions, and spending analytics — all in one place.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  onClick={handleLinkBanks}
                  className="inline-flex items-center gap-2 bg-white text-indigo-700 font-bold px-6 py-3.5 rounded-2xl hover:bg-blue-50 transition-all shadow-lg shadow-indigo-900/30 hover:shadow-xl hover:shadow-indigo-900/40 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Link2 className="w-5 h-5" />
                  Link My Bank Accounts
                </button>
              </div>
            </div>

            <div className="hidden md:flex flex-col items-center gap-3 opacity-80">
              <div className="w-24 h-24 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
                <Landmark className="w-12 h-12" />
              </div>
              <span className="text-xs text-blue-200 font-medium">Setu AA Sandbox</span>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: Building2, title: 'Multi-Bank View', desc: 'See all accounts from multiple banks in a single dashboard' },
            { icon: BarChart3, title: 'Spending Analytics', desc: 'Track income vs expenses with visual breakdowns' },
            { icon: ShieldCheck, title: 'Bank-Grade Security', desc: 'Data encrypted end-to-end via DEPA framework' },
          ].map((f, i) => (
            <div
              key={i}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <f.icon className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">{f.title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Connection Error</p>
              <p className="mt-0.5 text-red-600 dark:text-red-400">{error}</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ──────────────────────────────────────────────
  // RENDER: Linking in progress
  // ──────────────────────────────────────────────
  if (linkingStep) {
    const stepsConfig = {
      creating: { label: 'Creating consent request...', sub: 'Connecting to Setu AA' },
      redirecting: { label: 'Opening consent page...', sub: 'Approve in the new tab' },
      polling: { label: 'Waiting for approval...', sub: 'Complete consent in the Setu tab' },
      fetching: { label: 'Fetching bank data...', sub: 'Decrypting financial information' },
    };
    const step = stepsConfig[linkingStep] || stepsConfig.creating;

    return (
      <div className="flex items-center justify-center min-h-[60vh] animate-fade-in">
        <div className="text-center space-y-6 max-w-sm">
          <div className="relative mx-auto w-20 h-20">
            <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-2 bg-blue-50 dark:bg-blue-900/40 rounded-full flex items-center justify-center">
              <Landmark className="w-7 h-7 text-blue-600 animate-pulse" />
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {step.label}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5">
              {step.sub}
            </p>
          </div>

          {consentStatus && (
            <StatusBadge status={consentStatus} />
          )}

          {consentId && (
            <p className="text-xs text-slate-400 font-mono">
              Consent: {consentId.slice(0, 8)}...{consentId.slice(-4)}
            </p>
          )}

          {error && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleReset}
            className="text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 underline"
          >
            Cancel & Reset
          </button>
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────
  // RENDER: Dashboard with data
  // ──────────────────────────────────────────────
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Multi-Bank Dashboard
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {accounts.length} account{accounts.length !== 1 ? 's' : ''} linked • {transactions.length} transactions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => consentId && fetchTransactions(consentId)}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-semibold text-sm hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            Re-link
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Balance */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-blue-200 mb-2">
              <Wallet className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wider">Total Balance</span>
            </div>
            <p className="text-3xl font-extrabold tracking-tight">{formatINR(totalBalance)}</p>
            <p className="text-xs text-blue-200 mt-1">{accounts.length} linked account{accounts.length !== 1 ? 's' : ''}</p>
          </div>
        </div>

        {/* Total Income */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-2">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs font-medium uppercase tracking-wider">Total Income</span>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{formatINR(totalIncome)}</p>
          <p className="text-xs text-slate-500 mt-1">
            {filteredTxns.filter((t) => t.type === 'CREDIT').length} credit transactions
          </p>
        </div>

        {/* Total Spend */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 text-red-500 dark:text-red-400 mb-2">
            <TrendingDown className="w-4 h-4" />
            <span className="text-xs font-medium uppercase tracking-wider">Total Spend</span>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{formatINR(totalSpend)}</p>
          <p className="text-xs text-slate-500 mt-1">
            {filteredTxns.filter((t) => t.type === 'DEBIT').length} debit transactions
          </p>
        </div>
      </div>

      {/* Bank Account Cards */}
      {accounts.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-500" />
            Linked Accounts
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {accounts.map((acc, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 transition-all hover:shadow-lg hover:shadow-blue-500/5 group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-sm group-hover:scale-110 transition-transform">
                      {acc.bankName?.charAt(0) || 'B'}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-slate-900 dark:text-white">
                        {acc.bankName}
                      </p>
                      <p className="text-[11px] text-slate-500 font-mono">
                        {acc.maskedAccNumber}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-md">
                    {acc.type}
                  </span>
                </div>
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                  <p className="text-xs text-slate-500 mb-0.5">Balance</p>
                  <p className="text-xl font-extrabold text-slate-900 dark:text-white">
                    {formatINR(acc.balance)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Transactions Table */}
      <div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ArrowUpRight className="w-5 h-5 text-emerald-500" />
            Combined Transactions
          </h2>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
          >
            <Filter className="w-4 h-4" />
            Filters
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="flex flex-wrap gap-3 mb-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 animate-slide-up">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Bank</label>
              <select
                value={bankFilter}
                onChange={(e) => setBankFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white font-medium focus:border-blue-500 outline-none min-w-[160px]"
              >
                <option value="all">All Banks</option>
                {bankNames.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Type</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white font-medium focus:border-blue-500 outline-none min-w-[140px]"
              >
                <option value="all">All Types</option>
                <option value="CREDIT">Credit</option>
                <option value="DEBIT">Debit</option>
              </select>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  <th className="text-left px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Date</th>
                  <th className="text-left px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Description</th>
                  <th className="text-right px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Amount</th>
                  <th className="text-center px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Type</th>
                  <th className="text-left px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Bank</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                {filteredTxns.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center text-sm text-slate-400">
                      No transactions found with current filters.
                    </td>
                  </tr>
                ) : (
                  filteredTxns.map((txn, idx) => (
                    <tr
                      key={idx}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="px-5 py-3 text-sm text-slate-600 dark:text-slate-400 whitespace-nowrap font-medium">
                        {formatDate(txn.date)}
                      </td>
                      <td className="px-5 py-3 text-sm text-slate-900 dark:text-white font-medium max-w-[250px] truncate">
                        {txn.description || '—'}
                      </td>
                      <td className={`px-5 py-3 text-sm font-bold text-right whitespace-nowrap ${
                        txn.type === 'CREDIT'
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-red-500 dark:text-red-400'
                      }`}>
                        {txn.type === 'CREDIT' ? '+' : '-'}{formatINR(txn.amount)}
                      </td>
                      <td className="px-5 py-3 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          txn.type === 'CREDIT'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                            : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          {txn.type === 'CREDIT' ? (
                            <ArrowDownRight className="w-3 h-3" />
                          ) : (
                            <ArrowUpRight className="w-3 h-3" />
                          )}
                          {txn.type}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-sm text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                          {txn.bankName}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Income vs. Spend Mini Comparison bar */}
      {(totalIncome > 0 || totalSpend > 0) && (
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-500" />
            Income vs Spend Breakdown
          </h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Income</span>
                <span className="text-xs font-bold text-slate-900 dark:text-white">{formatINR(totalIncome)}</span>
              </div>
              <div className="h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-700"
                  style={{
                    width: `${totalIncome + totalSpend > 0 ? (totalIncome / (totalIncome + totalSpend)) * 100 : 0}%`,
                  }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-semibold text-red-500 dark:text-red-400">Spend</span>
                <span className="text-xs font-bold text-slate-900 dark:text-white">{formatINR(totalSpend)}</span>
              </div>
              <div className="h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-red-500 to-red-400 transition-all duration-700"
                  style={{
                    width: `${totalIncome + totalSpend > 0 ? (totalSpend / (totalIncome + totalSpend)) * 100 : 0}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between">
            <span className="text-xs text-slate-500 font-medium">Net Savings</span>
            <span className={`text-sm font-extrabold ${
              totalIncome - totalSpend >= 0
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-red-500 dark:text-red-400'
            }`}>
              {totalIncome - totalSpend >= 0 ? '+' : ''}{formatINR(totalIncome - totalSpend)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
