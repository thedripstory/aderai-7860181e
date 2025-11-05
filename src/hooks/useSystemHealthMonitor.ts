import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * System Health Monitor
 * Monitors critical system metrics and creates notifications when thresholds are exceeded
 */
export const useSystemHealthMonitor = () => {
  useEffect(() => {
    const monitorHealth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Check error rate from segment creation
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
        const { data: recentErrors } = await supabase
          .from("segment_creation_errors")
          .select("id, resolved_at")
          .gte("created_at", oneHourAgo);

        const unresolvedErrors = recentErrors?.filter(e => !e.resolved_at).length || 0;

        // Critical: More than 10 unresolved errors in last hour
        if (unresolvedErrors > 10) {
          await createHealthNotification(
            user.id,
            "critical",
            "Critical System Health Alert",
            `${unresolvedErrors} unresolved segment errors detected in the last hour. System requires immediate attention.`,
            { error_count: unresolvedErrors, time_window: "1 hour" }
          );
        }

        // Check email delivery health
        const { data: emailLogs } = await supabase
          .from("email_audit_log")
          .select("status")
          .gte("sent_at", oneHourAgo);

        const failedEmails = emailLogs?.filter(log => log.status === "failed").length || 0;
        const totalEmails = emailLogs?.length || 1;
        const failureRate = (failedEmails / totalEmails) * 100;

        // High email failure rate (>15%)
        if (failureRate > 15 && totalEmails > 5) {
          await createHealthNotification(
            user.id,
            "high",
            "Email Delivery Degradation",
            `Email failure rate at ${failureRate.toFixed(1)}% (${failedEmails}/${totalEmails}). Delivery system may be experiencing issues.`,
            { failure_rate: failureRate, failed_count: failedEmails, total_count: totalEmails }
          );
        }

        // Check for database connection issues (simulate - in production, use actual metrics)
        const { error: dbCheckError } = await supabase
          .from("users")
          .select("id")
          .limit(1);

        if (dbCheckError) {
          await createHealthNotification(
            user.id,
            "critical",
            "Database Connection Issue",
            "Unable to connect to database. System is experiencing critical issues.",
            { error: dbCheckError.message }
          );
        }

      } catch (error) {
        console.error("Health monitoring error:", error);
      }
    };

    // Run initial check
    monitorHealth();

    // Set up periodic health checks every 5 minutes
    const interval = setInterval(monitorHealth, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);
};

const createHealthNotification = async (
  adminUserId: string,
  severity: "critical" | "high" | "medium" | "low",
  title: string,
  message: string,
  metadata: any
) => {
  try {
    // Check if similar notification was created recently (last 10 minutes)
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const { data: recentNotifications } = await supabase
      .from("admin_notifications")
      .select("id")
      .eq("admin_user_id", adminUserId)
      .eq("title", title)
      .gte("created_at", tenMinutesAgo);

    // Don't create duplicate notifications
    if (recentNotifications && recentNotifications.length > 0) {
      return;
    }

    const { error } = await supabase
      .from("admin_notifications")
      .insert([{
        admin_user_id: adminUserId,
        notification_type: "warning",
        severity,
        title,
        message,
        metadata
      }]);

    if (error) throw error;
  } catch (error) {
    console.error("Failed to create health notification:", error);
  }
};
