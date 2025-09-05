import React from 'react';
import { theme } from '../../lib/theme';

interface FormFieldProps {
  label: string;
  children: React.ReactNode;
  error?: string;
  required?: boolean;
  className?: string;
}

export function FormField({ label, children, error, required = false, className = '' }: FormFieldProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  size?: 'sm' | 'base' | 'lg';
  error?: boolean;
  icon?: React.ReactNode;
}

export function Input({ 
  size = 'base', 
  error = false, 
  icon, 
  className = '', 
  ...props 
}: InputProps) {
  const getSizeClass = () => {
    switch (size) {
      case 'sm':
        return 'py-2 text-sm';
      case 'base':
        return 'py-3 text-sm';
      case 'lg':
        return 'py-4 text-base';
      default:
        return 'py-3 text-sm';
    }
  };

  const baseClasses = `block w-full rounded-xl border transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent`;
  const paddingClasses = icon ? 'pl-10 pr-3' : 'px-3';
  const errorClasses = error ? 'border-red-300 focus:ring-red-500' : 'border-gray-300';

  return (
    <div className="relative">
      {icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <div className="text-gray-400">
            {icon}
          </div>
        </div>
      )}
      <input
        className={`${baseClasses} ${getSizeClass()} ${paddingClasses} ${errorClasses} ${className}`}
        {...props}
      />
    </div>
  );
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  size?: 'sm' | 'base' | 'lg';
  error?: boolean;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
}

export function Select({ 
  size = 'base', 
  error = false, 
  options,
  placeholder,
  className = '', 
  ...props 
}: SelectProps) {
  const getSizeClass = () => {
    switch (size) {
      case 'sm':
        return 'py-2 text-sm';
      case 'base':
        return 'py-3 text-sm';
      case 'lg':
        return 'py-4 text-base';
      default:
        return 'py-3 text-sm';
    }
  };

  const baseClasses = `block w-full px-3 rounded-xl border transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent`;
  const errorClasses = error ? 'border-red-300 focus:ring-red-500' : 'border-gray-300';

  return (
    <select
      className={`${baseClasses} ${getSizeClass()} ${errorClasses} ${className}`}
      {...props}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}