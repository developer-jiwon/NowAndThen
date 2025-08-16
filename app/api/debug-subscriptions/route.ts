import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Service Role로 RLS 우회
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    console.log('=== DEBUGGING SUBSCRIPTION ISSUE ===');

    // 1. 모든 구독 데이터 원시 조회
    const { data: allSubs, error: allError } = await supabaseAdmin
      .from('push_subscriptions')
      .select('*');

    console.log('🔍 RAW SUBSCRIPTIONS:');
    console.log('Total found:', allSubs?.length || 0);
    console.log('Error:', allError);
    console.log('Data:', JSON.stringify(allSubs, null, 2));

    if (!allSubs || allSubs.length === 0) {
      return NextResponse.json({
        issue: 'NO_SUBSCRIPTIONS_FOUND',
        details: 'No subscriptions exist in database',
        allSubs,
        allError
      });
    }

    // 2. 각 구독별 상세 분석
    const analysis = allSubs.map((sub, index) => {
      const prefs = sub.notification_preferences;
      
      console.log(`\n🔍 SUBSCRIPTION ${index + 1}:`);
      console.log('User ID:', sub.user_id);
      console.log('FCM Token exists:', !!sub.fcm_token);
      console.log('FCM Token length:', sub.fcm_token?.length || 0);
      console.log('Notification Preferences:', JSON.stringify(prefs, null, 2));
      console.log('Daily Summary enabled:', prefs?.dailySummary);
      console.log('Daily Summary type:', typeof prefs?.dailySummary);
      
      return {
        index: index + 1,
        user_id: sub.user_id,
        has_fcm_token: !!sub.fcm_token,
        fcm_token_length: sub.fcm_token?.length || 0,
        fcm_token_preview: sub.fcm_token?.substring(0, 20) + '...',
        notification_preferences: prefs,
        daily_summary_enabled: prefs?.dailySummary,
        daily_summary_type: typeof prefs?.dailySummary,
        daily_summary_time: prefs?.dailySummaryTime,
        timezone: prefs?.timezone
      };
    });

    // 3. 백엔드 로직 시뮬레이션
    console.log('\n🔍 SIMULATING BACKEND LOGIC:');
    
    const validSubscriptions = allSubs.filter(sub => {
      const prefs = sub.notification_preferences;
      const hasFcmToken = sub.fcm_token && sub.fcm_token !== null;
      const hasDailySummary = prefs && (prefs.dailySummary === true || prefs.dailySummary === 'true');
      
      console.log(`User ${sub.user_id}:`);
      console.log('  - Has FCM token:', hasFcmToken);
      console.log('  - Daily summary setting:', prefs?.dailySummary);
      console.log('  - Daily summary check:', hasDailySummary);
      console.log('  - Passes filter:', hasFcmToken && hasDailySummary);
      
      return hasFcmToken && hasDailySummary;
    });

    console.log('\n✅ FILTER RESULTS:');
    console.log('Valid subscriptions:', validSubscriptions.length);
    console.log('This should be subscriptionsChecked value');

    return NextResponse.json({
      success: true,
      debug: {
        totalSubscriptions: allSubs.length,
        validSubscriptions: validSubscriptions.length,
        analysis,
        validSubscriptionIds: validSubscriptions.map(sub => sub.user_id),
        explanation: validSubscriptions.length === 0 ? 
          'No subscriptions pass the filter (FCM token AND daily summary enabled)' :
          `${validSubscriptions.length} subscriptions should receive notifications`
      }
    });

  } catch (error) {
    console.error('Error in debug subscriptions:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}