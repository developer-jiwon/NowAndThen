import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  try {
    const { id, userId, dueAt, payload } = await req.json()
    if (!id || !userId || !dueAt || !payload) {
      return NextResponse.json({ error: 'id, userId, dueAt, payload required' }, { status: 400 })
    }
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string
    if (!url || !serviceKey) {
      return NextResponse.json({ error: 'Service credentials missing' }, { status: 500 })
    }
    const supabase = createClient(url, serviceKey)
    const { error } = await supabase.from('push_queue').insert({ id, user_id: userId, due_at: dueAt, payload })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'unknown' }, { status: 500 })
  }
}

