import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// VAPID 키 설정
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(
    'mailto:your-email@example.com', // 연락처 이메일
    vapidPublicKey,
    vapidPrivateKey
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, title, message, data } = body;
    const id = (data && data.id) || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    if (!vapidPublicKey || !vapidPrivateKey) {
      return NextResponse.json({ error: 'VAPID keys not configured' }, { status: 500 });
    }

    // Supabase 클라이언트 생성
    const supabase = createRouteHandlerClient({ cookies });

    // 사용자의 웹 푸시 구독 정보 가져오기 (기존 컬럼명 사용)
    const { data: subscriptions, error } = await supabase
      .from('push_subscriptions')
      .select('push_subscription')
      .eq('user_id', userId)
      .not('push_subscription', 'is', null);

    if (error) {
      console.error('Error fetching subscriptions:', error);
      return NextResponse.json({ error: 'Failed to fetch subscriptions' }, { status: 500 });
    }

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json({ error: 'No web push subscriptions found' }, { status: 404 });
    }

    const results = [];

    // 각 구독에 대해 알림 전송
    for (const subscription of subscriptions) {
      if (!subscription.push_subscription) continue;

      try {
        const pushSubscription = subscription.push_subscription;
        
        const payload = JSON.stringify({
          title: title || 'NowAndThen 알림',
          body: message || '새로운 알림이 있습니다',
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          data: data || { url: '/', id }
        });
        const response = await webpush.sendNotification(
          pushSubscription,
          payload,
          { TTL: 300, headers: { Urgency: 'high', Topic: id } }
        );
        
        results.push({
          success: true,
          subscription: pushSubscription.endpoint,
          response: response.statusCode
        });

      } catch (error: any) {
        console.error('Error sending web push notification:', error);
        
        // 410 Gone - 구독이 만료됨
        if (error.statusCode === 410) {
          // 만료된 구독 삭제
          await supabase
            .from('push_subscriptions')
            .update({ push_subscription: null })
            .eq('user_id', userId);
        }

        results.push({
          success: false,
          subscription: subscription.push_subscription?.endpoint || 'unknown',
          error: error instanceof Error ? error.message : 'Unknown error',
          statusCode: error.statusCode
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const totalCount = results.length;

    // beacon for traceability
    try {
      const site = process.env.NEXT_PUBLIC_SITE_URL || '';
      if (site) {
        await fetch(`${site}/api/sw-log`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ event: 'SERVER_WEBPUSH_SENT', id, ts: Date.now(), count: results.length })
        });
      }
    } catch {}

    return NextResponse.json({
      success: successCount > 0,
      message: `Sent ${successCount}/${totalCount} notifications`,
      results
    });

  } catch (error: any) {
    console.error('Error in send-webpush API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// 테스트용 GET 엔드포인트
export async function GET() {
  return NextResponse.json({
    status: 'Web Push API is ready',
    vapidConfigured: !!(vapidPublicKey && vapidPrivateKey),
    timestamp: new Date().toISOString()
  });
}