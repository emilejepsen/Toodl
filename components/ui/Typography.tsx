import React from 'react';
import { theme } from '../../lib/theme';

// Heading Component
interface HeadingProps {
  children: React.ReactNode;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  size?: 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  color?: 'primary' | 'secondary' | 'muted' | 'white' | 'purple';
  className?: string;
  style?: React.CSSProperties;
}

export function Heading({ 
  children, 
  level = 2, 
  size,
  weight = 'bold',
  color = 'primary',
  className = '',
  style 
}: HeadingProps) {
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;
  
  // Default sizes based on heading level if not specified
  const getDefaultSize = () => {
    if (size) return size;
    
    switch (level) {
      case 1: return '4xl';
      case 2: return '3xl';
      case 3: return '2xl';
      case 4: return 'xl';
      case 5: return 'lg';
      case 6: return 'base';
      default: return '2xl';
    }
  };

  const getFontSize = () => {
    const selectedSize = getDefaultSize();
    switch (selectedSize) {
      case 'sm': return 'text-sm';
      case 'base': return 'text-base';
      case 'lg': return 'text-lg';
      case 'xl': return 'text-xl';
      case '2xl': return 'text-2xl';
      case '3xl': return 'text-3xl';
      case '4xl': return 'text-4xl';
      default: return 'text-2xl';
    }
  };

  const getFontWeight = () => {
    switch (weight) {
      case 'normal': return 'font-normal';
      case 'medium': return 'font-medium';
      case 'semibold': return 'font-semibold';
      case 'bold': return 'font-bold';
      default: return 'font-bold';
    }
  };

  const getTextColor = () => {
    switch (color) {
      case 'primary': return 'text-slate-800';
      case 'secondary': return 'text-slate-600';
      case 'muted': return 'text-slate-400';
      case 'white': return 'text-white';
      case 'purple': return 'text-purple-600';
      default: return 'text-slate-800';
    }
  };

  const isMainTitle = level === 1 && !size;
  const fontFamily = isMainTitle ? theme.typography.fontFamily.heading : theme.typography.fontFamily.body;

  return (
    <Tag 
      className={`${getFontSize()} ${getFontWeight()} ${getTextColor()} transition-colors duration-200 ${className}`}
      style={{ 
        fontFamily,
        ...style 
      }}
    >
      {children}
    </Tag>
  );
}

// Text/Paragraph Component
interface TextProps {
  children: React.ReactNode;
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  color?: 'primary' | 'secondary' | 'muted' | 'white' | 'purple' | 'success' | 'error' | 'warning';
  align?: 'left' | 'center' | 'right';
  className?: string;
  as?: 'p' | 'span' | 'div';
}

export function Text({ 
  children, 
  size = 'base', 
  weight = 'normal',
  color = 'primary',
  align = 'left',
  className = '',
  as = 'p'
}: TextProps) {
  const Tag = as;

  const getFontSize = () => {
    switch (size) {
      case 'xs': return 'text-xs';
      case 'sm': return 'text-sm';
      case 'base': return 'text-base';
      case 'lg': return 'text-lg';
      case 'xl': return 'text-xl';
      default: return 'text-base';
    }
  };

  const getFontWeight = () => {
    switch (weight) {
      case 'normal': return 'font-normal';
      case 'medium': return 'font-medium';
      case 'semibold': return 'font-semibold';
      case 'bold': return 'font-bold';
      default: return 'font-normal';
    }
  };

  const getTextColor = () => {
    switch (color) {
      case 'primary': return 'text-slate-800';
      case 'secondary': return 'text-slate-600';
      case 'muted': return 'text-slate-400';
      case 'white': return 'text-white';
      case 'purple': return 'text-purple-600';
      case 'success': return 'text-emerald-600';
      case 'error': return 'text-red-600';
      case 'warning': return 'text-amber-600';
      default: return 'text-slate-800';
    }
  };

  const getTextAlign = () => {
    switch (align) {
      case 'left': return 'text-left';
      case 'center': return 'text-center';
      case 'right': return 'text-right';
      default: return 'text-left';
    }
  };

  return (
    <Tag 
      className={`${getFontSize()} ${getFontWeight()} ${getTextColor()} ${getTextAlign()} transition-colors duration-200 ${className}`}
      style={{ fontFamily: theme.typography.fontFamily.body }}
    >
      {children}
    </Tag>
  );
}

// Label Component (for forms)
interface LabelProps {
  children: React.ReactNode;
  htmlFor?: string;
  required?: boolean;
  className?: string;
}

export function Label({ children, htmlFor, required, className = '' }: LabelProps) {
  return (
    <label 
      htmlFor={htmlFor}
      className={`block text-sm font-medium text-gray-700 mb-2 ${className}`}
      style={{ fontFamily: theme.typography.fontFamily.body }}
    >
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );
}
