import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Simple in-memory ring buffer (best-effort; persists per warm instance)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const g = globalThis as any;
if (!g.__SW_LOGS__) {
	g.__SW_LOGS__ = [] as Array<Record<string, unknown>>;
}
const LOGS: Array<Record<string, unknown>> = g.__SW_LOGS__;
const LIMIT = 1000;

export async function POST(req: NextRequest) {
	try {
		const body = await req.json();
		const entry = { ts: Date.now(), ...body } as Record<string, unknown>;
		LOGS.push(entry);
		if (LOGS.length > LIMIT) LOGS.splice(0, LOGS.length - LIMIT);
		console.log('[SW-LOG]', JSON.stringify(entry));
		return NextResponse.json({ ok: true });
	} catch (e) {
		console.error('[SW-LOG] parse error', e);
		return NextResponse.json({ ok: false }, { status: 400 });
	}
}

export async function GET() {
	return NextResponse.json({ ok: true, lines: LOGS });
}
