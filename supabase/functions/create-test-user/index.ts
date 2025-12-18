import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { Resend } from "https://esm.sh/resend@4.0.0";
import { TestUserInvitationEmail } from "./_templates/test-user-invitation.tsx";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CreateTestUserRequest {
  action?: "create" | "resend";
  email?: string;
  firstName?: string;
  brandName?: string;
  notes?: string;
  sendEmail?: boolean;
  testUserId?: string; // For resend action
}

const generateTempPassword = (): string => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let password = "";
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("create-test-user: Starting request processing");

    // Verify admin authorization
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      console.error("create-test-user: No authorization header");
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Supabase clients
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    // Client for verifying admin
    const supabaseAuth = createClient(supabaseUrl, supabaseServiceKey);
    
    // Verify the requesting user is an admin
    const token = authHeader.replace("Bearer ", "");
    const { data: { user: adminUser }, error: authError } = await supabaseAuth.auth.getUser(token);
    
    if (authError || !adminUser) {
      console.error("create-test-user: Auth error", authError);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if user is admin using the has_role function
    const { data: isAdmin, error: roleError } = await supabaseAuth.rpc("has_role", {
      _user_id: adminUser.id,
      _role: "admin"
    });

    if (roleError || !isAdmin) {
      console.error("create-test-user: Not an admin", roleError);
      return new Response(
        JSON.stringify({ error: "Admin access required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    const { action = "create", email, firstName, brandName, notes, sendEmail = true, testUserId }: CreateTestUserRequest = await req.json();
    const siteUrl = Deno.env.get("SITE_URL") || "https://aderai.io";

    // Handle resend invitation action
    if (action === "resend") {
      if (!testUserId) {
        return new Response(
          JSON.stringify({ error: "Test user ID required for resend" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log(`create-test-user: Resending invitation for test user ${testUserId}`);

      // Get the test user record
      const { data: testUser, error: fetchError } = await supabaseAuth
        .from("test_users")
        .select("*")
        .eq("id", testUserId)
        .single();

      if (fetchError || !testUser) {
        console.error("create-test-user: Test user not found", fetchError);
        return new Response(
          JSON.stringify({ error: "Test user not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (testUser.first_login_at) {
        return new Response(
          JSON.stringify({ error: "User has already logged in - cannot resend invitation" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Generate HTML directly from template function
      const html = TestUserInvitationEmail({
        firstName: testUser.first_name || "there",
        brandName: testUser.brand_name || "Your Brand",
        email: testUser.email,
        tempPassword: testUser.temp_password || "Password not available",
        loginUrl: `${siteUrl}/login`,
        dashboardUrl: `${siteUrl}/dashboard`
      });

      console.log(`create-test-user: Sending resend email to ${testUser.email}`);

      const { error: emailError } = await resend.emails.send({
        from: "Aderai <hello@updates.aderai.io>",
        to: [testUser.email],
        subject: `Reminder: Your Aderai Beta Account is Ready!`,
        html
      });

      if (emailError) {
        console.error("create-test-user: Failed to resend email", emailError);
        return new Response(
          JSON.stringify({ error: "Failed to send invitation email" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Update test_users record
      await supabaseAuth
        .from("test_users")
        .update({
          invitation_sent_at: new Date().toISOString(),
          status: "invited"
        })
        .eq("id", testUserId);

      // Log email in audit
      await supabaseAuth.from("email_audit_log").insert({
        user_id: testUser.user_id,
        email_type: "test_user_invitation_resend",
        recipient_email: testUser.email,
        subject: "Reminder: Your Aderai Beta Account is Ready!",
        status: "sent"
      });

      // Log admin action
      await supabaseAuth.from("admin_audit_log").insert({
        admin_user_id: adminUser.id,
        action_type: "test_user_invitation_resent",
        target_table: "test_users",
        target_id: testUserId,
        new_values: { email: testUser.email }
      });

      console.log(`create-test-user: Invitation resent successfully to ${testUser.email}`);

      return new Response(
        JSON.stringify({
          success: true,
          message: `Invitation resent to ${testUser.email}`
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // CREATE action - original logic
    if (!email || !firstName || !brandName) {
      return new Response(
        JSON.stringify({ error: "Email, first name, and brand name are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`create-test-user: Creating test user for ${email}`);

    // Check if user already exists
    const { data: existingUsers } = await supabaseAuth
      .from("users")
      .select("id, email")
      .eq("email", email.toLowerCase())
      .limit(1);

    if (existingUsers && existingUsers.length > 0) {
      return new Response(
        JSON.stringify({ error: "A user with this email already exists" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate temporary password
    const tempPassword = generateTempPassword();

    // Create the user in auth.users using admin API
    const { data: authData, error: createAuthError } = await supabaseAuth.auth.admin.createUser({
      email: email.toLowerCase(),
      password: tempPassword,
      email_confirm: true, // Auto-confirm the email
      user_metadata: {
        first_name: firstName,
        account_name: brandName,
        is_test_user: true
      }
    });

    if (createAuthError || !authData.user) {
      console.error("create-test-user: Failed to create auth user", createAuthError);
      return new Response(
        JSON.stringify({ error: `Failed to create user: ${createAuthError?.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const newUserId = authData.user.id;
    console.log(`create-test-user: Auth user created with ID ${newUserId}`);

    // Update users table to mark as test user with subscription bypassed
    const { error: updateError } = await supabaseAuth
      .from("users")
      .update({
        subscription_status: "active",
        subscription_start_date: new Date().toISOString(),
        subscription_end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year from now
      })
      .eq("id", newUserId);

    if (updateError) {
      console.error("create-test-user: Failed to update user subscription", updateError);
    }

    // Create notification preferences for the user
    await supabaseAuth
      .from("notification_preferences")
      .insert({ user_id: newUserId });

    // Record in test_users table
    const { data: testUserRecord, error: testUserError } = await supabaseAuth
      .from("test_users")
      .insert({
        user_id: newUserId,
        created_by_admin_id: adminUser.id,
        email: email.toLowerCase(),
        first_name: firstName,
        brand_name: brandName,
        temp_password: tempPassword, // Store for admin reference
        status: sendEmail ? "invited" : "created",
        invitation_sent_at: sendEmail ? new Date().toISOString() : null,
        notes: notes || null,
        subscription_bypassed: true
      })
      .select()
      .single();

    if (testUserError) {
      console.error("create-test-user: Failed to record test user", testUserError);
    }

    // Log audit action
    await supabaseAuth.from("admin_audit_log").insert({
      admin_user_id: adminUser.id,
      action_type: "test_user_created",
      target_table: "test_users",
      target_id: newUserId,
      new_values: {
        email: email.toLowerCase(),
        first_name: firstName,
        brand_name: brandName,
        subscription_bypassed: true
      }
    });

    // Send invitation email if requested
    let emailSent = false;
    if (sendEmail) {
      try {
        // Generate HTML directly from template function
        const html = TestUserInvitationEmail({
          firstName,
          brandName,
          email: email.toLowerCase(),
          tempPassword,
          loginUrl: `${siteUrl}/login`,
          dashboardUrl: `${siteUrl}/dashboard`
        });

        console.log(`create-test-user: Sending invitation email to ${email}`);

        const { error: emailError } = await resend.emails.send({
          from: "Aderai <hello@updates.aderai.io>",
          to: [email.toLowerCase()],
          subject: `Welcome to Aderai Beta - Your Test Account is Ready!`,
          html
        });

        if (emailError) {
          console.error("create-test-user: Failed to send email", emailError);
        } else {
          emailSent = true;
          console.log(`create-test-user: Invitation email sent to ${email}`);
          
          // Log email in audit
          await supabaseAuth.from("email_audit_log").insert({
            user_id: newUserId,
            email_type: "test_user_invitation",
            recipient_email: email.toLowerCase(),
            subject: "Welcome to Aderai Beta - Your Test Account is Ready!",
            status: "sent"
          });
        }
      } catch (emailErr) {
        console.error("create-test-user: Email sending error", emailErr);
      }
    }

    console.log(`create-test-user: Successfully created test user ${email}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: sendEmail 
          ? `Test user created and invitation sent to ${email}`
          : `Test user created for ${email}`,
        user: {
          id: newUserId,
          email: email.toLowerCase(),
          firstName,
          brandName,
          tempPassword: sendEmail ? undefined : tempPassword, // Only show password if email not sent
          emailSent
        },
        testUserRecord
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    console.error("create-test-user: Unexpected error", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
