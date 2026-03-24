import React, { useState } from 'react';
import { Card } from '../components/ui';
import { ShieldCheck, ArrowUpRight, ArrowDownRight, CreditCard, Clock, Search, Briefcase } from 'lucide-react';

export default function CreditScorePage() {
  const [projectedScore, setProjectedScore] = useState(742);
  const [actions, setActions] = useState({
    payDebt: false,
    newCard: false,
    missPayment: false
  });

  const toggleAction = (item, effect) => {
    setActions(prev => {
      const isActivating = !prev[item];
      setProjectedScore(score => isActivating ? score + effect : score - effect);
      return { ...prev, [item]: isActivating };
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-500" /> Credit Profile
          </h2>
          <p className="text-slate-500 dark:text-slate-400">Understand your credit health and simulate changes</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Score Gauge & Factors */}
        <Card className="flex flex-col">
          <h3 className="font-bold text-slate-800 dark:text-white mb-6">📊 Your Experian Score</h3>
          
          <div className="flex flex-col items-center py-6">
            <div className="relative w-48 h-24 overflow-hidden mb-2">
              <svg viewBox="0 0 180 100" className="w-48">
                <path d="M 20 90 A 70 70 0 0 1 160 90" fill="none" stroke="currentColor" className="text-slate-200 dark:text-slate-800" strokeWidth="14" strokeLinecap="round"/>
                <path d="M 20 90 A 70 70 0 0 1 160 90" fill="none" stroke="url(#gaugeGrad)" strokeWidth="14" strokeLinecap="round" strokeDasharray="220" strokeDashoffset={220 - (220 * 0.72)}/>
                <defs>
                  <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#ef4444"/>
                    <stop offset="50%" stopColor="#f59e0b"/>
                    <stop offset="100%" stopColor="#10b981"/>
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex flex-col items-center">
                <span className="text-4xl font-black text-emerald-500">742</span>
              </div>
            </div>
            <div className="text-emerald-500 font-bold tracking-wide uppercase text-sm mb-1 mt-2">Very Good</div>
            <div className="text-xs text-slate-500">Updated: March 2025</div>
          </div>

          <div className="flex-1 mt-4 space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-indigo-500" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Payment History</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-emerald-500">100%</div>
                <div className="text-[10px] text-slate-500 uppercase">High Impact</div>
              </div>
            </div>
            <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg">
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-blue-500" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Credit Utilization</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-emerald-500">12%</div>
                <div className="text-[10px] text-slate-500 uppercase">High Impact</div>
              </div>
            </div>
            <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg">
              <div className="flex items-center gap-3">
                <Briefcase className="w-5 h-5 text-purple-500" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Total Accounts</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-amber-500">4 Accounts</div>
                <div className="text-[10px] text-slate-500 uppercase">Low Impact</div>
              </div>
            </div>
            <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg">
              <div className="flex items-center gap-3">
                <Search className="w-5 h-5 text-rose-500" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Hard Inquiries</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-emerald-500">1</div>
                <div className="text-[10px] text-slate-500 uppercase">Low Impact</div>
              </div>
            </div>
          </div>
        </Card>

        {/* Score Simulator */}
        <Card className="flex flex-col">
          <div className="flex justify-between items-start mb-6">
            <h3 className="font-bold text-slate-800 dark:text-white">🔬 Score Simulator</h3>
            <div className="text-right">
              <div className="text-xs text-slate-500 uppercase mb-1">Projected Score</div>
              <div className={`text-3xl font-black ${
                projectedScore > 742 ? 'text-emerald-500' : projectedScore < 742 ? 'text-rose-500' : 'text-slate-900 dark:text-white'
              }`}>
                {projectedScore}
              </div>
              {projectedScore !== 742 && (
                <div className={`text-xs font-bold mt-1 flex items-center gap-1 justify-end ${projectedScore > 742 ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {projectedScore > 742 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {Math.abs(projectedScore - 742)} pts
                </div>
              )}
            </div>
          </div>

          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            Toggle scenarios below to see how they might impact your credit score over the next 30 days.
          </p>

          <div className="space-y-4 flex-1">
            <label className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-colors ${
              actions.payDebt ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800' : 'bg-slate-50 border-slate-200 dark:bg-slate-900/50 dark:border-slate-800 hover:border-emerald-500/30'
            }`}>
              <input type="checkbox" className="mt-1 w-4 h-4 text-emerald-600 rounded" checked={actions.payDebt} onChange={() => toggleAction('payDebt', 12)} />
              <div className="flex-1">
                <div className="font-semibold text-sm text-slate-800 dark:text-slate-200">Pay down credit card debt by ₹50,000</div>
                <div className="text-xs text-slate-500 mt-1">Lowers your credit utilization significantly</div>
              </div>
              <div className="text-emerald-500 font-bold text-sm">+12</div>
            </label>

            <label className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-colors ${
              actions.newCard ? 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800' : 'bg-slate-50 border-slate-200 dark:bg-slate-900/50 dark:border-slate-800 hover:border-amber-500/30'
            }`}>
              <input type="checkbox" className="mt-1 w-4 h-4 text-amber-600 rounded" checked={actions.newCard} onChange={() => toggleAction('newCard', -5)} />
              <div className="flex-1">
                <div className="font-semibold text-sm text-slate-800 dark:text-slate-200">Apply for a new credit card</div>
                <div className="text-xs text-slate-500 mt-1">Causes a temporary hard inquiry dip</div>
              </div>
              <div className="text-amber-500 font-bold text-sm">-5</div>
            </label>

            <label className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-colors ${
              actions.missPayment ? 'bg-rose-50 border-rose-200 dark:bg-rose-900/20 dark:border-rose-800' : 'bg-slate-50 border-slate-200 dark:bg-slate-900/50 dark:border-slate-800 hover:border-rose-500/30'
            }`}>
              <input type="checkbox" className="mt-1 w-4 h-4 text-rose-600 rounded" checked={actions.missPayment} onChange={() => toggleAction('missPayment', -45)} />
              <div className="flex-1">
                <div className="font-semibold text-sm text-slate-800 dark:text-slate-200">Miss a payment by 30 days</div>
                <div className="text-xs text-slate-500 mt-1">Severely impacts payment history</div>
              </div>
              <div className="text-rose-500 font-bold text-sm">-45</div>
            </label>
          </div>
        </Card>

      </div>
    </div>
  );
}
