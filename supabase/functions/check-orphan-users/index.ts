import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.78.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Checking for orphan users...');

    // Check for orphan users
    const { data: orphanUsers, error: checkError } = await supabaseClient
      .rpc('check_for_orphan_users');

    if (checkError) {
      console.error('Error checking orphan users:', checkError);
      throw checkError;
    }

    console.log(`Found ${orphanUsers?.length || 0} orphan users`);

    if (!orphanUsers || orphanUsers.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No orphan users found',
          orphanCount: 0 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fix orphan users automatically
    const { data: fixedUsers, error: fixError } = await supabaseClient
      .rpc('fix_orphan_users');

    if (fixError) {
      console.error('Error fixing orphan users:', fixError);
      throw fixError;
    }

    console.log(`Fixed ${fixedUsers?.length || 0} orphan users`);

    // Send admin notification about orphan users
    const adminNotification = {
      admin_user_id: '00000000-0000-0000-0000-000000000000', // Will be filtered by RLS to actual admins
      notification_type: 'info',
      severity: 'medium',
      title: 'Orphan Users Auto-Fixed',
      message: `Detected and fixed ${fixedUsers?.length || 0} orphan users. Users: ${orphanUsers.map((u: any) => u.email).join(', ')}`,
      metadata: {
        orphan_users: orphanUsers,
        fixed_users: fixedUsers,
        fixed_at: new Date().toISOString(),
      }
    };

    // Get all admin user IDs
    const { data: adminRoles } = await supabaseClient
      .from('user_roles')
      .select('user_id')
      .eq('role', 'admin');

    // Insert notification for each admin
    if (adminRoles && adminRoles.length > 0) {
      for (const admin of adminRoles) {
        await supabaseClient.from('admin_notifications').insert({
          ...adminNotification,
          admin_user_id: admin.user_id,
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Auto-fixed ${fixedUsers?.length || 0} orphan users`,
        orphanCount: orphanUsers.length,
        fixedCount: fixedUsers?.length || 0,
        orphanUsers,
        fixedUsers,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Check orphan users error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
