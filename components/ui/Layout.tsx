import React from 'react';
import { theme } from '../../lib/theme';

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function ScreenLayout({ children, className = '' }: LayoutProps) {
  return (
    <div 
      className={`min-h-screen bg-amber-50 text-slate-800 ${className}`}
      style={{ fontFamily: theme.typography.fontFamily.body }}
    >
      <div className="min-h-screen flex flex-col items-center justify-between p-6">
        {children}
      </div>
    </div>
  );
}

interface MainContentProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

export function MainContent({ children, className = '', maxWidth = 'md' }: MainContentProps) {
  const getMaxWidth = () => {
    switch (maxWidth) {
      case 'sm': return 'max-w-sm';
      case 'md': return 'max-w-md';
      case 'lg': return 'max-w-lg';
      case 'xl': return 'max-w-xl';
      default: return 'max-w-md';
    }
  };

  return (
    <main className={`w-full ${getMaxWidth()} mx-auto flex-grow flex flex-col justify-start ${className}`}>
      {children}
    </main>
  );
}

interface FooterProps {
  children: React.ReactNode;
  className?: string;
}

export function Footer({ children, className = '' }: FooterProps) {
  return (
    <footer className={`w-full max-w-md mx-auto py-8 ${className}`}>
      {children}
    </footer>
  );
}
