import React, { useState, useEffect, useMemo } from 'react';
import { CheckCircle, AlertCircle, Target, Info, Clock, SkipForward, AlertTriangle } from 'lucide-react';
import { SegmentResult, BatchProgress } from '@/hooks/useKlaviyoSegments';
import { SEGMENTS, applySegmentSettings, UserSegmentSettings, DEFAULT_SEGMENT_SETTINGS } from '@/lib/segmentData';
import { SuccessAnimation } from '@/components/SuccessAnimation';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// Helper types and functions for result state management
interface ResultStats {
  created: number;
  queued: number;
  failed: number;
  skipped: number;
  total: number;
}

type ResultState = 'all_queued' | 'partial_success' | 'all_success' | 'all_failed' | 'mixed';

function calculateResultStats(results: Array<{ status: string }>): ResultStats {
  return {
    created: results.filter(r => r.status === 'success').length,
    queued: results.filter(r => r.status === 'queued').length,
    failed: results.filter(r => r.status === 'error').length,
    skipped: results.filter(r => r.status === 'skipped').length,
    total: results.length,
  };
}

function getResultState(stats: ResultStats): ResultState {
  if (stats.created === 0 && stats.queued > 0 && stats.failed === 0) return 'all_queued';
  if (stats.created > 0 && stats.queued === 0 && stats.failed === 0) return 'all_success';
  if (stats.created === 0 && stats.queued === 0 && stats.failed > 0) return 'all_failed';
  if (stats.created > 0 && stats.queued > 0 && stats.failed === 0) return 'partial_success';
  return 'mixed';
}

interface SegmentCreationFlowProps {
  loading: boolean;
  results: SegmentResult[];
  onViewResults: () => void;
  onRetryFailed?: (failedSegmentIds: string[]) => void;
  userSettings?: UserSegmentSettings;
  batchProgress?: BatchProgress | null;
}

