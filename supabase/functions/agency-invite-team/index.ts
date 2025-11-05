import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      throw new Error("Unauthorized");
    }

    const { memberEmail, role } = await req.json();

    // Generate invitation token
    const invitationToken = crypto.randomUUID();
    const invitationExpires = new Date();
    invitationExpires.setDate(invitationExpires.getDate() + 7); // 7 days

    // Insert team member
    const { data: teamMember, error: insertError } = await supabaseClient
      .from("agency_team_members")
      .insert({
        agency_user_id: user.id,
        member_email: memberEmail,
        role: role || "member",
        invitation_token: invitationToken,
        invitation_expires: invitationExpires.toISOString(),
      })
      .select()
      .single();

    if (insertError) throw insertError;

    // Call send-notification-email function for invitation
    const inviteUrl = `${req.headers.get("origin") || "https://aderai.io"}/accept-invite?token=${invitationToken}`;
    
    await supabaseClient.functions.invoke("send-notification-email", {
      body: {
        to: memberEmail,
        subject: "You've been invited to join a team on Aderai",
        html: `
          <h1>Team Invitation</h1>
          <p>You've been invited to join a team on Aderai.</p>
          <p><a href="${inviteUrl}">Click here to accept the invitation</a></p>
          <p>This invitation expires in 7 days.</p>
        `,
      },
    });

    return new Response(
      JSON.stringify({ success: true, teamMember }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Error in agency-invite-team:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});