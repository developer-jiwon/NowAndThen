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

  // 사용자들의 카운트다운 한 번에 로드
  const userIds = rows.map((r: any) => r.user_id);
  let countdownsByUser: Record<string, any[]> = {};
  if (userIds.length > 0) {
    const { data: cds } = await supabase
      .from('countdowns')
      .select('id,user_id,title,date,hidden,is_count_up')
      .in('user_id', userIds)
      .order('date', { ascending: true });
    for (const c of cds || []) {
      if (c.hidden) continue;
      (countdownsByUser[c.user_id] ||= []).push(c);
    }
  }

  function daysLeft(dateStr: string): number {
    try {
      const now = new Date();
      const target = new Date(dateStr);
      const ms = target.getTime() - now.getTime();
      return Math.ceil(ms / (1000 * 60 * 60 * 24));
    } catch {
      return 0;
    }
  }

  function pickMessage(userId: string): { title: string; body: string } {
    const list = countdownsByUser[userId] || [];
    if (list.length === 0) {
      return hhmm === '08:30'
        ? { title: '아침 리마인더', body: '오늘의 순간을 간단히 기록해볼까요?' }
        : { title: '저녁 리마인더', body: '오늘 남긴 순간이 있나요? 한 줄만 기록해요.' };
    }
    const enriched = list.map((c) => ({ ...c, d: daysLeft(c.date) }));
    const upcoming = enriched.filter((c) => c.d >= 0).sort((a,b) => a.d - b.d);
    let chosen = upcoming.length > 0
      ? upcoming[Math.floor(Math.random() * Math.min(5, upcoming.length))]
      : enriched[Math.floor(Math.random() * enriched.length)];

    const d = chosen.d;
    const dStr = d === 0 ? '오늘' : d > 0 ? `D-${d}` : `D+${Math.abs(d)}`;
    const title = `${dStr} · ${chosen.title}`;
    const body = hhmm === '08:30'
      ? '오늘의 순간을 기록해볼까요?'
      : '하루를 간단히 마무리해요.';
    return { title, body };
  }

  // 큐에 업서트 (중복 방지: 고정 ID) + 동적 메시지
  const inserts = rows.map((s: any) => {
    const id = `${s.user_id}-${yyyyMMdd}-${hhmm.replace(':','')}`;
    const msg = pickMessage(s.user_id);
    return {
      id,
      user_id: s.user_id,
      due_at: new Date().toISOString(),
      payload: {
        title: msg.title,
        body: msg.body,
        url: '/',
        type: 'reminder',
        id,
        delayMs: 0,
      },
    };
  });

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


