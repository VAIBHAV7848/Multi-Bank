import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { useSupabaseData } from '../hooks/useSupabaseData';
import { supabase } from '../lib/supabase';
import { formatCurrency } from '../lib/formatters';
import { Card, PageTransition } from '../components/ui';
import { User, BellRing, Link2, CreditCard, Save } from 'lucide-react';

export default function SettingsPage() {
  const { user, profile, refreshProfile } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const { addToast } = useToast();
  const { accounts } = useSupabaseData();

  // State
  const [displayName, setDisplayName] = useState(profile?.display_name || user?.email?.split('@')[0] || '');
  const [currency, setCurrency] = useState(localStorage.getItem('currency') || 'INR');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  
  // Connected Banks
  const [connectedBankIds, setConnectedBankIds] = useState(() => {
    return JSON.parse(localStorage.getItem('connectedBanks') || '[]');
  });

  // Spending Limits
  const categories = ['Food', 'Travel', 'Shopping', 'Entertainment'];
  const [limits, setLimits] = useState(() => {
    const saved = localStorage.getItem('spendingLimits');
    return saved ? JSON.parse(saved) : {
      Food: 8000,
      Travel: 5000,
      Shopping: 10000,
      Entertainment: 4000
    };
  });

  // Handlers
  const handleLimitChange = (category, value) => {
    setLimits(prev => ({ ...prev, [category]: Number(value) }));
  };

  const toggleBank = (id) => {
    setConnectedBankIds(prev => 
      prev.includes(id) ? prev.filter(bId => bId !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    if (connectedBankIds.length === 0) {
      addToast('You must connect at least one bank account', 'error');
      return;
    }
    
    localStorage.setItem('currency', currency);
    localStorage.setItem('spendingLimits', JSON.stringify(limits));
    localStorage.setItem('connectedBanks', JSON.stringify(connectedBankIds));
    
    if (user?.id) {
      try {
        await supabase.from('profiles').update({
          display_name: displayName,
          preferences: { currency, theme: isDarkMode ? 'dark' : 'light' }
        }).eq('id', user.id);
        
        refreshProfile(); // <--- Update the global state immediately
        addToast('Settings saved successfully', 'success');
      } catch (e) {
        addToast('Error syncing profile to server', 'error');
      }
    } else {
      addToast('Settings saved to device', 'success');
    }
  };

  return (
    <PageTransition className="space-y-6">
      
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Settings</h2>
          <p className="text-slate-500 text-sm mt-1">Manage your account preferences and integrations.</p>
        </div>
        <button 
          onClick={handleSave}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-0.5 flex items-center gap-2"
        >
          <Save className="w-4 h-4" /> Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col - Profile & Prefs */}
        <div className="space-y-6 lg:col-span-1">
          <Card className="p-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-500" /> Account Profile
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                <input 
                  type="email" 
                  value={user?.email || ''} 
                  disabled
                  className="w-full bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-4 text-slate-500 dark:text-slate-400 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Display Name</label>
                <input 
                  type="text" 
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white font-medium"
                />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <BellRing className="w-5 h-5 text-amber-500" /> App Preferences
            </h3>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">Dark Theme</p>
                  <p className="text-sm text-slate-500">Switch to dark interface</p>
                </div>
                <button 
                  onClick={toggleTheme}
                  className={`w-12 h-6 rounded-full transition-colors relative ${isDarkMode ? 'bg-blue-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                >
                  <span className={`absolute top-1 max-w-[16px] w-4 h-4 bg-white rounded-full transition-all ${isDarkMode ? 'left-7' : 'left-1'}`}></span>
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">Push Alerts</p>
                  <p className="text-sm text-slate-500">Receive smart notifications</p>
                </div>
                <button 
                  onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${notificationsEnabled ? 'bg-blue-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                >
                  <span className={`absolute top-1 max-w-[16px] w-4 h-4 bg-white rounded-full transition-all ${notificationsEnabled ? 'left-7' : 'left-1'}`}></span>
                </button>
              </div>

              <div>
                <label className="block font-medium text-slate-900 dark:text-white mb-1">Default Currency</label>
                 <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 font-medium mt-1"
                >
                  <option value="INR">Indian Rupee (₹ INR)</option>
                  <option value="USD">US Dollar ($ USD)</option>
                </select>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Col - Banks & Limits */}
        <div className="space-y-6 lg:col-span-2">
          
          {/* Connected Banks Panel */}
          <Card className="p-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Link2 className="w-5 h-5 text-mint" /> connected Data Sources
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 focus-within:">
              Select which bank accounts to include in your dashboard and analytics.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {accounts.map(acc => {
                const isConnected = connectedBankIds.includes(acc.id);
                return (
                  <div 
                    key={acc.id}
                    onClick={() => toggleBank(acc.id)}
                    className={`flex items-center justify-between p-4 rounded-xl cursor-pointer border-2 transition-all ${
                      isConnected 
                        ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/10' 
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/50 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm" style={{ backgroundColor: acc.color }}>
                        {acc.bank_name.charAt(0)}
                      </div>
                      <div>
                        <p className={`font-semibold text-sm ${isConnected ? 'text-blue-900 dark:text-blue-100' : 'text-slate-700 dark:text-slate-300'}`}>
                          {acc.bank_name}
                        </p>
                        <p className="text-xs text-slate-500 font-mono">••• {(acc.masked_number || acc.maskedAccNumber || 'xxxx').slice(-4)}</p>
                      </div>
                    </div>
                    
                    <button className={`w-10 h-6 rounded-full transition-colors relative ${isConnected ? 'bg-mint' : 'bg-slate-300 dark:bg-slate-700'}`}>
                      <span className={`absolute top-1 max-w-[16px] w-4 h-4 bg-white rounded-full transition-all ${isConnected ? 'left-5' : 'left-1'}`}></span>
                    </button>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Spending Limits Panel */}
          <Card className="p-6">
             <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-rose-500" /> Monthly Spending Limits
              </h3>
            </div>

            <div className="space-y-6">
              {categories.map(cat => (
                <div key={cat} className="space-y-2">
                  <div className="flex justify-between items-end">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">{cat}</label>
                    <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                      {formatCurrency(limits[cat])}
                    </span>
                  </div>
                  <input 
                    type="range"
                    min="1000"
                    max="30000"
                    step="500"
                    value={limits[cat]}
                    onChange={(e) => handleLimitChange(cat, e.target.value)}
                    className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400 focus:outline-none"
                  />
                  <div className="flex justify-between text-xs text-slate-400 font-mono">
                    <span>₹1k</span>
                    <span>₹30k</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

        </div>
      </div>
    </PageTransition>
  );
}
