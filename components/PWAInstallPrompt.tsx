'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { X, Download, Plus, Smartphone, MoreVertical, Menu, Chrome, Copy } from 'lucide-react'
import IosShareIcon from '@/components/icons/IosShareIcon'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
  prompt(): Promise<void>
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  // Legacy iOS-specific modal removed; use unified modal only
  const [showIOSInstructions, setShowIOSInstructions] = useState(false)
  const [showSimpleGuide, setShowSimpleGuide] = useState(false)
  const [isInstallable, setIsInstallable] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [showBottomBar, setShowBottomBar] = useState(true)
  const [showDesktopHint, setShowDesktopHint] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [isInAppBrowser, setIsInAppBrowser] = useState(false)
  const [copied, setCopied] = useState(false)
  const [lang, setLang] = useState<'en' | 'ko'>('en')

  const L = (en: string, ko: string) => (lang === 'en' ? en : ko)

  useEffect(() => {
    // Detect mobile devices
    const ua = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(ua);
    const isAndroid = /Android/.test(ua);
    setIsMobile(isIOS || isAndroid);
    // common in-app browsers (KakaoTalk, Instagram, Facebook, Line, Naver, Daum)
    const inApp = /(KAKAOTALK|Instagram|FBAN|FBAV|Line\/|NAVER|DaumApps|Whale)/i.test(ua);
    setIsInAppBrowser(inApp);
    
    // Check if already installed
    const checkInstalled = () => {
      // PWA is installed if display-mode is standalone
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      // Or if launched from home screen on iOS
      const isIOSStandalone = (window.navigator as any).standalone === true
      
      setIsInstalled(isStandalone || isIOSStandalone)
    }

    checkInstalled()

    // Listen for beforeinstallprompt event (Chrome/Android)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setIsInstallable(true)
    }

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setIsInstallable(false)
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)
    // Unified guide trigger (from Enable/Install buttons)
    const openGuide = () => {
      setShowSimpleGuide(true)
      setShowBottomBar(false)
      setIsInstallable(false)
    }
    // Expose also as a global function for direct calls
    ;(window as any).NT_showInstallGuide = openGuide
    // If a pending intent was set before this mounted, open now
    if ((window as any).NT_pendingGuide) {
      delete (window as any).NT_pendingGuide
      openGuide()
    }
    window.addEventListener('show-pwa-guide', openGuide)

    // Do not auto-show any legacy iOS modal

    // Restore bottom bar dismissal state (hide for 7 days after dismiss)
    const dismissedAt = typeof window !== 'undefined' ? localStorage.getItem('pwa-bottom-dismissed') : null
    if (dismissedAt && Date.now() - parseInt(dismissedAt) < 7 * 24 * 60 * 60 * 1000) {
      setShowBottomBar(false)
    } else {
      // Only show if not installed and not running as standalone
      const inStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true
      setShowBottomBar(!inStandalone)
    }

    // Desktop hint visibility (hide for 7 days after dismiss)
    const desktopDismissedAt = typeof window !== 'undefined' ? localStorage.getItem('pwa-desktop-dismissed') : null
    if (desktopDismissedAt && Date.now() - parseInt(desktopDismissedAt) < 7 * 24 * 60 * 60 * 1000) {
      setShowDesktopHint(false)
    } else {
      const isDesktop = !/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
      const inStandalone2 = window.matchMedia('(display-mode: standalone)').matches
      setShowDesktopHint(isDesktop && !inStandalone2)
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
      window.removeEventListener('show-pwa-guide', openGuide)
      try { delete (window as any).NT_showInstallGuide } catch {}
    }
  }, [isInstalled])

  const handleInstallClick = async () => {
    console.log('PWA Install clicked, deferredPrompt available:', !!deferredPrompt);
    
    if (!deferredPrompt) {
      console.log('No deferredPrompt, showing simple guide');
      setShowBottomBar(false);
      setIsInstallable(false);
      setShowSimpleGuide(true);
      return;
    }

    try {
      console.log('Showing install prompt...');
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      
      console.log('Install prompt result:', outcome);
      if (outcome === 'accepted') {
        console.log('PWA install accepted')
        setIsInstalled(true);
      } else {
        console.log('PWA install dismissed')
      }
      
      setDeferredPrompt(null)
      setIsInstallable(false)
    } catch (error) {
      console.error('Error showing install prompt:', error)
      // Fallback to simple guide
      setShowSimpleGuide(true);
    }
  }

  const handleIOSClose = () => {
    setShowSimpleGuide(false)
    setShowBottomBar(false)
  }

  const handleBottomDismiss = () => {
    setShowBottomBar(false)
    if (typeof window !== 'undefined') {
      localStorage.setItem('pwa-bottom-dismissed', Date.now().toString())
    }
  }

  const handleDesktopDismiss = () => {
    setShowDesktopHint(false)
    if (typeof window !== 'undefined') {
      localStorage.setItem('pwa-desktop-dismissed', Date.now().toString())
    }
  }


  // Don't show if already installed. On desktop, render only when explicitly triggered (showSimpleGuide)
  if (isInstalled) return null
  if (!isMobile && !showSimpleGuide) return null

  const shouldShowIOS = false

  return (
    <>
      {/* Persistent bottom bar (mobile browsers, non-PWA) */}
      {!isInstalled && isMobile && showBottomBar && !showSimpleGuide && (
        <div className="fixed inset-x-0 bottom-0 z-40 px-2.5 pb-2.5 pointer-events-none">
          <div className="mx-auto w-full max-w-[520px] bg-white border border-gray-200 shadow-md rounded-xl p-2.5 flex items-center gap-3 pointer-events-auto sm:max-w-sm">
            <div className="bg-gray-100 rounded-full p-1">
              <Download className="w-3.5 h-3.5 text-gray-700" />
            </div>
            <div className="flex-1">
              <div className="text-[12px] font-medium text-gray-900">Add to Home Screen</div>
              <div className="text-[11px] text-gray-600">Install for quick access</div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBottomDismiss}
                className="h-7 px-2 text-[11px] rounded-lg"
              >
                Later
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  if (deferredPrompt) {
                    handleInstallClick()
                  } else {
                    // Fallback: show simple guide
                    setShowBottomBar(false);
                    setIsInstallable(false);
                    setShowSimpleGuide(true);
                  }
                }}
                className="h-7 px-3 text-[11px] bg-black hover:bg-gray-900 text-white font-medium rounded-lg"
              >
                Install
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop install hint - REMOVED */}
      {/* Android/Chrome Install Button */}
      {isInstallable && deferredPrompt && (
        <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom duration-500">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-3 max-w-[260px]">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="bg-gray-100 rounded-full p-1">
                  <Download className="w-3.5 h-3.5 text-gray-700" />
                </div>
                <span className="font-semibold text-xs text-gray-900">Add to Home Screen</span>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setIsInstallable(false)}
                className="h-5 w-5 p-0 hover:bg-gray-100 rounded-full"
              >
                <X className="w-3 h-3 text-gray-500" />
              </Button>
            </div>
            <p className="text-xs text-gray-600 mb-3 leading-relaxed">
              Install app for quick access
            </p>
            <Button 
              onClick={handleInstallClick}
              className="w-full text-xs h-7 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-xl"
              size="sm"
            >
              Install
            </Button>
          </div>
        </div>
      )}

      {/* Unified minimal install modal (also used when Enable triggers guide) */}
      {(shouldShowIOS || showSimpleGuide) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-md w-full mx-4 transform animate-in zoom-in-95 duration-300 max-w-[520px] sm:max-w-sm">
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="bg-gray-100 rounded-full p-1.5">
                    <Smartphone className="w-4 h-4 text-gray-700" />
                  </div>
                  <h3 className="text-[15px] font-semibold text-gray-900">{L('Add to Home Screen','홈 화면에 추가')}</h3>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleIOSClose}
                  className="h-6 w-6 p-0 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-3.5 h-3.5 text-gray-500" />
                </Button>
              </div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-[12px] text-gray-700 text-center w-full">{L('Install for quick access and reminders.','빠른 접속과 리마인더를 위해 설치하세요.')}</p>
              </div>
              <div className="flex justify-center mb-3">
                <div className="inline-flex rounded-lg border border-gray-200 overflow-hidden text-[11px]">
                  <button className={`px-2 py-1 ${lang==='en'?'bg-black text-white':'bg-white text-gray-700'}`} onClick={()=>setLang('en')}>EN</button>
                  <button className={`px-2 py-1 ${lang==='ko'?'bg-black text-white':'bg-white text-gray-700'}`} onClick={()=>setLang('ko')}>KR</button>
                </div>
              </div>

              {isInAppBrowser && (
                <div className="mb-3 rounded-lg border border-gray-200 bg-gray-50 text-[11px] text-gray-700 p-3 text-center">
                  {L('This app is opened inside another app. Open in your browser to install.','현재 인앱 브라우저에서 열렸습니다. 설치하려면 브라우저에서 열어주세요.')}
                  <div className="mt-1 text-gray-600">
                    {(() => {
                      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
                      return isIOS ? L('Open in Safari for best results.','Safari에서 여는 것이 가장 확실해요.') : L('Open in Chrome for best results.','Chrome에서 여는 것이 가장 확실해요.');
                    })()}
                  </div>
                  <div className="mt-2 flex flex-col items-center gap-1">
                    <Button
                      size="sm"
                      className="h-7 px-3 text-[11px] bg-black hover:bg-gray-900 text-white rounded-lg inline-flex items-center gap-1"
                      onClick={async () => {
                        try {
                          const href = window.location.href;
                          if (navigator.clipboard && navigator.clipboard.writeText) {
                            await navigator.clipboard.writeText(href);
                            setCopied(true);
                            setTimeout(()=>setCopied(false), 2000);
                          } else {
                            const t = document.createElement('textarea');
                            t.value = href;
                            document.body.appendChild(t);
                            t.select();
                            document.execCommand('copy');
                            document.body.removeChild(t);
                            setCopied(true);
                            setTimeout(()=>setCopied(false), 2000);
                          }
                        } catch {}
                      }}
                    >
                      <Copy className="w-3 h-3" /> {L('Copy link','링크 복사')}
                    </Button>
                    {copied && <div className="text-[11px] text-gray-600">{L('Link copied','링크가 복사되었습니다')}</div>}
                  </div>
                </div>
              )}
              
              <div className="space-y-2.5 mb-5">
                {(() => {
                  const ua = navigator.userAgent;
                  const isIOS = /iPad|iPhone|iPod/.test(ua);
                  const isAndroid = /Android/.test(ua);
                  const isChrome = /Chrome\//.test(ua);
                  const isSafari = /Safari\//.test(ua) && !isChrome;

                  if (isIOS) {
                    // iOS Safari/Chrome/Firefox: share sheet then Add to Home Screen
                    return (
                      <>
                        <div className="flex items-center gap-2 text-[12px] text-gray-700 flex-wrap">
                          <span className="text-gray-700 font-semibold">1.</span>
                          <IosShareIcon className="w-3.5 h-3.5 text-black" />
                          <span className="text-gray-900">{L('Tap Share','공유 버튼 탭')}</span>
                          <span className="text-gray-500">{L('then choose “Add to Home Screen”','“홈 화면에 추가” 선택')}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[12px] text-gray-700 flex-wrap">
                          <span className="text-gray-700 font-semibold">2.</span>
                          <span className="text-gray-900">{L('Tap “Add”','“추가” 버튼 탭')}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[12px] text-gray-700 flex-wrap">
                          <span className="text-gray-700 font-semibold">3.</span>
                          <span className="text-gray-900">{L('All set.','완료!')}</span>
                          <span className="text-gray-500">{L('Find it on your Home Screen','홈 화면에서 아이콘 확인')}</span>
                        </div>
                      </>
                    );
                  }

                  if (isAndroid && isChrome) {
                    // Android Chrome: menu then Install app
                    return (
                      <>
                        <div className="flex items-center gap-2 text-[12px] text-gray-700 flex-wrap">
                          <span className="text-gray-700 font-semibold">1.</span>
                          <MoreVertical className="w-3.5 h-3.5 text-black" />
                          <span className="text-gray-900">{L('Open menu (⋮)','메뉴(⋮) 열기')}</span>
                          <span className="text-gray-500">{L('top right','오른쪽 상단')}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[12px] text-gray-700 flex-wrap">
                          <span className="text-gray-700 font-semibold">2.</span>
                          <Download className="w-3.5 h-3.5 text-black" />
                          <span className="text-gray-900">{L('Tap “Install app”','“앱 설치” 선택')}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[12px] text-gray-700 flex-wrap">
                          <span className="text-gray-700 font-semibold">3.</span>
                          <span className="text-gray-900">{L('All set.','완료!')}</span>
                          <span className="text-gray-500">{L('Find it on your Home Screen','홈 화면에서 아이콘 확인')}</span>
                        </div>
                      </>
                    );
                  }

                  if (isAndroid) {
                    // Android other browsers
                    return (
                      <>
                        <div className="flex items-center gap-2 text-[12px] text-gray-700 flex-wrap">
                          <span className="text-gray-700 font-semibold">1.</span>
                          <Menu className="w-3.5 h-3.5 text-black" />
                          <span className="text-gray-900">{L('Open menu','메뉴 열기')}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[12px] text-gray-700 flex-wrap">
                          <span className="text-gray-700 font-semibold">2.</span>
                          <span className="text-gray-900">{L('Tap “Add to Home screen”','“홈 화면에 추가” 선택')}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[12px] text-gray-700 flex-wrap">
                          <span className="text-gray-700 font-semibold">3.</span>
                          <span className="text-gray-900">{L('All set.','완료!')}</span>
                          <span className="text-gray-500">{L('Find it on your Home Screen','홈 화면에서 아이콘 확인')}</span>
                        </div>
                      </>
                    );
                  }

                  // Fallback
                  return (
                    <>
                      <div className="flex items-center gap-2 text-[12px] text-gray-700 flex-wrap">
                        <span className="text-gray-700 font-semibold">1.</span>
                        <Download className="w-3.5 h-3.5 text-black" />
                        <span className="text-gray-900">{L('Click Install','설치 클릭')}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[12px] text-gray-700 flex-wrap">
                        <span className="text-gray-700 font-semibold">2.</span>
                        <span className="text-gray-900">{L('Confirm','확인')}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[12px] text-gray-700 flex-wrap">
                        <span className="text-gray-700 font-semibold">3.</span>
                        <span className="text-gray-900">{L('All set.','완료!')}</span>
                        <span className="text-gray-500">{L('Open it from your Home Screen','홈 화면에서 열기')}</span>
                      </div>
                    </>
                  );
                })()}
              </div>

              <div className="text-[11px] text-gray-500 text-center mb-3">You can remove it anytime.</div>

              <div className="flex justify-center">
                <Button 
                  onClick={handleIOSClose} 
                  className="text-[12px] h-8 px-4 bg-black hover:bg-gray-900 text-white rounded-lg"
                >
                  Got it
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Legacy detailed guide removed */}

    </>
  )
}