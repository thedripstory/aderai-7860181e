import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Mail, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const DISMISS_KEY = 'email_verification_banner_dismissed_at';
const DISMISS_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

interface EmailVerificationBannerProps {
  userEmail: string;
  emailVerified: boolean;
  userId: string;
}

export default function EmailVerificationBanner({
  userEmail,
  emailVerified,
  userId,
}: EmailVerificationBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if banner was dismissed within the last 7 days
    const dismissedAt = localStorage.getItem(DISMISS_KEY);
    if (dismissedAt) {
      const dismissedTime = parseInt(dismissedAt, 10);
      const now = Date.now();
      
      if (now - dismissedTime < DISMISS_DURATION) {
        setDismissed(true);
        return;
      } else {
        // Dismissal expired, clear it
        localStorage.removeItem(DISMISS_KEY);
      }
    }
  }, []);

  const sendVerificationEmail = async () => {
    setSending(true);
    try {
      const { error } = await supabase.functions.invoke(
        "send-verification-email",
        {
          body: { email: userEmail },
        }
      );

      if (error) throw error;

      toast({
        title: "Verification Email Sent",
        description: `Check your inbox at ${userEmail}`,
      });
    } catch (error: any) {
      console.error("Error sending verification email:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to send verification email",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
    setDismissed(true);
  };

  // Don't show if email is verified or banner is dismissed
  if (emailVerified || dismissed) {
    return null;
  }

  return (
    <div className="bg-muted/30 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <p className="text-sm text-muted-foreground">
              Please verify your email at <span className="font-medium text-foreground">{userEmail}</span>
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              onClick={sendVerificationEmail}
              disabled={sending}
              variant="ghost"
              size="sm"
              className="text-primary hover:text-primary hover:bg-primary/10"
            >
              {sending ? "Sending..." : "Resend Email"}
            </Button>
            <button
              onClick={handleDismiss}
              className="p-1 hover:bg-muted rounded transition-colors"
              aria-label="Dismiss for 7 days"
              title="Dismiss for 7 days"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
