import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({
    script: `
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(function(registrations) {
          for(let registration of registrations) {
            registration.unregister();
            process.env.NODE_ENV === 'development' && console.log('[SW] Unregistered:', registration.scope);
          }
          
          // 새로운 서비스 워커 등록
          setTimeout(() => {
            navigator.serviceWorker.register('/firebase-messaging-sw.js?v=5.0')
              .then(reg => process.env.NODE_ENV === 'development' && console.log('[SW] Re-registered:', reg.scope))
              .catch(err => console.error('[SW] Re-registration failed:', err));
          }, 1000);
        });
      }
    `,
    message: 'Service Worker force update script'
  });
}

export async function GET() {
  return NextResponse.json({
    status: 'Force SW Update API ready',
    description: 'POST to get service worker update script'
  });
}