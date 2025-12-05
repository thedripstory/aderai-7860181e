import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AderaiLogo } from "@/components/AderaiLogo";
import { SparklesCore } from "@/components/ui/sparkles";

interface AderaiPreloaderProps {
  minDisplayTime?: number;
  onComplete?: () => void;
}

export const AderaiPreloader: React.FC<AderaiPreloaderProps> = ({ 
  minDisplayTime = 2000,
  onComplete
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [hasMinTimeElapsed, setHasMinTimeElapsed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setHasMinTimeElapsed(true);
    }, minDisplayTime);

    return () => clearTimeout(timer);
  }, [minDisplayTime]);

  useEffect(() => {
    if (hasMinTimeElapsed && onComplete) {
      setIsVisible(false);
      const exitTimer = setTimeout(onComplete, 500);
      return () => clearTimeout(exitTimer);
    }
  }, [hasMinTimeElapsed, onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          className="h-screen w-full bg-background flex flex-col items-center justify-center overflow-hidden relative"
          initial={{ opacity: 1 }}
          exit={{ 
            opacity: 0,
            scale: 1.05,
            filter: "blur(10px)"
          }}
          transition={{ 
            duration: 0.5,
            ease: "easeInOut"
          }}
        >
          {/* Logo and text container */}
          <motion.div 
            className="relative z-20 flex flex-col items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Aderai logo with glow effect */}
            <motion.div
              className="relative"
              animate={{ 
                scale: [1, 1.02, 1],
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
            >
              <div className="absolute inset-0 blur-3xl bg-accent/20 rounded-full scale-150" />
              <AderaiLogo size="2xl" showHoverEffect={false} className="relative z-10" />
            </motion.div>
            
          </motion.div>

          {/* Sparkles container below logo - wrapped in Suspense with fallback */}
          <div className="w-[40rem] max-w-full h-40 relative mt-4">
            {/* Gradient lines */}
            <div className="absolute inset-x-20 top-0 bg-gradient-to-r from-transparent via-accent to-transparent h-[2px] w-3/4 blur-sm" />
            <div className="absolute inset-x-20 top-0 bg-gradient-to-r from-transparent via-accent to-transparent h-px w-3/4" />
            <div className="absolute inset-x-60 top-0 bg-gradient-to-r from-transparent via-primary to-transparent h-[5px] w-1/4 blur-sm" />
            <div className="absolute inset-x-60 top-0 bg-gradient-to-r from-transparent via-primary to-transparent h-px w-1/4" />

            {/* Core sparkles component */}
            <SparklesCore
              background="transparent"
              minSize={0.4}
              maxSize={1}
              particleDensity={1200}
              className="w-full h-full"
              particleColor="#F97316"
            />

            {/* Radial gradient mask to prevent sharp edges */}
            <div className="absolute inset-0 w-full h-full bg-background [mask-image:radial-gradient(350px_200px_at_top,transparent_20%,white)]" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AderaiPreloader;
