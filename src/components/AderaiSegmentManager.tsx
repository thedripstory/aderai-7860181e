import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Trash2, 
  RefreshCw, 
  Search,
  CheckCircle,
  AlertTriangle,
  Tag,
  Filter
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { sanitizeString } from '@/lib/inputSanitization';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface AderaiSegment {
  id: string;
  name: string;
  profileCount: number;
  createdAt: string;
}

interface AderaiSegmentManagerProps {
  klaviyoKeyId: string;
}

export const AderaiSegmentManager: React.FC<AderaiSegmentManagerProps> = ({ klaviyoKeyId }) => {
  const [segments, setSegments] = useState<AderaiSegment[]>([]);
  const [selectedSegments, setSelectedSegments] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [scanned, setScanned] = useState(false);

  const scanForAderaiSegments = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('klaviyo-proxy', {
        body: {
          keyId: klaviyoKeyId,
          endpoint: 'https://a.klaviyo.com/api/segments/',
          method: 'GET',
        },
      });

      if (error) throw error;

      // Filter segments that have "| Aderai" suffix or "Aderai" tag
      const allSegments = data?.data || [];
      const aderaiSegments = allSegments.filter((segment: any) => {
        const name = segment.attributes?.name || '';
        const tags = segment.attributes?.tags || [];
        return name.includes('| Aderai') || tags.includes('Aderai');
      });

      setSegments(aderaiSegments.map((s: any) => ({
        id: s.id,
        name: s.attributes?.name || 'Unnamed',
        profileCount: 0, // Would need additional API call for profile count
        createdAt: s.attributes?.created || new Date().toISOString(),
      })));
      setScanned(true);
      toast.success(`Found ${aderaiSegments.length} Aderai segments`);
    } catch (error) {
      console.error('Error scanning segments:', error);
      toast.error('Failed to scan for Aderai segments');
    } finally {
      setLoading(false);
    }
  }, [klaviyoKeyId]);

  const toggleSegment = (segmentId: string) => {
    setSelectedSegments(prev => 
      prev.includes(segmentId) 
        ? prev.filter(id => id !== segmentId)
        : [...prev, segmentId]
    );
  };

  const selectAll = () => {
    setSelectedSegments(segments.map(s => s.id));
  };

  const clearSelection = () => {
    setSelectedSegments([]);
  };

  const deleteSelectedSegments = async () => {
    setDeleting(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      for (const segmentId of selectedSegments) {
        try {
          const { error } = await supabase.functions.invoke('klaviyo-proxy', {
            body: {
              keyId: klaviyoKeyId,
              endpoint: `https://a.klaviyo.com/api/segments/${segmentId}`,
              method: 'DELETE',
            },
          });

          if (error) {
            errorCount++;
          } else {
            successCount++;
            // Log the deletion
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
              const segment = segments.find(s => s.id === segmentId);
              await supabase.from('segment_operations').insert({
                user_id: user.id,
                klaviyo_key_id: klaviyoKeyId,
                segment_name: segment?.name || 'Unknown',
                segment_klaviyo_id: segmentId,
                operation_type: 'deleted',
                operation_status: 'success',
              });
            }
          }
        } catch (err) {
          errorCount++;
        }
      }

      toast.success(`Deleted ${successCount} segments${errorCount > 0 ? `, ${errorCount} failed` : ''}`);
      
      // Remove deleted segments from the list
      setSegments(prev => prev.filter(s => !selectedSegments.includes(s.id)));
      setSelectedSegments([]);
    } catch (error) {
      console.error('Error deleting segments:', error);
      toast.error('Failed to delete segments');
    } finally {
      setDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <>
      <Card className="border-2 border-border/50 bg-gradient-to-br from-card to-card/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Tag className="w-5 h-5 text-primary" />
                Manage Aderai Segments
              </CardTitle>
              <CardDescription className="mt-1">
                View and manage all segments created by Aderai in your Klaviyo account
              </CardDescription>
            </div>
            <Button
              onClick={scanForAderaiSegments}
              disabled={loading}
              className="rounded-full"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Scanning...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  {scanned ? 'Rescan' : 'Scan for Aderai Segments'}
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {!scanned ? (
            <div className="text-center py-12 text-muted-foreground">
              <Search className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="font-medium">Click "Scan for Aderai Segments" to find segments</p>
              <p className="text-sm">This will search for all segments with the "| Aderai" suffix or "Aderai" tag</p>
            </div>
          ) : segments.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <CheckCircle className="w-16 h-16 mx-auto mb-4 text-emerald-500 opacity-70" />
              <p className="font-medium">No Aderai segments found</p>
              <p className="text-sm">Create segments using Aderai and they will appear here</p>
            </div>
          ) : (
            <>
              {/* Selection Controls */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
                <div className="flex items-center gap-4">
                  <Button variant="ghost" size="sm" onClick={selectAll}>
                    Select All
                  </Button>
                  <Button variant="ghost" size="sm" onClick={clearSelection}>
                    Clear
                  </Button>
                  <Badge variant="outline">
                    {selectedSegments.length} of {segments.length} selected
                  </Badge>
                </div>
                {selectedSegments.length > 0 && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setShowDeleteDialog(true)}
                    className="rounded-full"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Selected
                  </Button>
                )}
              </div>

              {/* Segments List */}
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                {segments.map((segment) => (
                  <div
                    key={segment.id}
                    className={`flex items-center justify-between p-4 rounded-lg border transition-colors cursor-pointer ${
                      selectedSegments.includes(segment.id)
                        ? 'bg-primary/10 border-primary/30'
                        : 'bg-muted/30 border-border/50 hover:bg-muted/50'
                    }`}
                    onClick={() => toggleSegment(segment.id)}
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={selectedSegments.includes(segment.id)}
                        onCheckedChange={() => toggleSegment(segment.id)}
                      />
                      <div>
                        <p className="font-medium">{segment.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Created: {new Date(segment.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                      Aderai
                    </Badge>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-700 dark:text-amber-300">
                      Deletion Warning
                    </p>
                    <p className="text-sm text-amber-600 dark:text-amber-400">
                      Deleting segments from Klaviyo is permanent and cannot be undone. 
                      Make sure you no longer need these segments before deleting.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedSegments.length} segment(s)?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. These segments will be permanently deleted from your Klaviyo account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteSelectedSegments}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};