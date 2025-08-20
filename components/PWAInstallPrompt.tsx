'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { X, Download, Share, Plus, Smartphone } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
  prompt(): Promise<void>
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showIOSInstructions, setShowIOSInstructions] = useState(false)
  const [isInstallable, setIsInstallable] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
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
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    const isIOSChrome = /CriOS/.test(navigator.userAgent)
    const isIOSFirefox = /FxiOS/.test(navigator.userAgent)
    const isIOSSafari = isIOS && !isIOSChrome && !isIOSFirefox
    
    if (isIOSSafari && !isInstalled) {
      // Show iOS install instructions after a delay
      setTimeout(() => setShowIOSInstructions(true), 3000)
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [isInstalled])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      
      if (outcome === 'accepted') {
        console.log('PWA install accepted')
      } else {
        console.log('PWA install dismissed')
      }
      
      setDeferredPrompt(null)
      setIsInstallable(false)
    } catch (error) {
      console.error('Error showing install prompt:', error)
    }
  }

  const handleIOSClose = () => {
    setShowIOSInstructions(false)
    // Don't show again for 7 days
    if (typeof window !== 'undefined') {
      localStorage.setItem('ios-install-dismissed', Date.now().toString())
    }
  }

  // Don't show if already installed
  if (isInstalled) return null

  // Check if iOS instructions were recently dismissed
  const iosDismissed = typeof window !== 'undefined' ? localStorage.getItem('ios-install-dismissed') : null
  const shouldShowIOS = showIOSInstructions && (!iosDismissed || Date.now() - parseInt(iosDismissed) > 7 * 24 * 60 * 60 * 1000)

  return (
    <>
      {/* Android/Chrome Install Button */}
      {isInstallable && deferredPrompt && (
        <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom duration-500">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-3 max-w-[260px]">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="bg-gray-100 rounded-full p-1">
                  <Download className="w-3.5 h-3.5 text-gray-700" />
                </div>
                <span className="font-semibold text-xs text-gray-900">Install App</span>
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
              Add to home screen for quick access
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
              
              <div className="space-y-3 mb-5">
                <div className="flex items-start gap-2.5">
                  <div className="bg-gray-100 rounded-full p-1.5 flex-shrink-0 mt-0.5">
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

                <div className="flex items-start gap-2.5">
                  <div className="bg-gray-100 rounded-full p-1.5 flex-shrink-0 mt-0.5">
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

                <div className="flex items-start gap-2.5">
                  <div className="bg-gray-100 rounded-full p-1.5 flex-shrink-0 mt-0.5">
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
    </>
  )
}