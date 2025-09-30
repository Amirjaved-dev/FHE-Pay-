'use client';

import React, { useEffect, useState } from 'react';
import { cn } from '@/utils/helpers';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { Button } from './Button';

export interface ToastProps {
  id?: string;
  title?: string;
  description?: string;
  variant?: 'default' | 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  onClose?: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

const Toast: React.FC<ToastProps> = ({
  id,
  title,
  description,
  variant = 'default',
  duration = 5000,
  onClose,
  action,
  className,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, 150);
  };

  if (!isVisible) return null;

  const variants = {
    default: {
      container: 'bg-background border-border',
      icon: null,
      iconColor: '',
    },
    success: {
      container: 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800',
      icon: CheckCircle,
      iconColor: 'text-green-600 dark:text-green-400',
    },
    error: {
      container: 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800',
      icon: AlertCircle,
      iconColor: 'text-red-600 dark:text-red-400',
    },
    warning: {
      container: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800',
      icon: AlertTriangle,
      iconColor: 'text-yellow-600 dark:text-yellow-400',
    },
    info: {
      container: 'bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800',
      icon: Info,
      iconColor: 'text-blue-600 dark:text-blue-400',
    },
  };

  const variantConfig = variants[variant];
  const IconComponent = variantConfig.icon;

  return (
    <div
      className={cn(
        'relative flex w-full max-w-sm items-start space-x-3 rounded-lg border p-4 shadow-lg transition-all duration-150',
        variantConfig.container,
        isExiting ? 'animate-out slide-out-to-right-full' : 'animate-in slide-in-from-right-full',
        className
      )}
      role="alert"
      aria-live="polite"
    >
      {/* Icon */}
      {IconComponent && (
        <div className="flex-shrink-0">
          <IconComponent className={cn('h-5 w-5', variantConfig.iconColor)} />
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        {title && (
          <div className="text-sm font-medium text-foreground">
            {title}
          </div>
        )}
        {description && (
          <div className={cn(
            'text-sm text-muted-foreground',
            title && 'mt-1'
          )}>
            {description}
          </div>
        )}
        {action && (
          <div className="mt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={action.onClick}
              className="h-8 px-3 text-xs"
            >
              {action.label}
            </Button>
          </div>
        )}
      </div>

      {/* Close button */}
      <div className="flex-shrink-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClose}
          className="h-6 w-6 text-muted-foreground hover:text-foreground"
          aria-label="Close notification"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export { Toast };
export default Toast;

// Toast Container
export interface ToastContainerProps {
  toasts: ToastProps[];
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  className?: string;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts = [],
  position = 'top-right',
  className,
}) => {
  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2',
  };

  if (!toasts || toasts.length === 0) return null;

  return (
    <div
      className={cn(
        'fixed z-50 flex flex-col space-y-2 pointer-events-none',
        positionClasses[position],
        className
      )}
    >
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast {...toast} />
        </div>
      ))}
    </div>
  );
};

// Toast Hook
export interface ToastState {
  toasts: ToastProps[];
  addToast: (toast: Omit<ToastProps, 'id'>) => string;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

let toastCounter = 0;
const generateToastId = () => `toast-${++toastCounter}`;

export const useToast = (): ToastState => {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const addToast = (toast: Omit<ToastProps, 'id'>): string => {
    const id = generateToastId();
    const newToast: ToastProps = {
      ...toast,
      id,
      onClose: () => removeToast(id),
    };

    setToasts((prev) => [...prev, newToast]);
    return id;
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const clearToasts = () => {
    setToasts([]);
  };

  return {
    toasts,
    addToast,
    removeToast,
    clearToasts,
  };
};

// Convenience functions
export const toast = {
  success: (message: string, options?: Partial<ToastProps>) => {
    // This would be implemented with a global toast context
    console.log('Success toast:', message, options);
  },
  error: (message: string, options?: Partial<ToastProps>) => {
    console.log('Error toast:', message, options);
  },
  warning: (message: string, options?: Partial<ToastProps>) => {
    console.log('Warning toast:', message, options);
  },
  info: (message: string, options?: Partial<ToastProps>) => {
    console.log('Info toast:', message, options);
  },
};