// Cron: send "connect your Klaviyo" reminder 24h after signup if not yet sent
// and Klaviyo is still not connected. Idempotent via klaviyo_reminder_sent flag.
import { createClient } from 'npm:@supabase/supabase-js@2'

Deno.serve(async (req) => {
  // Soft auth: require CRON_SECRET header.
  const cronSecret = Deno.env.get('CRON_SECRET')
  if (cronSecret) {
    const provided = req.headers.get('x-cron-secret')
    if (provided !== cronSecret) {
      return new Response('Unauthorized', { status: 401 })
    }
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const supabase = createClient(supabaseUrl, serviceKey)

  const { data: candidates, error } = await supabase
    .from('users')
    .select('id, email')
    .is('klaviyo_api_key', null)
    .eq('klaviyo_reminder_sent', false)
    .lt('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
    .limit(100)

  if (error) {
    console.error('[cron-klaviyo-reminder] query failed', error)
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }

  const results: any[] = []
  for (const u of candidates ?? []) {
    const resp = await fetch(`${supabaseUrl}/functions/v1/trigger-app-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${serviceKey}`,
        'apikey': serviceKey,
      },
      body: JSON.stringify({ type: 'connect-klaviyo-reminder', userId: u.id }),
    })
    results.push({ userId: u.id, status: resp.status })
  }

  return new Response(JSON.stringify({ processed: results.length, results }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
})
