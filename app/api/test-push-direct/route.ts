import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, title, message } = body;

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

    console.log('[Test] PWA CLOSED TEST - Found subscription for user:', userId);
    console.log('[Test] FCM Token available:', !!subscription.fcm_token);
    console.log('[Test] Web Push subscription available:', !!subscription.push_subscription);
    console.log('[Test] This notification should reach even when PWA is completely closed');

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
            notification: {
              title: title || '🚀 PWA 종료 테스트 성공!',
              body: message || 'PWA가 완전히 종료되어도 알림이 정상 작동합니다! 🎉',
              icon: '/favicon.ico',
              click_action: '/',
              require_interaction: true
            },
            data: {
              url: '/',
              type: 'test-direct'
            }
          })
        });

        const fcmResult = await fcmResponse.json();
        console.log('[Test] FCM Result:', fcmResult);

        results.push({
          method: 'FCM',
          success: fcmResponse.ok,
          result: fcmResult
        });
      } catch (error) {
        console.error('[Test] FCM Error:', error);
        results.push({
          method: 'FCM',
          success: false,
          error: error.message
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
            data: { url: '/', type: 'test-direct' }
          })
        });

        const webPushResult = await webPushResponse.json();
        console.log('[Test] Web Push Result:', webPushResult);

        results.push({
          method: 'Web Push',
          success: webPushResponse.ok,
          result: webPushResult
        });
      } catch (error) {
        console.error('[Test] Web Push Error:', error);
        results.push({
          method: 'Web Push',
          success: false,
          error: error.message
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
      { error: 'Internal server error', details: error.message },
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