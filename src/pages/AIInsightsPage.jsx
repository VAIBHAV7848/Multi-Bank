import React, { useMemo } from 'react';
import { Card } from '../components/ui';
import { BrainCircuit, TrendingDown, CheckCircle2, AlertTriangle, Info, Loader2 } from 'lucide-react';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { formatCurrency } from '../lib/formatters';
import { useSupabaseData } from '../hooks/useSupabaseData';

export default function AIInsightsPage() {
  const { transactions, loading } = useSupabaseData();

  const { predictData, categoryRadar, insights } = useMemo(() => {
    if (!transactions.length) return { predictData: [], categoryRadar: [], insights: [] };

    // Build monthly spending for prediction chart
    const monthMap = {};
    const catMap = {};
    const now = new Date();

    transactions.forEach(t => {
      if (t.type !== 'debit') return;
      const d = new Date(t.created_at || t.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const monthName = d.toLocaleString('default', { month: 'short' });
      monthMap[key] = monthMap[key] || { month: monthName, actual: 0 };
      monthMap[key].actual += Number(t.amount);

      catMap[t.category] = (catMap[t.category] || 0) + Number(t.amount);
    });

    const sorted = Object.values(monthMap).slice(-3);
    // Add 2 predicted months
    const avg = sorted.reduce((s, m) => s + m.actual, 0) / (sorted.length || 1);
    const nextMonths = [
      new Date(now.getFullYear(), now.getMonth() + 1),
      new Date(now.getFullYear(), now.getMonth() + 2),
    ];
    nextMonths.forEach(d => {
      sorted.push({ month: d.toLocaleString('default', { month: 'short' }), predicted: Math.round(avg * (0.9 + Math.random() * 0.2)) });
    });

    // Radar data
    const maxCat = Math.max(...Object.values(catMap), 1);
    const radar = Object.entries(catMap).slice(0, 6).map(([subject, val]) => ({
      subject: subject.length > 8 ? subject.slice(0, 7) + '.' : subject,
      A: Math.round((val / maxCat) * 100),
      fullMark: 100,
    }));

    // Generate smart insights from real data
    const totalSpent = transactions.filter(t => t.type === 'debit').reduce((s, t) => s + Number(t.amount), 0);
    const totalIncome = transactions.filter(t => t.type === 'credit').reduce((s, t) => s + Number(t.amount), 0);
    const topCategory = Object.entries(catMap).sort((a, b) => b[1] - a[1])[0];
    const savingsRate = totalIncome > 0 ? Math.round(((totalIncome - totalSpent) / totalIncome) * 100) : 0;

    const ins = [];
    if (topCategory) {
      ins.push({ id: 1, type: 'warning', icon: <TrendingDown className="w-5 h-5 text-orange-500" />, text: <><strong>{topCategory[0]}</strong> is your highest spend category at <strong>{formatCurrency(topCategory[1])}</strong>. Consider setting a budget.</>, tag: 'Actionable' });
    }
    if (savingsRate > 20) {
      ins.push({ id: 2, type: 'good', icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />, text: <>Your savings rate is <strong>{savingsRate}%</strong>. That's excellent — keep it up!</>, tag: 'Achievement' });
    } else if (savingsRate >= 0) {
      ins.push({ id: 2, type: 'alert', icon: <AlertTriangle className="w-5 h-5 text-rose-500" />, text: <>Your savings rate is only <strong>{savingsRate}%</strong>. Aim for at least 20%.</>, tag: 'Warning' });
    }
    ins.push({ id: 3, type: 'info', icon: <Info className="w-5 h-5 text-blue-500" />, text: <>Predicted next month spend: <strong>{formatCurrency(Math.round(avg))}</strong> based on recent trends.</>, tag: 'Projection' });
    if (transactions.length > 5) {
      const bigTxn = transactions.filter(t => t.type === 'debit').sort((a, b) => Number(b.amount) - Number(a.amount))[0];
      if (bigTxn) ins.push({ id: 4, type: 'info', icon: <AlertTriangle className="w-5 h-5 text-amber-500" />, text: <>Largest single transaction: <strong>{formatCurrency(bigTxn.amount)}</strong> at {bigTxn.merchant || bigTxn.merchant_name}.</>, tag: 'Spotlight' });
    }

    return { predictData: sorted, categoryRadar: radar, insights: ins };
  }, [transactions]);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-purple-500" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <BrainCircuit className="w-6 h-6 text-purple-500" /> AI Financial Insights
        </h2>
        <p className="text-slate-500 dark:text-slate-400">Intelligence derived from your real spending data</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="h-80 flex flex-col">
          <h3 className="font-bold text-slate-800 dark:text-white mb-4">📈 Spending Prediction</h3>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={predictData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient>
                  <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/><stop offset="95%" stopColor="#a855f7" stopOpacity={0}/></linearGradient>
                </defs>
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} formatter={(value) => formatCurrency(value)} />
                <Area type="monotone" dataKey="actual" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorActual)" />
                <Area type="monotone" dataKey="predicted" stroke="#a855f7" strokeWidth={2} fillOpacity={1} fill="url(#colorPredicted)" strokeDasharray="5 5" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="h-80 flex flex-col">
          <h3 className="font-bold text-slate-800 dark:text-white mb-4">🧠 Category Intelligence</h3>
          <div className="flex-1 w-full">
            {categoryRadar.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={categoryRadar}>
                  <PolarGrid stroke="#334155" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 11 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
                  <Radar name="Spending" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.4} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                </RadarChart>
              </ResponsiveContainer>
            ) : <p className="text-slate-500 text-center mt-8">Not enough data yet</p>}
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center justify-between">
          <span>💡 Generated Insights</span>
          <span className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 px-2 py-1 rounded-full">{insights.length} New</span>
        </h3>
        <div className="space-y-3">
          {insights.map(item => (
            <div key={item.id} className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 hover:border-blue-500/30 transition-colors">
              <div className="mt-0.5">{item.icon}</div>
              <div className="flex-1"><p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{item.text}</p></div>
              <span className={`text-[10px] font-bold px-2 py-1 rounded-full shrink-0 ${
                item.type === 'warning' ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30' :
                item.type === 'good' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30' :
                item.type === 'alert' ? 'bg-rose-100 text-rose-600 dark:bg-rose-900/30' :
                'bg-blue-100 text-blue-600 dark:bg-blue-900/30'
              }`}>{item.tag}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
