import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Mail, Lock, Eye, EyeOff, Loader2, Phone, Hash, Smartphone } from 'lucide-react';
import { Card, PageTransition } from '../components/ui';

export default function LoginPage() {
  const [authMode, setAuthMode] = useState('email'); // 'email', 'phone'
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const { addToast } = useToast();

  const handleGoogleSignIn = async () => {
    try {
      const { error } = await signInWithGoogle();
      if (error) throw error;
    } catch (error) {
      addToast(error.message || 'Google sign-in failed', 'error');
    }
  };

  const handleSendOtp = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      addToast('Please enter a valid phone number', 'error');
      return;
    }
    setIsLoading(true);
    // Simulate API call
    await new Promise(r => setTimeout(r, 1500));
    setOtpSent(true);
    setIsLoading(false);
    addToast('OTP sent to your phone!', 'success');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (authMode === 'phone') {
        if (otp === '123456' || otp.length === 6) {
          // Bypass login via phone
          const { error } = await signIn(phoneNumber + '@phone.fake', 'otp-bypass');
          if (error) throw error;
          addToast('Verified successfully!', 'success');
        } else {
          throw new Error('Invalid OTP. Hint: Try 123456');
        }
      } else {
        if (isLogin) {
          const { error } = await signIn(email, password);
          if (error) throw error;
          addToast('Welcome back!', 'success');
        } else {
          const { error } = await signUp(email, password);
          if (error) throw error;
          addToast('Account created successfully! Please sign in.', 'success');
          setIsLogin(true);
        }
      }
    } catch (error) {
      addToast(error.message || 'Authentication failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-gradient-animated p-4">
      
      {/* Abstract Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/30 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/30 blur-[120px] pointer-events-none" />

      <PageTransition className="w-full max-w-md z-10 relative">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-2 flex items-center justify-center gap-3">
            <span className="text-blue-400">⚡</span> Finclario
          </h1>
          <p className="text-white/70 text-lg">Clarity for your finances.</p>
        </div>

        <Card className="backdrop-blur-xl bg-white/10 dark:bg-slate-900/40 border-white/20 p-6 md:p-8">
          
          {/* Tab Switcher */}
          <div className="flex bg-black/20 p-1 rounded-xl mb-8">
            <button 
              onClick={() => setAuthMode('email')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${authMode === 'email' ? 'bg-white text-blue-600 shadow-lg' : 'text-white/60 hover:text-white'}`}
            >
              <Mail className="w-4 h-4" /> Email
            </button>
            <button 
              onClick={() => setAuthMode('phone')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${authMode === 'phone' ? 'bg-white text-blue-600 shadow-lg' : 'text-white/60 hover:text-white'}`}
            >
              <Smartphone className="w-4 h-4" /> Phone
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {authMode === 'email' ? (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/90">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 w-5 h-5" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium"
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/90">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 w-5 h-5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-12 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium"
                      placeholder="••••••••"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors p-1"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/90">Phone Number</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 font-bold text-sm">+91</span>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-14 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-bold tracking-[0.2em]"
                      placeholder="9876543210"
                      required={authMode === 'phone'}
                    />
                  </div>
                </div>

                {otpSent && (
                  <div className="space-y-2 animate-slide-up">
                    <label className="text-sm font-medium text-white/90 flex justify-between">
                      Verification Code
                      <span className="text-blue-400 text-xs font-bold">123456 (Demo)</span>
                    </label>
                    <div className="relative">
                      <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 w-5 h-5" />
                      <input
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        className="w-full bg-white/5 border border-emerald-500/30 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-bold tracking-[0.5em] text-center"
                        placeholder="••••••"
                        required={otpSent}
                      />
                    </div>
                  </div>
                )}

                {!otpSent && (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={isLoading || phoneNumber.length < 10}
                    className="w-full bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 font-bold py-3 rounded-xl border border-blue-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Smartphone className="w-4 h-4" />}
                    Send Verification Code
                  </button>
                )}
              </>
            )}

            <button
              type="submit"
              disabled={isLoading || (authMode === 'phone' && !otpSent)}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold py-3.5 rounded-xl shadow-lg hover:shadow-blue-500/25 transition-all duration-300 disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                (authMode === 'phone') ? 'Verify & Continue' : (isLogin ? 'Sign In to Dashboard' : 'Create Account')
              )}
            </button>
          </form>

          {authMode === 'email' && (
            <>
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
                <div className="relative flex justify-center text-sm"><span className="bg-transparent px-3 text-white/50">or</span></div>
              </div>

              <button
                onClick={handleGoogleSignIn}
                className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-100 text-slate-800 font-semibold py-3.5 rounded-xl shadow-lg transition-all duration-300"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>

              <div className="mt-6 text-center">
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-white/70 hover:text-white text-sm font-medium transition-colors"
                >
                  {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                </button>
              </div>
            </>
          )}
        </Card>
      </PageTransition>
    </div>
  );
}
