import React from 'react';
import { Check } from 'lucide-react';
import { theme } from '../../lib/theme';

interface ProgressStep {
  id: string;
  label: string;
  status: 'completed' | 'current' | 'upcoming';
}

interface ProgressBarProps {
  steps: ProgressStep[];
  size?: 'sm' | 'base' | 'lg';
  className?: string;
}

export function ProgressBar({ steps, size = 'sm', className = '' }: ProgressBarProps) {
  const circleSize = theme.components.progressBar.circle[size];
  const textSize = theme.components.progressBar.text[size];
  
  const getStepIcon = (step: ProgressStep, index: number) => {
    if (step.status === 'completed') {
      return <Check className={size === 'sm' ? 'h-3 w-3' : size === 'base' ? 'h-4 w-4' : 'h-5 w-5'} />;
    }
    return <span className="font-bold">{index + 1}</span>;
  };

  const getStepStyles = (step: ProgressStep) => {
    const baseStyles = `${circleSize} rounded-full flex items-center justify-center text-white font-bold transition-all duration-200`;
    
    switch (step.status) {
      case 'completed':
        return `${baseStyles} bg-purple-600`;
      case 'current':
        return `${baseStyles} bg-purple-600`;
      case 'upcoming':
        return `${baseStyles} bg-gray-300 text-gray-500`;
      default:
        return `${baseStyles} bg-gray-300 text-gray-500`;
    }
  };

  const getTextStyles = (step: ProgressStep) => {
    const baseStyles = `ml-1 ${textSize} font-semibold transition-colors duration-200`;
    
    switch (step.status) {
      case 'completed':
        return `${baseStyles} text-purple-600`;
      case 'current':
        return `${baseStyles} text-purple-600`;
      case 'upcoming':
        return `${baseStyles} text-gray-500`;
      default:
        return `${baseStyles} text-gray-500`;
    }
  };

  const getLineStyles = (currentIndex: number) => {
    const currentStep = steps[currentIndex];
    const nextStep = steps[currentIndex + 1];
    
    if (!nextStep) return '';
    
    const isCompleted = currentStep.status === 'completed';
    return `flex-1 h-0.5 transition-colors duration-200 ${
      isCompleted ? 'bg-purple-600' : 'bg-gray-300'
    }`;
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      {steps.map((step, index) => (
        <React.Fragment key={step.id}>
          <div className="flex items-center">
            <div className={getStepStyles(step)}>
              {getStepIcon(step, index)}
            </div>
            <span className={getTextStyles(step)}>
              {step.label}
            </span>
          </div>
          
          {index < steps.length - 1 && (
            <div className={`mx-3 ${getLineStyles(index)}`}></div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
