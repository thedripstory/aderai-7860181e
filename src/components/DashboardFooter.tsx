import React from 'react';
import { AderaiLogo } from '@/components/AderaiLogo';
import { Heart, ExternalLink, Shield, Lock, Eye, Server } from 'lucide-react';
import { motion } from 'framer-motion';

const KLAVIYO_LOGO_URL = "https://pub-3bbb34ba2afb44e8af7fdecd43e23b74.r2.dev/logos/Klaviyo_idRlQDy2Ux_1.png";

export const DashboardFooter: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative mt-16 border-t border-border/50">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-t from-muted/30 to-transparent pointer-events-none" />
      
      <div className="relative max-w-7xl mx-auto px-4 py-12">
        {/* Privacy Badge Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <div className="bg-slate-900 rounded-xl p-6 text-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-green-500/20">
                <Shield className="h-6 w-6 text-green-400" />
              </div>
              <h3 className="text-lg font-semibold">Your Data Privacy, Guaranteed</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-white/10 flex-shrink-0">
                  <Lock className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <p className="font-medium text-sm">No Customer Data Stored</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Your customer information never touches our servers
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-white/10 flex-shrink-0">
                  <Eye className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <p className="font-medium text-sm">No Data Reading</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    We only create segments, never read your profiles
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-white/10 flex-shrink-0">
                  <Server className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <p className="font-medium text-sm">Encrypted API Keys</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Your Klaviyo credentials are encrypted at rest
                  </p>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-400 text-center border-t border-slate-700 pt-4">
              Aderai only communicates with Klaviyo to create segment definitions. We never access, store, or process your customer data.
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          {/* Left - Branding */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
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
