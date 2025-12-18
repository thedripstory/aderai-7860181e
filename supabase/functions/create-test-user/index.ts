import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CreateTestUserRequest {
  action?: "create" | "resend";
  email: string;
  firstName: string;
  brandName: string;
  notes?: string;
  sendEmail: boolean;
  testUserId?: string;
}

const generateTempPassword = (): string => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let password = "";
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

const generateEmailHtml = (firstName: string, brandName: string, email: string, tempPassword: string, loginUrl: string): string => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #FFF8F3; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
      <div style="text-align: center; margin-bottom: 32px;">
        <img src="https://pub-3bbb34ba2afb44e8af7fdecd43e23b74.r2.dev/aderai-logos/zoomed-inblack-logo-png%20copy.png" alt="Aderai" style="height: 40px; width: auto;" />
      </div>
      
      <h1 style="color: #1a1a1a; font-size: 24px; font-weight: 600; margin: 0 0 16px 0; text-align: center;">
        Welcome to Aderai Beta! 🎉
      </h1>
      
      <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
        Hi ${firstName},
      </p>
      
      <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
        You've been invited to test <strong>Aderai</strong> - the fastest way to create expert-level Klaviyo segments for <strong>${brandName}</strong>.
      </p>
      
      <div style="background: #FFF8F3; border-radius: 12px; padding: 24px; margin: 24px 0;">
        <h3 style="color: #1a1a1a; font-size: 14px; font-weight: 600; margin: 0 0 16px 0; text-transform: uppercase; letter-spacing: 0.5px;">
          Your Login Credentials
        </h3>
        <div style="margin-bottom: 12px;">
          <span style="color: #666; font-size: 14px;">Email:</span>
          <div style="color: #1a1a1a; font-size: 16px; font-weight: 500; font-family: monospace; background: white; padding: 8px 12px; border-radius: 6px; margin-top: 4px;">
            ${email}
          </div>
        </div>
        <div>
          <span style="color: #666; font-size: 14px;">Temporary Password:</span>
          <div style="color: #1a1a1a; font-size: 16px; font-weight: 500; font-family: monospace; background: white; padding: 8px 12px; border-radius: 6px; margin-top: 4px;">
            ${tempPassword}
          </div>
        </div>
      </div>
      
      <div style="text-align: center; margin: 32px 0;">
        <a href="${loginUrl}" style="display: inline-block; background: linear-gradient(135deg, #FF6B35 0%, #EA580C 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: 600;">
          Log In to Aderai
        </a>
      </div>
      
      <div style="background: #f0fdf4; border-left: 4px solid #22c55e; padding: 16px; border-radius: 0 8px 8px 0; margin: 24px 0;">
        <p style="color: #166534; font-size: 14px; margin: 0; font-weight: 500;">
          🔐 Security Tip: Please change your password after your first login.
        </p>
      </div>
      
      <h3 style="color: #1a1a1a; font-size: 16px; font-weight: 600; margin: 32px 0 16px 0;">
        What you can do:
      </h3>
      <ul style="color: #4a4a4a; font-size: 14px; line-height: 1.8; padding-left: 20px; margin: 0;">
        <li>Create 70+ pre-built Klaviyo segments in seconds</li>
        <li>Generate AI-powered custom segments</li>
        <li>View segment performance analytics</li>
        <li>Test the complete Aderai experience</li>
      </ul>
      
      <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6; margin: 32px 0 0 0;">
        We'd love your feedback! Reply to this email with any thoughts, bugs, or suggestions.
      </p>
      
      <div style="border-top: 1px solid #e5e5e5; margin-top: 32px; padding-top: 24px; text-align: center;">
        <p style="color: #9ca3af; font-size: 12px; margin: 0;">
          © ${new Date().getFullYear()} Aderai. All rights reserved.
        </p>
      </div>
    </div>
  </div>
