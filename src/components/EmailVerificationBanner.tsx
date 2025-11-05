import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, Mail, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
  const [reminderInfo, setReminderInfo] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!emailVerified) {
      checkReminderStatus();
    }
  }, [emailVerified, userId]);

  const checkReminderStatus = async () => {
    try {
      const { data } = await supabase
        .from("email_verification_reminders")
        .select("*")
        .eq("user_id", userId)
        .single();

      setReminderInfo(data);
    } catch (error) {
      console.error("Error checking reminder status:", error);
    }
  };

  const sendVerificationEmail = async () => {
    setSending(true);
    try {
      // Call edge function to send verification email
      const { error } = await supabase.functions.invoke(
        "send-verification-email",
        {
          body: { email: userEmail },
        }
      );

      if (error) throw error;

      // Track reminder sent
      await supabase.from("email_verification_reminders").upsert({
        user_id: userId,
        last_reminder_sent_at: new Date().toISOString(),
        reminder_count: (reminderInfo?.reminder_count || 0) + 1,
      });

      toast({
        title: "Verification Email Sent",
        description: `Check your inbox at ${userEmail}`,
      });

      setDismissed(true);
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

  // Don't show if email is verified or banner is dismissed
  if (emailVerified || dismissed) {
    return null;
  }

  // Check if 24 hours have passed since account creation or last reminder
  const shouldShowUrgent = reminderInfo
    ? new Date().getTime() -
        new Date(reminderInfo.last_reminder_sent_at).getTime() >
      24 * 60 * 60 * 1000
    : false;

  return (
    <Alert
      className={`mb-6 ${
        shouldShowUrgent
          ? "border-red-500/20 bg-red-500/10"
          : "border-yellow-500/20 bg-yellow-500/10"
      }`}
    >
      <div className="flex items-start gap-3">
        <AlertCircle
          className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
            shouldShowUrgent ? "text-red-500" : "text-yellow-500"
          }`}
        />
        <div className="flex-1">
          <AlertDescription>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="font-semibold mb-1">
                  {shouldShowUrgent
                    ? "⚠️ Email Verification Required"
                    : "Please Verify Your Email"}
                </p>
                <p className="text-sm text-muted-foreground mb-3">
                  {shouldShowUrgent
                    ? `Your account has limited access until you verify ${userEmail}. Some features are restricted.`
                    : `We sent a verification email to ${userEmail}. Please check your inbox and click the link to unlock all features.`}
                </p>
                <Button
                  onClick={sendVerificationEmail}
                  disabled={sending}
                  size="sm"
                  variant={shouldShowUrgent ? "destructive" : "default"}
                >
                  {sending ? (
                    <div className="relative w-4 h-4 mr-2">
                      <div className="absolute inset-0 border-2 border-transparent border-t-white border-r-white rounded-full animate-spin" />
                    </div>
                  ) : (
                    <Mail className="w-4 h-4 mr-2" />
                  )}
                  {reminderInfo?.reminder_count > 0
                    ? "Resend Verification Email"
                    : "Send Verification Email"}
                </Button>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDismissed(true)}
                className="flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </AlertDescription>
        </div>
      </div>
    </Alert>
  );
}
