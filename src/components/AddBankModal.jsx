import React, { useState } from 'react';
import { Card } from '../components/ui';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Search, Building2, Plus, Loader2, CheckCircle2, X, MapPin } from 'lucide-react';

const BANK_COLORS = {
  'State Bank of India': '#1a4b8c', 'HDFC Bank': '#004c8f', 'ICICI Bank': '#f58220',
  'Axis Bank': '#97144d', 'Kotak Mahindra Bank': '#ed1c24', 'Punjab National Bank': '#1e3a7b',
  'Bank of Baroda': '#f47920', 'Canara Bank': '#ffd700', 'Union Bank of India': '#003366',
  'IndusInd Bank': '#880016', 'Yes Bank': '#0060aa', 'IDBI Bank': '#00693e',
  'Bank of India': '#ed1c24', 'Central Bank of India': '#c41230', 'Indian Bank': '#1a237e',
  'Paytm Payments Bank': '#00baf2', 'Federal Bank': '#003c71', 'South Indian Bank': '#004b87',
};

export default function AddBankModal({ isOpen, onClose }) {
  const { session } = useAuth();
  const { addToast } = useToast();
  const [ifsc, setIfsc] = useState('');
  const [bankInfo, setBankInfo] = useState(null);
  const [searching, setSearching] = useState(false);
  const [accountNumber, setAccountNumber] = useState('');
  const [accountType, setAccountType] = useState('Savings');
  const [balance, setBalance] = useState('');
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const lookupIFSC = async () => {
    if (ifsc.length !== 11) { addToast('IFSC must be 11 characters', 'warning'); return; }
    setSearching(true);
    setBankInfo(null);
    try {
      const res = await fetch(`https://ifsc.razorpay.com/${ifsc.toUpperCase()}`);
      if (!res.ok) throw new Error('Invalid IFSC');
      const data = await res.json();
      setBankInfo(data);
    } catch {
      addToast('Invalid IFSC code. Please check and retry.', 'error');
    }
    setSearching(false);
  };

  const handleSave = async () => {
    if (!bankInfo || !accountNumber || !balance) { addToast('Fill all fields', 'warning'); return; }
    setSaving(true);
    const color = BANK_COLORS[bankInfo.BANK] || '#3b82f6';
    const { error } = await supabase.from('accounts').insert({
      user_id: session.user.id,
      bank_name: bankInfo.BANK,
      account_name: `${accountType} - ${bankInfo.BRANCH}`,
      account_number: `XXXX-${accountNumber.slice(-4)}`,
      account_type: accountType,
      balance: Number(balance),
      color: color,
    });
    if (error) { addToast('Failed to add bank', 'error'); console.error(error); }
    else { addToast(`${bankInfo.BANK} added successfully!`, 'success'); onClose(); }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 space-y-5" onClick={e => e.stopPropagation()}>
        
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-500" /> Add Real Bank Account
          </h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"><X className="w-5 h-5 text-slate-400" /></button>
        </div>

        {/* IFSC Lookup */}
        <div>
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1 block">IFSC Code</label>
          <div className="flex gap-2">
            <input
              value={ifsc} onChange={e => setIfsc(e.target.value.toUpperCase())}
              placeholder="e.g. HDFC0001234"
              maxLength={11}
              className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-mono tracking-wider uppercase"
            />
            <button onClick={lookupIFSC} disabled={searching} className="bg-blue-600 hover:bg-blue-700 text-white px-5 rounded-xl font-medium flex items-center gap-2 disabled:opacity-60">
              {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />} Verify
            </button>
          </div>
        </div>

        {/* Bank Info Card */}
        {bankInfo && (
          <Card className="border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-900/10">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow" style={{ backgroundColor: BANK_COLORS[bankInfo.BANK] || '#3b82f6' }}>
                {bankInfo.BANK.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-800 dark:text-white">{bankInfo.BANK}</h3>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{bankInfo.BRANCH}</p>
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-1"><MapPin className="w-3 h-3" /> {bankInfo.CITY}, {bankInfo.STATE}</p>
                <p className="text-xs font-mono text-slate-400 mt-1">IFSC: {bankInfo.IFSC} • MICR: {bankInfo.MICR || 'N/A'}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Account Details */}
        {bankInfo && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1 block">Account Number</label>
              <input
                value={accountNumber} onChange={e => setAccountNumber(e.target.value)}
                placeholder="Enter your account number"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-mono"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1 block">Account Type</label>
                <select value={accountType} onChange={e => setAccountType(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm">
                  <option>Savings</option><option>Current</option><option>Salary</option><option>Credit</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1 block">Current Balance (₹)</label>
                <input type="number" value={balance} onChange={e => setBalance(e.target.value)} placeholder="e.g. 50000" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm" />
              </div>
            </div>

            <button onClick={handleSave} disabled={saving} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white py-3.5 rounded-xl font-semibold shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 disabled:opacity-60">
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />} Add Bank Account
            </button>
          </div>
        )}

        <p className="text-[10px] text-center text-slate-400">🔒 Bank verified via Razorpay IFSC API • Data stored with Row Level Security</p>
      </div>
    </div>
  );
}
