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

  const [telegramLoading, setTelegramLoading] = useState(false);
  const [telegramStatus, setTelegramStatus] = useState(null);

  // Derived data
  const activeAccounts = accounts;
  const activeTransactions = transactions;

  // Send individual notification
  const sendTelegramAlert = useCallback(async (message) => {
    try {
      // Find chat ID
      const updatesRes = await fetch(`${API_BASE}/api/telegram/updates`);
      const updatesData = await updatesRes.json();
      if (!updatesData.success || !updatesData.chats || updatesData.chats.length === 0) return;
      const targetChatId = updatesData.chats[0].chatId;

      await fetch(`${API_BASE}/api/telegram/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId: targetChatId, message }),
      });
    } catch (err) {
      console.error('Telegram send failed:', err);
    }
  }, []);

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
  const simulateTelegramAlert = useCallback(async () => {
    setTelegramLoading(true);
    setTelegramStatus(null);
    try {
      // Auto-fetch the chat ID from someone who messaged the bot
      const updatesRes = await fetch(`${API_BASE}/api/telegram/updates`);
      const updatesData = await updatesRes.json();
      
      if (!updatesData.success || !updatesData.chats || updatesData.chats.length === 0) {
        setTelegramStatus('error_no_chat');
        setTelegramLoading(false);
        setTimeout(() => setTelegramStatus(null), 5000);
        return;
      }

      // Target the most recent active chat ID
      const targetChatId = updatesData.chats[0].chatId;

      const summary = activeAlerts.map(a => a.telegramMsg || `• ${a.title}: ${a.description}`).join('\n\n');
      const textMessage = activeAlerts.length > 0 
        ? `📱 <b>Finclario Auto Alert</b>\n${activeAlerts.length} active alert(s) detected\n\n${summary}\n\n—\n🕐 ${new Date().toLocaleString('en-IN')}` 
        : `✅ <b>Finclario All Clear</b>\n\nNo active alerts right now!\n\n🕐 ${new Date().toLocaleString('en-IN')}`;

      // Send telegram update
      const res = await fetch(`${API_BASE}/api/telegram/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId: targetChatId, message: textMessage }),
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
  }, [activeAlerts]);

  // HACKATHON DEMO: Automatically send alert once per session on page load
  useEffect(() => {
    if (activeAlerts.length > 0 && !sessionStorage.getItem('auto_alert_sent')) {
      sessionStorage.setItem('auto_alert_sent', 'true');
      const timer = setTimeout(() => {
        simulateTelegramAlert();
      }, 1500); // 1.5s delay for dramatic effect
      return () => clearTimeout(timer);
    }
  }, [activeAlerts, simulateTelegramAlert]);

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
                Instantly push all active alerts to your phone
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={simulateTelegramAlert}
              disabled={telegramLoading}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold transition-colors shadow-sm disabled:opacity-50"
            >
              {telegramLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {telegramLoading ? 'Sending...' : 'Simulate Telegram Alert'}
            </button>
          </div>
        </div>

        {/* Status Toast */}
        {telegramStatus && (
          <div className={`text-sm font-semibold px-4 py-3 rounded-xl animate-slide-up ${
            telegramStatus.includes('error') 
              ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800'
              : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
          }`}>
            {telegramStatus === 'sent' && '✅ Alert successfully pushed to Telegram!'}
            {telegramStatus === 'error_no_chat' && (
              <div className="space-y-1">
                <p>❌ <b>No Telegram user found.</b></p>
                <p className="font-normal text-xs opacity-90">Please open Telegram, find your bot, and send a message like "Hi" or "/start" to it first so it knows who to message, then click simulate again!</p>
              </div>
            )}
            {telegramStatus === 'error' && '❌ Failed to send. Ensure you have texted the bot first!'}
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
