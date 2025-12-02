import React from 'react';
import { LogOut, Settings as SettingsIcon, HelpCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const klaviyoLogo = "https://pub-3bbb34ba2afb44e8af7fdecd43e23b74.r2.dev/logos/Klaviyo_idRlQDy2Ux_1.png";

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
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <a href="/dashboard" className="group flex items-center gap-3">
            <div className="text-3xl font-playfair font-bold tracking-tight hover:scale-105 transition-transform duration-300">
              aderai<span className="text-accent group-hover:animate-pulse">.</span>
            </div>
            <span className="text-sm text-muted-foreground font-medium hidden sm:block">
              AI-Powered Segmentation
            </span>
          </a>

          <div className="flex items-center gap-3">
            {children}
            
            {/* Help Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10">
                  <HelpCircle className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => navigate('/help')}>
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Help Center
                </DropdownMenuItem>
                {onStartTour && (
                  <DropdownMenuItem onClick={onStartTour}>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Restart Tour
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {showSettings && (
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => navigate('/settings')} 
                data-tour="settings-button"
                className="rounded-full hover:bg-primary/10"
              >
                <SettingsIcon className="w-5 h-5" />
              </Button>
            )}
            
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="rounded-full hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};