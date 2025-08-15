# Push Notifications Setup Guide

이제 웹이 완전히 닫혀있어도 앱처럼 알림이 뜨는 시스템이 구현되었습니다! 🎉

## ✅ 구현된 기능들

### 1. **완전한 Push Notification 시스템**
- 웹 브라우저가 닫혀있어도 알림 수신
- Firebase Cloud Messaging (FCM) 기반
- Service Worker를 통한 백그라운드 처리

### 2. **자동 알림 스케줄링**
- 24시간 전: "내일 마감입니다"
- 1시간 전: "1시간 남았습니다!"
- 마감 시: "지금입니다!"
- 5분마다 자동 체크

### 3. **사용자 제어 시스템**
- 쉬운 알림 on/off 버튼
- 개인별 알림 설정 저장
- 브라우저 권한 관리

## 🔧 설정 방법

### 1. Firebase 프로젝트 생성
```bash
# Firebase Console에서:
1. 새 프로젝트 생성
2. Cloud Messaging 활성화
3. 웹 앱 추가
4. 설정값들을 .env.local에 추가
```

### 2. 환경변수 설정 (.env.local)
```bash
# Firebase 설정
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your_vapid_key

# FCM 서버 키 (Edge Functions용)
FCM_SERVER_KEY=your_fcm_server_key

# Supabase 서비스 키
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. 데이터베이스 마이그레이션
```bash
# Supabase에서 실행:
supabase/migrations/create_push_subscriptions.sql
```

### 4. Edge Functions 배포
```bash
# Supabase CLI로:
supabase functions deploy send-notifications
supabase functions deploy setup-cron
```

### 5. Cron Job 활성화
```bash
# setup-cron function 한번 실행하여 자동 스케줄링 시작
```

## 📱 사용자 경험

### 알림 활성화
1. 로그인 후 "Enable Alerts" 버튼 클릭
2. 브라우저에서 알림 허용
3. 자동으로 구독 완료!

### 알림 받기
- **앱 사용 중**: 화면 상단 토스트
- **앱 닫은 상태**: 시스템 알림 (진짜 앱처럼!)
- **알림 클릭**: 해당 타이머로 바로 이동

## 🔧 알림 설정 커스터마이징

```typescript
// 알림 시간 설정 (database의 notification_preferences)
{
  "deadlines": true,
  "reminders": true, 
  "daily_summary": false,
  "hours_before": [24, 1] // 24시간 전, 1시간 전
}
```

## 🚀 배포 체크리스트

- [ ] Firebase 프로젝트 생성 및 설정
- [ ] 환경변수 추가 (.env.local)
- [ ] Supabase 마이그레이션 실행
- [ ] Edge Functions 배포
- [ ] Cron Job 설정
- [ ] 테스트: 타이머 생성 → 1시간 후 설정 → 알림 확인

## 💡 주요 특징

- **크로스 플랫폼**: iOS Safari, Android Chrome, Desktop 모두 지원
- **배터리 효율**: 5분마다만 체크
- **사용자 친화적**: 원클릭 활성화/비활성화
- **데이터 절약**: 필요한 경우에만 알림 전송
- **안전한 권한**: 사용자가 직접 제어

이제 사용자들이 **진짜 앱처럼** 알림을 받을 수 있습니다! 🎯