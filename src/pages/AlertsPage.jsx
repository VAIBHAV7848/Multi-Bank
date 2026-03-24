import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSupabaseData } from '../hooks/useSupabaseData';
import { formatCurrency, formatDate } from '../lib/formatters';
import { Card, PageTransition } from '../components/ui';
import { Bell, AlertTriangle, CheckCircle, Info, X, ShieldCheck, Send, MessageCircle, Settings, Loader2, Zap, ExternalLink } from 'lucide-react';

const API_BASE = '';

export default function AlertsPage() {
  const { accounts, transactions } = useSupabaseData();
  const [dismissedAlerts, setDismissedAlerts] = useState(() => {
    return JSON.parse(localStorage.getItem('dismissedAlerts') || '[]');
  });

  // Telegram state
  const [telegramChatId, setTelegramChatId] = useState(() => localStorage.getItem('telegram_chat_id') || '');
  const [telegramEnabled, setTelegramEnabled] = useState(() => localStorage.getItem('telegram_enabled') === 'true');
  const [showTelegramSetup, setShowTelegramSetup] = useState(false);
  const [telegramLoading, setTelegramLoading] = useState(false);
  const [telegramStatus, setTelegramStatus] = useState(null);
  const [chatIdInput, setChatIdInput] = useState('');

  // Derived data
  const activeAccounts = accounts;
  const activeTransactions = transactions;

  // Send Telegram notification
  const sendTelegramAlert = useCallback(async (message) => {
    if (!telegramEnabled || !telegramChatId) return;
    try {
      await fetch(`${API_BASE}/api/telegram/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId: telegramChatId, message }),
      });
    } catch (err) {
      console.error('Telegram send failed:', err);
    }
  }, [telegramEnabled, telegramChatId]);

  // Generate Alerts based on real data
  const alerts = useMemo(() => {
    const generated = [];
    const now = new Date();
    
    // 1. Low Balance Alert (< ₹3,000)
    activeAccounts.forEach(acc => {
      if (Number(acc.balance) < 3000) {
        generated.push({
          id: `low-bal-${acc.id}`,
          type: 'warning',
          title: 'Low Balance Warning',
          description: `Your ${acc.bank_name} account balance is below ₹3,000. Balance: ${formatCurrency(acc.balance)}`,
          telegramMsg: `⚠️ <b>Low Balance Warning</b>\nYour ${acc.bank_name} account balance is below ₹3,000.\nBalance: ${formatCurrency(acc.balance)}`,
          time: new Date().toISOString(),
          icon: AlertTriangle
        });
      }
    });

    // 2. High Spending Alert (> ₹8,000 in a category this month)
    const categorySpendingThisMonth = {};
    activeTransactions.filter(t => {
      const d = new Date(t.created_at);
      return t.type === 'debit' && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).forEach(t => {
      categorySpendingThisMonth[t.category] = (categorySpendingThisMonth[t.category] || 0) + Number(t.amount);
    });

    Object.entries(categorySpendingThisMonth).forEach(([category, amount]) => {
      if (amount > 8000) {
        generated.push({
          id: `high-spend-${category}`,
          type: 'info',
          title: 'High Spending Detected',
          description: `You've spent ${formatCurrency(amount)} on ${category} this month.`,
          telegramMsg: `📊 <b>High Spending Alert</b>\nYou've spent ${formatCurrency(amount)} on ${category} this month.`,
          time: new Date().toISOString(),
          icon: Info
        });
      }
    });

    // 3. Unusual Transaction Alert (> ₹12,000 single transaction)
    activeTransactions.forEach(t => {
      if (t.type === 'debit' && Number(t.amount) > 12000) {
        const d = new Date(t.created_at);
        if ((now - d) / (1000 * 60 * 60 * 24) <= 7) {
          generated.push({
            id: `large-tx-${t.id}`,
            type: 'critical',
            title: 'Large Transaction Alert',
            description: `A large transaction of ${formatCurrency(t.amount)} was made at ${t.merchant}.`,
            telegramMsg: `🚨 <b>Large Transaction Alert</b>\nA transaction of ${formatCurrency(t.amount)} was made at ${t.merchant}.`,
            time: t.created_at,
            icon: AlertTriangle
          });
        }
      }
    });

    // 4. Positive: Saving Streak
    const getNetForMonth = (monthOffset) => {
      const d = new Date();
      d.setMonth(d.getMonth() - monthOffset);
      const txns = activeTransactions.filter(t => {
        const txDate = new Date(t.created_at);
        return txDate.getMonth() === d.getMonth() && txDate.getFullYear() === d.getFullYear();
      });
      const income = txns.filter(t => t.type === 'credit').reduce((s, t) => s + Number(t.amount), 0);
      const spent = txns.filter(t => t.type === 'debit').reduce((s, t) => s + Number(t.amount), 0);
      return income - spent;
    };

    const netThisMonth = getNetForMonth(0);
    const netLastMonth = getNetForMonth(1);

    if (netLastMonth > 0 && netThisMonth > netLastMonth) {
      generated.push({
        id: `saving-streak-${now.getMonth()}`,
        type: 'success',
        title: 'Saving Streak!',
        description: `Great job! Your net savings this month (${formatCurrency(netThisMonth)}) exceed last month's savings.`,
        telegramMsg: `🎉 <b>Saving Streak!</b>\nNet savings: ${formatCurrency(netThisMonth)} — exceeds last month!`,
        time: new Date().toISOString(),
        icon: CheckCircle
      });
    }

    return generated.sort((a, b) => new Date(b.time) - new Date(a.time));
  }, [activeAccounts, activeTransactions]);

  // Filter out dismissed alerts
  const activeAlerts = alerts.filter(a => !dismissedAlerts.includes(a.id));

  const dismissAlert = (id) => {
    const newDismissed = [...dismissedAlerts, id];
    setDismissedAlerts(newDismissed);
    localStorage.setItem('dismissedAlerts', JSON.stringify(newDismissed));
  };
  
  const clearAll = () => {
    const allIds = alerts.map(a => a.id);
    const newDismissed = [...new Set([...dismissedAlerts, ...allIds])];
    setDismissedAlerts(newDismissed);
    localStorage.setItem('dismissedAlerts', JSON.stringify(newDismissed));
  };

  // Telegram setup handlers
  const saveTelegramSettings = () => {
    const id = chatIdInput.trim();
    if (!id) return;
    setTelegramChatId(id);
    localStorage.setItem('telegram_chat_id', id);
    setTelegramEnabled(true);
    localStorage.setItem('telegram_enabled', 'true');
    setShowTelegramSetup(false);
    setTelegramStatus('saved');
    setTimeout(() => setTelegramStatus(null), 3000);
  };

  const toggleTelegram = () => {
    const newVal = !telegramEnabled;
    setTelegramEnabled(newVal);
    localStorage.setItem('telegram_enabled', String(newVal));
  };

  const sendTestAlert = async () => {
    if (!telegramChatId) {
      setShowTelegramSetup(true);
      return;
    }
    setTelegramLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/telegram/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId: telegramChatId,
          message: `✅ <b>Finclario Test Alert</b>\n\nThis is a test notification from your Finclario dashboard.\n\n⚡ Your alerts are working!\n🕐 ${new Date().toLocaleString('en-IN')}`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setTelegramStatus('sent');
      } else {
        setTelegramStatus('error');
      }
    } catch {
      setTelegramStatus('error');
    }
    setTelegramLoading(false);
    setTimeout(() => setTelegramStatus(null), 3000);
  };

  const pushAllToTelegram = async () => {
    if (!telegramChatId || activeAlerts.length === 0) return;
    setTelegramLoading(true);
    
    const summary = activeAlerts.map(a => a.telegramMsg || `• ${a.title}: ${a.description}`).join('\n\n');
    const message = `📱 <b>Finclario Alert Summary</b>\n${activeAlerts.length} active alert(s)\n\n${summary}\n\n—\n🕐 ${new Date().toLocaleString('en-IN')}`;
    
    try {
      await fetch(`${API_BASE}/api/telegram/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId: telegramChatId, message }),
      });
      setTelegramStatus('pushed');
    } catch {
      setTelegramStatus('error');
    }
    setTelegramLoading(false);
    setTimeout(() => setTelegramStatus(null), 3000);
  };

  const getTypeStyles = (type) => {
    switch (type) {
      case 'critical': return 'border-red-500/50 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400';
      case 'warning': return 'border-amber-500/50 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400';
      case 'success': return 'border-mint/50 bg-mint/10 dark:bg-emerald-500/10 text-mint dark:text-emerald-400';
      default: return 'border-blue-500/50 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400';
    }
  };

  return (
    <PageTransition className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Bell className="w-6 h-6" /> Notifications & Alerts
          </h2>
          <p className="text-slate-500 text-sm mt-1">Smart insights generated from your connected accounts.</p>
        </div>
        <div className="flex items-center gap-2">
          {activeAlerts.length > 0 && (
            <button 
              onClick={clearAll}
              className="text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors underline underline-offset-4"
            >
              Mark all as read
            </button>
          )}
        </div>
      </div>

      {/* Telegram Integration Card */}
      <div className="rounded-2xl border border-blue-200 dark:border-blue-800 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center shadow-md shadow-blue-500/30">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">Telegram Notifications</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {telegramEnabled && telegramChatId 
                  ? `Connected • Chat ID: ${telegramChatId}` 
                  : 'Get instant alerts on Telegram'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {telegramChatId && (
              <button
                onClick={toggleTelegram}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  telegramEnabled ? 'bg-blue-500' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${
                  telegramEnabled ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            )}
            <button
              onClick={() => { setShowTelegramSetup(!showTelegramSetup); setChatIdInput(telegramChatId); }}
              className="p-2 rounded-lg text-slate-500 hover:bg-white/50 dark:hover:bg-slate-800/50 transition-colors"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {showTelegramSetup && (
          <div className="space-y-3 pt-3 border-t border-blue-200 dark:border-blue-800 animate-slide-up">
            <div className="bg-white dark:bg-slate-900 rounded-xl p-4 space-y-3">
              <div className="text-xs text-slate-600 dark:text-slate-400 space-y-2">
                <p className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-blue-500" /> Quick Setup:
                </p>
                <ol className="list-decimal list-inside space-y-1 ml-1">
                  <li>Open Telegram and search for your Finclario bot</li>
                  <li>Send <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-blue-600 dark:text-blue-400 font-mono">/start</code> to the bot</li>
                  <li>Copy your <strong>Chat ID</strong> from the bot's response and paste below</li>
                </ol>
              </div>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatIdInput}
                  onChange={e => setChatIdInput(e.target.value)}
                  placeholder="Enter your Telegram Chat ID"
                  className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
                <button
                  onClick={saveTelegramSettings}
                  className="px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-semibold text-sm rounded-xl transition-colors shadow-sm"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Action Row */}
        {telegramEnabled && telegramChatId && (
          <div className="flex flex-wrap gap-2 pt-1">
            <button
              onClick={sendTestAlert}
              disabled={telegramLoading}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all disabled:opacity-50"
            >
              {telegramLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              Send Test
            </button>
            {activeAlerts.length > 0 && (
              <button
                onClick={pushAllToTelegram}
                disabled={telegramLoading}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold transition-colors shadow-sm disabled:opacity-50"
              >
                {telegramLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <MessageCircle className="w-3.5 h-3.5" />}
                Push {activeAlerts.length} Alert{activeAlerts.length !== 1 ? 's' : ''} to Telegram
              </button>
            )}
          </div>
        )}

        {/* Status Toast */}
        {telegramStatus && (
          <div className={`text-xs font-semibold px-3 py-2 rounded-lg animate-slide-up ${
            telegramStatus === 'error' 
              ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
              : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
          }`}>
            {telegramStatus === 'sent' && '✅ Test alert sent to Telegram!'}
            {telegramStatus === 'saved' && '✅ Telegram chat ID saved!'}
            {telegramStatus === 'pushed' && '✅ All alerts pushed to Telegram!'}
            {telegramStatus === 'error' && '❌ Failed to send. Check your Chat ID and ensure the bot is running.'}
          </div>
        )}
      </div>

      {/* Alert List */}
      <div className="space-y-4">
        {activeAlerts.length === 0 ? (
          <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed border-2 dark:border-slate-800 bg-transparent shadow-none">
            <div className="w-20 h-20 bg-mint/10 rounded-full flex items-center justify-center text-mint mb-6">
              <ShieldCheck className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">✅ All Clear!</h3>
            <p className="text-slate-500 max-w-sm">
              You have no active alerts. Everything looks secure and on track. We'll notify you if something needs attention.
            </p>
          </Card>
        ) : (
          activeAlerts.map(alert => {
            const Icon = alert.icon;
            const styles = getTypeStyles(alert.type);
            
            return (
              <div 
                key={alert.id}
                className={`relative p-5 rounded-2xl border ${styles} animate-slide-up transition-all group`}
              >
                <div className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1 pr-8">
                    <h3 className="font-bold mb-1 text-slate-900 dark:text-white">{alert.title}</h3>
                    <p className="text-sm opacity-90 leading-relaxed max-w-2xl">{alert.description}</p>
                    <p className="text-xs opacity-70 mt-3 font-medium flex items-center gap-1">
                      {formatDate(alert.time)}
                    </p>
                  </div>
                </div>
                
                <div className="absolute top-4 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                  {telegramEnabled && telegramChatId && (
                    <button 
                      onClick={() => sendTelegramAlert(alert.telegramMsg || `${alert.title}\n${alert.description}`)}
                      className="p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                      title="Send to Telegram"
                    >
                      <Send className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </button>
                  )}
                  <button 
                    onClick={() => dismissAlert(alert.id)}
                    className="p-2 rounded-lg hover:bg-black/10 transition-all"
                    aria-label="Dismiss alert"
                  >
                    <X className="w-4 h-4 text-slate-900 dark:text-white" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </PageTransition>
  );
}
