import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';

// VAPID 설정 (새로운 키로 직접 설정)
const vapidKeys = {
  publicKey: 'BPkvztDqKmqVqzYmBJTbGpATHDHXKBTukcbOGUd_z4dzaHSd2icshWEaEtUke2RphUjEQql2s5lhLTNxQlLsnXk',
  privateKey: 'ZIaSEZS0_Qfw2JPMl0uIcPFnhIYhcJRtys0fz_jq0ms'
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
