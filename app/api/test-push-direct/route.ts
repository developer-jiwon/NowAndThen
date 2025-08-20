import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    // 환경변수 체크
    process.env.NODE_ENV === 'development' && console.log('🔧 [Config Check] FCM_SERVER_KEY exists:', !!process.env.FCM_SERVER_KEY);
    process.env.NODE_ENV === 'development' && console.log('🔧 [Config Check] NEXT_PUBLIC_SITE_URL:', process.env.NEXT_PUBLIC_SITE_URL);
    process.env.NODE_ENV === 'development' && console.log('🔧 [Config Check] VAPID keys:', {
      public: !!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      private: !!process.env.VAPID_PRIVATE_KEY
    });
    
    const body = await request.json();
    const { userId, title, message, delayMs } = body;
    const pushId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const supabase = createRouteHandlerClient({ cookies });

    // 사용자의 구독 정보 가져오기
    const { data: subscription, error } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !subscription) {
      return NextResponse.json({ error: 'No subscription found' }, { status: 404 });
    }

    process.env.NODE_ENV === 'development' && console.log('🚀 [PWA CLOSED TEST] Starting notification test for user:', userId);
    process.env.NODE_ENV === 'development' && console.log('📱 [PWA CLOSED TEST] FCM Token available:', !!subscription.fcm_token);
    process.env.NODE_ENV === 'development' && console.log('🌐 [PWA CLOSED TEST] Web Push subscription available:', !!subscription.push_subscription);
    process.env.NODE_ENV === 'development' && console.log('⏰ [PWA CLOSED TEST] Current time:', new Date().toISOString());
    process.env.NODE_ENV === 'development' && console.log('🎯 [PWA CLOSED TEST] This notification MUST reach even when PWA is completely closed');
    
    // 구독 정보 상세 로깅
    if (subscription.fcm_token) {
      process.env.NODE_ENV === 'development' && console.log('🔑 [FCM] Token exists, length:', subscription.fcm_token.length);
    }
    if (subscription.push_subscription) {
      process.env.NODE_ENV === 'development' && console.log('🔔 [WebPush] Subscription endpoint:', subscription.push_subscription.endpoint?.substring(0, 50) + '...');
    }

    let results = [];

    // Firebase FCM 시도
    if (subscription.fcm_token) {
      try {
        const fcmResponse = await fetch('https://fcm.googleapis.com/fcm/send', {
          method: 'POST',
          headers: {
            'Authorization': `key=${process.env.FCM_SERVER_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: subscription.fcm_token,
            priority: 'high',  // 높은 우선순위 (PWA 종료 상태에서 필수)
            notification: {
              title: title || '🚀 PWA 종료 테스트 성공!',
              body: message || 'PWA가 완전히 종료되어도 알림이 정상 작동합니다! 🎉',
              icon: '/favicon.ico',
              click_action: '/',
              require_interaction: true
            },
            data: {
              url: '/',
              type: 'server-test',
              timestamp: Date.now().toString(),
              priority: 'high',
              delayMs: typeof delayMs === 'number' ? Math.max(0, Math.min(60000, delayMs)) : 0,
              id: pushId
            },
            // Android 전용 설정
            android: {
              priority: 'high',
              notification: {
                channel_id: 'default',
                priority: 'high',
                visibility: 'public'
              }
            },
            // 웹푸시 전용 설정
            webpush: {
              headers: {
                Urgency: 'high'
              },
              notification: {
                requireInteraction: true,
                silent: false
              }
            }
          })
        });

        const fcmResult = await fcmResponse.json();
        process.env.NODE_ENV === 'development' && console.log('📲 [FCM] Response status:', fcmResponse.status, fcmResponse.statusText);
        process.env.NODE_ENV === 'development' && console.log('📲 [FCM] Full result:', JSON.stringify(fcmResult, null, 2));
        
        if (fcmResponse.ok) {
          process.env.NODE_ENV === 'development' && console.log('✅ [FCM] Notification sent successfully! Should reach device even when PWA is closed.');
        } else {
          console.error('❌ [FCM] Notification failed:', fcmResult);
        }

        results.push({
          method: 'FCM',
          success: fcmResponse.ok,
          result: fcmResult,
          httpStatus: fcmResponse.status
        });
      } catch (error) {
        console.error('[Test] FCM Error:', error);
        results.push({
          method: 'FCM',
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // Web Push 시도
    if (subscription.push_subscription) {
      try {
        const webPushResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/send-webpush`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
            title: title || '🚀 PWA 종료 테스트 성공!',
            message: message || 'Web Push로 PWA 종료 상태에서도 알림 전달! 🚀',
            data: { url: '/', type: 'server-test', delayMs: typeof delayMs === 'number' ? Math.max(0, Math.min(60000, delayMs)) : 0, id: pushId }
          })
        });

        const webPushResult = await webPushResponse.json();
        process.env.NODE_ENV === 'development' && console.log('🌐 [WebPush] Response status:', webPushResponse.status, webPushResponse.statusText);
        process.env.NODE_ENV === 'development' && console.log('🌐 [WebPush] Full result:', JSON.stringify(webPushResult, null, 2));
        
        if (webPushResponse.ok) {
          process.env.NODE_ENV === 'development' && console.log('✅ [WebPush] Notification sent successfully! Should reach device even when PWA is closed.');
        } else {
          console.error('❌ [WebPush] Notification failed:', webPushResult);
        }

        results.push({
          method: 'Web Push',
          success: webPushResponse.ok,
          result: webPushResult,
          httpStatus: webPushResponse.status
        });
      } catch (error) {
        console.error('[Test] Web Push Error:', error);
        results.push({
          method: 'Web Push',
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return NextResponse.json({
      success: results.some(r => r.success),
      subscription: {
        hasFirebase: !!subscription.fcm_token,
        hasWebPush: !!subscription.push_subscription,
        preferences: subscription.notification_preferences
      },
      results,
      message: '✅ PWA를 완전히 종료하고 10초 후 알림을 확인하세요! (앱을 최근 앱 목록에서도 제거해주세요)'
    });

  } catch (error: any) {
    console.error('Error in test-push-direct:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'PWA Push Test API ready',
    description: 'POST with userId to test PWA closed notifications',
    timestamp: new Date().toISOString()
  });
}