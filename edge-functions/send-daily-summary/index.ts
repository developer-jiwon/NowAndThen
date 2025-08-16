import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

// Firebase FCM 알림 전송
const sendFCMNotification = async (fcmToken, payload) => {
  const fcmUrl = 'https://fcm.googleapis.com/fcm/send';
  const message = {
    to: fcmToken,
    notification: {
      title: payload.title,
      body: payload.body,
      icon: '/icon-192x192.png',
      click_action: payload.url || '/'
    },
    data: {
      url: payload.url || '/',
      type: 'daily_summary'
    }
  };
  
  try {
    const response = await fetch(fcmUrl, {
      method: 'POST',
      headers: {
        'Authorization': `key=${Deno.env.get('FCM_SERVER_KEY')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(message)
    });
    
    if (!response.ok) {
      console.error('FCM request failed:', response.status, response.statusText);
      return false;
    }
    
    const result = await response.json();
    console.log('FCM response:', result);
    return result.success === 1;
  } catch (error) {
    console.error('FCM error:', error);
    return false;
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '', 
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    console.log('Starting daily summary notifications...');
    
    // 먼저 테이블 구조 확인
    const { data: tableInfo, error: tableError } = await supabaseClient
      .from('push_subscriptions')
      .select('*')
      .limit(1);
    
    if (tableError) {
      console.error('Error accessing push_subscriptions table:', tableError);
      return new Response(JSON.stringify({ error: tableError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    console.log('Table structure sample:', tableInfo?.[0]);
    
    // 모든 구독 가져오기 (필터링 없이)
    const { data: allSubscriptions, error: subsError } = await supabaseClient
      .from('push_subscriptions')
      .select('*')
      .not('fcm_token', 'is', null);
    
    if (subsError) {
      console.error('Error fetching subscriptions:', subsError);
      return new Response(JSON.stringify({ error: subsError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    console.log('Total subscriptions found:', allSubscriptions?.length || 0);
    
    // daily summary가 활성화된 구독들 필터링
    const activeSubscriptions = allSubscriptions?.filter(sub => {
      try {
        // 여러 가능한 경로 시도
        const prefs = sub.notification_preferences || sub.preferences || sub.settings || {};
        
        // 방법 1: daily_summary boolean
        if (typeof prefs.daily_summary === 'boolean' && prefs.daily_summary) {
          return true;
        }
        
        // 방법 2: dailySummary boolean
        if (typeof prefs.dailySummary === 'boolean' && prefs.dailySummary) {
          return true;
        }
        
        // 방법 3: daily_summary_enabled boolean
        if (typeof prefs.daily_summary_enabled === 'boolean' && prefs.daily_summary_enabled) {
          return true;
        }
        
        return false;
      } catch (error) {
        console.error('Error parsing preferences for subscription:', sub.id, error);
        return false;
      }
    }) || [];
    
    console.log('Active daily summary subscriptions:', activeSubscriptions.length);
    
    let notificationsSent = 0;
    let errors = 0;
    
    for (const subscription of activeSubscriptions) {
      try {
        console.log('Processing subscription:', subscription.id);
        
        // 사용자 타임존과 시간 설정 가져오기
        const prefs = subscription.notification_preferences || subscription.preferences || subscription.settings || {};
        const userTimezone = prefs.timezone || prefs.userTimezone || 'UTC';
        const summaryTime = prefs.daily_summary_time || prefs.dailySummaryTime || '09:00';
        
        console.log(`User ${subscription.user_id}: timezone=${userTimezone}, target=${summaryTime}`);
        
        // 사용자 타임존에서 현재 시간 확인
        const now = new Date();
        const userTime = new Intl.DateTimeFormat('en-CA', {
          timeZone: userTimezone,
          hour12: false,
          hour: '2-digit',
          minute: '2-digit'
        }).format(now);
        
        console.log(`Current time in ${userTimezone}: ${userTime}`);
        
        // 설정된 시간과 현재 시간 비교 (±2분 허용)
        const [targetHour, targetMinute] = summaryTime.split(':').map(Number);
        const [currentHour, currentMinute] = userTime.split(':').map(Number);
        const targetMinutes = targetHour * 60 + targetMinute;
        const currentMinutes = currentHour * 60 + currentMinute;
        const timeDiff = Math.abs(targetMinutes - currentMinutes);
        
        console.log(`Time difference: ${timeDiff} minutes`);
        
        // 2분 이내가 아니면 스킵
        if (timeDiff > 2) {
          console.log(`Skipping user ${subscription.user_id}: time diff ${timeDiff} minutes`);
          continue;
        }
        
        console.log(`Sending daily summary to user ${subscription.user_id}`);
        
        // 해당 사용자의 타이머들 가져오기
        const { data: timers, error: timersError } = await supabaseClient
          .from('countdowns')
          .select('*')
          .eq('user_id', subscription.user_id)
          .eq('hidden', false)
          .order('date', { ascending: true });
        
        if (timersError) {
          console.error(`Error fetching timers for user ${subscription.user_id}:`, timersError);
          errors++;
          continue;
        }
        
        // 요약 메시지 생성
        let summaryText = '오늘도 목표를 향해 나아가세요! 🌟';
        
        if (timers && timers.length > 0) {
          const activeTimers = timers.filter(timer => {
            const timerDate = new Date(timer.date);
            return timerDate > now;
          });
          
          if (activeTimers.length > 0) {
            summaryText = `활성 타이머: ${activeTimers.length}개\n`;
            summaryText += activeTimers.slice(0, 3).map(t => `• ${t.title}`).join('\n');
            if (activeTimers.length > 3) {
              summaryText += `\n... 외 ${activeTimers.length - 3}개`;
            }
          }
        }
        
        const payload = {
          title: '📅 오늘의 타이머 요약',
          body: summaryText,
          url: '/'
        };
        
        // FCM 알림 전송
        const fcmSent = await sendFCMNotification(subscription.fcm_token, payload);
        if (fcmSent) {
          notificationsSent++;
          console.log(`Daily summary sent to user ${subscription.user_id}`);
        } else {
          errors++;
          console.error(`Failed to send daily summary to user ${subscription.user_id}`);
        }
        
      } catch (error) {
        console.error(`Error processing user ${subscription.user_id}:`, error);
        errors++;
      }
    }
    
    const result = {
      success: true,
      totalSubscriptions: allSubscriptions?.length || 0,
      activeSubscriptions: activeSubscriptions.length,
      notificationsSent,
      errors,
      timestamp: new Date().toISOString()
    };
    
    console.log('Daily summary batch completed:', result);
    
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Error in send-daily-summary function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
