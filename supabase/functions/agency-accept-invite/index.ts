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

    const { invitationToken, userEmail } = await req.json();

    // Find invitation
    const { data: invitation, error: findError } = await supabaseClient
      .from("agency_team_members")
      .select("*")
      .eq("invitation_token", invitationToken)
      .single();

    if (findError || !invitation) {
      throw new Error("Invalid invitation token");
    }

    // Verify email matches invitation
    if (invitation.member_email !== user.email) {
      throw new Error("This invitation was sent to a different email address");
    }

    // Check expiration
    if (new Date(invitation.invitation_expires) < new Date()) {
      throw new Error("Invitation has expired");
    }

    // Update invitation with user ID and status
    const { error: updateError } = await supabaseClient
      .from("agency_team_members")
      .update({
        member_user_id: user.id,
        status: "active",
        invitation_token: null,
        invitation_expires: null,
      })
      .eq("id", invitation.id);

    if (updateError) throw updateError;

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Error in agency-accept-invite:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});