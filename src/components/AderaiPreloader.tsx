import React from "react";
import { SparklesCore } from "@/components/ui/sparkles";
import { motion } from "framer-motion";

interface AderaiPreloaderProps {
  message?: string;
}

export const AderaiPreloader: React.FC<AderaiPreloaderProps> = ({ 
  message = "Loading..." 
}) => {
  return (
    <div className="h-screen w-full bg-background flex flex-col items-center justify-center overflow-hidden relative">
      {/* Full screen sparkles background */}
      <div className="w-full absolute inset-0 h-screen">
        <SparklesCore
          id="aderai-preloader-sparkles"
          background="transparent"
          minSize={0.6}
          maxSize={1.4}
          particleDensity={100}
          className="w-full h-full"
          particleColor="hsl(var(--primary))"
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
          <div className="absolute inset-0 blur-3xl bg-primary/10 rounded-full scale-150" />
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
        
        {/* Gradient line decoration */}
        <div className="w-64 h-1 relative mt-2">
          <div className="absolute inset-x-0 top-0 bg-gradient-to-r from-transparent via-primary to-transparent h-[2px] w-full blur-sm" />
          <div className="absolute inset-x-0 top-0 bg-gradient-to-r from-transparent via-primary to-transparent h-px w-full" />
          <motion.div 
            className="absolute top-0 h-[2px] w-1/4 bg-gradient-to-r from-transparent via-accent to-transparent blur-sm"
            animate={{ x: [0, 192, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </motion.div>
    </div>
  );
};

export default AderaiPreloader;
