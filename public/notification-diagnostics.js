/**
 * PWA 백그라운드 알림 종합 진단 스크립트
 * A부터 Z까지 모든 원인을 자동 분석
 */

class NotificationDiagnostics {
  constructor() {
    this.results = {
      browser: {},
      device: {},
      permissions: {},
      serviceWorker: {},
      fcm: {},
      webpush: {},
      pwa: {},
      limitations: []
    };
  }

  async runFullDiagnostics() {
    console.log('🔍 PWA 백그라운드 알림 종합 진단 시작...\n');
    
    await this.checkBrowserSupport();
    await this.checkDeviceInfo();
    await this.checkPermissions();
    await this.checkServiceWorkerStatus();
    await this.checkPWAStatus();
    await this.checkFCMSetup();
    await this.checkWebPushSetup();
    await this.checkKnownLimitations();
    
    return this.generateReport();
  }

  async checkBrowserSupport() {
    console.log('📱 1. 브라우저 지원 상태 체크...');
    
    this.results.browser = {
      notificationAPI: 'Notification' in window,
      serviceWorkerAPI: 'serviceWorker' in navigator,
      pushManagerAPI: 'PushManager' in window,
      userAgent: navigator.userAgent,
      isStandalone: window.matchMedia('(display-mode: standalone)').matches,
      isInApp: (window.navigator).standalone === true
    };

    // 브라우저별 특이사항
    const isChrome = /Chrome/i.test(navigator.userAgent);
    const isSafari = /Safari/i.test(navigator.userAgent) && !/Chrome/i.test(navigator.userAgent);
    const isFirefox = /Firefox/i.test(navigator.userAgent);
    const isEdge = /Edge/i.test(navigator.userAgent);

    this.results.browser.type = isChrome ? 'Chrome' : isSafari ? 'Safari' : isFirefox ? 'Firefox' : isEdge ? 'Edge' : 'Unknown';
    
    console.log('  ✓ Notification API:', this.results.browser.notificationAPI ? '지원' : '❌ 미지원');
    console.log('  ✓ Service Worker:', this.results.browser.serviceWorkerAPI ? '지원' : '❌ 미지원');
    console.log('  ✓ Push Manager:', this.results.browser.pushManagerAPI ? '지원' : '❌ 미지원');
    console.log('  ✓ 브라우저:', this.results.browser.type);
  }

  async checkDeviceInfo() {
    console.log('\n📱 2. 디바이스 정보 체크...');
    
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/i.test(navigator.userAgent);
    
    this.results.device = {
      isMobile,
      isIOS,
      isAndroid,
      isDesktop: !isMobile,
      platform: navigator.platform,
      hardwareConcurrency: navigator.hardwareConcurrency,
      onLine: navigator.onLine
    };

    console.log('  ✓ 디바이스 타입:', isMobile ? (isIOS ? 'iOS' : isAndroid ? 'Android' : 'Mobile') : 'Desktop');
    console.log('  ✓ 플랫폼:', this.results.device.platform);
    console.log('  ✓ 온라인 상태:', this.results.device.onLine ? '연결됨' : '❌ 오프라인');
  }

  async checkPermissions() {
    console.log('\n🔐 3. 권한 상태 체크...');
    
    if ('Notification' in window) {
      this.results.permissions.notification = Notification.permission;
      
      // 세부 권한 체크
      if ('permissions' in navigator) {
        try {
          const notifyPerm = await navigator.permissions.query({name: 'notifications'});
          this.results.permissions.detailed = notifyPerm.state;
        } catch (e) {
          this.results.permissions.detailed = 'unknown';
        }
      }
    }

    console.log('  ✓ 알림 권한:', this.results.permissions.notification);
    console.log('  ✓ 세부 권한:', this.results.permissions.detailed || 'N/A');
    
    if (this.results.permissions.notification === 'denied') {
      console.log('  ❌ 치명적 문제: 알림 권한이 거부됨');
      this.results.limitations.push('알림 권한 거부 - 시스템 설정에서 수동으로 변경 필요');
    }
  }

  async checkServiceWorkerStatus() {
    console.log('\n⚙️ 4. 서비스 워커 상태 체크...');
    
    if ('serviceWorker' in navigator) {
      try {
        // 등록된 서비스 워커들 체크
        const registrations = await navigator.serviceWorker.getRegistrations();
        this.results.serviceWorker.registrations = registrations.map(reg => ({
          scope: reg.scope,
          state: reg.active?.state,
          scriptURL: reg.active?.scriptURL
        }));

        // Firebase SW 체크
        const firebaseSW = registrations.find(reg => reg.scope.includes('firebase') || reg.active?.scriptURL.includes('firebase'));
        this.results.serviceWorker.firebase = !!firebaseSW;

        // WebPush SW 체크
        const webpushSW = registrations.find(reg => reg.active?.scriptURL.includes('webpush'));
        this.results.serviceWorker.webpush = !!webpushSW;

        // 활성 상태 체크
        this.results.serviceWorker.hasActive = registrations.some(reg => reg.active?.state === 'activated');

        console.log('  ✓ 등록된 SW 개수:', registrations.length);
        console.log('  ✓ Firebase SW:', this.results.serviceWorker.firebase ? '있음' : '❌ 없음');
        console.log('  ✓ WebPush SW:', this.results.serviceWorker.webpush ? '있음' : '❌ 없음');
        console.log('  ✓ 활성 SW:', this.results.serviceWorker.hasActive ? '있음' : '❌ 없음');

        if (registrations.length === 0) {
          this.results.limitations.push('서비스 워커가 등록되지 않음');
        }

      } catch (error) {
        this.results.serviceWorker.error = error.message;
        console.log('  ❌ SW 체크 실패:', error.message);
      }
    }
  }