</body>
</html>
  `;
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("create-test-user: Starting request processing");

    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      console.error("create-test-user: No authorization header");
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAuth = createClient(supabaseUrl, supabaseServiceKey);
    
    const token = authHeader.replace("Bearer ", "");
    const { data: { user: adminUser }, error: authError } = await supabaseAuth.auth.getUser(token);
    
    if (authError || !adminUser) {
      console.error("create-test-user: Auth error", authError);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

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

    const { action = "create", email, firstName, brandName, notes, sendEmail, testUserId }: CreateTestUserRequest = await req.json();
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

      const { data: testUser, error: fetchError } = await supabaseAuth
        .from("test_users")
        .select("*")
        .eq("id", testUserId)
        .single();

      if (fetchError || !testUser) {
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

      try {
        const html = generateEmailHtml(
          testUser.first_name || "there",
          testUser.brand_name || "Your Brand",
          testUser.email,
          testUser.temp_password,
          `${siteUrl}/login`
        );

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

        await supabaseAuth
          .from("test_users")
          .update({
            invitation_sent_at: new Date().toISOString(),
            status: "invited"
          })
          .eq("id", testUserId);

        await supabaseAuth.from("email_audit_log").insert({
          user_id: testUser.user_id,
          email_type: "test_user_invitation_resend",
          recipient_email: testUser.email,
          subject: "Reminder: Your Aderai Beta Account is Ready!",
          status: "sent"
        });

        await supabaseAuth.from("admin_audit_log").insert({
          admin_user_id: adminUser.id,
          action_type: "test_user_invitation_resent",
          target_table: "test_users",
          target_id: testUserId,
          new_values: { email: testUser.email }
        });

        console.log(`create-test-user: Invitation resent to ${testUser.email}`);

        return new Response(
          JSON.stringify({
            success: true,
            message: `Invitation resent to ${testUser.email}`
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );

      } catch (emailErr) {
        console.error("create-test-user: Resend email error", emailErr);
        return new Response(
          JSON.stringify({ error: "Failed to send invitation email" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // CREATE action
    if (!email || !firstName || !brandName) {
      return new Response(
        JSON.stringify({ error: "Email, first name, and brand name are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`create-test-user: Creating test user for ${email}`);

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

    const tempPassword = generateTempPassword();
    console.log(`create-test-user: Attempting to create auth user`);

    let authData;
    let createAuthError;
    try {
      const result = await supabaseAuth.auth.admin.createUser({
        email: email.toLowerCase(),
        password: tempPassword,
        email_confirm: true,
        user_metadata: {
          first_name: firstName,
          account_name: brandName,
          is_test_user: true
        }
      });
      authData = result.data;
      createAuthError = result.error;
      console.log(`create-test-user: Auth creation result - user: ${authData?.user?.id}, error: ${createAuthError?.message}`);
    } catch (authException) {
      console.error("create-test-user: Exception during auth creation", authException);
      return new Response(
        JSON.stringify({ error: `Auth creation exception: ${authException instanceof Error ? authException.message : 'Unknown error'}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (createAuthError || !authData?.user) {
      console.error("create-test-user: Failed to create auth user", createAuthError);
      return new Response(
        JSON.stringify({ error: `Failed to create user: ${createAuthError?.message || 'No user returned'}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const newUserId = authData.user.id;
    console.log(`create-test-user: Auth user created with ID ${newUserId}`);

    // Update users table
    const { error: updateError } = await supabaseAuth
      .from("users")
      .update({
        subscription_status: "active",
        subscription_start_date: new Date().toISOString(),
        subscription_end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
      })
      .eq("id", newUserId);

    if (updateError) {
      console.error("create-test-user: Failed to update user subscription", updateError);
    }

    await supabaseAuth
      .from("notification_preferences")
      .insert({ user_id: newUserId });

    const { data: testUserRecord, error: testUserError } = await supabaseAuth
      .from("test_users")
      .insert({
        user_id: newUserId,
        created_by_admin_id: adminUser.id,
        email: email.toLowerCase(),
        first_name: firstName,
        brand_name: brandName,
        temp_password: tempPassword,
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

    let emailSent = false;
    if (sendEmail) {
      try {
        console.log(`create-test-user: Sending invitation email`);
        const html = generateEmailHtml(firstName, brandName, email.toLowerCase(), tempPassword, `${siteUrl}/login`);

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
          tempPassword: sendEmail ? undefined : tempPassword,
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
