import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, CheckCircle } from 'lucide-react';

interface SegmentCreationModalProps {
  isOpen: boolean;
  segmentName: string;
  segmentDescription: string;
  isComplete: boolean;
  onComplete?: () => void;
}

export const SegmentCreationModal: React.FC<SegmentCreationModalProps> = ({
  isOpen,
  segmentName,
  segmentDescription,
  isComplete,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
        >
          {/* Animated background orbs */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-3xl"
            />
            <motion.div
              animate={{
                scale: [1.2, 1, 1.2],
                opacity: [0.2, 0.4, 0.2],
              }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/20 rounded-full blur-3xl"
            />
          </div>

          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative bg-card/95 backdrop-blur-xl border border-border/50 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl"
          >
            {/* Glow effect */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />
            
            <div className="relative z-10">
              {/* Header */}
              <div className="text-center mb-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4"
                >
                  {isComplete ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      <CheckCircle className="w-8 h-8 text-green-500" />
                    </motion.div>
                  ) : (
                    <div className="relative">
                      {/* Aggressive rotating loader */}
                      <div className="relative w-8 h-8">
                        <div className="absolute inset-0 border-2 border-transparent border-t-primary border-r-primary rounded-full animate-spin" />
                        <div className="absolute inset-1 border-2 border-transparent border-b-accent border-l-accent rounded-full animate-[spin_0.8s_linear_infinite_reverse]" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-lg shadow-primary/50" />
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
                
                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-xl font-bold text-foreground"
                >
                  {isComplete ? 'Segment Created!' : 'Creating Segment...'}
                </motion.h2>
              </div>

              {/* Segment Info Card */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-muted/50 rounded-xl p-4 mb-6 border border-border/30"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Sparkles className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground truncate">{segmentName}</h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {segmentDescription}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Progress indicator */}
              {!isComplete && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Syncing with Klaviyo</span>
                    <motion.span
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="text-primary font-medium"
                    >
                      Processing...
                    </motion.span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ x: '-100%' }}
                      animate={{ x: '100%' }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                      className="h-full w-1/2 bg-gradient-to-r from-transparent via-primary to-transparent rounded-full"
                    />
                  </div>
                </motion.div>
              )}

              {isComplete && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-center text-sm text-muted-foreground"
                >
                  Your segment is now live in Klaviyo
                </motion.p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