  async checkPWAStatus() {
    console.log('\n📱 5. PWA 상태 체크...');
    
    this.results.pwa = {
      isStandalone: window.matchMedia('(display-mode: standalone)').matches,
      isInstalled: (window.navigator).standalone === true,
      hasManifest: !!document.querySelector('link[rel="manifest"]'),
      manifestUrl: document.querySelector('link[rel="manifest"]')?.href
    };

    // Manifest 파일 체크
    if (this.results.pwa.manifestUrl) {
      try {
        const response = await fetch(this.results.pwa.manifestUrl);
        const manifest = await response.json();
        this.results.pwa.manifest = {
          name: manifest.name,
          scope: manifest.scope,
          display: manifest.display,
          startUrl: manifest.start_url
        };
      } catch (e) {
        this.results.pwa.manifestError = e.message;
      }
    }

    console.log('  ✓ PWA 모드:', this.results.pwa.isStandalone ? '활성' : '❌ 비활성');
    console.log('  ✓ 설치 상태:', this.results.pwa.isInstalled ? '설치됨' : '브라우저');
    console.log('  ✓ Manifest:', this.results.pwa.hasManifest ? '있음' : '❌ 없음');

    if (this.results.device.isIOS && !this.results.pwa.isStandalone) {
      this.results.limitations.push('iOS는 PWA 모드에서만 백그라운드 알림 지원');
    }
  }

  async checkFCMSetup() {
    console.log('\n🔥 6. Firebase FCM 설정 체크...');
    
    try {
      // FCM 토큰 체크
      if (window.firebase && window.firebase.messaging) {
        const messaging = window.firebase.messaging();
        this.results.fcm.available = true;
        
        try {
          const token = await messaging.getToken();
          this.results.fcm.hasToken = !!token;
          this.results.fcm.tokenLength = token?.length;
        } catch (e) {
          this.results.fcm.tokenError = e.message;
        }
      } else {
        this.results.fcm.available = false;
        this.results.fcm.error = 'Firebase SDK not loaded';
      }

      console.log('  ✓ Firebase SDK:', this.results.fcm.available ? '로드됨' : '❌ 미로드');
      console.log('  ✓ FCM 토큰:', this.results.fcm.hasToken ? '있음' : '❌ 없음');
      
      if (this.results.fcm.tokenError) {
        console.log('  ❌ 토큰 에러:', this.results.fcm.tokenError);
        this.results.limitations.push(`FCM 토큰 문제: ${this.results.fcm.tokenError}`);
      }

    } catch (error) {
      this.results.fcm.error = error.message;
      console.log('  ❌ FCM 체크 실패:', error.message);
    }
  }

