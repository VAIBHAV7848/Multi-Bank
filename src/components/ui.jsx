import React from 'react';

export function PageTransition({ children, className = '', ...props }) {
  return (
    <div className={`animate-fade-in animate-slide-up w-full h-full ${className}`} {...props}>
      {children}
    </div>
  );
}

export function Skeleton({ className = '' }) {
  return (
    <div className={`bg-slate-200 dark:bg-slate-800 animate-pulse rounded-xl ${className}`} />
  );
}

export function Card({ children, className = '', ...props }) {
  return (
    <div className={`bg-white/70 dark:bg-slate-900/70 backdrop-blur-lg border border-white/20 dark:border-slate-800/50 shadow-xl rounded-2xl p-6 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${className}`} {...props}>
      {children}
    </div>
  );
}
