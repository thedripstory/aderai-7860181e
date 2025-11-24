import { ArrowRight, X } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface TimeBasedPopupProps {
  onGetStarted: () => void;
}

export const TimeBasedPopup = ({ onGetStarted }: TimeBasedPopupProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    checkAndShowPopup();
  }, []);

  const checkAndShowPopup = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get user data to check 2FA prompt timing
      const { data: userData } = await supabase
        .from("users")
        .select("created_at, two_factor_prompt_shown_at")
        .eq("id", user.id)
        .single();

      if (!userData) return;

      // Check if it's been 3 days since signup and popup hasn't been shown
      const signupDate = new Date(userData.created_at);
      const now = new Date();
      const daysSinceSignup = Math.floor((now.getTime() - signupDate.getTime()) / (1000 * 60 * 60 * 24));

      const hasShownBefore = userData.two_factor_prompt_shown_at;

      if (daysSinceSignup >= 3 && !hasShownBefore) {
        const timer = setTimeout(() => {
          setIsVisible(true);
        }, 30000); // 30 seconds

        return () => clearTimeout(timer);
      }
    } catch (error) {
      console.error("Error checking popup status:", error);
    }
  };

  const handleClose = async () => {
    setIsVisible(false);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Mark prompt as shown
        await supabase
          .from("users")
          .update({ two_factor_prompt_shown_at: new Date().toISOString() })
          .eq("id", user.id);
      }
    } catch (error) {
      console.error("Error updating popup status:", error);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center animate-fade-in">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" onClick={handleClose} />

      {/* Popup Content */}
      <div className="relative bg-card border border-border rounded-3xl p-8 max-w-md mx-4 shadow-2xl animate-scale-in">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Close popup"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-6">
          <div className="mx-auto flex items-center justify-center mb-2">
            <span className="text-4xl font-playfair font-bold">
              aderai<span className="text-accent">.</span>
            </span>
          </div>

          <div className="space-y-3">
            <h3 className="text-2xl font-bold">You've been here for 30 seconds.</h3>
            <p className="text-muted-foreground leading-relaxed">
              This is exactly the amount of time it takes to create 70+ segments directly in your Klaviyo account using
              Aderai.
            </p>
          </div>

          <button
            onClick={() => {
              handleClose();
              onGetStarted();
            }}
            className="group w-full bg-primary text-primary-foreground px-8 py-4 rounded-full text-lg font-semibold hover:bg-primary/90 transition-all hover:scale-105 shadow-lg hover:shadow-xl inline-flex items-center justify-center gap-2"
          >
            <span>Start Building Segments</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={handleClose}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
};
