import React from 'react';
import { AlertCircle, XCircle, Info, CheckCircle } from 'lucide-react';
import { Text, Button } from './';
import { theme } from '../../lib/theme';

interface ErrorMessageProps {
  message: string;
  type?: 'error' | 'warning' | 'info' | 'success';
  onRetry?: () => void;
  onDismiss?: () => void;
  retryLabel?: string;
  dismissLabel?: string;
  className?: string;
}

export function ErrorMessage({
  message,
  type = 'error',
  onRetry,
  onDismiss,
  retryLabel = 'Prøv igen',
  dismissLabel = 'OK',
  className = ''
}: ErrorMessageProps) {
  const getIcon = () => {
    switch (type) {
      case 'error':
        return <XCircle className="h-5 w-5" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5" />;
      case 'info':
        return <Info className="h-5 w-5" />;
      case 'success':
        return <CheckCircle className="h-5 w-5" />;
      default:
        return <XCircle className="h-5 w-5" />;
    }
  };

  const getStyles = () => {
    switch (type) {
      case 'error':
        return {
          container: 'bg-red-50 border-red-200',
          text: 'text-red-600',
          icon: 'text-red-500'
        };
      case 'warning':
        return {
          container: 'bg-yellow-50 border-yellow-200',
          text: 'text-yellow-700',
          icon: 'text-yellow-500'
        };
      case 'info':
        return {
          container: 'bg-blue-50 border-blue-200',
          text: 'text-blue-700',
          icon: 'text-blue-500'
        };
      case 'success':
        return {
          container: 'bg-green-50 border-green-200',
          text: 'text-green-700',
          icon: 'text-green-500'
        };
      default:
        return {
          container: 'bg-red-50 border-red-200',
          text: 'text-red-600',
          icon: 'text-red-500'
        };
    }
  };

  const styles = getStyles();

  return (
    <div className={`p-4 border rounded-xl ${styles.container} ${className}`}>
      <div className="flex items-start space-x-3">
        <div className={`flex-shrink-0 ${styles.icon}`}>
          {getIcon()}
        </div>
        <div className="flex-1">
          <Text size="sm" className={styles.text}>
            {message}
          </Text>
          {(onRetry || onDismiss) && (
            <div className="flex space-x-2 mt-3">
              {onRetry && (
                <Button size="sm" variant="outline" onClick={onRetry}>
                  {retryLabel}
                </Button>
              )}
              {onDismiss && (
                <Button size="sm" variant="ghost" onClick={onDismiss}>
                  {dismissLabel}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface LoadingMessageProps {
  message: string;
  className?: string;
}

export function LoadingMessage({ message, className = '' }: LoadingMessageProps) {
  return (
    <div className={`p-4 bg-blue-50 border border-blue-200 rounded-xl text-center ${className}`}>
      <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent mx-auto mb-2"></div>
      <Text size="sm" className="text-blue-600">
        {message}
      </Text>
    </div>
  );
}