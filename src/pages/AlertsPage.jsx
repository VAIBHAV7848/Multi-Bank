import React, { useState, useEffect, useMemo } from 'react';
import { useSupabaseData } from '../hooks/useSupabaseData';
import { formatCurrency, formatDate } from '../lib/formatters';
import { Card, PageTransition } from '../components/ui';
import { Bell, AlertTriangle, CheckCircle, Info, X, ShieldCheck } from 'lucide-react';

export default function AlertsPage() {
  const { accounts, transactions } = useSupabaseData();
  const [dismissedAlerts, setDismissedAlerts] = useState(() => {
    return JSON.parse(localStorage.getItem('dismissedAlerts') || '[]');
  });

  // Derived data
  // Derived data
  const activeAccounts = accounts;
  const activeTransactions = transactions;

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
          time: new Date().toISOString(),
          icon: Info
        });
      }
    });

    // 3. Unusual Transaction Alert (> ₹12,000 single transaction)
    activeTransactions.forEach(t => {
      if (t.type === 'debit' && Number(t.amount) > 12000) {
        // Only alert for transactions in the last 7 days to keep it relevant
        const d = new Date(t.created_at);
        if ((now - d) / (1000 * 60 * 60 * 24) <= 7) {
          generated.push({
            id: `large-tx-${t.id}`,
            type: 'critical',
            title: 'Large Transaction Alert',
            description: `A large transaction of ${formatCurrency(t.amount)} was made at ${t.merchant}.`,
            time: t.created_at,
            icon: AlertTriangle
          });
        }
      }
    });

    // 4. Positive: Saving Streak (If last month net > 0 and this month net > last month net)
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
        {activeAlerts.length > 0 && (
          <button 
            onClick={clearAll}
            className="text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors underline underline-offset-4"
          >
            Mark all as read
          </button>
        )}
      </div>

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
                
                <button 
                  onClick={() => dismissAlert(alert.id)}
                  className="absolute top-4 right-4 p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-black/10 transition-all"
                  aria-label="Dismiss alert"
                >
                  <X className="w-4 h-4 text-slate-900 dark:text-white" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </PageTransition>
  );
}
