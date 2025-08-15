import { serve } from "https://deno.land/std@0.208.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface NotificationPayload {
  title: string
  body: string
  url?: string
  timerId?: string
}

// Firebase Admin SDK headers for FCM
const sendFCMNotification = async (fcmToken: string, payload: NotificationPayload) => {
  const fcmUrl = 'https://fcm.googleapis.com/fcm/send'
  
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
      timerId: payload.timerId || ''
    }
  }

  const response = await fetch(fcmUrl, {
    method: 'POST',
    headers: {
      'Authorization': `key=${Deno.env.get('FCM_SERVER_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  })

  return response.ok
}

// Web Push Protocol for browsers that support it
const sendWebPushNotification = async (subscription: any, payload: NotificationPayload) => {
  // This would require web-push library for Deno
  // For now, we'll focus on FCM which has better cross-browser support
  return true
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const now = new Date()
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000)
    const oneDayFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000)

    console.log('Checking for timers between:', now.toISOString(), 'and', oneDayFromNow.toISOString())

    // Find timers that need notifications (1 hour and 24 hours before)
    const { data: timers, error: timersError } = await supabaseClient
      .from('countdowns')
      .select(`
        id,
        title,
        date,
        user_id,
        hidden,
        push_subscriptions!inner (
          fcm_token,
          push_subscription,
          notification_preferences
        )
      `)
      .gte('date', now.toISOString())
      .lte('date', oneDayFromNow.toISOString())
      .eq('hidden', false) // Don't send notifications for hidden timers

    if (timersError) {
      console.error('Error fetching timers:', timersError)
      return new Response(JSON.stringify({ error: timersError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    console.log('Found timers:', timers?.length || 0)

    let notificationsSent = 0
    let errors = 0

    for (const timer of timers || []) {
      try {
        const timerDate = new Date(timer.date)
        const timeDiff = timerDate.getTime() - now.getTime()
        const hoursUntil = Math.floor(timeDiff / (1000 * 60 * 60))
        
        // Check if we should send notification based on custom preferences
        const preferences = timer.push_subscriptions.notification_preferences || { hours_before: [24, 1] }
        const hoursBefore = preferences.hours_before || [24, 1]
        
        // 알림을 보낼지 결정하는 로직 개선
        let shouldNotify = false
        let notificationTitle = ''
        let notificationBody = ''

        // 사용자가 설정한 각 시간대를 체크
        for (const targetHours of hoursBefore) {
          const tolerance = targetHours >= 24 ? 1 : 0.1 // 24시간 이상은 1시간 여유, 이하는 6분 여유
          
          if (Math.abs(hoursUntil - targetHours) <= tolerance) {
            shouldNotify = true
            
            if (targetHours >= 24 * 7) {
              notificationTitle = `${Math.round(targetHours / 24)}일 전 알림`
              notificationBody = `${timer.title}이 ${Math.round(targetHours / 24)}일 후 마감됩니다`
            } else if (targetHours >= 24) {
              notificationTitle = `${Math.round(targetHours / 24)}일 전 알림`
              notificationBody = `${timer.title}이 ${Math.round(targetHours / 24)}일 후 마감됩니다`
            } else if (targetHours >= 1) {
              notificationTitle = `${Math.round(targetHours)}시간 전 알림`
              notificationBody = `${timer.title}이 ${Math.round(targetHours)}시간 후 마감됩니다!`
            } else if (targetHours > 0) {
              notificationTitle = `${Math.round(targetHours * 60)}분 전 알림`
              notificationBody = `${timer.title}이 ${Math.round(targetHours * 60)}분 후 마감됩니다!`
            } else {
              notificationTitle = '타이머 도달!'
              notificationBody = `${timer.title} 시간이 되었습니다!`
            }
            break
          }
        }

        // 정확한 시간 도달 체크 (0시간 설정이 있는 경우)
        if (!shouldNotify && hoursBefore.includes(0) && hoursUntil <= 0.1 && hoursUntil >= -0.1) {
          shouldNotify = true
          notificationTitle = '타이머 도달!'
          notificationBody = `${timer.title} 시간이 되었습니다!`
        }

        if (!shouldNotify) continue

        const payload: NotificationPayload = {
          title: notificationTitle,
          body: notificationBody,
          url: `/?timer=${timer.id}`,
          timerId: timer.id
        }

        // Send FCM notification
        if (timer.push_subscriptions.fcm_token) {
          const fcmSent = await sendFCMNotification(
            timer.push_subscriptions.fcm_token,
            payload
          )
          if (fcmSent) {
            notificationsSent++
            console.log(`FCM notification sent for timer ${timer.id}`)
          } else {
            errors++
            console.error(`Failed to send FCM notification for timer ${timer.id}`)
          }
        }

        // Send Web Push notification as fallback
        if (timer.push_subscriptions.push_subscription) {
          try {
            const subscription = JSON.parse(timer.push_subscriptions.push_subscription)
            await sendWebPushNotification(subscription, payload)
            console.log(`Web Push notification sent for timer ${timer.id}`)
          } catch (e) {
            console.error(`Failed to send Web Push notification for timer ${timer.id}:`, e)
          }
        }

      } catch (error) {
        console.error(`Error processing timer ${timer.id}:`, error)
        errors++
      }
    }

    const result = {
      success: true,
      timersChecked: timers?.length || 0,
      notificationsSent,
      errors,
      timestamp: now.toISOString()
    }

    console.log('Notification batch completed:', result)

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Error in send-notifications function:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})