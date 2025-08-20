// Deno Edge Function: poll push_queue every minute and send single-shot webpush (direct send, no app dependency)
import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import webpush from 'https://esm.sh/web-push@3.6.7';

const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' };

// Configure VAPID
const vapidPublicKey = Deno.env.get('NEXT_PUBLIC_VAPID_PUBLIC_KEY');
const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY');
if (vapidPublicKey && vapidPrivateKey) {
  try {
    webpush.setVapidDetails('mailto:dev.jiwonnie@gmail.com', vapidPublicKey, vapidPrivateKey);
  } catch (_e) {
    // ignore, will error at send time
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  const now = new Date().toISOString();
  const { data: rows, error } = await supabase
    .from('push_queue')
    .select('id,user_id,payload')
    .lte('due_at', now)
    .eq('status', 'pending')
    .limit(50);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...cors, 'Content-Type': 'application/json' },
    });
  }

  const results: any[] = [];
  for (const row of rows ?? []) {
    try {
      // fetch user subscription
      const { data: subRow } = await supabase
        .from('push_subscriptions')
        .select('push_subscription')
        .eq('user_id', row.user_id)
        .single();
      const subscription = subRow?.push_subscription;
      if (!subscription) throw new Error('no subscription');

      const id = row.payload?.id || row.id;
      const payload = {
        title: row.payload?.title || 'Now & Then 알림',
        body: row.payload?.body || '',
        icon: row.payload?.icon || '/favicon.ico',
        badge: row.payload?.badge || '/favicon.ico',
        data: {
          url: row.payload?.url || '/',
          type: row.payload?.type || 'scheduled',
          id,
          timestamp: Date.now().toString(),
        },
      };

      if (!vapidPublicKey || !vapidPrivateKey) throw new Error('VAPID not configured');

      const res = await webpush.sendNotification(
        subscription,
        JSON.stringify(payload),
        { TTL: 120, headers: { Urgency: 'high', Topic: id } }
      );

      if (res.statusCode !== 201) throw new Error('webpush status ' + res.statusCode);

      await supabase
        .from('push_queue')
        .update({ status: 'sent', sent_at: new Date().toISOString() })
        .eq('id', row.id);
      results.push({ id: row.id, ok: true });
    } catch (e) {
      await supabase
        .from('push_queue')
        .update({ status: 'failed', error: String(e) })
        .eq('id', row.id);
      results.push({ id: row.id, ok: false, error: String(e) });
    }
  }

  return new Response(
    JSON.stringify({ ok: true, processed: results.length, results }),
    { headers: { ...cors, 'Content-Type': 'application/json' } }
  );
});

