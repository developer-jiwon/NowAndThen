// Deno Edge Function: poll push_queue every minute and send single-shot webpush
import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' }

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  const supabase = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '')
  const now = new Date().toISOString()
  const { data: rows, error } = await supabase.from('push_queue').select('id,user_id,payload').lte('due_at', now).eq('status','pending').limit(50)
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...cors, 'Content-Type':'application/json' } })

  const results: any[] = []
  for (const row of rows ?? []) {
    try {
      // fetch user subscription
      const { data: subRow } = await supabase.from('push_subscriptions').select('push_subscription').eq('user_id', row.user_id).single()
      const subscription = subRow?.push_subscription
      if (!subscription) throw new Error('no subscription')

      // relay to app API to use existing sender
      const site = Deno.env.get('NEXT_PUBLIC_SITE_URL') ?? ''
      await fetch(`${site}/api/send-webpush`, {
        method: 'POST', headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({ userId: row.user_id, title: row.payload?.title, message: row.payload?.body, data: row.payload?.data })
      })

      await supabase.from('push_queue').update({ status:'sent', sent_at: new Date().toISOString() }).eq('id', row.id)
      results.push({ id: row.id, ok: true })
    } catch (e) {
      await supabase.from('push_queue').update({ status:'failed', error: String(e) }).eq('id', row.id)
      results.push({ id: row.id, ok: false, error: String(e) })
    }
  }

  return new Response(JSON.stringify({ ok: true, processed: results.length, results }), { headers: { ...cors, 'Content-Type':'application/json' } })
})

