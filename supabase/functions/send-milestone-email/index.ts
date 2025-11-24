import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Processing milestone email notifications...");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get unread milestone notifications
    const { data: notifications, error: notifError } = await supabase
      .from("admin_notifications")
      .select("*")
      .eq("notification_type", "info")
      .eq("read", false)
      .not("metadata->>trigger_email", "is", null)
      .eq("metadata->>trigger_email", "milestone");

    if (notifError) {
      console.error("Error fetching notifications:", notifError);
      throw notifError;
    }

    if (!notifications || notifications.length === 0) {
      console.log("No milestone emails to send");
      return new Response(
        JSON.stringify({ success: true, message: "No milestone emails to send" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    let sentCount = 0;
    let errorCount = 0;

    for (const notification of notifications) {
      try {
        const metadata = notification.metadata as any;
        const milestone = metadata.milestone;
        const email = metadata.email;
        const userId = metadata.user_id;

        // Get user data
        const { data: userData } = await supabase
          .from("users")
          .select("account_name")
          .eq("id", userId)
          .single();

        // Count AI suggestions used
        const { data: usageData } = await supabase
          .from("usage_limits")
          .select("ai_suggestions_total")
          .eq("user_id", userId)
          .single();

        // Send milestone email
        const { error: emailError } = await supabase.functions.invoke("send-email", {
          body: {
            to: email,
            template_name: "milestone",
            template_data: {
              accountName: userData?.account_name || "there",
              milestone: milestone,
              segmentCount: milestone,
              aiSuggestionsUsed: usageData?.ai_suggestions_total || 0,
            },
            userId: userId,
          },
        });

        if (emailError) {
          console.error(`Error sending milestone email to ${email}:`, emailError);
          errorCount++;
        } else {
          console.log(`Sent milestone email to ${email}`);
          sentCount++;

          // Mark notification as read
          await supabase
            .from("admin_notifications")
            .update({ read: true })
            .eq("id", notification.id);
        }
      } catch (notifError) {
        console.error(`Error processing notification:`, notifError);
        errorCount++;
      }
    }

    console.log(`Milestone emails complete: ${sentCount} sent, ${errorCount} errors`);

    return new Response(
      JSON.stringify({
        success: true,
        sent: sentCount,
        errors: errorCount,
        total: notifications.length,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in milestone emails:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
