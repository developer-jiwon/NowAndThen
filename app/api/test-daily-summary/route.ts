import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Service Role로 RLS 우회
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { userId, testTime } = await req.json();
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    process.env.NODE_ENV === 'development' && console.log('=== TESTING DAILY SUMMARY FOR USER ===');
    process.env.NODE_ENV === 'development' && console.log('User ID:', userId);
    process.env.NODE_ENV === 'development' && console.log('Test time:', testTime);

    // Service Role 권한으로 사용자의 타이머들 가져오기
    const { data: timers, error: timersError } = await supabaseAdmin
      .from('countdowns')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: true });
      
    process.env.NODE_ENV === 'development' && console.log('Raw query result:', { timers, error: timersError });
    
    // 숨김 타이머 필터링은 코드에서 처리
    const visibleTimers = timers?.filter(timer => !timer.hidden) || [];

    if (timersError) {
      console.error('Error fetching timers:', timersError);
      return NextResponse.json({ error: 'Failed to fetch timers' }, { status: 500 });
    }

    process.env.NODE_ENV === 'development' && console.log('Found timers:', timers?.length || 0);
    process.env.NODE_ENV === 'development' && console.log('Visible timers:', visibleTimers?.length || 0);
    process.env.NODE_ENV === 'development' && console.log('Timer data:', visibleTimers);

    // 오늘, 내일, 이번 주 타이머들 분류
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const todayTimers = visibleTimers?.filter(timer => {
      const timerDate = new Date(timer.date);
      return timerDate.toDateString() === today.toDateString();
    }) || [];

    const tomorrowTimers = visibleTimers?.filter(timer => {
      const timerDate = new Date(timer.date);
      return timerDate.toDateString() === tomorrow.toDateString();
    }) || [];

    const thisWeekTimers = visibleTimers?.filter(timer => {
      const timerDate = new Date(timer.date);
      return timerDate > tomorrow && timerDate <= nextWeek;
    }) || [];

    // 요약 메시지 생성
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

    const result = {
      title: '오늘의 타이머 요약',
      body: summaryText,
      timersCount: visibleTimers?.length || 0,
      todayCount: todayTimers.length,
      tomorrowCount: tomorrowTimers.length,
      thisWeekCount: thisWeekTimers.length,
      hasContent,
      allTimers: visibleTimers?.map(t => ({ title: t.title, date: t.date })) || []
    };

    process.env.NODE_ENV === 'development' && console.log('=== NOTIFICATION RESULT ===');
    process.env.NODE_ENV === 'development' && console.log('Title:', result.title);
    process.env.NODE_ENV === 'development' && console.log('Body:', result.body);
    process.env.NODE_ENV === 'development' && console.log('Timers breakdown:', {
      total: result.timersCount,
      today: result.todayCount,
      tomorrow: result.tomorrowCount,
      thisWeek: result.thisWeekCount
    });

    return NextResponse.json(result);

  } catch (error) {
    console.error('Error in test-daily-summary:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}