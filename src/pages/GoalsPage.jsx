import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui';
import { Target, Flag, Car, Home, Plus, Briefcase, ChevronRight, X, Loader2, Trash2 } from 'lucide-react';
import { formatCurrency } from '../lib/formatters';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const ICON_MAP = {
  briefcase: <Briefcase className="w-6 h-6 text-blue-500" />,
  car: <Car className="w-6 h-6 text-indigo-500" />,
  home: <Home className="w-6 h-6 text-emerald-500" />,
  flag: <Flag className="w-6 h-6 text-rose-500" />,
  target: <Target className="w-6 h-6 text-purple-500" />,
};

const COLORS = ['bg-blue-500', 'bg-indigo-500', 'bg-emerald-500', 'bg-rose-500', 'bg-purple-500', 'bg-amber-500'];

export default function GoalsPage() {
  const { session } = useAuth();
  const { addToast } = useToast();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', target: '', current: '0', icon: 'target', color: 'bg-blue-500', eta: '' });
  const [saving, setSaving] = useState(false);

  const userId = session?.user?.id;

  // Fetch goals
  const loadGoals = async () => {
    if (!userId) return;
    setLoading(true);
    const { data, error } = await supabase.from('goals').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    if (error) { console.error(error); addToast('Failed to load goals', 'error'); }
    else setGoals(data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadGoals();

    // Realtime subscription
    const channel = supabase.channel('goals_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'goals', filter: `user_id=eq.${userId}` }, () => loadGoals())
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [userId]);


  const handleAdd = async () => {
    if (!formData.name || !formData.target) { addToast('Name and target required', 'warning'); return; }
    setSaving(true);
    const { error } = await supabase.from('goals').insert({
      user_id: userId, name: formData.name, target: Number(formData.target), current: Number(formData.current) || 0,
      icon: formData.icon, color: formData.color, eta: formData.eta || null,
    });
    if (error) addToast('Failed to add goal', 'error');
    else { addToast('Goal added!', 'success'); setShowForm(false); setFormData({ name: '', target: '', current: '0', icon: 'target', color: 'bg-blue-500', eta: '' }); }
    setSaving(false);
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation(); // Prevent clicking the card
    if (!confirm('Are you sure you want to delete this goal?')) return;
    
    try {
      const { error } = await supabase.from('goals').delete().eq('id', id);
      if (error) throw error;
      addToast('Goal deleted successfully', 'success');
      // Update local state is handled by the subscription, but let's be fast
      setGoals(goals.filter(g => g.id !== id));
    } catch (err) {
      addToast('Failed to delete goal', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Target className="w-6 h-6 text-blue-500" /> Financial Goals
          </h2>
          <p className="text-slate-500 dark:text-slate-400">Track and manage your savings targets</p>
        </div>
        <button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow flex items-center gap-2 transition-all hover:shadow-lg">
          <Plus className="w-4 h-4" /> New Goal
        </button>
      </div>

      {showForm && (
        <Card>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-slate-800 dark:text-white">Add New Goal</h3>
            <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-slate-400" /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input placeholder="Goal name" value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-sm text-slate-900 dark:text-white" />
            <input placeholder="Target amount (₹)" type="number" value={formData.target} onChange={e => setFormData(p => ({ ...p, target: e.target.value }))} className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-sm text-slate-900 dark:text-white" />
            <input placeholder="Current saved (₹)" type="number" value={formData.current} onChange={e => setFormData(p => ({ ...p, current: e.target.value }))} className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-sm text-slate-900 dark:text-white" />
            <input placeholder="ETA (e.g. Dec 2025)" value={formData.eta} onChange={e => setFormData(p => ({ ...p, eta: e.target.value }))} className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-sm text-slate-900 dark:text-white" />
          </div>
          <button onClick={handleAdd} disabled={saving} className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 disabled:opacity-60">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Save Goal
          </button>
        </Card>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {goals.map(goal => {
            const progress = Math.min(100, Math.round((Number(goal.current) / Number(goal.target)) * 100));
            const isComplete = progress === 100;
            return (
              <Card key={goal.id} className="cursor-pointer group hover:border-blue-500/50 hover:shadow-md transition-all relative">
                <button 
                  onClick={(e) => handleDelete(goal.id, e)}
                  className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors z-10"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-xl bg-slate-100 dark:bg-slate-800 ${isComplete ? 'ring-2 ring-emerald-500/50' : ''}`}>
                      {ICON_MAP[goal.icon] || ICON_MAP.target}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 dark:text-slate-100">{goal.name}</h3>
                      <p className="text-xs text-slate-500">Target: {formatCurrency(goal.target)}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-slate-700 dark:text-slate-300">{formatCurrency(goal.current)}</span>
                    <span className="text-slate-500">{progress}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full ${goal.color} rounded-full transition-all duration-1000 ease-out`} style={{ width: `${progress}%` }} />
                  </div>
                  <div className="text-right mt-2 text-xs text-slate-400">
                    {isComplete ? <span className="text-emerald-500 font-medium font-bold">Goal reached! 🎉</span> : goal.eta ? `ETA: ${goal.eta}` : ''}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
