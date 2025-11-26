import React, { useState, useEffect } from "react";
import { SparklesCore } from "@/components/ui/sparkles";
import { motion, AnimatePresence } from "framer-motion";

interface AderaiPreloaderProps {
  message?: string;
  minDisplayTime?: number;
  onComplete?: () => void;
}

export const AderaiPreloader: React.FC<AderaiPreloaderProps> = ({ 
  message = "Loading...",
  minDisplayTime = 3000,
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
      // Start exit animation
      setIsVisible(false);
      // Call onComplete after exit animation
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
          {/* Full screen sparkles background with orange/accent color */}
          <div className="w-full absolute inset-0 h-screen">
            <SparklesCore
              id="aderai-preloader-sparkles"
              background="transparent"
              minSize={0.6}
              maxSize={1.4}
              particleDensity={100}
              className="w-full h-full"
              particleColor="#F97316"
              speed={1}
            />
          </div>
          
          {/* Logo and text container */}
          <motion.div 
            className="relative z-20 flex flex-col items-center gap-6"
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
              <div className="text-5xl md:text-6xl font-playfair font-bold tracking-tight relative z-10">
                aderai<span className="text-accent animate-pulse">.</span>
              </div>
            </motion.div>
            
            {/* Loading message */}
            <motion.p 
              className="text-muted-foreground text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              {message}
            </motion.p>
            
            {/* Gradient line decoration with orange accent */}
            <div className="w-64 h-1 relative mt-2">
              <div className="absolute inset-x-0 top-0 bg-gradient-to-r from-transparent via-accent to-transparent h-[2px] w-full blur-sm" />
              <div className="absolute inset-x-0 top-0 bg-gradient-to-r from-transparent via-accent to-transparent h-px w-full" />
              <motion.div 
                className="absolute top-0 h-[2px] w-1/4 bg-gradient-to-r from-transparent via-primary to-transparent blur-sm"
                animate={{ x: [0, 192, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AderaiPreloader;
