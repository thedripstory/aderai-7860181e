import React from 'react';
import { AderaiLogo } from '@/components/AderaiLogo';
import { Heart, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

const KLAVIYO_LOGO_URL = "https://pub-3bbb34ba2afb44e8af7fdecd43e23b74.r2.dev/logos/Klaviyo_idRlQDy2Ux_1.png";

export const DashboardFooter: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative mt-16 border-t border-border/50">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-t from-muted/30 to-transparent pointer-events-none" />
      
      <div className="relative max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          {/* Left - Branding */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center md:items-start gap-3"
          >
            <AderaiLogo size="lg" href="/dashboard" />
            <p className="text-sm text-muted-foreground">
              Simplifying Klaviyo segmentation
            </p>
          </motion.div>

          {/* Center - Powered by & Links */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Powered by</span>
              <img 
                src={KLAVIYO_LOGO_URL} 
                alt="Klaviyo" 
                className="h-4 opacity-70 dark:invert" 
              />
            </div>
            
            <div className="flex items-center gap-6 text-sm">
              <a 
                href="/help" 
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Help Center
              </a>
              <a 
                href="/settings" 
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Settings
              </a>
              <a 
                href="https://aderai.io" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
              >
                Website
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </motion.div>

          {/* Right - Made with love */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col items-center md:items-end gap-2"
          >
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <span>Made with</span>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
              >
                <Heart className="w-4 h-4 text-red-500 fill-red-500" />
              </motion.div>
              <span>for marketers</span>
            </div>
            <p className="text-xs text-muted-foreground/60">
              © {currentYear} Aderai. All rights reserved.
            </p>
          </motion.div>
        </div>

        {/* Bottom decorative line */}
        <div className="mt-8 pt-6 border-t border-border/30">
          <p className="text-center text-xs text-muted-foreground/50">
            Building better segments, one click at a time ✨
          </p>
        </div>
      </div>
    </footer>
  );
};
