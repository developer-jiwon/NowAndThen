import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';

// VAPID 설정 (환경변수에서 가져오기)
const vapidKeys = {
  publicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '',
  privateKey: process.env.VAPID_PRIVATE_KEY || ''
};

webpush.setVapidDetails(
  'mailto:dev.jiwonnie@gmail.com',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

export async function POST(request: NextRequest) {
  try {
    const { subscription } = await request.json();
    
    if (!subscription) {
      return NextResponse.json(
        { error: 'Push subscription is required' },
        { status: 400 }
      );
    }

    console.log('[API] Scheduling delayed push notification...');
    
    // 20초 후 푸시 전송
    setTimeout(async () => {
      try {
        const payload = {
          title: 'NowAndThen 테스트 알림',
          body: '20초 후 푸시 알림이 도착했습니다! 🎉',
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
    }, 20000); // 20초
    
    return NextResponse.json({ 
      success: true, 
      message: 'Delayed push notification scheduled for 20 seconds from now'
    });
    
  } catch (error) {
    console.error('[API] Failed to schedule delayed push:', error);
    
    return NextResponse.json(
      { error: 'Failed to schedule delayed push notification' },
      { status: 500 }
    );
  }
}
