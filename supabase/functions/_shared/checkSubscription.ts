import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export async function requireActiveSubscription(
  req: Request
): Promise<{ ok: true; userId: string } | { ok: false; response: Response }> {
  const admin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { persistSession: false } }
  );
  const token = (req.headers.get('Authorization') || '').replace('Bearer ', '');
  const { data: { user } } = await admin.auth.getUser(token);
  if (!user) {
    return { ok: false, response: new Response(
      JSON.stringify({ error: 'Not authenticated' }),
      { status: 401, headers: { ...cors, 'Content-Type': 'application/json' } }
    )};
  }
  const email = (user.email || '').toLowerCase();
  if (email.endsWith('@thedripstory.com')) {
    return { ok: true, userId: user.id };
  }
  const { data: profile } = await admin
    .from('users')
    .select('subscription_status')
    .eq('id', user.id)
    .maybeSingle();
  const status = profile?.subscription_status;
  if (status === 'active' || status === 'trialing') {
    return { ok: true, userId: user.id };
  }
  return { ok: false, response: new Response(
    JSON.stringify({ error: 'Active subscription required' }),
    { status: 403, headers: { ...cors, 'Content-Type': 'application/json' } }
  )};
}
