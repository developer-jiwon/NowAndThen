import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// In-memory ring buffer per instance
const g = globalThis as {
  __SW_LOGS__?: Array<Record<string, unknown>>;
  __SW_SEQ__?: number;
};
if (!g.__SW_LOGS__) g.__SW_LOGS__ = [];
if (!g.__SW_SEQ__) g.__SW_SEQ__ = 0;
const LOGS: Array<Record<string, unknown>> = g.__SW_LOGS__;
const LIMIT = 1000;

export async function POST(req: NextRequest) {
	try {
		const body = await req.json();
		const entry = { seq: ++g.__SW_SEQ__!, ts: Date.now(), ...body } as Record<string, unknown>;
		LOGS.push(entry);
		if (LOGS.length > LIMIT) LOGS.splice(0, LOGS.length - LIMIT);
		process.env.NODE_ENV === 'development' && console.log('[SW-LOG]', JSON.stringify(entry));
		return NextResponse.json({ ok: true });
	} catch (e) {
		console.error('[SW-LOG] parse error', e);
		return NextResponse.json({ ok: false }, { status: 400 });
	}
}

export async function GET(req: NextRequest) {
	const url = new URL(req.url);
	const format = url.searchParams.get('format') || url.searchParams.get('fmt') || url.searchParams.get('f');
	if (format === 'txt' || format === 'text') {
		const lines = LOGS.map((e) => {
			const { seq } = e as { seq?: number };
			const pretty = JSON.stringify(e, null, 2);
			return `${seq ?? '?'}\n${pretty}`;
		});
		return new NextResponse(lines.join('\n\n'), {
			status: 200,
			headers: { 'Content-Type': 'text/plain; charset=utf-8' },
		});
	}
	return NextResponse.json({ ok: true, lines: LOGS });
}
