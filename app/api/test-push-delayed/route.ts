import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';

function isAuthorized(req: NextRequest) {
  if (process.env.NODE_ENV !== 'production') return true;
  const token = req.headers.get('x-admin-token');
  return !!token && token === process.env.ADMIN_API_TOKEN;
}

const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails('mailto:admin@localhost', vapidPublicKey, vapidPrivateKey);
}

export async function POST(request: NextRequest) {
	try {
		if (!isAuthorized(request)) return NextResponse.json({ error: 'Not found' }, { status: 404 });
		process.env.NODE_ENV === 'development' && console.log('[API] 🚀 Delayed push request received');
		const { subscription, id: incomingId } = await request.json();
		if (!subscription) {
			return NextResponse.json({ error: 'Push subscription is required' }, { status: 400 });
		}

		const id = incomingId || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
		process.env.NODE_ENV === 'development' && console.log('[API] ⏱️ Scheduling single-shot (10s), id:', id);

		const send = async (label: string) => {
			const tag = `test-delayed-${id}`;
			const payload = {
				title: '이번엔 작동합니다.',
				body: '',
				icon: '/favicon.ico',
				badge: '/favicon.ico',
				tag,
				requireInteraction: true,
				actions: [
					{ action: 'view', title: '확인하기' },
					{ action: 'dismiss', title: '닫기' }
				],
				data: { url: '/', type: 'delayed-server', id, sentAt: Date.now(), shot: label, delayMs: 10000 }
			};
			if (!vapidPublicKey || !vapidPrivateKey) throw new Error('VAPID keys not configured');
			const result = await webpush.sendNotification(
				subscription,
				JSON.stringify(payload),
				{ TTL: 60, headers: { Urgency: 'high', Topic: id } }
			);
			process.env.NODE_ENV === 'development' && console.log(`[API] ✅ Shot ${label} sent:`, result.statusCode);
		};

		setTimeout(() => { send('A(10s)').catch(e => console.error('[API] ❌ Shot A failed:', e?.statusCode || e)); }, 10000);

		return NextResponse.json({ success: true, scheduled: [10000], id });
	} catch (error: any) {
		console.error('[API] ❌ Push failed:', error?.statusCode || error?.code || error);
		return NextResponse.json({ error: 'Failed to schedule push' }, { status: 500 });
	}
}
