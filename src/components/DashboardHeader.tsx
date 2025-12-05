import React from 'react';
import { LogOut, Settings as SettingsIcon, HelpCircle, Sparkles, ArrowLeft, Clock } from 'lucide-react';
import { AderaiLogo } from '@/components/AderaiLogo';
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
import { trackEvent, resetAnalytics } from '@/lib/analytics';
import { ActiveJobsButton } from './ActiveJobsButton';

interface DashboardHeaderProps {
  onStartTour?: () => void;
  showSettings?: boolean;
  showBackButton?: boolean;
  children?: React.ReactNode;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  onStartTour,
  showSettings = true,
  showBackButton = false,
  children,
}) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    trackEvent('User Signed Out');
    resetAnalytics();
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-card/30 backdrop-blur-2xl supports-[backdrop-filter]:bg-card/30 shadow-lg">
      <div className="container max-w-screen-2xl mx-auto">
        <div className="flex h-20 items-center justify-between px-6 lg:px-8">
          
          {/* Brand */}
          <div className="flex items-center gap-3">
            <AderaiLogo size="lg" href="/dashboard" showKlaviyoBadge />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            
            {/* Back to Dashboard button */}
            {showBackButton && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/dashboard')}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </Button>
            )}
            
            {/* Active Jobs Button */}
            <ActiveJobsButton />
            
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
                
                <DropdownMenuItem 
                  onClick={() => navigate('/jobs')}
                  className="cursor-pointer py-2.5"
                >
                  <Clock className="w-4 h-4 mr-3 text-muted-foreground" />
                  <span className="font-medium">Job History</span>
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
                  className="cursor-pointer py-2.5 text-destructive focus:text-destructive hover:!bg-destructive hover:!text-white [&:hover_svg]:text-white"
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