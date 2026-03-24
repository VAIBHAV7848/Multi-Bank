import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useSupabaseData } from '../hooks/useSupabaseData';
import { useLanguage } from '../context/LanguageContext';
import { 
  LayoutDashboard, 
  ArrowLeftRight, 
  PieChart, 
  Bell, 
  Settings as SettingsIcon,
  LogOut,
  Moon,
  Sun,
  Target,
  BrainCircuit,
  Landmark,
  ShieldCheck,
  FileText,
  Globe
} from 'lucide-react';

// Placeholders for screens
import DashboardPage from './DashboardPage';
import TransactionsPage from './TransactionsPage';
import AnalyticsPage from './AnalyticsPage';
import AlertsPage from './AlertsPage';
import SettingsPage from './SettingsPage';
import GoalsPage from './GoalsPage';
import AIInsightsPage from './AIInsightsPage';
import SchemesPage from './SchemesPage';
import CreditScorePage from './CreditScorePage';
import ReportsPage from './ReportsPage';

import BankDashboard from './BankDashboard';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'transactions', label: 'Transactions', icon: ArrowLeftRight },
  { id: 'analytics', label: 'Analytics', icon: PieChart },
  { id: 'goals', label: 'Goals', icon: Target },
  { id: 'insights', label: 'AI Insights', icon: BrainCircuit },
  { id: 'schemes', label: 'Loans & Schemes', icon: Landmark },
  { id: 'credit', label: 'Credit Score', icon: ShieldCheck },
  { id: 'reports', label: 'Reports', icon: FileText },
  { id: 'bankaa', label: 'Bank AA', icon: Landmark },
  { id: 'alerts', label: 'Alerts', icon: Bell },
  { id: 'settings', label: 'Settings', icon: SettingsIcon },
];

export default function AppShell() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { user, signOut } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const { lastSynced } = useSupabaseData();
  const { t, language, changeLanguage, languages, currentLanguage } = useLanguage();
  const [showLangMenu, setShowLangMenu] = useState(false);
  const langRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => { if (langRef.current && !langRef.current.contains(e.target)) setShowLangMenu(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Mock checking local storage for unread alerts
  const unreadAlerts = 2;

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardPage onNavigate={setActiveTab} />;
      case 'transactions': return <TransactionsPage />;
      case 'analytics': return <AnalyticsPage />;
      case 'goals': return <GoalsPage />;
      case 'insights': return <AIInsightsPage />;
      case 'schemes': return <SchemesPage />;
      case 'credit': return <CreditScorePage />;
      case 'reports': return <ReportsPage />;
      case 'bankaa': return <BankDashboard />;
      case 'alerts': return <AlertsPage />;
      case 'settings': return <SettingsPage />;
      default: return <DashboardPage />;
    }
  };

  const activeLabel = t(`nav.${activeTab}`) || NAV_ITEMS.find(i => i.id === activeTab)?.label || 'Dashboard';
  const timeStr = lastSynced ? Math.floor((new Date() - lastSynced) / 60000) : 0;

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      
      {/* Sidebar (Desktop) */}
      <aside className="hidden md:flex flex-col w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex-shrink-0 z-20 shadow-sm transition-colors">
        <div className="p-6">
          <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
            <span className="text-blue-500">⚡</span> Finclario
          </h1>
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
                  isActive 
                    ? 'bg-blue-500 text-white shadow-md shadow-blue-500/20' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : ''}`} />
                {t(`nav.${item.id}`) || item.label}
                {item.id === 'alerts' && unreadAlerts > 0 && (
                  <span className={`ml-auto text-xs py-0.5 px-2 rounded-full font-bold ${
                    isActive ? 'bg-white text-blue-600' : 'bg-red-500 text-white'
                  }`}>
                    {unreadAlerts}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-lg shadow-sm">
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold truncate dark:text-slate-200">
                {user?.email?.split('@')[0] || 'User'}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {user?.email}
              </p>
            </div>
          </div>
          
          <button 
            onClick={signOut}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors font-medium"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
          
          <p className="text-center text-[10px] text-slate-400 dark:text-slate-500 mt-4 uppercase tracking-wider font-semibold">
            Finclario v1.0 • HackArena
          </p>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        
        {/* Top Navbar */}
        <header className="h-16 px-4 md:px-8 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex items-center justify-between z-10 sticky top-0 transition-colors">
          <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-500 dark:from-white dark:to-slate-400">
            {activeLabel}
          </h2>
          
          <div className="flex items-center gap-2 sm:gap-4">
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-mint animate-pulse"></span>
              {timeStr === 0 ? t('common.syncedJustNow') : t('common.syncedAgo', { time: timeStr })}
            </span>
            
            {/* Language Switcher */}
            <div className="relative" ref={langRef}>
              <button
                onClick={() => setShowLangMenu(!showLangMenu)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-xs font-medium"
                aria-label="Change language"
              >
                <Globe className="w-4 h-4" />
                <span className="hidden sm:inline">{currentLanguage.native}</span>
              </button>
              {showLangMenu && (
                <div className="absolute right-0 top-full mt-2 w-44 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 overflow-hidden animate-slide-up">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => { changeLanguage(lang.code); setShowLangMenu(false); }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors ${
                        language === lang.code
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span className="text-base">{lang.flag}</span>
                      <span>{lang.native}</span>
                      {language === lang.code && <span className="ml-auto text-blue-500">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            
            <button 
              onClick={() => setActiveTab('alerts')}
              className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative md:hidden"
            >
              <Bell className="w-5 h-5" />
              {unreadAlerts > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
              )}
            </button>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <div className="flex-1 overflow-y-auto w-full p-4 md:p-8 scroll-smooth pb-24 md:pb-8">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </div>
      </main>

      {/* Bottom Tab Bar (Mobile) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 z-50 px-2 pb-safe pt-2 transition-colors">
        <div className="flex justify-around items-center">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center justify-center w-full py-2 ${
                  isActive ? 'text-blue-500' : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                <div className="relative">
                  <Icon className={`w-6 h-6 mb-1 ${isActive ? 'animate-bounce-short' : ''}`} />
                  {item.id === 'alerts' && unreadAlerts > 0 && !isActive && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
                  )}
                </div>
                <span className="text-[10px] font-medium leading-none">{t(`nav.${item.id}`) || item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
      

    </div>
  );
}
