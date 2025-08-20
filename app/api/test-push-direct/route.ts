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
    const { userId, title, message, delayMs, id: clientId } = body;
    const pushId = clientId || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

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

    // 즉시 발사는 하지 않음. 아래에서 서버 단일 지연 샷으로만 스케줄.
    const results: any[] = [];
    let fcmOk = false;
    let webpushOk = false;

    // Schedule a single delayed shot via internal API (10s) to avoid reliance on SW timers
    try {
      if (subscription.push_subscription) {
        fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/test-push-delayed`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subscription: subscription.push_subscription, id: pushId })
        }).catch(() => {});
      }
    } catch {}

    // server-side beacon for trace
    try {
      const site = process.env.NEXT_PUBLIC_SITE_URL || '';
      const payload = { event: 'SERVER_PUSH_SENT', id: pushId, fcmOk, webpushOk, delayMs: typeof delayMs === 'number' ? Math.max(0, Math.min(60000, delayMs)) : 0, ts: Date.now() };
      if (site) {
        fetch(`${site}/api/sw-log`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }).catch(() => {});
      }
    } catch {}

    return NextResponse.json({
      success: true,
      scheduled: true,
      subscription: {
        hasFirebase: !!subscription.fcm_token,
        hasWebPush: !!subscription.push_subscription,
        preferences: subscription.notification_preferences
      },
      results,
      message: '✅ 서버에서 10초 후 단일 푸시가 예약되었습니다.'
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