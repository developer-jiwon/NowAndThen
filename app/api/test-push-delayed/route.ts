import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';

// VAPID 설정 (.env.local과 일치)
const vapidKeys = {
	publicKey: 'BAh0YkNpMzFaTleGijr-4mvzLp3TA7-3E_V225OS1L-JJHWMO_eYcFH8o3wD6SxHGnwobqXwSdta4zXTzQDro6s',
	privateKey: 'YifvATCN0RY1vHfdbqh7nj4rWtrX3KVsc9ER4dw2uks'
};

webpush.setVapidDetails(
	'mailto:dev.jiwonnie@gmail.com',
	vapidKeys.publicKey,
	vapidKeys.privateKey
);

export async function POST(request: NextRequest) {
	try {
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
