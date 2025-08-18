import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
	try {
		const body = await req.json();
		const ts = new Date(body?.ts || Date.now()).toISOString();
		console.log(`[SW-LOG ${ts}]`, JSON.stringify(body));
		return NextResponse.json({ ok: true });
	} catch (e) {
		console.error('[SW-LOG] parse error', e);
		return NextResponse.json({ ok: false }, { status: 400 });
	}
}
