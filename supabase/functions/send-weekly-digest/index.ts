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
    console.log("Starting weekly digest job...");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get all users who want weekly digests
    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("id, email, account_name")
      .eq("email_verified", true);

    if (usersError) {
      console.error("Error fetching users:", usersError);
      throw usersError;
    }

    if (!users || users.length === 0) {
      console.log("No users to send digest to");
      return new Response(
        JSON.stringify({ success: true, message: "No users to send digest to" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    let sentCount = 0;
    let errorCount = 0;

    // Process each user
    for (const user of users) {
      try {
        // Check if user wants weekly digest
        const { data: prefs } = await supabase
          .from("notification_preferences")
          .select("email_weekly_summary")
          .eq("user_id", user.id)
          .single();

        if (prefs?.email_weekly_summary === false) {
          console.log(`Skipping user ${user.email} - digest disabled`);
          continue;
        }

        // Get user's weekly activity
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        // Count segments created this week
        const { count: segmentsCount } = await supabase
          .from("ai_suggestions")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)
          .gte("created_at", oneWeekAgo.toISOString());

        // Count AI suggestions used this week
        const { count: aiUsageCount } = await supabase
          .from("usage_limits")
          .select("ai_suggestions_total", { count: "exact", head: false })
          .eq("user_id", user.id)
          .single();

        // Check if they viewed analytics
        const { data: analyticsEvents } = await supabase
          .from("analytics_events")
          .select("event_name")
          .eq("user_id", user.id)
          .eq("event_name", "analytics_viewed")
          .gte("created_at", oneWeekAgo.toISOString())
          .limit(1);

        // Send weekly digest email
        const { error: emailError } = await supabase.functions.invoke("send-email", {
          body: {
            to: user.email,
            template_name: "weekly_digest",
            template_data: {
              accountName: user.account_name || "there",
              weeklyActivity: {
                segmentsCreated: segmentsCount || 0,
                aiUsed: aiUsageCount || 0,
                analyticsViewed: (analyticsEvents?.length || 0) > 0,
              },
            },
            userId: user.id,
          },
        });

        if (emailError) {
          console.error(`Error sending digest to ${user.email}:`, emailError);
          errorCount++;
        } else {
          console.log(`Sent digest to ${user.email}`);
          sentCount++;
        }
      } catch (userError) {
        console.error(`Error processing user ${user.email}:`, userError);
        errorCount++;
      }
    }

    console.log(`Weekly digest complete: ${sentCount} sent, ${errorCount} errors`);

    return new Response(
      JSON.stringify({
        success: true,
        sent: sentCount,
        errors: errorCount,
        total: users.length,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in weekly digest:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
