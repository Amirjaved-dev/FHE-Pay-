import React from 'react';
import { cn } from '@/utils/helpers';
import { Loader2 } from 'lucide-react';

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'primary' | 'secondary' | 'muted';
  className?: string;
  label?: string;
  showLabel?: boolean;
}

const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  variant = 'default',
  className,
  label = 'Loading...',
  showLabel = false,
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12',
  };
  
  const variantClasses = {
    default: 'text-foreground',
    primary: 'text-primary',
    secondary: 'text-secondary-foreground',
    muted: 'text-muted-foreground',
  };

  if (showLabel) {
    return (
      <div className={cn('flex items-center space-x-2', className)}>
        <Loader2 
          className={cn(
            'animate-spin',
            sizeClasses[size],
            variantClasses[variant]
          )}
        />
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
    );
  }

  return (
    <Loader2 
      className={cn(
        'animate-spin',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      aria-label={label}
    />
  );
};

export { Spinner };
export default Spinner;

// Full page spinner
export interface FullPageSpinnerProps {
  message?: string;
  size?: 'md' | 'lg' | 'xl';
}

export const FullPageSpinner: React.FC<FullPageSpinnerProps> = ({
  message = 'Loading...',
  size = 'lg',
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex flex-col items-center space-y-4">
        <Spinner size={size} variant="primary" />
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  );
};

// Inline spinner for buttons and small spaces
export interface InlineSpinnerProps {
  size?: 'sm' | 'md';
  className?: string;
}

export const InlineSpinner: React.FC<InlineSpinnerProps> = ({
  size = 'sm',
  className,
}) => {
  return (
    <Spinner 
      size={size} 
      variant="default" 
      className={cn('inline', className)}
    />
  );
};

// Card spinner for loading cards
export interface CardSpinnerProps {
  message?: string;
  className?: string;
}

export const CardSpinner: React.FC<CardSpinnerProps> = ({
  message = 'Loading...',
  className,
}) => {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center p-8 space-y-4',
      className
    )}>
      <Spinner size="md" variant="muted" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
};

// Dots spinner (alternative animation)
export interface DotsSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'primary' | 'secondary' | 'muted';
  className?: string;
}

export const DotsSpinner: React.FC<DotsSpinnerProps> = ({
  size = 'md',
  variant = 'default',
  className,
}) => {
  const sizeClasses = {
    sm: 'w-1 h-1',
    md: 'w-2 h-2',
    lg: 'w-3 h-3',
  };
  
  const variantClasses = {
    default: 'bg-foreground',
    primary: 'bg-primary',
    secondary: 'bg-secondary-foreground',
    muted: 'bg-muted-foreground',
  };

  return (
    <div className={cn('flex space-x-1', className)}>
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className={cn(
            'rounded-full animate-pulse',
            sizeClasses[size],
            variantClasses[variant]
          )}
          style={{
            animationDelay: `${index * 0.2}s`,
            animationDuration: '1s',
          }}
        />
      ))}
    </div>
  );
};

// Pulse spinner (for skeleton loading)
export interface PulseSpinnerProps {
  className?: string;
  children?: React.ReactNode;
}

export const PulseSpinner: React.FC<PulseSpinnerProps> = ({
  className,
  children,
}) => {
  return (
    <div className={cn('animate-pulse', className)}>
      {children || (
        <div className="h-4 bg-muted rounded w-full" />
      )}
    </div>
  );
};