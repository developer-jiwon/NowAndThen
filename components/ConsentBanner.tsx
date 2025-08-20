"use client"

import { useEffect, useState } from "react"

declare global {
  interface Window {
    dataLayer?: any[]
    gtag?: (...args: any[]) => void
  }
}

export default function ConsentBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      // If Google's CMP is present (AdSense integrated Funding Choices), hide our custom banner
      if (typeof window !== 'undefined' && (window as any).googlefc) {
        setVisible(false)
        return
      }
      const stored = localStorage.getItem("consentChoice")
      setVisible(stored === null)
    } catch {}
  }, [])

  const updateConsent = (granted: boolean) => {
    try {
      window.dataLayer = window.dataLayer || []
      const gtag = window.gtag || ((...args: any[]) => window.dataLayer?.push(args))
      gtag('consent', 'update', {
        ad_storage: granted ? 'granted' : 'denied',
        ad_user_data: granted ? 'granted' : 'denied',
        ad_personalization: granted ? 'granted' : 'denied',
        analytics_storage: granted ? 'granted' : 'denied',
      })
      localStorage.setItem("consentChoice", granted ? "granted" : "denied")
      setVisible(false)
    } catch {
      // noop
      setVisible(false)
    }
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 bg-white border-t border-gray-200">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        <p className="text-xs text-gray-700 leading-snug">
          이 사이트는 쿠키를 사용합니다. 동의 시 개인화된 광고 및 분석이 활성화됩니다.
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => updateConsent(false)}
            className="px-3 py-1.5 text-xs border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            거부
          </button>
          <button
            onClick={() => updateConsent(true)}
            className="px-3 py-1.5 text-xs rounded-md bg-[#4E724C] text-white hover:bg-[#3A5A38]"
          >
            동의
          </button>
        </div>
      </div>
    </div>
  )
}


