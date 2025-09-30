'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from './ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import {
  AlertTriangle,
  RefreshCw,
  Home,
  Bug,
  Copy,
  CheckCircle
} from 'lucide-react';
import { cn } from '@/utils/helpers';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
  className?: string;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return {
      hasError: true,
      error,
      errorId,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // In production, you might want to send this to an error reporting service
    // Example: Sentry.captureException(error, { contexts: { react: errorInfo } });
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
    });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          errorId={this.state.errorId}
          onRetry={this.handleRetry}
          onGoHome={this.handleGoHome}
          showDetails={this.props.showDetails}
          className={this.props.className}
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

// Error Fallback Component
interface ErrorFallbackProps {
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
  onRetry: () => void;
  onGoHome: () => void;
  showDetails?: boolean;
  className?: string;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  errorInfo,
  errorId,
  onRetry,
  onGoHome,
  showDetails = false,
  className,
}) => {
  const [showFullError, setShowFullError] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const errorDetails = {
    message: error?.message || 'Unknown error',
    stack: error?.stack || 'No stack trace available',
    componentStack: errorInfo?.componentStack || 'No component stack available',
    errorId,
    timestamp: new Date().toISOString(),
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'Unknown',
    url: typeof window !== 'undefined' ? window.location.href : 'Unknown',
  };

  const handleCopyError = async () => {
    try {
      const errorText = JSON.stringify(errorDetails, null, 2);
      await navigator.clipboard.writeText(errorText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy error details:', err);
    }
  };

  const handleReportBug = () => {
    const subject = encodeURIComponent(`Bug Report: ${error?.message || 'Application Error'}`);
    const body = encodeURIComponent(
      `Error ID: ${errorId}\n\n` +
      `Error Message: ${error?.message || 'Unknown error'}\n\n` +
      `Timestamp: ${errorDetails.timestamp}\n\n` +
      `URL: ${errorDetails.url}\n\n` +
      `Please describe what you were doing when this error occurred:\n\n`
    );
    
    // Replace with your actual bug report email or system
    window.open(`mailto:support@fhepay.com?subject=${subject}&body=${body}`);
  };

  return (
    <div className={cn(
      'min-h-[400px] flex items-center justify-center p-4',
      className
    )}>
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <CardTitle className="text-xl text-red-900">
            Oops! Something went wrong
          </CardTitle>
          <p className="text-muted-foreground mt-2">
            We apologize for the inconvenience. An unexpected error has occurred.
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Error Summary */}
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="text-sm font-medium text-red-900 mb-1">
              Error Details
            </div>
            <div className="text-sm text-red-700">
              {error?.message || 'An unknown error occurred'}
            </div>
            <div className="text-xs text-red-600 mt-2">
              Error ID: {errorId}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={onRetry}
              className="flex items-center justify-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Try Again</span>
            </Button>
            
            <Button
              variant="outline"
              onClick={onGoHome}
              className="flex items-center justify-center space-x-2"
            >
              <Home className="w-4 h-4" />
              <span>Go Home</span>
            </Button>
            
            <Button
              variant="outline"
              onClick={handleReportBug}
              className="flex items-center justify-center space-x-2"
            >
              <Bug className="w-4 h-4" />
              <span>Report Bug</span>
            </Button>
          </div>

          {/* Technical Details (Development/Debug) */}
          {(showDetails || process.env.NODE_ENV === 'development') && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Technical Details</h4>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyError}
                    className="flex items-center space-x-1"
                  >
                    {copied ? (
                      <>
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        <span className="text-xs">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span className="text-xs">Copy</span>
                      </>
                    )}
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFullError(!showFullError)}
                    className="text-xs"
                  >
                    {showFullError ? 'Hide' : 'Show'} Details
                  </Button>
                </div>
              </div>
              
              {showFullError && (
                <div className="space-y-3">
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="text-xs font-medium mb-2">Error Stack:</div>
                    <pre className="text-xs text-muted-foreground whitespace-pre-wrap break-all">
                      {error?.stack || 'No stack trace available'}
                    </pre>
                  </div>
                  
                  {errorInfo?.componentStack && (
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="text-xs font-medium mb-2">Component Stack:</div>
                      <pre className="text-xs text-muted-foreground whitespace-pre-wrap">
                        {errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Help Text */}
          <div className="text-center text-sm text-muted-foreground">
            If this problem persists, please contact our support team with the error ID above.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Specific Error Boundaries for different contexts
export const PageErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <ErrorBoundary
      showDetails={process.env.NODE_ENV === 'development'}
      className="min-h-screen"
    >
      {children}
    </ErrorBoundary>
  );
};

export const ComponentErrorBoundary: React.FC<{ 
  children: ReactNode;
  fallback?: ReactNode;
}> = ({ children, fallback }) => {
  const defaultFallback = (
    <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
      <div className="flex items-center space-x-2 text-red-700">
        <AlertTriangle className="w-4 h-4" />
        <span className="text-sm font-medium">Component Error</span>
      </div>
      <p className="text-sm text-red-600 mt-1">
        This component failed to load. Please try refreshing the page.
      </p>
    </div>
  );

  return (
    <ErrorBoundary fallback={fallback || defaultFallback}>
      {children}
    </ErrorBoundary>
  );
};

// Hook for handling async errors in components
export const useErrorHandler = () => {
  const [error, setError] = React.useState<Error | null>(null);

  const handleError = React.useCallback((error: Error) => {
    console.error('Async error caught:', error);
    setError(error);
  }, []);

  const clearError = React.useCallback(() => {
    setError(null);
  }, []);

  // Throw error to be caught by ErrorBoundary
  if (error) {
    throw error;
  }

  return { handleError, clearError };
};