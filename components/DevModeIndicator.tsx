"use client"

import { useEffect, useState } from "react"

export default function DevModeIndicator() {
  const [isDev, setIsDev] = useState(false)
  const [devInfo, setDevInfo] = useState<any>(null)

  useEffect(() => {
    if (typeof window === "undefined") return

    const urlParams = new URLSearchParams(window.location.search)
    const devParam = urlParams.get('dev')
    const isDevMode = process.env.NODE_ENV === 'development' || 
      devParam === '1' || devParam === 'true'

    setIsDev(isDevMode)

    if (isDevMode) {
      setDevInfo({
        nodeEnv: process.env.NODE_ENV,
        hasDevParam: devParam === '1' || devParam === 'true',
        userId: localStorage.getItem('now_then_user_id'),
        guestId: localStorage.getItem('guest_id')
      })
      
      // Add padding to body to account for the dev indicator
      document.body.style.paddingTop = '40px'
    }

    return () => {
      // Clean up padding when component unmounts
      if (isDevMode) {
        document.body.style.paddingTop = '0'
      }
    }
  }, [])

  if (!isDev) return null

  const handleResetStorage = () => {
    if (typeof window !== "undefined" && (window as any).devUtils) {
      (window as any).devUtils.resetLocalStorage()
    } else {
      // Fallback manual reset
      const keys = Object.keys(localStorage)
      const appKeys = keys.filter(key => 
        key.startsWith('now_then_') || 
        key.includes('countdown') || 
        key === 'guest_id' ||
        key === 'dev_user_data'
      )
      
      appKeys.forEach(key => localStorage.removeItem(key))
      console.log('Reset localStorage keys:', appKeys)
      window.location.reload()
    }
  }

  const handleSwitchToProduction = () => {
    const url = new URL(window.location.href)
    url.searchParams.delete('dev')
    localStorage.removeItem('dev_user_data')
    window.location.href = url.toString()
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-400 text-black text-xs px-4 py-2 flex items-center justify-between shadow-md">
      <div className="flex items-center gap-4">
        <span className="font-bold">🔧 DEVELOPMENT MODE</span>
        <span>
          Mode: {process.env.NODE_ENV === 'development' ? 'Local Dev' : 'Production + ?dev=1'}
        </span>
        <span>User: {devInfo?.userId || 'Loading...'}</span>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={handleResetStorage}
          className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
          title="Reset all app localStorage data"
        >
          Reset Storage
        </button>
        <button
          onClick={handleSwitchToProduction}
          className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600"
          title="Switch to production mode"
        >
          Exit Dev Mode
        </button>
      </div>
    </div>
  )
}
