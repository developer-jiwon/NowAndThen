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
}

// Send Web Push notification
const sendWebPushNotification = async (subscription: any, payload: NotificationPayload) => {
  // Web Push는 외부 라이브러리가 필요하므로 일단 HTTP API 호출로 처리
  const webPushUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/send-webpush-notification`
  
  const message = {
    subscription: subscription,
    payload: {
      title: payload.title,
      body: payload.body,
      icon: '/favicon.ico',
      data: {
        url: payload.url || '/',
        type: 'daily_summary'
      }
    }
  }

  console.log('=== WEB PUSH REQUEST ===')
  console.log('Web Push URL:', webPushUrl)
  console.log('Web Push Message:', JSON.stringify(message, null, 2))

  try {
    const response = await fetch(webPushUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    })

    console.log('=== WEB PUSH RESPONSE ===')
    console.log('Status:', response.status)
    console.log('Status Text:', response.statusText)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Web Push error:', errorText)
      return { success: false, error: errorText }
    }

    const result = await response.json()
    console.log('Web Push result:', result)
    return { success: true, result }

  } catch (error) {
    console.error('Web Push fetch error:', error)
    return { success: false, error: error.message }
  }
}

// Send Firebase FCM notification
const sendFCMNotification = async (fcmToken: string, payload: NotificationPayload) => {
  const fcmUrl = 'https://fcm.googleapis.com/fcm/send'
  
  const message = {
    to: fcmToken,
    notification: {
      title: payload.title,
      body: payload.body,
      icon: '/favicon.ico',
      click_action: payload.url || '/'
    },
    data: {
      url: payload.url || '/',
      type: 'daily_summary'
    }
  }

  console.log('=== FCM REQUEST ===')
  console.log('FCM URL:', fcmUrl)
  console.log('FCM Message:', JSON.stringify(message, null, 2))
  console.log('FCM Server Key exists:', !!Deno.env.get('FCM_SERVER_KEY'))

  const response = await fetch(fcmUrl, {
    method: 'POST',
    headers: {
      'Authorization': `key=${Deno.env.get('FCM_SERVER_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  })

  console.log('=== FCM RESPONSE ===')
  console.log('Status:', response.status)
  console.log('Status Text:', response.statusText)
  
  if (!response.ok) {
    const errorText = await response.text()
    console.error('FCM Error Response:', errorText)
  } else {
    const responseData = await response.text()
    console.log('FCM Success Response:', responseData)
  }

  return response.ok
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    console.log('Starting daily summary notifications...')

    // Service Role로 RLS 무시하고 모든 구독 가져오기
    const { data: allSubscriptions, error: subsError } = await supabaseClient
      .from('push_subscriptions')
      .select('*')

    const subscriptions = allSubscriptions?.filter(sub => {
      const prefs = sub.notification_preferences
      const hasFcmToken = sub.fcm_token && sub.fcm_token !== null
      const hasDailySummary = prefs && (prefs.dailySummary === true || prefs.dailySummary === 'true')
      return hasFcmToken && hasDailySummary
    }) || []

    if (subsError) {
      console.error('Error fetching subscriptions:', subsError)
      return new Response(JSON.stringify({ error: subsError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    console.log('=== DEBUG INFO ===')
    console.log('All subscriptions found:', allSubscriptions?.length || 0)
    console.log('Subscriptions with FCM token:', allSubscriptions?.filter(sub => sub.fcm_token !== null).length || 0)
    console.log('Sample subscription:', JSON.stringify(allSubscriptions?.[0], null, 2))
    console.log('Found subscriptions with daily summary enabled:', subscriptions?.length || 0)
    
    // Check each subscription individually
    allSubscriptions?.forEach((sub, index) => {
      console.log(`Subscription ${index}:`, {
        user_id: sub.user_id,
        has_fcm_token: !!sub.fcm_token,
        dailySummary: sub.notification_preferences?.dailySummary,
        dailySummaryType: typeof sub.notification_preferences?.dailySummary
      })
    })


    let notificationsSent = 0
    let errors = 0

    for (const subscription of subscriptions || []) {
      try {
        const userTimezone = subscription.notification_preferences?.timezone || 'UTC'
        const summaryTime = subscription.notification_preferences?.daily_summary_time || '09:00'
        
        // Check current time in user timezone
        const now = new Date()
        const userTime = new Intl.DateTimeFormat('en-CA', {
          timeZone: userTimezone,
          hour12: false,
          hour: '2-digit',
          minute: '2-digit'
        }).format(now)

        console.log(`User ${subscription.user_id}: timezone=${userTimezone}, target=${summaryTime}, current=${userTime}`)

        // Compare set time with current time (±2 minutes allowed)
        const [targetHour, targetMinute] = summaryTime.split(':').map(Number)
        const [currentHour, currentMinute] = userTime.split(':').map(Number)
        
        const targetMinutes = targetHour * 60 + targetMinute
        const currentMinutes = currentHour * 60 + currentMinute
        const timeDiff = Math.abs(targetMinutes - currentMinutes)

        // Skip if not within 2 minutes
        if (timeDiff > 2) {
          console.log(`Skipping user ${subscription.user_id}: time diff ${timeDiff} minutes`)
          continue
        }

        console.log(`Sending daily summary to user ${subscription.user_id}`)

        // Fetch timers for this user
        const { data: timers, error: timersError } = await supabaseClient
          .from('countdowns')
          .select('*')
          .eq('user_id', subscription.user_id)
          .eq('hidden', false)
          .order('date', { ascending: true })

        if (timersError) {
          console.error(`Error fetching timers for user ${subscription.user_id}:`, timersError)
          errors++
          continue
        }

        // Categorize timers for today, tomorrow, and this week
        const today = new Date()
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)
        const nextWeek = new Date(today)
        nextWeek.setDate(nextWeek.getDate() + 7)

        const todayTimers = timers?.filter(timer => {
          const timerDate = new Date(timer.date)
          return timerDate.toDateString() === today.toDateString()
        }) || []

        const tomorrowTimers = timers?.filter(timer => {
          const timerDate = new Date(timer.date)
          return timerDate.toDateString() === tomorrow.toDateString()
        }) || []

        const thisWeekTimers = timers?.filter(timer => {
          const timerDate = new Date(timer.date)
          return timerDate > tomorrow && timerDate <= nextWeek
        }) || []

        // Generate summary message
        let summaryText = ''
        let hasContent = false

        if (todayTimers.length > 0) {
          const todayDisplay = todayTimers.slice(0, 3).map(t => t.title).join(', ')
          summaryText += `Today: ${todayDisplay}`
          if (todayTimers.length > 3) {
            summaryText += ` and ${todayTimers.length - 3} more`
          }
          summaryText += '\n'
          hasContent = true
        }

        if (tomorrowTimers.length > 0) {
          const tomorrowDisplay = tomorrowTimers.slice(0, 3).map(t => t.title).join(', ')
          summaryText += `Tomorrow: ${tomorrowDisplay}`
          if (tomorrowTimers.length > 3) {
            summaryText += ` and ${tomorrowTimers.length - 3} more`
          }
          summaryText += '\n'
          hasContent = true
        }

        if (thisWeekTimers.length > 0) {
          summaryText += `This week: ${thisWeekTimers.slice(0, 3).map(t => t.title).join(', ')}`
          if (thisWeekTimers.length > 3) {
            summaryText += ` and ${thisWeekTimers.length - 3} more`
          }
          hasContent = true
        }

        if (!hasContent) {
          summaryText = 'No timers scheduled within the next week.'
        }

        const payload: NotificationPayload = {
          title: 'Daily Timer Summary',
          body: summaryText,
          url: '/'
        }

        console.log('=== NOTIFICATION PAYLOAD ===')
        console.log('Title:', payload.title)
        console.log('Body:', payload.body)
        console.log('FCM Token:', subscription.fcm_token?.substring(0, 20) + '...')
        console.log('Web Push Subscription:', !!subscription.webpush_subscription)
        console.log('Notification Method:', subscription.notification_method)
        console.log('Full notification content:')
        console.log(JSON.stringify(payload, null, 2))

        let sent = false

        // Try Firebase FCM first
        if (subscription.fcm_token && (subscription.notification_method === 'firebase' || !subscription.notification_method)) {
          console.log('Attempting FCM notification...')
          const fcmSent = await sendFCMNotification(subscription.fcm_token, payload)
          if (fcmSent) {
            sent = true
            console.log(`✅ FCM Daily summary sent to user ${subscription.user_id}`)
          }
        }

        // Try Web Push (if Firebase fails or web push only)
        if (!sent && subscription.webpush_subscription) {
          console.log('Attempting Web Push notification...')
          const webPushResult = await sendWebPushNotification(subscription.webpush_subscription, payload)
          if (webPushResult.success) {
            sent = true
            console.log(`✅ Web Push Daily summary sent to user ${subscription.user_id}`)
          }
        }
        
        if (sent) {
          notificationsSent++
          console.log(`📱 Notification content: "${payload.title}" - "${payload.body}"`)
        } else {
          errors++
          console.error(`❌ Failed to send daily summary to user ${subscription.user_id} (no working method)`)
        }

      } catch (error) {
        console.error(`Error processing user ${subscription.user_id}:`, error)
        errors++
      }
    }

    const result = {
      success: true,
      subscriptionsChecked: subscriptions?.length || 0,
      notificationsSent,
      errors,
      timestamp: new Date().toISOString()
    }

    console.log('Daily summary batch completed:', result)

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Error in send-daily-summary function:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})