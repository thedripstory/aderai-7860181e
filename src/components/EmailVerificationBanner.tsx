import React, { useState, useEffect } from "react";
import { Mail, X, Loader } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const EmailVerificationBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const checkEmailVerification = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user && !user.email_confirmed_at) {
        setIsVisible(true);
      }
    };

    checkEmailVerification();
  }, []);

  const handleResendEmail = async () => {
    setIsResending(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user?.email) {
        throw new Error("No email found");
      }

      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email,
      });

      if (error) throw error;

      toast({
        title: "Verification email sent",
        description: "Please check your inbox and spam folder.",
      });
    } catch (error) {
      console.error("Error resending email:", error);
      toast({
        title: "Failed to resend email",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="bg-gradient-to-r from-orange-500/10 to-primary/10 border-b-2 border-orange-500/20">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <Mail className="w-5 h-5 text-orange-500 flex-shrink-0" />
            <div className="text-sm">
              <span className="font-medium">Verify your email address</span>
              <span className="text-muted-foreground ml-2">
                Check your inbox for the verification link.
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleResendEmail}
              disabled={isResending}
              className="text-sm font-medium text-primary hover:underline disabled:opacity-50 flex items-center gap-1"
            >
              {isResending ? (
                <>
                  <Loader className="w-3 h-3 animate-spin" />
                  Sending...
                </>
              ) : (
                "Resend email"
              )}
            </button>
            <button
              onClick={() => setIsVisible(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
