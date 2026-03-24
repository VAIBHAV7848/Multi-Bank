import React from 'react';

export function PageTransition({ children, className = '' }) {
  return (
    <div className={`animate-fade-in animate-slide-up w-full h-full ${className}`}>
      {children}
    </div>
  );
}

export function Skeleton({ className = '' }) {
  return (
    <div className={`bg-slate-200 dark:bg-slate-800 animate-pulse rounded-xl ${className}`} />
  );
}

export function Card({ children, className = '' }) {
  return (
    <div className={`glass-card ${className}`}>
      {children}
    </div>
  );
}
