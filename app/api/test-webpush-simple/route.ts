import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const supabase = createRouteHandlerClient({ cookies });

    // 사용자의 알림 구독 정보 확인
    const { data: subscription, error } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      return NextResponse.json({
        success: false,
        step: 1,
        issue: 'No subscription found',
        solution: 'Enable notifications first',
        error: error.message
      });
    }

    const result = {
      success: true,
      subscription: {
        hasFirebase: !!subscription.fcm_token,
        hasWebPush: !!subscription.push_subscription,
        preferences: subscription.notification_preferences
      },
      timestamp: new Date().toISOString()
    };

    // 웹 푸시가 활성화되어 있으면 테스트 알림 전송
    if (subscription.push_subscription) {
      try {
        const webpushResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/send-webpush`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
            title: '웹 푸시 테스트',
            message: '순수 웹 푸시 알림이 정상 작동합니다! 🎉',
            data: { url: '/', type: 'test' }
          })
        });

        const webpushResult = await webpushResponse.json();
        result.webPushTest = webpushResult;

      } catch (error) {
        result.webPushTest = {
          success: false,
          error: 'Failed to send web push test'
        };
      }
    }

    return NextResponse.json(result);

  } catch (error: any) {
    console.error('Error in test-webpush-simple API:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'Web Push Test API is ready',
    description: 'POST with userId to test web push functionality',
    timestamp: new Date().toISOString()
  });
}