import { serve } from "https://deno.land/std@0.208.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// 테스트용 FCM 알림 전송
const sendTestFCMNotification = async (fcmToken: string) => {
  const fcmUrl = 'https://fcm.googleapis.com/fcm/send'
  
  const message = {
    to: fcmToken,
    notification: {
      title: '테스트 알림',
      body: '백엔드 FCM 알림이 정상 작동합니다!',
      icon: '/favicon.ico',
      click_action: '/'
    },
    data: {
      url: '/',
      type: 'test'
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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 하드코딩된 FCM 토큰으로 테스트
    const testToken = "dcl5St_9AM9ENzEBpi_-qP:APA91bHBQlUJbs70mloYnAIyhDQJRGaZthA6z0F08vbJdN2KzwaC12MmOWCDdh_bkNvsmJUs-Xbq2kxLnWbzzjkBRh98aS9pFBZ006CLdutO7ZrWSlR9fMo"
    
    const success = await sendTestFCMNotification(testToken)
    
    return new Response(JSON.stringify({ 
      success,
      message: success ? 'Test notification sent!' : 'Failed to send notification'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})