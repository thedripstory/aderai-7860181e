import React, { useState, useEffect, useMemo } from 'react';
import { CheckCircle, AlertCircle, Target } from 'lucide-react';
import { SegmentResult } from '@/hooks/useKlaviyoSegments';
import { SEGMENTS, applySegmentSettings, UserSegmentSettings, DEFAULT_SEGMENT_SETTINGS } from '@/lib/segmentData';
import { Progress } from '@/components/ui/progress';
import { SuccessAnimation } from '@/components/SuccessAnimation';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface SegmentCreationFlowProps {
  loading: boolean;
  results: SegmentResult[];
  onViewResults: () => void;
  onRetryFailed?: (failedSegmentIds: string[]) => void;
  userSettings?: UserSegmentSettings;
}

export const SegmentCreationFlow: React.FC<SegmentCreationFlowProps> = ({
  loading,
  results,
  onViewResults,
  onRetryFailed,
  userSettings = DEFAULT_SEGMENT_SETTINGS,
}) => {
  const navigate = useNavigate();
  const [showSuccess, setShowSuccess] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const failedResults = useMemo(() => 
    results.filter(r => r.status === 'error'),
    [results]
  );
  
  const hasFailures = useMemo(() => 
    failedResults.length > 0,
    [failedResults]
  );
  
  const successfulCount = useMemo(() => 
    results.filter(r => r.status === 'success').length,
    [results]
  );
  
  const totalCount = results.length;
  
  const progressPercent = useMemo(() => 
    totalCount > 0 ? (results.length / Math.max(totalCount, 1)) * 100 : 0,
    [totalCount, results.length]
  );

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

  // Show success animation when all segments complete successfully
  useEffect(() => {
    if (!loading && results.length > 0 && !hasFailures) {
      setShowSuccess(true);
    }
  }, [loading, results, hasFailures]);

  return (
    <>
      <SuccessAnimation
        show={showSuccess}
        title="Segments Created!"
        description={`Successfully created ${successfulCount} segments in Klaviyo`}
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
                    {/* Outer rotating ring */}
                    <div className="absolute inset-0 border-2 border-transparent border-t-primary border-r-primary rounded-full animate-spin" />
                    
                    {/* Middle counter-rotating ring */}
                    <div className="absolute inset-1.5 border-2 border-transparent border-b-accent border-l-accent rounded-full animate-[spin_0.8s_linear_infinite_reverse]" />
                    
                    {/* Inner pulsing core */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-3 h-3 rounded-full bg-primary animate-pulse shadow-lg shadow-primary/50" />
                    </div>
                    
                    {/* Orbiting particles */}
                    <div className="absolute inset-0 animate-spin" style={{ animationDuration: '2s' }}>
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-accent" />
                    </div>
                    <div className="absolute inset-0 animate-[spin_2s_linear_infinite_reverse]">
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-orange-500" />
                    </div>
                  </div>
                ) : hasFailures ? (
                  <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                    <Target className="w-6 h-6 text-destructive" />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  </div>
                )}
              </div>
              <h2 className="text-xl font-semibold text-foreground">
                {loading ? 'Creating Segments...' : hasFailures ? 'Some Segments Failed' : 'Segments Created!'}
              </h2>
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

            {/* Progress section */}
            <div className="px-6 pb-6">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-muted-foreground">Syncing with Klaviyo</span>
                <span className="text-primary font-medium">
                  {loading ? 'Processing...' : `${successfulCount} of ${totalCount} complete`}
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

            {/* Results list (collapsed view) */}
            {!loading && results.length > 0 && (
              <div className="px-6 pb-4 max-h-48 overflow-y-auto">
                <div className="space-y-2">
                  {results.map((result, idx) => {
                    const segment = SEGMENTS.find((s) => s.id === result.segmentId);
                    return (
                      <div
                        key={idx}
                        className={`flex items-center gap-2 p-2 rounded-lg text-sm ${
                          result.status === "success"
                            ? "bg-green-500/10 text-green-600"
                            : "bg-red-500/10 text-red-600"
                        }`}
                      >
                        {result.status === "success" ? (
                          <CheckCircle className="w-4 h-4 flex-shrink-0" />
                        ) : (
                          <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        )}
                        <span className="truncate">{segment?.name || result.segmentId}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Action buttons */}
            {!loading && (
              <div className="px-6 pb-6 space-y-2">
                {hasFailures && onRetryFailed && (
                  <button
                    onClick={() => onRetryFailed(failedResults.map(r => r.segmentId))}
                    className="w-full bg-orange-500 text-white py-3 rounded-xl font-medium hover:bg-orange-600 transition-colors"
                  >
                    Retry Failed ({failedResults.length})
                  </button>
                )}
                <button
                  onClick={onViewResults}
                  className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-medium hover:bg-primary/90 transition-colors"
                >
                  {hasFailures ? 'Continue' : 'Done'}
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </>
  );
};
