import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';

// VAPID 설정 (환경변수에서 가져오기)
const vapidKeys = {
  publicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '',
  privateKey: process.env.VAPID_PRIVATE_KEY || ''
};

webpush.setVapidDetails(
  'mailto:dev.jiwonnie@gmail.com',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

export async function POST(request: NextRequest) {
  try {
    const { subscription, payload } = await request.json();
    
    if (!subscription) {
      return NextResponse.json(
        { error: 'Push subscription is required' },
        { status: 400 }
      );
    }

    console.log('[API] Sending push notification to:', subscription.endpoint);
    
    // 푸시 전송
    const result = await webpush.sendNotification(
      subscription,
      JSON.stringify(payload)
    );
    
    console.log('[API] Push sent successfully:', result.statusCode);
    
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
