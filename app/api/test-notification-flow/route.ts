import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Service Role로 RLS 우회
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();
    
    process.env.NODE_ENV === 'development' && console.log('=== AUTOMATED NOTIFICATION FLOW TEST ===');
    process.env.NODE_ENV === 'development' && console.log('Testing for user:', userId);

    // 사용자가 없으면 모든 구독 확인
    let query = supabaseAdmin.from('push_subscriptions').select('*');
    if (userId) {
      query = query.eq('user_id', userId);
    }
    
    // 1. Subscription check (FCM or WebPush)
    const { data: subscriptions, error: subError } = await query;

    process.env.NODE_ENV === 'development' && console.log('🔍 STEP 1: FCM Token Check');
    process.env.NODE_ENV === 'development' && console.log('Subscriptions found:', subscriptions?.length || 0);
    process.env.NODE_ENV === 'development' && console.log('Subscription data:', subscriptions);
    
    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json({
        success: false,
        step: 1,
        issue: 'No push subscription found',
        solution: 'Enable notifications first (create a web push subscription)'
      });
    }

    const subscription = subscriptions[0];
    const hasFCM = !!subscription.fcm_token;
    const hasWebPush = !!subscription.push_subscription;
    if (!hasFCM && !hasWebPush) {
      return NextResponse.json({
        success: false,
        step: 1,
        issue: 'No valid push channel (FCM/webpush)',
        solution: 'Re-enable notifications to create a push subscription'
      });
    }
    process.env.NODE_ENV === 'development' && console.log('✅ Channel:', { hasFCM, hasWebPush });

    // 2. Daily Summary 설정 확인
    const prefs = subscription.notification_preferences || {};
    process.env.NODE_ENV === 'development' && console.log('🔍 STEP 2: Daily Summary Settings Check');
    process.env.NODE_ENV === 'development' && console.log('Notification preferences:', prefs);
    
    const dailyEnabled = prefs.dailySummary === true || prefs.daily_summary === true || prefs.enabled === true;
    const dailyTime = prefs.dailySummaryTime || prefs.daily_summary_time || '08:30';
    process.env.NODE_ENV === 'development' && console.log('✅ Daily summary:', { dailyEnabled, dailyTime });

    // 3. 사용자 타이머 데이터 확인
    const { data: timers, error: timersError } = await supabaseAdmin
      .from('countdowns')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: true });

    process.env.NODE_ENV === 'development' && console.log('🔍 STEP 3: User Timer Data Check');
    process.env.NODE_ENV === 'development' && console.log('Timers found:', timers?.length || 0);
    process.env.NODE_ENV === 'development' && console.log('Timer data:', timers?.map(t => ({ title: t.title, date: t.date, hidden: t.hidden })));

    const visibleTimers = timers?.filter(timer => !timer.hidden) || [];
    process.env.NODE_ENV === 'development' && console.log('Visible timers:', visibleTimers.length);

    // 4. 백엔드 알림 함수 시뮬레이션
    process.env.NODE_ENV === 'development' && console.log('🔍 STEP 4: Backend Notification Simulation');
    
    // 타이머 분류
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const todayTimers = visibleTimers.filter(timer => {
      const timerDate = new Date(timer.date);
      return timerDate.toDateString() === today.toDateString();
    });

    const tomorrowTimers = visibleTimers.filter(timer => {
      const timerDate = new Date(timer.date);
      return timerDate.toDateString() === tomorrow.toDateString();
    });

    const thisWeekTimers = visibleTimers.filter(timer => {
      const timerDate = new Date(timer.date);
      return timerDate > tomorrow && timerDate <= nextWeek;
    });

    // 알림 내용 생성
    let summaryText = '';
    let hasContent = false;

    if (todayTimers.length > 0) {
      const todayDisplay = todayTimers.slice(0, 3).map(t => t.title).join(', ');
      summaryText += `오늘: ${todayDisplay}`;
      if (todayTimers.length > 3) {
        summaryText += ` 외 ${todayTimers.length - 3}개`;
      }
      summaryText += '\n';
      hasContent = true;
    }

    if (tomorrowTimers.length > 0) {
      const tomorrowDisplay = tomorrowTimers.slice(0, 3).map(t => t.title).join(', ');
      summaryText += `내일: ${tomorrowDisplay}`;
      if (tomorrowTimers.length > 3) {
        summaryText += ` 외 ${tomorrowTimers.length - 3}개`;
      }
      summaryText += '\n';
      hasContent = true;
    }

    if (thisWeekTimers.length > 0) {
      summaryText += `이번 주: ${thisWeekTimers.slice(0, 3).map(t => t.title).join(', ')}`;
      if (thisWeekTimers.length > 3) {
        summaryText += ` 외 ${thisWeekTimers.length - 3}개`;
      }
      hasContent = true;
    }

    if (!hasContent) {
      summaryText = '일주일 안에 예정된 타이머가 없습니다.';
    }

    process.env.NODE_ENV === 'development' && console.log('✅ Notification content generated:', summaryText);

    // 5. FCM 전송 시뮬레이션 (실제로는 보내지 않음)
    process.env.NODE_ENV === 'development' && console.log('🔍 STEP 5: FCM Send Simulation');
    process.env.NODE_ENV === 'development' && console.log('Would send FCM to token:', subscription.fcm_token.substring(0, 20) + '...');
    process.env.NODE_ENV === 'development' && console.log('Title: Daily summary');
    process.env.NODE_ENV === 'development' && console.log('Body:', summaryText);

    // 6. 시간 매칭 시뮬레이션
    const now = new Date();
    const userTimezone = prefs.timezone || 'UTC';
    const currentTime = now.toLocaleString('en-US', { 
      timeZone: userTimezone, 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
    
    process.env.NODE_ENV === 'development' && console.log('🔍 STEP 6: Time Matching Simulation');
    process.env.NODE_ENV === 'development' && console.log('User timezone:', userTimezone);
    process.env.NODE_ENV === 'development' && console.log('Current time:', currentTime);
    process.env.NODE_ENV === 'development' && console.log('Daily summary time:', dailyTime);
    
    const [targetHour, targetMinute] = dailyTime.split(':').map(Number);
    const [currentHour, currentMinute] = currentTime.split(':').map(Number);
    
    const targetMinutes = targetHour * 60 + targetMinute;
    const currentMinutes = currentHour * 60 + currentMinute;
    const timeDiff = Math.abs(targetMinutes - currentMinutes);
    
    process.env.NODE_ENV === 'development' && console.log('Time difference:', timeDiff, 'minutes');
    const wouldSend = timeDiff <= 2;
    process.env.NODE_ENV === 'development' && console.log('Would send notification now?', wouldSend);

    return NextResponse.json({
      success: true,
      testResults: {
        step1_subscription: {
          status: 'PASS',
          channel: hasFCM ? 'FCM' : 'WebPush'
        },
        step2_daily_summary: {
          status: dailyEnabled ? 'PASS' : 'INFO',
          enabled: dailyEnabled,
          time: dailyTime,
          timezone: userTimezone
        },
        step3_timer_data: {
          status: 'PASS',
          totalTimers: timers?.length || 0,
          visibleTimers: visibleTimers.length,
          todayCount: todayTimers.length,
          tomorrowCount: tomorrowTimers.length,
          thisWeekCount: thisWeekTimers.length
        },
        step4_notification_content: {
          status: 'PASS',
          title: 'Daily summary',
          body: summaryText,
          hasContent
        },
        step5_fcm_simulation: {
          status: 'PASS',
          wouldSendFCM: true
        },
        step6_time_matching: {
          status: wouldSend ? 'PASS' : 'INFO',
          currentTime,
          targetTime: prefs.dailySummaryTime,
          timeDifference: timeDiff,
          wouldSendNow: wouldSend
        }
      }
    });

  } catch (error) {
    console.error('Error in automated test:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}