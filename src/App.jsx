import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import AppShell from './pages/AppShell';
import LoginPage from './pages/LoginPage';
import SetupPage from './pages/SetupPage';

function ProtectedRoute({ children }) {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!session) {
    return <LoginPage />;
  }

  // Check if setup is needed (mock implementation for now)
  const isSetupComplete = localStorage.getItem('setupComplete') === 'true';
  if (!isSetupComplete) {
    return <SetupPage onComplete={() => window.location.reload()} />;
  }

  return children;
}

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
