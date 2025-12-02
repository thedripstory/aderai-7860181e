import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { SegmentResult } from '@/hooks/useKlaviyoSegments';
import { SEGMENTS } from '@/lib/segmentData';
import { supabase } from "@/integrations/supabase/client";
import { ErrorHandler } from '@/lib/errorHandlers';
import { Progress } from '@/components/ui/progress';
import { SuccessAnimation } from '@/components/SuccessAnimation';
import { useNavigate } from 'react-router-dom';

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
  const failedResults = results.filter(r => r.status === 'error');
  const hasFailures = failedResults.length > 0;
  const successfulCount = results.filter(r => r.status === 'success').length;
  const totalCount = results.length;
  const completedCount = results.length; // All results in the array are complete (no pending state)
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

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
      
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <div className="bg-card rounded-lg shadow-lg p-8 border border-border">
            <div className="text-center mb-8">
              <div className="relative w-8 h-8 mx-auto mb-4">
                {/* Aggressive rotating loader */}
                <div className="absolute inset-0 border-2 border-transparent border-t-primary border-r-primary rounded-full animate-spin" />
                
                {/* Middle counter-rotating ring */}
                <div className="absolute inset-1 border-2 border-transparent border-b-accent border-l-accent rounded-full animate-[spin_0.8s_linear_infinite_reverse]" />
                
                {/* Inner pulsing core */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-lg shadow-primary/50" />
                </div>
                
                {/* Orbiting particles */}
                <div className="absolute inset-0 animate-spin" style={{ animationDuration: '2s' }}>
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent" />
                </div>
                <div className="absolute inset-0 animate-[spin_2s_linear_infinite_reverse]">
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-orange-500" />
                </div>
              </div>
              <h2 className="text-2xl font-bold mb-2">Creating Your Segments</h2>
              <p className="text-muted-foreground">
                {loading ? "Please wait while we create your segments..." : "Segment creation complete"}
              </p>
            </div>

            {/* Progress Bar */}
            {loading && totalCount > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="font-medium">Progress</span>
                  <span className="text-muted-foreground">
                    {completedCount} of {totalCount}
                  </span>
                </div>
                <Progress value={progressPercent} className="h-2" />
              </div>
            )}

          <div className="space-y-3 mb-6">
            {results.map((result, idx) => {
              const segment = SEGMENTS.find((s) => s.id === result.segmentId);
              return (
                <div
                  key={idx}
                  className={`p-4 rounded-lg border ${
                    result.status === "success"
                      ? "border-green-500/50 bg-green-500/5"
                      : result.status === "error"
                      ? "border-red-500/50 bg-red-500/5"
                      : "border-border"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {result.status === "success" ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : result.status === "error" ? (
                      <AlertCircle className="w-5 h-5 text-red-500" />
                    ) : (
                      <Loader className="w-5 h-5 animate-spin" />
                    )}
                    <div className="flex-1">
                      <div className="font-medium">{segment?.name}</div>
                      <div className="text-sm text-muted-foreground">{result.message}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {!loading && (
            <div className="space-y-3 mt-6">
              {hasFailures && onRetryFailed && (
                <button
                  onClick={() => onRetryFailed(failedResults.map(r => r.segmentId))}
                  className="w-full bg-orange-500 text-white py-3 rounded-lg font-medium hover:bg-orange-600 transition-colors"
                >
                  Retry Failed Segments ({failedResults.length})
                </button>
              )}
              <button
                onClick={onViewResults}
                className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:bg-primary/90"
              >
                {hasFailures ? 'Continue with Successful Segments' : 'View Results'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
};