export const SegmentCreationFlow: React.FC<SegmentCreationFlowProps> = ({
  loading,
  results,
  onViewResults,
  onRetryFailed,
  userSettings = DEFAULT_SEGMENT_SETTINGS,
  batchProgress,
}) => {
  const navigate = useNavigate();
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Calculate stats and state
  const stats = useMemo(() => calculateResultStats(results), [results]);
  const resultState = useMemo(() => getResultState(stats), [stats]);
  
  const failedResults = useMemo(() => 
    results.filter(r => r.status === 'error'),
    [results]
  );
  
  const progressPercent = useMemo(() => {
    if (batchProgress && loading) {
      return (batchProgress.segmentsProcessed / batchProgress.totalSegments) * 100;
    }
    return stats.total > 0 ? ((stats.created + stats.queued + stats.failed + stats.skipped) / stats.total) * 100 : 0;
  }, [stats, batchProgress, loading]);

  // Get current segment being processed with settings applied
  const currentSegment = useMemo(() => {
    if (results.length > 0) {
      const lastResult = results[results.length - 1];
      const segment = SEGMENTS.find(s => s.id === lastResult.segmentId);
      if (segment) {
        return applySegmentSettings(segment, userSettings);
      }
    }
    return null;
  }, [results, userSettings]);

  // Show success animation ONLY for all_success state
  useEffect(() => {
    if (!loading && results.length > 0 && resultState === 'all_success') {
      setShowSuccess(true);
    }
  }, [loading, results, resultState]);

  // State configuration for different result states
  const stateConfig = {
    all_queued: {
      icon: Clock,
      iconBg: 'bg-blue-500/10',
      iconColor: 'text-blue-500',
      title: 'Segments Queued',
      subtitle: `${stats.queued} segment${stats.queued !== 1 ? 's' : ''} will be created in the background`,
    },
    partial_success: {
      icon: CheckCircle,
      iconBg: 'bg-green-500/10',
      iconColor: 'text-green-500',
      title: `${stats.created} Segment${stats.created !== 1 ? 's' : ''} Created`,
      subtitle: `${stats.queued} more queued for background processing`,
    },
    all_success: {
      icon: CheckCircle,
      iconBg: 'bg-green-500/10',
      iconColor: 'text-green-500',
      title: 'Segments Created!',
      subtitle: `Successfully created ${stats.created} segment${stats.created !== 1 ? 's' : ''} in Klaviyo`,
    },
    all_failed: {
      icon: AlertCircle,
      iconBg: 'bg-destructive/10',
      iconColor: 'text-destructive',
      title: 'Creation Failed',
      subtitle: `${stats.failed} segment${stats.failed !== 1 ? 's' : ''} could not be created`,
    },
    mixed: {
      icon: AlertTriangle,
      iconBg: 'bg-amber-500/10',
      iconColor: 'text-amber-500',
      title: 'Partially Complete',
      subtitle: `${stats.created} created${stats.queued > 0 ? `, ${stats.queued} queued` : ''}${stats.failed > 0 ? `, ${stats.failed} failed` : ''}`,
    },
  };

  const currentConfig = stateConfig[resultState];
  const HeaderIcon = currentConfig.icon;

  return (
    <>
      <SuccessAnimation
        show={showSuccess}
        title="Segments Created!"
        description={`Successfully created ${stats.created} segment${stats.created !== 1 ? 's' : ''} in Klaviyo`}
        onComplete={() => {
          setShowSuccess(false);
          navigate('/dashboard');
        }}
      />
      
      <div className="min-h-screen bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <div className="bg-card rounded-2xl shadow-2xl border border-border overflow-hidden">
            {/* Header with icon */}
            <div className="pt-8 pb-4 flex flex-col items-center">
              <div className="w-16 h-16 flex items-center justify-center mb-4">
                {loading ? (
                  /* Aggressive rotating loader */
                  <div className="relative w-12 h-12">
                    <div className="absolute inset-0 border-2 border-transparent border-t-primary border-r-primary rounded-full animate-spin" />
                    <div className="absolute inset-1.5 border-2 border-transparent border-b-accent border-l-accent rounded-full animate-[spin_0.8s_linear_infinite_reverse]" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-3 h-3 rounded-full bg-primary animate-pulse shadow-lg shadow-primary/50" />
                    </div>
                    <div className="absolute inset-0 animate-spin" style={{ animationDuration: '2s' }}>
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-accent" />
                    </div>
                    <div className="absolute inset-0 animate-[spin_2s_linear_infinite_reverse]">
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-orange-500" />
                    </div>
                  </div>
                ) : (
                  <div className={`w-12 h-12 rounded-full ${currentConfig.iconBg} flex items-center justify-center`}>
                    <HeaderIcon className={`w-6 h-6 ${currentConfig.iconColor}`} />
                  </div>
                )}
              </div>
              <h2 className="text-xl font-semibold text-foreground">
                {loading ? 'Creating Segments...' : currentConfig.title}
              </h2>
              {!loading && (
                <p className="text-sm text-muted-foreground mt-1 text-center px-4">
                  {currentConfig.subtitle}
                </p>
              )}
            </div>

            {/* Current segment card */}
            <div className="px-6 pb-4">
              <AnimatePresence mode="wait">
                {currentSegment && (
                  <motion.div
                    key={currentSegment.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-muted/50 rounded-xl p-4 border border-border/50"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Target className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-foreground truncate">
                          {currentSegment.name}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
                          {currentSegment.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Batch progress indicator */}
            <div className="px-6 pb-6">
              {loading && batchProgress && batchProgress.totalBatches > 1 && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 text-sm text-primary font-medium mb-2">
                    <div className="relative w-4 h-4">
                      <div className="absolute inset-0 border-2 border-transparent border-t-primary rounded-full animate-spin" />
                    </div>
                    <span>Processing batch {batchProgress.currentBatch} of {batchProgress.totalBatches}</span>
                  </div>
                  
                  <div className="flex items-start gap-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-600 dark:text-blue-400">
                      Klaviyo limits segment creation to 5 at a time. We're processing your {batchProgress.totalSegments} segments in {batchProgress.totalBatches} batches.
                    </p>
                  </div>
                  
                  {batchProgress.estimatedTimeRemaining > 0 && (
                    <p className="text-xs text-muted-foreground mt-2 text-center">
                      ~{Math.ceil(batchProgress.estimatedTimeRemaining)}s remaining
                    </p>
                  )}
                </div>
              )}

              {/* Progress section */}
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-muted-foreground">Syncing with Klaviyo</span>
                <span className="text-primary font-medium">
                  {loading && batchProgress 
                    ? `${batchProgress.segmentsProcessed} of ${batchProgress.totalSegments}` 
                    : loading 
                      ? 'Processing...' 
                      : `${stats.created} of ${stats.total} complete`}
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                />
              </div>
            </div>

            {/* Results list */}
            {!loading && results.length > 0 && (
              <div className="px-6 pb-4 max-h-48 overflow-y-auto">
                <div className="space-y-2">
                  {results.map((result, idx) => {
                    const segment = SEGMENTS.find((s) => s.id === result.segmentId);
                    
                    const statusConfig: Record<string, { bg: string; text: string; icon: React.ElementType; label?: string }> = {
                      success: { bg: 'bg-green-500/10', text: 'text-green-600', icon: CheckCircle },
                      error: { bg: 'bg-red-500/10', text: 'text-red-600', icon: AlertCircle },
                      queued: { bg: 'bg-blue-500/10', text: 'text-blue-600', icon: Clock, label: 'Queued' },
                      skipped: { bg: 'bg-amber-500/10', text: 'text-amber-600', icon: SkipForward, label: 'Skipped' },
                    };
                    
                    const config = statusConfig[result.status] || statusConfig.error;
                    const IconComponent = config.icon;
                    
                    return (
                      <div
                        key={idx}
                        className={`flex items-center gap-2 p-2 rounded-lg text-sm ${config.bg} ${config.text}`}
                      >
                        <IconComponent className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate flex-1">{segment?.name || result.segmentId}</span>
                        {config.label && (
                          <span className="text-xs opacity-75 flex-shrink-0">{config.label}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            
            {/* Queued segments explanation banner */}
            {!loading && stats.queued > 0 && (
              <div className="mx-6 mb-4 flex items-start gap-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-blue-600 dark:text-blue-400">
                  <p>Segments are queued due to Klaviyo's rate limits. They'll be created automatically in the background.</p>
                  <Link to="/jobs" className="underline font-medium mt-1 inline-block">
                    View Job Progress →
                  </Link>
                </div>
              </div>
            )}

            {/* Action buttons */}
            {!loading && (
              <div className="px-6 pb-6 space-y-2">
                {stats.failed > 0 && onRetryFailed && (
                  <button
                    onClick={() => onRetryFailed(failedResults.map(r => r.segmentId))}
                    className="w-full bg-orange-500 text-white py-3 rounded-xl font-medium hover:bg-orange-600 transition-colors"
                  >
                    Retry Failed ({stats.failed})
                  </button>
                )}
                <button
                  onClick={onViewResults}
                  className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-medium hover:bg-primary/90 transition-colors"
                >
                  {stats.failed > 0 ? 'Continue' : 'Done'}
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </>
  );
};