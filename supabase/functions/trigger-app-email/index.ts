// Atomic dedup-aware trigger for app onboarding emails.
// Type: 'welcome' | 'first-segment' | 'connect-klaviyo-reminder'
// Uses an UPDATE ... WHERE flag = false RETURNING pattern so concurrent
// callers can never produce duplicate sends.
import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'

type EmailType = 'welcome' | 'first-segment' | 'connect-klaviyo-reminder'

const FLAG_COLUMN: Record<EmailType, string> = {
  'welcome': 'welcome_email_sent',
  'first-segment': 'first_segment_email_sent',
  'connect-klaviyo-reminder': 'klaviyo_reminder_sent',
}

const TEMPLATE_NAME: Record<EmailType, string> = {
  'welcome': 'welcome',
  'first-segment': 'first-segment',
  'connect-klaviyo-reminder': 'connect-klaviyo-reminder',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const supabase = createClient(supabaseUrl, serviceKey)

  try {
    const body = await req.json()
    const type = body.type as EmailType
    const userId = body.userId as string
    const extra = (body.templateData ?? {}) as Record<string, unknown>

    if (!type || !FLAG_COLUMN[type]) {
      return new Response(JSON.stringify({ error: 'invalid type' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }
    if (!userId) {
      return new Response(JSON.stringify({ error: 'userId required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // Atomic flag claim: only proceed if we successfully flipped the flag.
    const col = FLAG_COLUMN[type]
    const { data: claimed, error: claimErr } = await supabase
      .from('users')
      .update({ [col]: true })
      .eq('id', userId)
      .eq(col, false)
      .select('id, email, first_name, klaviyo_api_key, stripe_subscription_id')
      .maybeSingle()

    if (claimErr) {
      return new Response(JSON.stringify({ error: claimErr.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    if (!claimed) {
      // Already sent or user missing.
      return new Response(JSON.stringify({ success: true, skipped: 'already_sent_or_missing' }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // Extra safety for connect-klaviyo-reminder: don't send if klaviyo is now connected.
    if (type === 'connect-klaviyo-reminder' && (claimed as any).klaviyo_api_key) {
      return new Response(JSON.stringify({ success: true, skipped: 'klaviyo_already_connected' }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const templateData = {
      firstName: (claimed as any).first_name ?? null,
      dashboardUrl: `${Deno.env.get('SITE_URL') ?? 'https://aderai.io'}/dashboard`,
      ...extra,
    }

    const resp = await fetch(`${supabaseUrl}/functions/v1/send-transactional-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${serviceKey}`,
        'apikey': serviceKey,
      },
      body: JSON.stringify({
        templateName: TEMPLATE_NAME[type],
        recipientEmail: (claimed as any).email,
        idempotencyKey: `${type}-${userId}`,
        templateData,
      }),
    })

    const text = await resp.text()

    if (!resp.ok) {
      // Roll back the flag so it can retry later.
      await supabase.from('users').update({ [col]: false }).eq('id', userId)
      console.error('[trigger-app-email] send failed', { type, status: resp.status, text })
      return new Response(JSON.stringify({ error: 'send_failed', details: text }), { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    return new Response(JSON.stringify({ success: true, type, userId }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
