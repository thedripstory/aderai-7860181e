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
    <header className="sticky top-0 z-50 border-b border-border/20 bg-background/98 backdrop-blur-xl shadow-sm">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Section */}
          <a 
            href="/dashboard" 
            className="group flex items-center gap-4 hover:opacity-90 transition-opacity duration-200"
          >
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-playfair font-bold tracking-tight text-foreground">
                aderai
              </span>
              <span className="text-2xl font-playfair font-bold text-accent group-hover:scale-110 transition-transform duration-300">
                .
              </span>
            </div>
            <div className="hidden lg:flex items-center gap-2 pl-4 border-l border-border/40">
              <Sparkles className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-muted-foreground">
                AI-Powered Segmentation
              </span>
            </div>
          </a>

          {/* Right Section */}
          <div className="flex items-center gap-2">
            {/* Children (Klaviyo sync indicator, etc) */}
            {children && (
              <div className="mr-2">
                {children}
              </div>
            )}
            
            {/* Help Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="rounded-lg hover:bg-accent/10 hover:text-accent transition-all"
                >
                  <HelpCircle className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 p-1">
                <DropdownMenuItem 
                  onClick={() => navigate('/help')}
                  className="rounded-md cursor-pointer"
                >
                  <HelpCircle className="w-4 h-4 mr-3 text-muted-foreground" />
                  <span className="font-medium">Help Center</span>
                </DropdownMenuItem>
                {onStartTour && (
                  <DropdownMenuItem 
                    onClick={onStartTour}
                    className="rounded-md cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 mr-3 text-accent" />
                    <span className="font-medium">Restart Tour</span>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Settings Button */}
            {showSettings && (
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => navigate('/settings')} 
                data-tour="settings-button"
                className="rounded-lg hover:bg-accent/10 hover:text-accent transition-all"
              >
                <SettingsIcon className="w-5 h-5" />
              </Button>
            )}
            
            {/* Sign Out Button */}
            <Button 
              variant="ghost"
              onClick={handleLogout}
              className="ml-2 rounded-lg px-4 hover:bg-destructive/10 hover:text-destructive transition-all"
            >
              <LogOut className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline font-medium">Sign Out</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};