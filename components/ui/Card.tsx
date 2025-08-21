import React from 'react';
import { theme } from '../../lib/theme';

interface CardProps {
  children: React.ReactNode;
  padding?: 'sm' | 'base' | 'lg';
  shadow?: 'sm' | 'base' | 'lg' | 'xl';
  className?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
  // Optional: use a predefined min-height from theme for consistent component sizing
  minHeightVariant?: 'gridItem';
}

export function Card({ 
  children, 
  padding = 'base', 
  shadow = 'lg', 
  className = '', 
  onClick,
  style,
  minHeightVariant
}: CardProps) {
  const paddingClass = theme.components.card.padding[padding];
  
  const getShadowClass = () => {
    switch (shadow) {
      case 'sm':
        return 'shadow-sm';
      case 'base':
        return 'shadow';
      case 'lg':
        return 'shadow-lg';
      case 'xl':
        return 'shadow-xl';
      default:
        return 'shadow-lg';
    }
  };

  const baseClasses = `bg-white rounded-2xl transition-all duration-200 ${paddingClass} ${getShadowClass()}`;
  const interactiveClasses = onClick ? 'cursor-pointer hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]' : '';

  const computedStyle: React.CSSProperties = {
    ...(minHeightVariant ? { minHeight: (theme as any).components.card.heights[minHeightVariant] } : {}),
    ...style,
  };

  return (
    <div 
      className={`${baseClasses} ${interactiveClasses} ${className}`}
      onClick={onClick}
      style={computedStyle}
    >
      {children}
    </div>
  );
}