  async checkWebPushSetup() {
    console.log('\n🌐 7. Web Push 설정 체크...');
    
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      try {
        const registration = await navigator.serviceWorker.ready;
        
        if (registration.pushManager) {
          // 기존 구독 체크
          const subscription = await registration.pushManager.getSubscription();
          this.results.webpush.hasSubscription = !!subscription;
          
          if (subscription) {
            // Mask endpoint and keys to avoid leaking sensitive data in console
            const ep = subscription.endpoint || '';
            this.results.webpush.endpoint = ep ? ep.slice(0, 24) + '…' : '';
            this.results.webpush.keys = {
              p256dh: !!subscription.getKey('p256dh'),
              auth: !!subscription.getKey('auth')
            };
          }

          // VAPID 키 체크 (환경변수에서)
          this.results.webpush.vapidAvailable = !!(
            window.location.hostname === 'localhost' || 
            window.location.protocol === 'https:'
          );

        }

        console.log('  ✓ Push Manager:', !!registration.pushManager ? '지원' : '❌ 미지원');
        console.log('  ✓ 구독 상태:', this.results.webpush.hasSubscription ? '구독됨' : '❌ 미구독');
        console.log('  ✓ HTTPS/Localhost:', this.results.webpush.vapidAvailable ? '안전한 컨텍스트' : '❌ 불안전');

      } catch (error) {
        this.results.webpush.error = error.message;
        console.log('  ❌ WebPush 체크 실패:', error.message);
      }
    } else {
      this.results.webpush.supported = false;
      console.log('  ❌ Web Push API 미지원');
      this.results.limitations.push('Web Push API 미지원');
    }
  }

  async checkKnownLimitations() {
    console.log('\n⚠️ 8. 알려진 제한사항 체크...');
    
    // iOS Safari 제한사항
    if (this.results.device.isIOS) {
      if (!this.results.pwa.isStandalone) {
        this.results.limitations.push('iOS Safari: PWA로 설치된 경우에만 백그라운드 알림 지원');
      }
      if (this.results.browser.type === 'Safari') {
        this.results.limitations.push('iOS Safari: 시스템 알림 설정에서 Safari 알림 허용 필요');
      }
    }

    // Android Chrome 제한사항
    if (this.results.device.isAndroid) {
      this.results.limitations.push('Android Chrome: 배터리 최적화에서 Chrome 제외 필요');
      this.results.limitations.push('Android: 시스템 설정에서 Chrome 알림 허용 필요');
      this.results.limitations.push('Android: 방해금지 모드 확인 필요');
    }

    // 일반적인 제한사항
    if (!this.results.webpush.vapidAvailable) {
      this.results.limitations.push('HTTPS 또는 localhost 환경에서만 작동');
    }

    if (this.results.permissions.notification !== 'granted') {
      this.results.limitations.push('알림 권한이 granted 상태가 아님');
    }

    if (!this.results.serviceWorker.hasActive) {
      this.results.limitations.push('활성화된 서비스 워커가 없음');
    }

    console.log('  ⚠️ 발견된 제한사항:', this.results.limitations.length, '개');
    this.results.limitations.forEach((limitation, i) => {
      console.log(`    ${i + 1}. ${limitation}`);
    });
  }

  generateReport() {
    console.log('\n📊 ========== 진단 결과 리포트 ==========\n');
    
    const canWork = this.assessCapability();
    
    console.log('🎯 PWA 백그라운드 알림 가능 여부:', canWork.possible ? '✅ 가능' : '❌ 불가능');
    console.log('📈 신뢰도:', canWork.reliability);
    
    if (!canWork.possible) {
      console.log('\n🚫 차단 요인:');
      canWork.blockers.forEach((blocker, i) => {
        console.log(`  ${i + 1}. ${blocker}`);
      });
    }
    
    if (canWork.possible && this.results.limitations.length > 0) {
      console.log('\n⚠️ 주의사항:');
      this.results.limitations.forEach((limitation, i) => {
        console.log(`  ${i + 1}. ${limitation}`);
      });
    }

    console.log('\n🔧 권장 해결 방법:');
    this.generateRecommendations().forEach((rec, i) => {
      console.log(`  ${i + 1}. ${rec}`);
    });

    console.log('\n========================================\n');
    
    return {
      possible: canWork.possible,
      reliability: canWork.reliability,
      blockers: canWork.blockers,
      limitations: this.results.limitations,
      recommendations: this.generateRecommendations(),
      fullResults: this.results
    };
  }

  assessCapability() {
    const blockers = [];
    
    // 필수 조건들 체크
    if (!this.results.browser.notificationAPI) {
      blockers.push('브라우저가 Notification API를 지원하지 않음');
    }
    
    if (!this.results.browser.serviceWorkerAPI) {
      blockers.push('브라우저가 Service Worker를 지원하지 않음');
    }
    
    if (this.results.permissions.notification === 'denied') {
      blockers.push('알림 권한이 거부됨');
    }
    
    if (this.results.device.isIOS && !this.results.pwa.isStandalone) {
      blockers.push('iOS에서 PWA 모드가 아님');
    }
    
    if (!this.results.serviceWorker.hasActive) {
      blockers.push('활성화된 서비스 워커가 없음');
    }

    const possible = blockers.length === 0;
    let reliability = '높음';
    
    if (this.results.limitations.length > 3) {
      reliability = '낮음';
    } else if (this.results.limitations.length > 1) {
      reliability = '보통';
    }
    
    return { possible, reliability, blockers };
  }

  generateRecommendations() {
    const recommendations = [];
    
    if (this.results.permissions.notification !== 'granted') {
      recommendations.push('브라우저에서 알림 권한 허용');
    }
    
    if (this.results.device.isIOS && !this.results.pwa.isStandalone) {
      recommendations.push('iOS: 홈 화면에 추가하여 PWA 모드로 실행');
    }
    
    if (this.results.device.isAndroid) {
      recommendations.push('Android: 설정 → 앱 → Chrome → 알림 허용');
      recommendations.push('Android: 배터리 최적화에서 Chrome 제외');
    }
    
    if (!this.results.serviceWorker.firebase && !this.results.serviceWorker.webpush) {
      recommendations.push('서비스 워커 등록 및 활성화');
    }
    
    if (!this.results.fcm.hasToken && !this.results.webpush.hasSubscription) {
      recommendations.push('FCM 토큰 또는 WebPush 구독 생성');
    }
    
    return recommendations;
  }
}

// 전역에서 사용할 수 있도록 등록
window.NotificationDiagnostics = NotificationDiagnostics;

// 자동 실행 함수
window.runNotificationDiagnostics = async () => {
  const diagnostics = new NotificationDiagnostics();
  return await diagnostics.runFullDiagnostics();
};

console.log('🔍 PWA 알림 진단 도구 로드됨');
console.log('사용법: runNotificationDiagnostics() 또는 new NotificationDiagnostics().runFullDiagnostics()');