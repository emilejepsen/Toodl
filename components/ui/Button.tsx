import React from 'react';
import { theme } from '../../lib/theme';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'base' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

export function Button({ 
  children, 
  variant = 'primary', 
  size = 'base', 
  disabled = false,
  loading = false,
  className = '', 
  onClick,
  type = 'button'
}: ButtonProps) {
  const sizeClass = theme.components.button.size[size];

  const getVariantStyles = () => {
    const baseStyles = `font-medium rounded-xl transition-all duration-200 transform focus:outline-none focus:ring-2 focus:ring-offset-2`;
    
    switch (variant) {
      case 'primary':
        return `${baseStyles} text-white bg-purple-500 hover:bg-purple-600 focus:ring-purple-500 hover:scale-[1.02] active:scale-[0.98]`;
      case 'secondary':
        return `${baseStyles} text-purple-600 bg-purple-50 hover:bg-purple-100 focus:ring-purple-500 hover:scale-[1.02] active:scale-[0.98]`;
      case 'outline':
        return `${baseStyles} text-purple-600 bg-transparent border-2 border-purple-600 hover:bg-purple-50 focus:ring-purple-500 hover:scale-[1.02] active:scale-[0.98]`;
      case 'ghost':
        return `${baseStyles} text-gray-600 bg-transparent hover:bg-gray-50 focus:ring-gray-500 hover:scale-[1.02] active:scale-[0.98]`;
      case 'danger':
        return `${baseStyles} text-white bg-red-500 hover:bg-red-600 focus:ring-red-500 hover:scale-[1.02] active:scale-[0.98]`;
      default:
        return `${baseStyles} text-white bg-purple-500 hover:bg-purple-600 focus:ring-purple-500 hover:scale-[1.02] active:scale-[0.98]`;
    }
  };

  const getDisabledStyles = () => {
    if (disabled || loading) {
      return 'opacity-50 cursor-not-allowed transform-none hover:transform-none';
    }
    return '';
  };

  return (
    <button
      type={type}
      className={`${getVariantStyles()} ${sizeClass} ${getDisabledStyles()} ${className}`}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading ? (
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2"></div>
          Indlæser...
        </div>
      ) : (
        children
      )}
    </button>
  );
}

// Specialized icon button for mic, play, etc.
interface IconButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'base' | 'lg' | 'xl';
  disabled?: boolean;
  loading?: boolean;
  animate?: 'pulse' | 'bounce' | 'none';
  className?: string;
  onClick?: () => void;
}

export function IconButton({ 
  children, 
  variant = 'primary', 
  size = 'base',
  disabled = false,
  loading = false,
  animate = 'none',
  className = '', 
  onClick 
}: IconButtonProps) {
  const sizeClass = theme.components.button.size.icon[size];

  const getVariantStyles = () => {
    const baseStyles = `rounded-full flex items-center justify-center text-white transition-all duration-200 transform focus:outline-none focus:ring-2 focus:ring-offset-2`;
    
    switch (variant) {
      case 'primary':
        return `${baseStyles} bg-purple-500 hover:bg-purple-600 focus:ring-purple-500 hover:scale-110 active:scale-95`;
      case 'secondary':
        return `${baseStyles} bg-gray-500 hover:bg-gray-600 focus:ring-gray-500 hover:scale-110 active:scale-95`;
      case 'danger':
        return `${baseStyles} bg-red-500 hover:bg-red-600 focus:ring-red-500 hover:scale-110 active:scale-95`;
      default:
        return `${baseStyles} bg-purple-500 hover:bg-purple-600 focus:ring-purple-500 hover:scale-110 active:scale-95`;
    }
  };

  const getAnimationClass = () => {
    switch (animate) {
      case 'pulse':
        return 'animate-pulse';
      case 'bounce':
        return 'animate-bounce';
      default:
        return '';
    }
  };

  const getDisabledStyles = () => {
    if (disabled || loading) {
      return 'opacity-50 cursor-not-allowed transform-none hover:transform-none';
    }
    return '';
  };

  return (
    <button
      className={`${getVariantStyles()} ${sizeClass} ${getAnimationClass()} ${getDisabledStyles()} ${className}`}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading ? (
        <div className="animate-spin rounded-full h-1/2 w-1/2 border-2 border-current border-t-transparent"></div>
      ) : (
        children
      )}
    </button>
  );
}
