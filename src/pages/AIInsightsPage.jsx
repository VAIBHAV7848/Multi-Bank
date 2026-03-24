import React from 'react';
import { Card } from '../components/ui';
import { BrainCircuit, TrendingDown, Target, Zap, AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { formatCurrency } from '../lib/formatters';

const predictData = [
  { month: 'Jan', actual: 45000 },
  { month: 'Feb', actual: 38240 },
  { month: 'Mar', actual: 39500 },
  { month: 'Apr', predicted: 42000 },
  { month: 'May', predicted: 41000 },
];

const categoryRadar = [
  { subject: 'Food', A: 120, fullMark: 150 },
  { subject: 'Travel', A: 98, fullMark: 150 },
  { subject: 'Shopping', A: 86, fullMark: 150 },
  { subject: 'Bills', A: 99, fullMark: 150 },
  { subject: 'Health', A: 85, fullMark: 150 },
  { subject: 'Ent.', A: 65, fullMark: 150 },
];

const insights = [
  { id: 1, type: 'warning', icon: <TrendingDown className="w-5 h-5 text-orange-500" />, text: <>You spend <strong>24% more on Food</strong> on weekends compared to weekdays. Consider meal prepping.</>, tag: 'Actionable' },
  { id: 2, type: 'good', icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />, text: <>Your utility bills have dropped by <strong>₹800</strong> this month. Great job conserving energy!</>, tag: 'Achievement' },
  { id: 3, type: 'info', icon: <Info className="w-5 h-5 text-blue-500" />, text: <>Based on your current run-rate, you will save <strong>{formatCurrency(18500)}</strong> by month-end.</>, tag: 'Projection' },
  { id: 4, type: 'alert', icon: <AlertTriangle className="w-5 h-5 text-rose-500" />, text: <>Multiple unexpected recurring charges detected for <strong>"Spotify Premium"</strong> across different cards.</>, tag: 'Duplicate' },
];

export default function AIInsightsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BrainCircuit className="w-6 h-6 text-purple-500" /> AI Financial Insights
          </h2>
          <p className="text-slate-500 dark:text-slate-400">Personalized intelligence based on your spending patterns</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="h-80 flex flex-col">
          <h3 className="font-bold text-slate-800 dark:text-white mb-4">📈 Spending Prediction (Next 2 Months)</h3>
          <div className="flex-1 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={predictData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: '#e2e8f0' }}
                  formatter={(value) => formatCurrency(value)}
                />
                <Area type="monotone" dataKey="actual" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorActual)" />
                <Area type="monotone" dataKey="predicted" stroke="#a855f7" strokeWidth={2} fillOpacity={1} fill="url(#colorPredicted)" strokeDasharray="5 5" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="h-80 flex flex-col">
          <h3 className="font-bold text-slate-800 dark:text-white mb-4">🧠 Category Intelligence</h3>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={categoryRadar}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} />
                <Radar name="Spending Velocity" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.4} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center justify-between">
          <div>💡 All Generated Insights</div>
          <span className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 px-2 py-1 rounded-full">{insights.length} New</span>
        </h3>
        <div className="space-y-3">
          {insights.map(item => (
            <div key={item.id} className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 hover:border-blue-500/30 transition-colors">
              <div className="mt-0.5">{item.icon}</div>
              <div className="flex-1">
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{item.text}</p>
              </div>
              <span className={`text-[10px] font-bold px-2 py-1 rounded-full shrink-0 ${
                item.type === 'warning' ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30' :
                item.type === 'good' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30' :
                item.type === 'alert' ? 'bg-rose-100 text-rose-600 dark:bg-rose-900/30' :
                'bg-blue-100 text-blue-600 dark:bg-blue-900/30'
              }`}>
                {item.tag}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
