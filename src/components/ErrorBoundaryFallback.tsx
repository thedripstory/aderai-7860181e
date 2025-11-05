import { AlertCircle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface ErrorBoundaryFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

export function ErrorBoundaryFallback({ error, resetErrorBoundary }: ErrorBoundaryFallbackProps) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-destructive/5 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="bg-card rounded-lg border-2 border-destructive/20 p-8 text-center">
          {/* Error Icon */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 mb-6">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold mb-3">Oops! Something went wrong</h2>
          
          {/* Description */}
          <p className="text-muted-foreground mb-6">
            We encountered an unexpected error. This has been logged and our team will look into it.
          </p>

          {/* Error details (dev only) */}
          {import.meta.env.DEV && (
            <div className="mb-6 p-4 bg-muted rounded-lg text-left">
              <p className="text-xs font-mono text-destructive break-all">
                {error.message}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <Button onClick={resetErrorBoundary} className="w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                resetErrorBoundary();
                navigate('/');
              }}
              className="w-full"
            >
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
