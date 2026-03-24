import React, { useState } from 'react';
import { Card } from '../components/ui';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Smartphone, Shield, KeyRound, Loader2, CheckCircle2, ChevronRight, X, Building2, Server } from 'lucide-react';
import { formatCurrency } from '../lib/formatters';

const SETU_LOGO = "https://setu.co/favicon.png";

export default function SetuAAModal({ isOpen, onClose, onComplete }) {
  const { session } = useAuth();
  const { addToast } = useToast();
  
  const [step, setStep] = useState(1); // 1: Phone, 2: OTP, 3: Discovering, 4: Consent, 5: Fetching
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  
  // Sandbox Discovered Banks
  const sandboxAccounts = [
    { id: 'acc-1', bank: 'HDFC Bank', type: 'SAVINGS', mask: 'XXXX-9821', balance: 145000, color: '#004c8f' },
    { id: 'acc-2', bank: 'State Bank of India', type: 'CURRENT', mask: 'XXXX-4420', balance: 850000, color: '#1a4b8c' }
  ];

  if (!isOpen) return null;

  const handlePhoneSubmit = (e) => {
    e.preventDefault();
    if (phone.length !== 10) return addToast('Enter valid 10-digit mobile number', 'warning');
    setStep(2);
  };

  const handleOtpSubmit = (e) => {
    e.preventDefault();
    if (otp.length !== 6) return addToast('Enter 6-digit OTP', 'warning');
    setStep(3);
    // Simulate FIP Discovery
    setTimeout(() => {
      setStep(4);
    }, 2500);
  };

  const approveConsent = async () => {
    setStep(5);
    try {
      // Step 1: Insert sandbox accounts to Supabase
      const accountsToInsert = sandboxAccounts.map(acc => ({
        user_id: session.user.id,
        bank_name: acc.bank,
        account_name: `${acc.type} - ${acc.mask}`,
        account_number: acc.mask,
        account_type: 'Savings',
        balance: acc.balance,
        color: acc.color
      }));

      const { data: insertedAccounts, error: accError } = await supabase
        .from('accounts')
        .insert(accountsToInsert)
        .select();

      if (accError) throw accError;

      // Step 2: Generate realistic Sandbox transactions for these accounts
      const txnsToInsert = [];
      const categories = ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment'];
      const merchants = ['Amazon', 'Uber', 'Zomato', 'Swiggy', 'Netflix', 'Reliance Fresh'];
      
      insertedAccounts.forEach(acc => {
        // Generate 15 txns per account
        for (let i = 0; i < 15; i++) {
          const isCredit = Math.random() > 0.8;
          const amount = isCredit 
            ? Math.floor(Math.random() * 50000) + 10000 
            : Math.floor(Math.random() * 5000) + 100;
          
          const date = new Date();
          date.setDate(date.getDate() - Math.floor(Math.random() * 30));

          txnsToInsert.push({
            user_id: session.user.id,
            account_id: acc.id,
            merchant_name: isCredit ? 'Salary / IMPS Transfer' : merchants[Math.floor(Math.random() * merchants.length)],
            category: isCredit ? 'Income' : categories[Math.floor(Math.random() * categories.length)],
            category_emoji: isCredit ? '💰' : '💳',
            amount: amount,
            type: isCredit ? 'credit' : 'debit',
            status: 'completed',
            date: date.toISOString().split('T')[0]
          });
        }
      });

      const { error: txnError } = await supabase.from('transactions').insert(txnsToInsert);
      if (txnError) throw txnError;

      setTimeout(() => {
        addToast('Data successfully fetched via Setu AA Sandbox', 'success');
        if (onComplete) onComplete();
        onClose();
        setStep(1);
        setPhone('');
        setOtp('');
      }, 2000);

    } catch (error) {
      console.error(error);
      addToast('Failed to sync Setu Sandbox data', 'error');
      setStep(1);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4" onClick={() => step !== 3 && step !== 5 && onClose()}>
      <div 
        className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden flex flex-col items-center p-8 relative border border-slate-200 dark:border-slate-800"
        onClick={e => e.stopPropagation()}
      >
        {/* Setu / AA Header bar */}
        {(step !== 3 && step !== 5) && (
          <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        )}

        <div className="w-full flex justify-center mb-6 mt-2">
          <div className="flex items-center gap-3">
            <img src={SETU_LOGO} alt="Setu" className="w-8 h-8 rounded-md" onError={(e) => e.target.style.display='none'} />
            <div className="h-6 w-px bg-slate-300 dark:bg-slate-700"></div>
            <span className="font-bold text-slate-800 dark:text-slate-200 tracking-tight">Setu AA Sandbox</span>
          </div>
        </div>

        {/* STEP 1: Phone */}
        {step === 1 && (
          <form className="w-full space-y-6 animate-in fade-in slide-in-from-bottom-4" onSubmit={handlePhoneSubmit}>
            <div className="text-center">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Verify Identity</h2>
              <p className="text-sm text-slate-500 mt-1">Enter number linked to your bank accounts</p>
            </div>
            
            <div className="relative">
              <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="Mobile Number"
                className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl py-3.5 pl-12 pr-4 text-slate-900 dark:text-white font-semibold text-lg focus:border-blue-500 focus:ring-0 outline-none transition-all"
                autoFocus
              />
            </div>

            <button type="submit" className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
              Send OTP <ChevronRight className="w-5 h-5" />
            </button>
            
            <p className="text-[10px] text-center text-slate-400 flex items-center justify-center gap-1">
              <Shield className="w-3 h-3" /> Encrypted by RBI regulated Account Aggregator
            </p>
          </form>
        )}

        {/* STEP 2: OTP */}
        {step === 2 && (
          <form className="w-full space-y-6 animate-in fade-in slide-in-from-right-8" onSubmit={handleOtpSubmit}>
            <div className="text-center">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Enter OTP</h2>
              <p className="text-sm text-slate-500 mt-1">Sent to +91 {phone.slice(0,4)} {phone.slice(4)}</p>
            </div>
            
            <div className="relative">
              <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="• • • • • •"
                className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl py-3.5 pl-12 pr-4 text-center text-slate-900 dark:text-white font-bold text-2xl tracking-[0.5em] focus:border-blue-500 outline-none transition-all"
                autoFocus
              />
            </div>

            <button type="submit" className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:opacity-90">
              Verify
            </button>
          </form>
        )}

        {/* STEP 3: Discovering */}
        {step === 3 && (
          <div className="w-full space-y-6 py-8 flex flex-col items-center justify-center animate-in fade-in">
            <div className="relative">
              <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent flex items-center justify-center rounded-full animate-spin"></div>
              <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/40 rounded-full flex items-center justify-center text-blue-600">
                <Server className="w-6 h-6 animate-pulse" />
              </div>
            </div>
            <div className="text-center">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Discovering FIPs...</h2>
              <p className="text-sm text-slate-500 mt-1">Finding your linked bank accounts</p>
            </div>
          </div>
        )}

        {/* STEP 4: Consent Approval */}
        {step === 4 && (
          <div className="w-full space-y-5 animate-in fade-in slide-in-from-bottom-4">
            <div className="text-center mb-2">
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Accounts Found</h2>
            </div>
            
            <div className="space-y-3">
              {sandboxAccounts.map(acc => (
                <div key={acc.id} className="p-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <Building2 className="w-5 h-5 text-slate-400" />
                    <div>
                      <p className="font-bold text-sm text-slate-900 dark:text-white">{acc.bank}</p>
                      <p className="text-[10px] text-slate-500 font-mono">{acc.mask}</p>
                    </div>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-blue-600" />
                </div>
              ))}
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-xl border border-blue-100 dark:border-blue-900/50">
              <p className="text-[11px] text-blue-800 dark:text-blue-300 font-medium">
                Data requested: <span className="font-bold">Summary, Transactions, Profiles</span>
              </p>
              <p className="text-[11px] text-blue-800/80 dark:text-blue-400/80 mt-1">
                Duration: <span className="font-bold">1 Year</span>
              </p>
            </div>

            <button onClick={approveConsent} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors">
              Approve Consent
            </button>
            <p className="text-[10px] text-center text-slate-400 leading-tight">By approving, you digitally sign the consent artefact under the DEPA framework.</p>
          </div>
        )}

        {/* STEP 5: Fetching & Decrypting */}
        {step === 5 && (
          <div className="w-full space-y-6 py-8 flex flex-col items-center justify-center animate-in fade-in">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-2" />
            <div className="text-center">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Fetching Data...</h2>
              <p className="text-sm text-slate-500 mt-1">Decrypting financial information</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
