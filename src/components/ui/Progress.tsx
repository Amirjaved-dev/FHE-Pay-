import React from 'react';
import { cn } from '@/utils/helpers';

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'destructive';
  showLabel?: boolean;
  label?: string;
  animated?: boolean;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ 
    className, 
    value = 0, 
    max = 100, 
    size = 'md', 
    variant = 'default',
    showLabel = false,
    label,
    animated = false,
    ...props 
  }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
    
    const sizeClasses = {
      sm: 'h-2',
      md: 'h-3',
      lg: 'h-4',
    };
    
    const variantClasses = {
      default: 'bg-primary',
      success: 'bg-green-500',
      warning: 'bg-yellow-500',
      destructive: 'bg-red-500',
    };

    return (
      <div className="w-full space-y-2">
        {(showLabel || label) && (
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">
              {label || 'Progress'}
            </span>
            <span className="font-medium">
              {Math.round(percentage)}%
            </span>
          </div>
        )}
        <div
          ref={ref}
          className={cn(
            'relative w-full overflow-hidden rounded-full bg-secondary',
            sizeClasses[size],
            className
          )}
          {...props}
        >
          <div
            className={cn(
              'h-full transition-all duration-300 ease-in-out',
              variantClasses[variant],
              animated && 'animate-pulse'
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  }
);

Progress.displayName = 'Progress';

export { Progress };
export default Progress;

// Circular Progress Component
export interface CircularProgressProps {
  value?: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  variant?: 'default' | 'success' | 'warning' | 'destructive';
  showLabel?: boolean;
  label?: string;
  className?: string;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  value = 0,
  max = 100,
  size = 120,
  strokeWidth = 8,
  variant = 'default',
  showLabel = false,
  label,
  className,
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  
  const variantColors = {
    default: 'stroke-primary',
    success: 'stroke-green-500',
    warning: 'stroke-yellow-500',
    destructive: 'stroke-red-500',
  };

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-secondary"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={cn(
            'transition-all duration-300 ease-in-out',
            variantColors[variant]
          )}
        />
      </svg>
      {(showLabel || label) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold">
            {Math.round(percentage)}%
          </span>
          {label && (
            <span className="text-sm text-muted-foreground">
              {label}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

// Skeleton Progress Component
export interface SkeletonProgressProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const SkeletonProgress: React.FC<SkeletonProgressProps> = ({
  className,
  size = 'md',
}) => {
  const progress = 60; // Default progress value for skeleton
  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
  };

  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between items-center">
        <div className="h-4 w-16 bg-muted animate-pulse rounded" />
        <div className="h-4 w-8 bg-muted animate-pulse rounded" />
      </div>
      <div
        className={cn(
          'relative w-full overflow-hidden rounded-full bg-muted',
          sizeClasses[size],
          className
        )}
      >
        <div
          className={cn(
            'h-full bg-primary animate-pulse transition-all',
            sizeClasses[size]
          )}
          style={{ width: `${progress}%` }}
        >
          <span className="sr-only">{progress}% complete</span>
        </div>
      </div>
    </div>
  );
}
