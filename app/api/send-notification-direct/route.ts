import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    process.env.NODE_ENV === 'development' && console.log('=== SENDING DIRECT FCM NOTIFICATION ===');

    const fcmToken = "dcl5St_9AM9ENzEBpi_-qP:APA91bHBQlUJbs70mloYnAIyhDQJRGaZthA6z0F08vbJdN2KzwaC12MmOWCDdh_bkNvsmJUs-Xbq2kxLnWbzzjkBRh98aS9pFBZ006CLdutO7ZrWSlR9fMo";
    
    const message = {
      to: fcmToken,
      notification: {
        title: '오늘의 타이머 요약',
        body: '테스트: PWA 완전 종료 후 알림 테스트',
        icon: '/favicon.ico',
        click_action: '/'
      },
      data: {
        url: '/',
        type: 'test_direct'
      }
    };

    process.env.NODE_ENV === 'development' && console.log('Sending FCM message:', JSON.stringify(message, null, 2));

    const response = await fetch('https://fcm.googleapis.com/fcm/send', {
      method: 'POST',
      headers: {
        'Authorization': `key=${process.env.FCM_SERVER_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    const responseText = await response.text();
    
    process.env.NODE_ENV === 'development' && console.log('FCM Response Status:', response.status);
    process.env.NODE_ENV === 'development' && console.log('FCM Response:', responseText);

    return NextResponse.json({
      success: response.ok,
      status: response.status,
      response: responseText,
      message: response.ok ? 'Notification sent successfully!' : 'Failed to send notification'
    });

  } catch (error) {
    console.error('Error sending direct notification:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}