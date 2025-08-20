import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Service Role로 RLS 우회
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    process.env.NODE_ENV === 'development' && console.log('=== FORCING DAILY SUMMARY TEST ===');

    // 현재 시간 + 1분으로 설정
    const now = new Date();
    const targetTime = new Date(now.getTime() + 60000); // 1분 후
    const timeString = targetTime.toTimeString().slice(0, 5); // HH:MM 형식
    
    process.env.NODE_ENV === 'development' && console.log('Current time:', now.toTimeString().slice(0, 5));
    process.env.NODE_ENV === 'development' && console.log('Target time (1 min later):', timeString);

    // 1. 모든 구독 찾기
    const { data: subscriptions, error: subError } = await supabaseAdmin
      .from('push_subscriptions')
      .select('*');

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No subscriptions found'
      });
    }

    process.env.NODE_ENV === 'development' && console.log('Found subscriptions:', subscriptions.length);

    // 2. 첫 번째 구독의 Daily Summary 시간을 1분 후로 강제 설정
    const subscription = subscriptions[0];
    const updatedPrefs = {
      ...subscription.notification_preferences,
      dailySummary: true,
      dailySummaryTime: timeString
    };

    const { error: updateError } = await supabaseAdmin
      .from('push_subscriptions')
      .update({
        notification_preferences: updatedPrefs,
        updated_at: new Date().toISOString()
      })
      .eq('id', subscription.id);

    if (updateError) {
      console.error('Update error:', updateError);
      return NextResponse.json({
        success: false,
        error: 'Failed to update notification time'
      });
    }

    process.env.NODE_ENV === 'development' && console.log('✅ Updated notification time to:', timeString);

    // 3. 백엔드 daily summary 함수 직접 호출해서 테스트
    const backendUrl = process.env.NEXT_PUBLIC_SUPABASE_URL + '/functions/v1/send-daily-summary';
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    process.env.NODE_ENV === 'development' && console.log('Calling backend function...');
    process.env.NODE_ENV === 'development' && console.log('URL:', backendUrl);
    process.env.NODE_ENV === 'development' && console.log('Has service key:', !!serviceKey);

    const backendResponse = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${serviceKey}`,
        'Content-Type': 'application/json'
      }
    });

    const backendResult = await backendResponse.text();
    process.env.NODE_ENV === 'development' && console.log('Backend response status:', backendResponse.status);
    process.env.NODE_ENV === 'development' && console.log('Backend response:', backendResult);

    let backendData;
    try {
      backendData = JSON.parse(backendResult);
    } catch (e) {
      backendData = { raw: backendResult };
    }

    return NextResponse.json({
      success: true,
      message: 'Daily summary test completed',
      details: {
        updatedTime: timeString,
        currentTime: now.toTimeString().slice(0, 5),
        targetUser: subscription.user_id,
        fcmToken: subscription.fcm_token?.substring(0, 20) + '...',
        backendResponse: {
          status: backendResponse.status,
          data: backendData
        }
      }
    });

  } catch (error) {
    console.error('Error in force daily summary:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}