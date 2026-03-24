import React, { useMemo } from 'react';
import { useSupabaseData } from '../hooks/useSupabaseData';
import { formatCurrency, getCategoryColor } from '../lib/formatters';
import { Card, PageTransition, Skeleton } from '../components/ui';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell,
  BarChart, Bar,
  AreaChart, Area
} from 'recharts';
import { DollarSign, TrendingDown, Target, Wallet } from 'lucide-react';

export default function AnalyticsPage() {
  const { transactions, loading } = useSupabaseData();

  // Derived data
  const activeTransactions = transactions;

  // --- Data Processing for Charts ---

  // 1. Current Month Stats
  const { currentMonthSpent, currentMonthIncome, savingsRate, topCategory } = useMemo(() => {
    const now = new Date();
    const thisMonthTxns = activeTransactions.filter(t => {
      const d = new Date(t.created_at);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });

    const spent = thisMonthTxns.filter(t => t.type === 'debit').reduce((sum, t) => sum + Number(t.amount), 0);
    const income = thisMonthTxns.filter(t => t.type === 'credit').reduce((sum, t) => sum + Number(t.amount), 0);
    
    // Top Category
    const catTotals = {};
    thisMonthTxns.filter(t => t.type === 'debit').forEach(t => {
      catTotals[t.category] = (catTotals[t.category] || 0) + Number(t.amount);
    });
    const topCat = Object.entries(catTotals).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None';

    const rate = income > 0 ? ((income - spent) / income) * 100 : 0;

    return {
      currentMonthSpent: spent,
      currentMonthIncome: income,
      savingsRate: rate.toFixed(1),
      topCategory: topCat
    };
  }, [activeTransactions]);

  // 2. Spending by Category (Pie Chart)
  const categoryData = useMemo(() => {
    const totals = {};
    activeTransactions.filter(t => t.type === 'debit').forEach(t => {
      totals[t.category] = (totals[t.category] || 0) + Number(t.amount);
    });
    
    return Object.entries(totals)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6); // Top 6
  }, [activeTransactions]);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  // 3. Monthly Income vs Expense (Bar Chart & Area Chart)
  const monthlyData = useMemo(() => {
    const months = {};
    
    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const name = d.toLocaleString('en-US', { month: 'short' });
      const yearMonth = `${d.getFullYear()}-${d.getMonth()}`;
      months[yearMonth] = { name, income: 0, expense: 0, net: 0, sortKey: d.getTime() };
    }

    activeTransactions.forEach(t => {
      const d = new Date(t.created_at);
      const yearMonth = `${d.getFullYear()}-${d.getMonth()}`;
      if (months[yearMonth]) {
        const amount = Number(t.amount);
        if (t.type === 'credit') {
          months[yearMonth].income += amount;
        } else {
          months[yearMonth].expense += amount;
        }
        months[yearMonth].net = months[yearMonth].income - months[yearMonth].expense;
      }
    });

    return Object.values(months).sort((a, b) => a.sortKey - b.sortKey);
  }, [activeTransactions]);


  // Custom Tooltip Formatter
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-lg shadow-xl">
          <p className="font-bold text-slate-900 dark:text-white mb-2">{label || payload[0].name}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-2 text-sm font-medium">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></span>
              <span className="text-slate-500 dark:text-slate-400 capitalize">{entry.name}:</span>
              <span className="text-slate-900 dark:text-white">{formatCurrency(entry.value)}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading && transactions.length === 0) {
    return (
      <PageTransition className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-32" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-[400px]" />
          <Skeleton className="h-[400px]" />
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition className="space-y-8">
      
      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card className="flex items-center gap-4 group">
          <div className="w-14 h-14 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400 group-hover:scale-110 transition-transform">
            <TrendingDown className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Spent This Month</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{formatCurrency(currentMonthSpent)}</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4 group">
          <div className="w-14 h-14 rounded-2xl bg-mint/20 flex items-center justify-center text-mint group-hover:scale-110 transition-transform">
            <DollarSign className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Income This Month</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{formatCurrency(currentMonthIncome)}</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4 group">
          <div className="w-14 h-14 rounded-2xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
            <Target className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Top Category</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white capitalize">{topCategory}</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4 group">
          <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
            <Wallet className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Savings Rate</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {savingsRate}%
            </p>
          </div>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Cashflow Bar Chart */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Income vs Expense</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(val) => `₹${val / 1000}k`} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }} />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="expense" name="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Category Spending Pie Chart */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Spending Snapshot</h3>
          <div className="h-[300px] w-full flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend layout="vertical" verticalAlign="middle" align="right" iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Center Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-4 pr-16 md:pr-32">
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Spent</span>
              <span className="text-xl font-bold text-slate-900 dark:text-white">
                {formatCurrency(categoryData.reduce((sum, item) => sum + item.value, 0))}
              </span>
            </div>
          </div>
        </Card>

        {/* Net Savings Area Chart */}
        <Card className="p-6 lg:col-span-2">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Net Savings Growth</h3>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorNetPos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorNetNeg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(val) => `₹${val / 1000}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="net" 
                  name="Net Savings"
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorNetPos)" 
                  activeDot={{ r: 6, strokeWidth: 0, fill: '#3b82f6' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

      </div>
    </PageTransition>
  );
}
