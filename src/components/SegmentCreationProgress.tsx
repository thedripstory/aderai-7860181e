import { CheckCircle2, Circle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SegmentProgressItem {
  name: string;
  status: "pending" | "creating" | "success" | "failed";
}

interface SegmentCreationProgressProps {
  segments: SegmentProgressItem[];
  currentIndex: number;
}

export const SegmentCreationProgress = ({ 
  segments, 
  currentIndex 
}: SegmentCreationProgressProps) => {
  return (
    <div className="w-full max-w-2xl mx-auto space-y-3">
      <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
        <span>Creating segments...</span>
        <span className="font-medium">{currentIndex + 1} / {segments.length}</span>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
        <AnimatePresence mode="popLayout">
          {segments.map((segment, index) => (
            <motion.div
              key={segment.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
              className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                segment.status === "creating" 
                  ? "bg-primary/5 border-primary" 
                  : segment.status === "success"
                  ? "bg-green-500/5 border-green-500/20"
                  : segment.status === "failed"
                  ? "bg-destructive/5 border-destructive/20"
                  : "bg-muted/30 border-border/30"
              }`}
            >
              {segment.status === "pending" && (
                <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              )}
              {segment.status === "creating" && (
                <Loader2 className="h-5 w-5 text-primary animate-spin flex-shrink-0" />
              )}
              {segment.status === "success" && (
                <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
              )}
              {segment.status === "failed" && (
                <Circle className="h-5 w-5 text-destructive flex-shrink-0" />
              )}
              
              <span className={`text-sm flex-1 ${
                segment.status === "success" 
                  ? "text-green-700 dark:text-green-300" 
                  : segment.status === "failed"
                  ? "text-destructive"
                  : segment.status === "creating"
                  ? "text-primary font-medium"
                  : "text-muted-foreground"
              }`}>
                {segment.name}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-primary to-orange-500"
          initial={{ width: 0 }}
          animate={{ width: `${((currentIndex + 1) / segments.length) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </div>
  );
};