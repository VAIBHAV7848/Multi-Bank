import React, { useState } from 'react';
import { PageTransition, Card } from '../components/ui';
import { Target, Flag, Car, Home, Plus, Briefcase, ChevronRight } from 'lucide-react';
import { formatCurrency } from '../lib/formatters';

export default function GoalsPage() {
  const [goals] = useState([
    { id: 1, name: 'Emergency Fund', icon: <Briefcase className="w-6 h-6 text-blue-500" />, target: 300000, current: 150000, color: 'bg-blue-500', eta: 'Dec 2025' },
    { id: 2, name: 'New Car Downpayment', icon: <Car className="w-6 h-6 text-indigo-500" />, target: 500000, current: 120000, color: 'bg-indigo-500', eta: 'Mar 2026' },
    { id: 3, name: 'House Purchase', icon: <Home className="w-6 h-6 text-emerald-500" />, target: 2000000, current: 2000000, color: 'bg-emerald-500', eta: 'Achieved' },
    { id: 4, name: 'Europe Vacation', icon: <Flag className="w-6 h-6 text-rose-500" />, target: 400000, current: 85000, color: 'bg-rose-500', eta: 'Oct 2025' }
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Target className="w-6 h-6 text-blue-500" /> Financial Goals
          </h2>
          <p className="text-slate-500 dark:text-slate-400">Track and manage your savings targets</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow flex items-center gap-2 transition-all hover:shadow-lg">
          <Plus className="w-4 h-4" /> New Goal
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {goals.map(goal => {
          const progress = Math.min(100, Math.round((goal.current / goal.target) * 100));
          const isComplete = progress === 100;

          return (
            <Card key={goal.id} className="cursor-pointer group hover:border-blue-500/50 hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl bg-slate-100 dark:bg-slate-800 ${isComplete ? 'ring-2 ring-emerald-500/50' : ''}`}>
                    {goal.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-slate-100">{goal.name}</h3>
                    <p className="text-xs text-slate-500">Target: {formatCurrency(goal.target)}</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </div>
              
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-slate-700 dark:text-slate-300">{formatCurrency(goal.current)}</span>
                  <span className="text-slate-500">{progress}%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${goal.color} rounded-full transition-all duration-1000 ease-out`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="text-right mt-2 text-xs text-slate-400">
                  {isComplete ? <span className="text-emerald-500 font-medium">Goal reached! 🎉</span> : `ETA: ${goal.eta}`}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
