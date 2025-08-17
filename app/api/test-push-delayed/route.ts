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
    
    console.log('[API] 🔍 Subscription data:', {
      hasSubscription: !!subscription,
      endpoint: subscription?.endpoint?.substring(0, 50) + '...',
      hasKeys: !!subscription?.keys
    });
    
    if (!subscription) {
      console.log('[API] ❌ No subscription provided');
      return NextResponse.json(
        { error: 'Push subscription is required' },
        { status: 400 }
      );
    }

    console.log('[API] ✅ Scheduling delayed push notification...');
    
    // 8초 후 푸시 전송
    setTimeout(async () => {
      try {
        const payload = {
          title: 'NowAndThen 테스트 알림',
          body: '8초 후 푸시 알림이 도착했습니다! 🎉',
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: 'test-delayed',
          requireInteraction: true,
          actions: [
            { action: 'view', title: '확인하기' },
            { action: 'dismiss', title: '닫기' }
          ],
          data: { url: '/' }
        };
        
        console.log('[API] Sending delayed push notification...');
        
        const result = await webpush.sendNotification(
          subscription,
          JSON.stringify(payload)
        );
        
        console.log('[API] Delayed push sent successfully:', result.statusCode);
        
      } catch (error) {
        console.error('[API] Delayed push failed:', error);
      }
    }, 8000); // 8초
    
    return NextResponse.json({ 
      success: true, 
      message: 'Delayed push notification scheduled for 8 seconds from now'
    });
    
  } catch (error) {
    console.error('[API] Failed to schedule delayed push:', error);
    
    return NextResponse.json(
      { error: 'Failed to schedule delayed push notification' },
      { status: 500 }
    );
  }
}
