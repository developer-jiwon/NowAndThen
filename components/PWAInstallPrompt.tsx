'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { X, Download, Share, Plus, Smartphone, MoreVertical, Menu, Chrome } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
  prompt(): Promise<void>
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showIOSInstructions, setShowIOSInstructions] = useState(false)
  const [showSimpleGuide, setShowSimpleGuide] = useState(false)
  const [isInstallable, setIsInstallable] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [showBottomBar, setShowBottomBar] = useState(true)
  const [showDesktopHint, setShowDesktopHint] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Detect mobile devices
    const ua = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(ua);
    const isAndroid = /Android/.test(ua);
    setIsMobile(isIOS || isAndroid);
    
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

    // Check if iOS Safari and not installed
    const isIOSChrome = /CriOS/.test(navigator.userAgent)
    const isIOSFirefox = /FxiOS/.test(navigator.userAgent)
    const isIOSSafari = isIOS && !isIOSChrome && !isIOSFirefox
    
    if (isIOSSafari && !isInstalled) {
      // Show iOS install instructions after a delay
      setTimeout(() => setShowIOSInstructions(true), 3000)
    }

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
    }
  }, [isInstalled])

  const handleInstallClick = async () => {
    console.log('PWA Install clicked, deferredPrompt available:', !!deferredPrompt);
    
    if (!deferredPrompt) {
      console.log('No deferredPrompt, showing simple guide');
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
    setShowIOSInstructions(false)
    // Don't show again for 7 days
    if (typeof window !== 'undefined') {
      localStorage.setItem('ios-install-dismissed', Date.now().toString())
    }
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


  // Don't show if already installed or not on mobile
  if (isInstalled || !isMobile) return null

  // Check if iOS instructions were recently dismissed
  const iosDismissed = typeof window !== 'undefined' ? localStorage.getItem('ios-install-dismissed') : null
  const shouldShowIOS = showIOSInstructions && (!iosDismissed || Date.now() - parseInt(iosDismissed) > 7 * 24 * 60 * 60 * 1000)

  return (
    <>
      {/* Persistent bottom bar (mobile browsers, non-PWA) */}
      {!isInstalled && showBottomBar && (
        <div className="fixed inset-x-0 bottom-0 z-40 px-3 pb-3 pointer-events-none">
          <div className="mx-auto max-w-sm w-full bg-white border border-gray-200 shadow-lg rounded-2xl p-3 flex items-center gap-3 pointer-events-auto">
            <div className="bg-gray-100 rounded-full p-1">
              <Download className="w-3.5 h-3.5 text-gray-700" />
            </div>
            <div className="flex-1">
              <div className="text-xs font-semibold text-gray-900">Add to Home Screen</div>
              <div className="text-[11px] text-gray-600">Install app for quick access</div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBottomDismiss}
                className="h-7 px-2 text-[11px] rounded-xl"
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
                    setShowSimpleGuide(true);
                  }
                }}
                className="h-7 px-3 text-[11px] bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-xl"
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

      {/* iOS Safari Instructions Modal */}
      {shouldShowIOS && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black bg-opacity-40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full mx-4 transform animate-in zoom-in-95 duration-300">
            <div className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="bg-gray-100 rounded-full p-1.5">
                    <Smartphone className="w-4 h-4 text-gray-700" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900">Add to Home Screen</h3>
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
              
              <p className="text-xs text-gray-600 mb-4 text-center">
                Install Now & Then as an app for quick access
              </p>
              
              <div className="space-y-2.5 mb-5">
                <div className="flex items-start gap-2">
                  <div className="bg-gray-100 rounded-full p-1 flex-shrink-0 mt-0">
                    <span className="text-gray-700 font-bold text-xs">1</span>
                  </div>
                  <div>
                    <p className="font-semibold text-xs text-gray-900 mb-0.5">Tap Share Button</p>
                    <div className="flex items-center gap-1.5 text-xs text-gray-600">
                      <Share className="w-3 h-3" />
                      <span>Bottom center of your browser</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <div className="bg-gray-100 rounded-full p-1 flex-shrink-0 mt-0">
                    <span className="text-gray-700 font-bold text-xs">2</span>
                  </div>
                  <div>
                    <p className="font-semibold text-xs text-gray-900 mb-0.5">Add to Home Screen</p>
                    <div className="flex items-center gap-1.5 text-xs text-gray-600">
                      <Plus className="w-3 h-3" />
                      <span>Select this option from the menu</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <div className="bg-gray-100 rounded-full p-1 flex-shrink-0 mt-0">
                    <span className="text-gray-700 font-bold text-xs">3</span>
                  </div>
                  <div>
                    <p className="font-semibold text-xs text-gray-900 mb-0.5">Done!</p>
                    <p className="text-xs text-gray-600">
                      Find the app icon on your home screen
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={handleIOSClose} 
                  className="flex-1 text-xs h-8 rounded-xl border-gray-200 text-gray-600 hover:bg-gray-50"
                >
                  Later
                </Button>
                <Button 
                  onClick={handleIOSClose} 
                  className="flex-1 text-xs h-8 bg-gray-900 hover:bg-gray-800 text-white rounded-xl"
                >
                  Got it
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Install Guide */}
      {showSimpleGuide && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl max-h-[80vh] overflow-y-auto">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Add to Home Screen
              </h3>
              <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                Add this app to your home screen to use it like a regular app.
              </p>
              <div className="flex flex-col gap-2">
                {(() => {
                  const ua = navigator.userAgent;
                  const isIOS = /iPad|iPhone|iPod/.test(ua);
                  const isAndroid = /Android/.test(ua);
                  const isChrome = /Chrome/.test(ua);
                  const isSafari = /Safari/.test(ua) && !/Chrome/.test(ua);
                  
                  if (isIOS) {
                    if (isSafari) {
                      return [
                        "Tap the Share button (📤︎) at the bottom center of Safari",
                        "Scroll down and tap 'Add to Home Screen'",
                        "Edit the name if desired, then tap 'Add'",
                        "Open the app from your home screen"
                      ];
                    } else {
                      return [
                        "Tap the Share button (📤︎) at the right end of the address bar",
                        "Select 'Add to Home Screen'",
                        "Tap 'Add' to install the app",
                        "Open the app from your home screen"
                      ];
                    }
                  } else if (isAndroid) {
                    if (isChrome) {
                      return [
                        "Tap the three dots menu (⋯) at the top right",
                        "Select 'Add to Home Screen' or 'Install App'",
                        "Tap 'Install' to add the app",
                        "Open the app from your home screen or app drawer"
                      ];
                    } else {
                      return [
                        "Tap the menu button in your browser",
                        "Look for 'Add to Home Screen' or 'Install App'",
                        "Tap 'Install' to add the app",
                        "Open the app from your home screen or app drawer"
                      ];
                    }
                  } else {
                    return [
                      "Click the menu (⋯) in your browser",
                      "Look for 'Install' or 'Add to Desktop'",
                      "Click 'Install' to add the app",
                      "If no install option, bookmark this page for easy access"
                    ];
                  }
                })().map((step, index) => (
                  <div key={index} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-gray-500">{index + 1}.</span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
              <Button
                onClick={() => setShowSimpleGuide(false)}
                className="bg-[#4E724C] hover:bg-[#3A5A38] text-white font-medium px-6 py-2 rounded-lg transition-colors duration-200 mt-4"
              >
                Got It!
              </Button>
            </div>
          </div>
        </div>
      )}

    </>
  )
}