import React, { useState, useEffect, useMemo } from 'react';
import { CheckCircle, AlertCircle, Target } from 'lucide-react';
import { SegmentResult } from '@/hooks/useKlaviyoSegments';
import { SEGMENTS } from '@/lib/segmentData';
import { Progress } from '@/components/ui/progress';
import { SuccessAnimation } from '@/components/SuccessAnimation';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface SegmentCreationFlowProps {
  loading: boolean;
  results: SegmentResult[];
  onViewResults: () => void;
  onRetryFailed?: (failedSegmentIds: string[]) => void;
}

export const SegmentCreationFlow: React.FC<SegmentCreationFlowProps> = ({
  loading,
  results,
  onViewResults,
  onRetryFailed,
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

  // Get current segment being processed
  const currentSegment = useMemo(() => {
    if (results.length > 0) {
      const lastResult = results[results.length - 1];
      return SEGMENTS.find(s => s.id === lastResult.segmentId);
    }
    return null;
  }, [results]);

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
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Target className="w-5 h-5 text-primary" />
                </div>
              </div>
              <h2 className="text-xl font-semibold text-foreground">
                {loading ? 'Creating Segment...' : hasFailures ? 'Some Segments Failed' : 'Segments Created!'}
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
