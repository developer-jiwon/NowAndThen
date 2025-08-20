import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();
    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
    const service = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
    if (!url || !service) return NextResponse.json({ error: 'service creds missing' }, { status: 500 });

    const supabase = createClient(url, service);
    const id = `${userId}-TEST-${Date.now()}`;
    const dueAt = new Date(Date.now() + 10000).toISOString();

    const { error } = await supabase.from('push_queue').insert({
      id,
      user_id: userId,
      due_at: dueAt,
      payload: {
        title: 'Reminder (test)',
        body: 'This should arrive in ~10s even if the PWA is closed.',
        url: '/',
        type: 'reminder',
        id,
        delayMs: 0,
      },
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, id, dueAt });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'unknown' }, { status: 500 });
  }
}


