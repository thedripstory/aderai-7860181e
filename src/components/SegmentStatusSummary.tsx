import { RefreshCw, CheckCircle2, Circle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';

interface SegmentStatusSummaryProps {
  createdCount: number;
  availableCount: number;
  selectedCount: number;
  loading: boolean;
  lastSynced: Date | null;
  onRefresh: () => void;
}

export function SegmentStatusSummary({
  createdCount,
  availableCount,
  selectedCount,
  loading,
  lastSynced,
  onRefresh
}: SegmentStatusSummaryProps) {
  return (
    <div className="flex flex-wrap items-center gap-4 p-3 bg-muted/50 rounded-lg border">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
          <span className="text-sm font-medium">{createdCount}</span>
          <span className="text-sm text-muted-foreground">created in Klaviyo</span>
        </div>
      </div>

      <div className="w-px h-4 bg-border" />

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-400" />
          <span className="text-sm font-medium">{availableCount}</span>
          <span className="text-sm text-muted-foreground">available to create</span>
        </div>
      </div>

      <div className="w-px h-4 bg-border" />

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-primary" />
          <span className="text-sm font-medium">{selectedCount}</span>
          <span className="text-sm text-muted-foreground">selected</span>
        </div>
      </div>

      <div className="ml-auto flex items-center gap-2">
        {lastSynced && (
          <span className="text-xs text-muted-foreground">
            Synced {formatDistanceToNow(lastSynced, { addSuffix: true })}
          </span>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={onRefresh}
          disabled={loading}
          className="h-8 gap-1.5"
        >
          {loading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <RefreshCw className="h-3.5 w-3.5" />
          )}
          <span className="text-xs">Refresh</span>
        </Button>
      </div>
    </div>
  );
}
