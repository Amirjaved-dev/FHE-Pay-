import React from 'react';
import { cn } from '@/utils/helpers';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'default', size = 'md', children, ...props }, ref) => {
    const baseClasses = 'inline-flex items-center rounded-full border font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2';
    
    const variants = {
      default: 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
      secondary: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
      destructive: 'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
      outline: 'text-foreground border-border',
      success: 'border-transparent bg-green-600 text-white hover:bg-green-700 dark:bg-green-500 dark:text-white dark:hover:bg-green-600',
      warning: 'border-transparent bg-yellow-600 text-white hover:bg-yellow-700 dark:bg-yellow-500 dark:text-white dark:hover:bg-yellow-600',
    };
    
    const sizes = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-2.5 py-0.5 text-sm',
      lg: 'px-3 py-1 text-base',
    };

    return (
      <div
        className={cn(
          baseClasses,
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Badge.displayName = 'Badge';

export { Badge };
export default Badge;

// Status-specific badge components
export interface StatusBadgeProps extends Omit<BadgeProps, 'variant'> {
  status: 'active' | 'paused' | 'completed' | 'pending' | 'cancelled' | 'processing';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, ...props }) => {
  const statusVariants = {
    active: 'success' as const,
    paused: 'warning' as const,
    completed: 'secondary' as const,
    pending: 'outline' as const,
    cancelled: 'destructive' as const,
    processing: 'default' as const,
  };

  const statusLabels = {
    active: 'Active',
    paused: 'Paused',
    completed: 'Completed',
    pending: 'Pending',
    cancelled: 'Cancelled',
    processing: 'Processing',
  };

  return (
    <Badge variant={statusVariants[status]} {...props}>
      {statusLabels[status]}
    </Badge>
  );
};

export interface RoleBadgeProps extends Omit<BadgeProps, 'variant'> {
  role: 'employer' | 'employee';
}

export const RoleBadge: React.FC<RoleBadgeProps> = ({ role, ...props }) => {
  const roleVariants = {
    employer: 'default' as const,
    employee: 'secondary' as const,
  };

  const roleLabels = {
    employer: 'Employer',
    employee: 'Employee',
  };

  return (
    <Badge variant={roleVariants[role]} {...props}>
      {roleLabels[role]}
    </Badge>
  );
};
