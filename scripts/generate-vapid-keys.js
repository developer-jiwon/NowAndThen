/**
 * VAPID 키 생성 스크립트
 * 
 * 실행 방법:
 * node scripts/generate-vapid-keys.js
 */

const webpush = require('web-push');

console.log('🔐 Generating VAPID keys for Web Push notifications...\n');

const vapidKeys = webpush.generateVAPIDKeys();

console.log('📋 Copy these keys to your .env.local file:\n');

console.log('# Web Push VAPID Keys (alternative to FCM)');
console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${vapidKeys.privateKey}`);

console.log('\n✅ VAPID keys generated successfully!');
console.log('\n📝 Important notes:');
console.log('1. Keep the private key secure and never expose it in client-side code');
console.log('2. The public key can be safely used in client-side code');
console.log('3. These keys are used for Web Push API authentication');
console.log('4. You only need to generate these once per project');

console.log('\n🔗 Next steps:');
console.log('1. Add these keys to your .env.local file');
console.log('2. Update your email in app/api/send-webpush/route.ts');
console.log('3. Test web push notifications in your app');