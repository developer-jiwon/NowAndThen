import { serve } from "https://deno.land/std@0.208.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Web Push를 위한 VAPID 설정
const vapidPublicKey = Deno.env.get('NEXT_PUBLIC_VAPID_PUBLIC_KEY')
const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY')

// Base64 URL-safe decode
function base64UrlToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

// JWT 토큰 생성 (간단한 버전)
async function generateVAPIDJWT(audience: string): Promise<string> {
  if (!vapidPublicKey || !vapidPrivateKey) {
    throw new Error('VAPID keys not configured')
  }

  const header = {
    typ: 'JWT',
    alg: 'ES256'
  }

  const payload = {
    aud: audience,
    exp: Math.floor(Date.now() / 1000) + 12 * 60 * 60, // 12 hours
    sub: 'mailto:your-email@example.com'
  }

  const headerBase64 = btoa(JSON.stringify(header)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
  const payloadBase64 = btoa(JSON.stringify(payload)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
  
  const unsignedToken = `${headerBase64}.${payloadBase64}`
  
  // 실제 프로덕션에서는 crypto API를 사용해야 하지만, 
  // 간단한 구현을 위해 고정된 서명을 사용
  const signature = 'simplified_signature'
  
  return `${unsignedToken}.${signature}`
}

serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { subscription, payload } = await req.json()

    if (!subscription || !payload) {
      return new Response(
        JSON.stringify({ error: 'Missing subscription or payload' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('=== WEB PUSH SEND ATTEMPT ===')
    console.log('Subscription endpoint:', subscription.endpoint)
    console.log('Payload:', JSON.stringify(payload, null, 2))

    // Web Push 알림 전송
    const pushPayload = JSON.stringify({
      title: payload.title,
      body: payload.body,
      icon: payload.icon || '/favicon.ico',
      badge: payload.badge || '/favicon.ico',
      data: payload.data || {}
    })

    // 간단한 Web Push 구현 (실제로는 web-push 라이브러리 사용 권장)
    const url = new URL(subscription.endpoint)
    const audience = `${url.protocol}//${url.host}`
    
    try {
      // FCM endpoint인 경우 FCM API 사용
      if (subscription.endpoint.includes('fcm.googleapis.com')) {
        console.log('Using FCM endpoint for web push')
        
        const fcmUrl = subscription.endpoint
        const response = await fetch(fcmUrl, {
          method: 'POST',
          headers: {
            'TTL': '2419200',
            'Content-Type': 'application/json',
            'Authorization': `key=${Deno.env.get('FCM_SERVER_KEY')}`
          },
          body: pushPayload
        })

        if (!response.ok) {
          throw new Error(`FCM request failed: ${response.status} ${response.statusText}`)
        }

        console.log('✅ FCM Web Push sent successfully')
        return new Response(
          JSON.stringify({ success: true, method: 'fcm' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // 다른 endpoint의 경우 표준 Web Push API 시도
      console.log('Using standard Web Push API')
      
      const response = await fetch(subscription.endpoint, {
        method: 'POST',
        headers: {
          'TTL': '2419200',
          'Content-Type': 'application/octet-stream',
          'Content-Encoding': 'aes128gcm'
        },
        body: pushPayload
      })

      if (!response.ok) {
        throw new Error(`Web Push request failed: ${response.status} ${response.statusText}`)
      }

      console.log('✅ Standard Web Push sent successfully')
      return new Response(
        JSON.stringify({ success: true, method: 'standard' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )

    } catch (pushError) {
      console.error('Web Push send error:', pushError)
      
      // Fallback: 간단한 POST 요청
      console.log('Trying fallback method...')
      
      const fallbackResponse = await fetch(subscription.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: pushPayload
      })

      if (fallbackResponse.ok) {
        console.log('✅ Fallback Web Push sent successfully')
        return new Response(
          JSON.stringify({ success: true, method: 'fallback' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      throw new Error(`All methods failed. Last status: ${fallbackResponse.status}`)
    }

  } catch (error) {
    console.error('Web Push function error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        details: 'Check function logs for more information'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})