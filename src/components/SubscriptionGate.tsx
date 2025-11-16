import { useEffect } from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { Loader2 } from 'lucide-react';

interface SubscriptionGateProps {
  children: React.ReactNode;
  showToast?: boolean;
}

export function SubscriptionGate({ children, showToast = true }: SubscriptionGateProps) {
  const { subscribed, loading, requireSubscription } = useSubscription();

  useEffect(() => {
    if (!loading) {
      requireSubscription(showToast);
    }
  }, [loading, subscribed, requireSubscription, showToast]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Verifying subscription...</p>
        </div>
      </div>
    );
  }

  if (!subscribed) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🔒</span>
          </div>
          <h2 className="text-2xl font-bold mb-2">Subscription Required</h2>
          <p className="text-muted-foreground mb-6">
            Please complete your payment to access this feature.
          </p>
          <p className="text-sm text-muted-foreground">
            Redirecting to payment...
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
