import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';

// Admin guard to prevent abuse in production
function isAuthorized(req: NextRequest) {
  if (process.env.NODE_ENV !== 'production') return true;
  const token = req.headers.get('x-admin-token');
  return !!token && token === process.env.ADMIN_API_TOKEN;
}

// Configure VAPID from env
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails('mailto:admin@localhost', vapidPublicKey, vapidPrivateKey);
}

export async function POST(request: NextRequest) {
  try {
    if (!isAuthorized(request)) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const { subscription, payload } = await request.json();
    
    if (!subscription) {
      return NextResponse.json(
        { error: 'Push subscription is required' },
        { status: 400 }
      );
    }

    process.env.NODE_ENV === 'development' && console.log('[API] Sending push notification to:', subscription.endpoint);
    
    // 푸시 전송
    if (!vapidPublicKey || !vapidPrivateKey) {
      return NextResponse.json({ error: 'VAPID keys not configured' }, { status: 500 });
    }
    const result = await webpush.sendNotification(
      subscription,
      JSON.stringify(payload)
    );
    
    process.env.NODE_ENV === 'development' && console.log('[API] Push sent successfully:', result.statusCode);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Push notification sent',
      statusCode: result.statusCode 
    });
    
  } catch (error) {
    console.error('[API] Push notification failed:', error);
    
    return NextResponse.json(
      { error: 'Failed to send push notification' },
      { status: 500 }
    );
  }
}
