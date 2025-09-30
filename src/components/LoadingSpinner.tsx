'use client';

import React from 'react';
import { Spinner } from './ui/Spinner';
import { cn } from '@/utils/helpers';

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'primary' | 'secondary';
  label?: string;
  className?: string;
  fullScreen?: boolean;
  overlay?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  variant = 'default',
  label,
  className,
  fullScreen = false,
  overlay = false,
}) => {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        <div className="flex flex-col items-center space-y-4">
          <Spinner size="lg" variant={variant} />
          {label && (
            <div className="text-sm text-muted-foreground animate-pulse">
              {label}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (overlay) {
    return (
      <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50 backdrop-blur-sm rounded-lg">
        <div className="flex flex-col items-center space-y-2">
          <Spinner size={size} variant={variant} />
          {label && (
            <div className="text-xs text-muted-foreground">
              {label}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col items-center space-y-2', className)}>
      <Spinner size={size} variant={variant} />
      {label && (
        <div className={cn(
          'text-muted-foreground',
          size === 'sm' ? 'text-xs' : 'text-sm'
        )}>
          {label}
        </div>
      )}
    </div>
  );
};

export default LoadingSpinner;

// Specific loading components for different contexts
export const PageLoader: React.FC<{ message?: string }> = ({ 
  message = 'Loading...' 
}) => {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <LoadingSpinner 
        size="lg" 
        label={message} 
        className="text-center"
      />
    </div>
  );
};

export const CardLoader: React.FC<{ message?: string }> = ({ 
  message = 'Loading...' 
}) => {
  return (
    <div className="flex items-center justify-center p-8">
      <LoadingSpinner 
        size="md" 
        label={message}
      />
    </div>
  );
};

export const ButtonLoader: React.FC<{ size?: 'sm' | 'md' }> = ({ 
  size = 'sm' 
}) => {
  return (
    <Spinner 
      size={size} 
      variant="secondary" 
      className="text-current"
    />
  );
};

export const InlineLoader: React.FC<{ message?: string }> = ({ 
  message = 'Loading...' 
}) => {
  return (
    <div className="flex items-center space-x-2">
      <Spinner size="sm" />
      <span className="text-sm text-muted-foreground">{message}</span>
    </div>
  );
};

// FHE-specific loading states
export const FHELoader: React.FC<{ 
  operation?: 'encrypting' | 'decrypting' | 'generating' | 'processing';
  message?: string;
}> = ({ 
  operation = 'processing',
  message 
}) => {
  const defaultMessages = {
    encrypting: 'Encrypting data with FHE...',
    decrypting: 'Decrypting data...',
    generating: 'Generating FHE keys...',
    processing: 'Processing with FHE...',
  };

  const displayMessage = message || defaultMessages[operation];

  return (
    <div className="flex flex-col items-center space-y-3 p-6">
      <div className="relative">
        <Spinner size="lg" variant="primary" />
        <div className="absolute inset-0 animate-ping">
          <Spinner size="lg" variant="primary" className="opacity-20" />
        </div>
      </div>
      <div className="text-center space-y-1">
        <div className="text-sm font-medium">{displayMessage}</div>
        <div className="text-xs text-muted-foreground">
          This may take a few moments due to encryption complexity
        </div>
      </div>
    </div>
  );
};

// Transaction loading states
export const TransactionLoader: React.FC<{ 
  step?: 'preparing' | 'signing' | 'broadcasting' | 'confirming';
  txHash?: string;
}> = ({ 
  step = 'preparing',
  txHash 
}) => {
  const stepMessages = {
    preparing: 'Preparing transaction...',
    signing: 'Please sign the transaction in your wallet',
    broadcasting: 'Broadcasting transaction...',
    confirming: 'Waiting for confirmation...',
  };

  return (
    <div className="flex flex-col items-center space-y-4 p-6">
      <Spinner size="lg" variant="primary" />
      <div className="text-center space-y-2">
        <div className="text-sm font-medium">{stepMessages[step]}</div>
        {txHash && (
          <div className="text-xs text-muted-foreground">
            Transaction: {txHash.slice(0, 10)}...{txHash.slice(-8)}
          </div>
        )}
        {step === 'signing' && (
          <div className="text-xs text-orange-600">
            Check your wallet for the signature request
          </div>
        )}
      </div>
    </div>
  );
};

// Stream operation loaders
export const StreamLoader: React.FC<{ 
  operation?: 'creating' | 'withdrawing' | 'pausing' | 'resuming' | 'loading';
}> = ({ 
  operation = 'loading' 
}) => {
  const operationMessages = {
    creating: 'Creating salary stream...',
    withdrawing: 'Processing withdrawal...',
    pausing: 'Pausing stream...',
    resuming: 'Resuming stream...',
    loading: 'Loading stream data...',
  };

  return (
    <LoadingSpinner 
      size="md" 
      label={operationMessages[operation]}
      className="py-8"
    />
  );
};

// Dashboard loading skeleton
export const DashboardLoader: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-muted animate-pulse rounded" />
          <div className="h-4 w-32 bg-muted animate-pulse rounded" />
        </div>
        <div className="h-10 w-32 bg-muted animate-pulse rounded" />
      </div>
      
      {/* Stats skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="p-6 border rounded-lg space-y-3">
            <div className="h-4 w-24 bg-muted animate-pulse rounded" />
            <div className="h-8 w-32 bg-muted animate-pulse rounded" />
            <div className="h-3 w-20 bg-muted animate-pulse rounded" />
          </div>
        ))}
      </div>
      
      {/* Content skeleton */}
      <div className="space-y-4">
        <div className="h-6 w-40 bg-muted animate-pulse rounded" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="p-6 border rounded-lg space-y-4">
              <div className="flex items-center justify-between">
                <div className="h-5 w-32 bg-muted animate-pulse rounded" />
                <div className="h-6 w-16 bg-muted animate-pulse rounded-full" />
              </div>
              <div className="space-y-2">
                <div className="h-4 w-full bg-muted animate-pulse rounded" />
                <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
              </div>
              <div className="h-2 w-full bg-muted animate-pulse rounded-full" />
              <div className="flex space-x-2">
                <div className="h-8 flex-1 bg-muted animate-pulse rounded" />
                <div className="h-8 flex-1 bg-muted animate-pulse rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};