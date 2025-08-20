import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  try {
    const { id, userId, dueAt, payload } = await req.json()
    if (!id || !userId || !dueAt || !payload) {
      return NextResponse.json({ error: 'id, userId, dueAt, payload required' }, { status: 400 })
    }
    const supabase = createRouteHandlerClient({ cookies })
    const { error } = await supabase.from('push_queue').insert({ id, user_id: userId, due_at: dueAt, payload })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'unknown' }, { status: 500 })
  }
}

