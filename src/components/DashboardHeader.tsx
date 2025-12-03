import React from 'react';
import { LogOut, Settings as SettingsIcon, HelpCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface DashboardHeaderProps {
  onStartTour?: () => void;
  showSettings?: boolean;
  children?: React.ReactNode;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  onStartTour,
  showSettings = true,
  children,
}) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-card/30 backdrop-blur-2xl supports-[backdrop-filter]:bg-card/30 shadow-lg">
      <div className="container max-w-screen-2xl mx-auto">
        <div className="flex h-20 items-center justify-between px-6 lg:px-8">
          
          {/* Brand */}
          <a 
            href="/dashboard" 
            className="group flex items-center gap-3 transition-opacity hover:opacity-80"
          >
            <div className="relative">
              <div className="text-3xl font-playfair font-bold tracking-tight">
                <span className="bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
                  aderai
                </span>
                <span className="text-accent transition-transform duration-300 group-hover:scale-125 inline-block">
                  .
                </span>
              </div>
            </div>
            
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 backdrop-blur-sm shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-accent" />
              <span className="text-xs font-semibold text-accent tracking-wide uppercase">
                AI Segmentation
              </span>
            </div>
          </a>

          {/* Actions */}
          <div className="flex items-center gap-3">
            
            {/* Dynamic content slot */}
            {children}
            
            {/* Actions dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="h-10 w-10 rounded-full hover:bg-muted/50 border border-transparent hover:border-border/50 transition-all duration-200"
                >
                  <SettingsIcon className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className="w-56 bg-card/95 backdrop-blur-2xl border-border/50 shadow-2xl"
                sideOffset={8}
              >
                {showSettings && (
                  <>
                    <DropdownMenuItem 
                      onClick={() => navigate('/settings')}
                      data-tour="settings-button"
                      className="cursor-pointer py-2.5"
                    >
                      <SettingsIcon className="w-4 h-4 mr-3 text-muted-foreground" />
                      <span className="font-medium">Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-border/50" />
                  </>
                )}
                
                <DropdownMenuItem 
                  onClick={() => navigate('/help')}
                  className="cursor-pointer py-2.5"
                >
                  <HelpCircle className="w-4 h-4 mr-3 text-muted-foreground" />
                  <span className="font-medium">Help Center</span>
                </DropdownMenuItem>
                
                {onStartTour && (
                  <DropdownMenuItem 
                    onClick={onStartTour}
                    className="cursor-pointer py-2.5"
                  >
                    <Sparkles className="w-4 h-4 mr-3 text-accent" />
                    <span className="font-medium">Product Tour</span>
                  </DropdownMenuItem>
                )}
                
                <DropdownMenuSeparator className="bg-border/50" />
                
                <DropdownMenuItem 
                  onClick={handleLogout}
                  className="cursor-pointer py-2.5 text-destructive focus:text-destructive"
                >
                  <LogOut className="w-4 h-4 mr-3" />
                  <span className="font-medium">Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
          </div>
        </div>
      </div>
    </header>
  );
};