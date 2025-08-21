import React from 'react';
import { theme } from '../../lib/theme';

interface HeaderProps {
  size?: 'sm' | 'base' | 'lg';
  subtitle?: string;
  className?: string;
}

export function Header({ size = 'base', subtitle, className = '' }: HeaderProps) {
  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          container: 'py-4',
          title: 'text-3xl',
          subtitle: 'text-sm',
        };
      case 'base':
        return {
          container: 'py-6',
          title: 'text-4xl',
          subtitle: 'text-base',
        };
      case 'lg':
        return {
          container: 'py-8',
          title: 'text-5xl',
          subtitle: 'text-lg',
        };
    }
  };

  const styles = getSizeStyles();

  return (
    <header className={`w-full max-w-md mx-auto text-center ${styles.container} ${className}`}>
      <h1 
        className={`${styles.title} text-purple-600 transition-all duration-200`}
        style={{ fontFamily: theme.typography.fontFamily.heading }}
      >
        PlayTale
      </h1>
      {subtitle && (
        <p className={`mt-2 text-slate-600 font-medium ${styles.subtitle}`}>
          {subtitle}
        </p>
      )}
    </header>
  );
}
