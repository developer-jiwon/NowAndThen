import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';

// VAPID 설정 (.env.local과 일치)
const vapidKeys = {
  publicKey: 'BAh0YkNpMzFaTleGijr-4mvzLp3TA7-3E_V225OS1L-JJHWMO_eYcFH8o3wD6SxHGnwobqXwSdta4zXTzQDro6s',
  privateKey: 'YifvATCN0RY1vHfdbqh7nj4rWtrX3KVsc9ER4dw2uks'
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

    process.env.NODE_ENV === 'development' && console.log('[API] Sending push notification to:', subscription.endpoint);
    
    // 푸시 전송
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
