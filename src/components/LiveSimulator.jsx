import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useSupabaseData } from '../hooks/useSupabaseData';
import { Activity, Play, Square, Server } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function LiveSimulator() {
  const { session } = useAuth();
  const { accounts } = useSupabaseData();
  const { addToast } = useToast();
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let interval;
    if (isRunning && session?.user?.id && accounts.length > 0) {
      interval = setInterval(async () => {
        // Pick a random account
        const account = accounts[Math.floor(Math.random() * accounts.length)];
        
        // 80% chance of debit, 20% credit
        const isCredit = Math.random() > 0.8;
        const amount = Math.floor(Math.random() * (isCredit ? 15000 : 1200)) + 65;
        
        const debitMerchants = ['Zomato', 'Uber', 'Amazon', 'Starbucks', 'Swiggy', 'MakeMyTrip', 'Blinkit', 'Shell Petrol'];
        const debitCategories = ['Food', 'Transport', 'Shopping', 'Entertainment', 'Groceries'];
        
        const merchant = isCredit 
          ? (Math.random() > 0.5 ? 'NEFT Transfer IN' : 'IMPS Ref: 982173')
          : debitMerchants[Math.floor(Math.random() * debitMerchants.length)];
          
        const category = isCredit 
          ? 'Income' 
          : debitCategories[Math.floor(Math.random() * debitCategories.length)];

        const dateObj = new Date();
        
        try {
          // 1. Update Account Balance
          const newBalance = Number(account.balance) + (isCredit ? amount : -amount);
          await supabase.from('accounts').update({ balance: newBalance }).eq('id', account.id);

          // 2. Insert Transaction
          await supabase.from('transactions').insert({
            user_id: session.user.id,
            account_id: account.id,
            merchant_name: merchant,
            category: category,
            category_emoji: isCredit ? '💰' : '💳',
            amount: amount,
            type: isCredit ? 'credit' : 'debit',
            status: 'completed',
            date: dateObj.toISOString().split('T')[0],
            created_at: dateObj.toISOString() // accurate exact timestamp for proper sorting
          });
          
          if (!isCredit && amount > 1000) {
            addToast(`Alert: Large debit of ₹${amount} at ${merchant}`, 'warning');
          }
        } catch (error) {
          console.error('Simulator error:', error);
        }

      }, 3500); // Fire every 3.5 seconds
    }
    
    return () => clearInterval(interval);
  }, [isRunning, session, accounts, addToast]);

  if (accounts.length === 0) return null;

  return (
    <div className="fixed bottom-24 md:bottom-8 right-8 z-[100]">
      <div className="relative group">
        <div className={`absolute -inset-1 rounded-full blur-md opacity-70 transition-all duration-1000 ${isRunning ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500 group-hover:opacity-100'}`}></div>
        <button 
          onClick={() => setIsRunning(!isRunning)}
          className={`relative flex items-center gap-2 px-5 py-3.5 rounded-full font-bold shadow-2xl border border-white/20 backdrop-blur-md transition-all ${
            isRunning 
              ? 'bg-rose-600 hover:bg-rose-700 text-white' 
              : 'bg-emerald-600 hover:bg-emerald-700 text-white'
          }`}
        >
          {isRunning ? (
            <Square className="w-5 h-5 fill-current" />
          ) : (
            <Server className="w-5 h-5 animate-pulse" />
          )}
          <span className="hidden sm:flex flex-col items-start leading-tight">
            <span className="text-[10px] text-white/70 uppercase tracking-widest">{isRunning ? 'Active Live Stream' : 'Hackathon Demo'}</span>
            <span className="text-sm">{isRunning ? 'Stop Live Simulator' : 'Start Live Transactions'}</span>
          </span>
          {isRunning && <Activity className="w-5 h-5 ml-1" />}
        </button>
      </div>
    </div>
  );
}
