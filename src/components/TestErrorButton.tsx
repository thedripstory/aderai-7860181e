import { Button } from '@/components/ui/button';
import { ErrorLogger } from '@/lib/errorLogger';
import { toast } from 'sonner';

export function TestErrorButton() {
  const triggerTestError = async () => {
    try {
      // Intentionally throw an error for testing
      throw new Error('This is a test error to verify error tracking system');
    } catch (error) {
      // Log the error to database
      await ErrorLogger.logError(error as Error, {
        testError: true,
        triggeredFrom: 'TestErrorButton',
        timestamp: new Date().toISOString(),
      });
      
      toast.success('Test error logged successfully! Check the Admin Dashboard → Errors tab to see it.');
    }
  };

  return (
    <Button 
      variant="destructive" 
      size="sm"
      onClick={triggerTestError}
    >
      Test Error Logging
    </Button>
  );
}
