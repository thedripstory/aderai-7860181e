import React, { Component, ErrorInfo, ReactNode } from 'react';
import { toast } from 'sonner';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ErrorLogger } from '@/lib/errorLogger';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class GlobalErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    
    // Log error to database for monitoring
    ErrorLogger.logError(error, {
      componentStack: errorInfo.componentStack,
      errorBoundary: 'GlobalErrorBoundary',
      timestamp: new Date().toISOString(),
    });
    
    // Show user-friendly toast notification
    toast.error('An unexpected error occurred', {
      description: 'We\'re working to fix this. Please try refreshing the page.',
      action: {
        label: 'Refresh Page',
        onClick: () => window.location.reload(),
      },
      duration: Infinity, // Requires manual dismiss
    });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
          <div className="max-w-md w-full bg-card border border-border rounded-lg p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
            </div>
            
            <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
            
            <p className="text-muted-foreground mb-6">
              We encountered an unexpected error. Don't worry, your data is safe. Try refreshing the page or going back to the dashboard.
            </p>
            
            {import.meta.env.DEV && this.state.error && (
              <div className="mb-6 p-4 bg-red-500/5 border border-red-500/20 rounded-lg text-left">
                <p className="text-xs font-mono text-red-500 break-all">
                  {this.state.error.message}
                </p>
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => window.location.reload()}
                className="flex-1"
              >
                Refresh Page
              </Button>
              <Button
                variant="outline"
                onClick={() => window.location.href = '/dashboard'}
                className="flex-1"
              >
                Go to Dashboard
              </Button>
            </div>
            
            {import.meta.env.DEV && (
              <Button
                variant="ghost"
                onClick={this.handleReset}
                className="w-full mt-3"
              >
                Try to Continue (Dev Only)
              </Button>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
