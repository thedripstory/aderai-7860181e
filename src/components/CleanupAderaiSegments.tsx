import { useState } from 'react';
import { Trash2, AlertTriangle, Loader2, CheckCircle2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CleanupAderaiSegmentsProps {
  klaviyoKeyId: string;
  onComplete?: () => void;
}

interface SegmentPreview {
  id: string;
  name: string;
}

type CleanupState = 'idle' | 'loading' | 'preview' | 'deleting' | 'complete';

export function CleanupAderaiSegments({ klaviyoKeyId, onComplete }: CleanupAderaiSegmentsProps) {
  const [state, setState] = useState<CleanupState>('idle');
  const [segments, setSegments] = useState<SegmentPreview[]>([]);
  const [deletedCount, setDeletedCount] = useState(0);
  const [totalToDelete, setTotalToDelete] = useState(0);
  const [showConfirm, setShowConfirm] = useState(false);

  const handlePreview = async () => {
    setState('loading');
    try {
      const { data, error } = await supabase.functions.invoke('klaviyo-delete-aderai-segments', {
        body: { klaviyoKeyId, dryRun: true }
      });

      if (error) throw error;

      if (data.count === 0) {
        toast.info('No Aderai segments found in your Klaviyo account');
        setState('idle');
        return;
      }

      setSegments(data.segmentsToDelete || []);
      setTotalToDelete(data.count);
      setState('preview');
      setShowConfirm(true);
    } catch (error: any) {
      toast.error('Failed to fetch segments', { description: error.message });
      setState('idle');
    }
  };

  const handleDelete = async () => {
    setShowConfirm(false);
    setState('deleting');
    setDeletedCount(0);

    let totalDeleted = 0;
    let hasMore = true;

    while (hasMore) {
      try {
        const { data, error } = await supabase.functions.invoke('klaviyo-delete-aderai-segments', {
          body: { klaviyoKeyId, dryRun: false }
        });

        if (error) throw error;

        totalDeleted += data.summary?.deleted || 0;
        setDeletedCount(totalDeleted);
        hasMore = data.hasMore || false;

        if (data.summary?.errors > 0) {
          toast.warning(`${data.summary.errors} segments failed to delete`);
        }
      } catch (error: any) {
        toast.error('Deletion error', { description: error.message });
        hasMore = false;
      }
    }

    setState('complete');
    onComplete?.();
  };

  const handleReset = () => {
    setState('idle');
    setSegments([]);
    setDeletedCount(0);
    setTotalToDelete(0);
  };

  if (state === 'complete') {
    return (
      <div className="p-4 rounded-lg bg-green-50 border border-green-200">
        <div className="flex items-center gap-3 mb-3">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          <span className="font-medium text-green-800">Cleanup Complete</span>
        </div>
        <p className="text-sm text-green-700 mb-4">
          Successfully deleted {deletedCount} Aderai segment{deletedCount !== 1 ? 's' : ''} from Klaviyo.
        </p>
        <Button variant="outline" size="sm" onClick={handleReset}>
          Done
        </Button>
      </div>
    );
  }

  if (state === 'deleting') {
    const progress = totalToDelete > 0 ? Math.round((deletedCount / totalToDelete) * 100) : 0;
    
    return (
      <div className="p-4 rounded-lg bg-muted border">
        <div className="flex items-center gap-3 mb-3">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span className="font-medium">Deleting segments...</span>
        </div>
        <Progress value={progress} className="h-2 mb-2" />
        <p className="text-sm text-muted-foreground">
          {deletedCount} of {totalToDelete} deleted (respecting Klaviyo API limits)
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="p-4 rounded-lg bg-destructive/5 border border-destructive/20">
        <div className="flex items-start gap-3 mb-3">
          <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
          <div>
            <p className="font-medium text-destructive">Delete All Aderai Segments</p>
            <p className="text-sm text-muted-foreground mt-1">
              This will permanently delete all segments created by Aderai from your Klaviyo account.
              This action cannot be undone.
            </p>
          </div>
        </div>
        <Button
          variant="destructive"
          size="sm"
          onClick={handlePreview}
          disabled={state === 'loading'}
          className="gap-2"
        >
          {state === 'loading' ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading...
            </>
          ) : (
            <>
              <Trash2 className="h-4 w-4" />
              Preview Segments to Delete
            </>
          )}
        </Button>
      </div>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Delete {totalToDelete} Aderai Segments?
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4">
                <p>
                  This will permanently delete <strong>{totalToDelete}</strong> Aderai-created 
                  segments from your Klaviyo account.
                </p>
                
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-amber-800 text-sm">
                  <strong>⚠️ Warning:</strong> Flows and campaigns using these segments may break.
                  Make sure no active automations depend on these segments.
                </div>

                {segments.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Segments to delete:</p>
                    <ScrollArea className="h-[150px] border rounded-md p-2">
                      <ul className="space-y-1 text-sm">
                        {segments.slice(0, 20).map((seg) => (
                          <li key={seg.id} className="text-muted-foreground truncate">
                            • {seg.name}
                          </li>
                        ))}
                        {segments.length > 20 && (
                          <li className="text-muted-foreground italic">
                            ...and {segments.length - 20} more
                          </li>
                        )}
                      </ul>
                    </ScrollArea>
                  </div>
                )}

                <p className="text-sm text-destructive font-medium">
                  This action cannot be undone.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleReset}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Yes, Delete All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
