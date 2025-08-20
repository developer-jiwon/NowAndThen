import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// KST 기준 고정 스케줄
const TIMEZONE = 'Asia/Seoul';
const SLOTS = ['08:30', '17:20'];

function formatKSTNow(): { hhmm: string; yyyyMMdd: string } {
  const now = new Date();
  const hh = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', hour12: false, timeZone: TIMEZONE }).format(now);
  const mm = new Intl.DateTimeFormat('en-GB', { minute: '2-digit', timeZone: TIMEZONE }).format(now);
  const yyyy = new Intl.DateTimeFormat('en-GB', { year: 'numeric', timeZone: TIMEZONE }).format(now);
  const MM = new Intl.DateTimeFormat('en-GB', { month: '2-digit', timeZone: TIMEZONE }).format(now);
  const dd = new Intl.DateTimeFormat('en-GB', { day: '2-digit', timeZone: TIMEZONE }).format(now);
  return { hhmm: `${hh}:${mm}`, yyyyMMdd: `${yyyy}${MM}${dd}` };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  const { hhmm, yyyyMMdd } = formatKSTNow();
  const shouldRun = SLOTS.includes(hhmm);

  if (!shouldRun) {
    return new Response(JSON.stringify({ ok: true, skipped: true, hhmm }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // 대상 사용자 조회: 구독 존재 + 알림 활성화
  const { data: subs, error } = await supabase
    .from('push_subscriptions')
    .select('user_id, push_subscription, notification_preferences')
    .not('push_subscription', 'is', null);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const rows = (subs || []).filter((s: any) => {
    const p = s.notification_preferences || {};
    // enable flag: support both camelCase and snake_case
    const enabled = p.dailySummary === true || p.daily_summary === true || p.enabled === true;
    return enabled;
  });

  // 큐에 업서트 (중복 방지: 고정 ID)
  const inserts = rows.map((s: any) => ({
    id: `${s.user_id}-${yyyyMMdd}-${hhmm.replace(':','')}`,
    user_id: s.user_id,
    due_at: new Date().toISOString(),
    payload: {
      title: hhmm === '08:30' ? '아침 리마인더' : '저녁 리마인더',
      body: hhmm === '08:30' ? '오늘 계획을 시작해볼까요?' : '오늘 마무리할 일들을 확인해보세요.',
      url: '/',
      type: 'server-test',
      id: `${s.user_id}-${yyyyMMdd}-${hhmm.replace(':','')}`,
      delayMs: 0,
    },
  }));

  let inserted = 0;
  if (inserts.length > 0) {
    const { error: upsertErr } = await supabase
      .from('push_queue')
      .upsert(inserts, { onConflict: 'id', ignoreDuplicates: true });
    if (!upsertErr) inserted = inserts.length;
  }

  return new Response(
    JSON.stringify({ ok: true, hhmm, usersConsidered: rows.length, enqueued: inserted }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
});


