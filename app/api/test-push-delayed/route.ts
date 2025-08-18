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
		console.log('[API] 🚀 Delayed push request received');
		const { subscription } = await request.json();
		if (!subscription) {
			return NextResponse.json({ error: 'Push subscription is required' }, { status: 400 });
		}

		const uniqueId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
		console.log('[API] ⏱️ Scheduling server delay 10s, id:', uniqueId);
		setTimeout(async () => {
			try {
				const tag = `test-delayed-${uniqueId}`;
				const payload = {
					title: 'NowAndThen 테스트 알림',
					body: '10초 후 푸시 알림이 도착했습니다! 🎉',
					icon: '/favicon.ico',
					badge: '/favicon.ico',
					tag,
					requireInteraction: true,
					actions: [
						{ action: 'view', title: '확인하기' },
						{ action: 'dismiss', title: '닫기' }
					],
					data: {
						url: '/',
						type: 'delayed-server',
						id: uniqueId,
						sentAt: Date.now()
					}
				};
				console.log('[API] 🚀 Sending delayed push now, id:', uniqueId, 'tag:', tag);
				const result = await webpush.sendNotification(
					subscription,
					JSON.stringify(payload),
					{ TTL: 60, headers: { Urgency: 'high', Topic: uniqueId } }
				);
				console.log('[API] ✅ Delayed push sent:', result.statusCode);
			} catch (error:any) {
				console.error('[API] ❌ Delayed push failed:', error?.statusCode || error?.code || error);
			}
		}, 10000);

		return NextResponse.json({ success: true, scheduledInMs: 10000, id: uniqueId });
	} catch (error: any) {
		console.error('[API] ❌ Push failed:', error?.statusCode || error?.code || error);
		return NextResponse.json({ error: 'Failed to schedule push' }, { status: 500 });
	}
}
