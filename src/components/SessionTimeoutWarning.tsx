import { AlertCircle, RefreshCw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface SessionTimeoutWarningProps {
  onRefresh: () => void;
  onDismiss: () => void;
  expiresAt: Date | null;
}

export function SessionTimeoutWarning({
  onRefresh,
  onDismiss,
  expiresAt,
}: SessionTimeoutWarningProps) {
  const getTimeRemaining = () => {
    if (!expiresAt) return "soon";
    
    const diff = expiresAt.getTime() - Date.now();
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
  };

  return (
    <div className="fixed top-4 right-4 z-[9999] max-w-md animate-in slide-in-from-top-4">
      <Alert className="border-yellow-500 bg-card shadow-xl">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <AlertDescription>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="font-semibold mb-1">Session Expiring Soon</p>
                  <p className="text-sm text-muted-foreground mb-3">
                    Your session will expire in {getTimeRemaining()}. Would you like to continue?
                  </p>
                  <div className="flex gap-2">
                    <Button onClick={onRefresh} size="sm">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Continue Session
                    </Button>
                    <Button variant="ghost" size="sm" onClick={onDismiss}>
                      Dismiss
                    </Button>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onDismiss}
                  className="flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </AlertDescription>
          </div>
        </div>
      </Alert>
    </div>
  );
}
