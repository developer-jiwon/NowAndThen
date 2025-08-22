"use client"

import { useEffect, useState } from "react"
import { useUser } from "@supabase/auth-helpers-react"

export default function DevModeIndicator() {
  const user = useUser()
  const [isDev, setIsDev] = useState(false)
  const [devInfo, setDevInfo] = useState<any>(null)
  const [isResetting, setIsResetting] = useState(false)
  const [isExiting, setIsExiting] = useState(false)
  const [showTestCredentials, setShowTestCredentials] = useState(false)
  const [showAdminLoginPrompt, setShowAdminLoginPrompt] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return

    const urlParams = new URLSearchParams(window.location.search)
    const devParam = urlParams.get('dev')
    
    // 로컬 개발환경: 항상 개발 모드
    // 배포된 사이트: ?dev=1이 있을 때는 개발 모드 비활성화 (admin 로그인 팝업 표시)
    let isDevMode = false
    
    if (process.env.NODE_ENV === 'development') {
      isDevMode = true
    } else if (process.env.NODE_ENV === 'production' && (devParam === '1' || devParam === 'true')) {
      // 배포 후 ?dev=1이 있으면 개발 모드 비활성화하고 admin 로그인 팝업 표시
      isDevMode = false
      console.log('🔒 Test mode requires admin authentication in production')
    }

    setIsDev(isDevMode)

    if (isDevMode) {
      setDevInfo({
        nodeEnv: process.env.NODE_ENV,
        hasDevParam: devParam === '1' || devParam === 'true',
        userId: localStorage.getItem('now_then_user_id'),
        guestId: localStorage.getItem('guest_id'),
        devUserData: localStorage.getItem('dev_user_data')
      })
      
      // Add padding to body to account for the dev indicator
      document.body.style.paddingTop = '40px'
    }

    // ji04wonton30@gmail.com에게만 테스트 계정 정보 표시 (일반 모드에서)
    if (user && user.email === 'ji04wonton30@gmail.com' && !isDevMode) {
      setShowTestCredentials(true)
    } else {
      setShowTestCredentials(false)
    }

    // ?dev=1 파라미터가 있으면 모든 사용자에게 admin 로그인 팝업 표시 (로컬 개발환경 제외)
    if (process.env.NODE_ENV === 'production' && (devParam === '1' || devParam === 'true')) {
      setShowAdminLoginPrompt(true)
    } else {
      setShowAdminLoginPrompt(false)
    }

    return () => {
      // Clean up padding when component unmounts
      if (isDevMode) {
        document.body.style.paddingTop = '0'
      }
    }
  }, [user])

  // Admin 로그인 팝업 표시 (?dev=1 파라미터가 있지만 로그인하지 않은 경우)
  if (showAdminLoginPrompt) {
    return (
      <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
          <div className="text-center mb-6">
            <div className="text-2xl mb-2">🚫</div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Access Restricted</h3>
            <p className="text-sm text-gray-600">
              Test mode requires administrator authentication.
            </p>
          </div>
          
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <div className="text-sm text-blue-700">
              <div className="font-semibold mb-1">⚠️ Security Notice:</div>
              <div className="text-xs">
                Test mode is restricted to authorized administrators only. 
                Please contact the system administrator for access credentials.
              </div>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => {
                const url = new URL(window.location.href);
                url.searchParams.delete('dev');
                window.location.href = url.toString();
              }}
              className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg text-sm hover:bg-gray-600 transition-colors"
            >
              Exit Test Mode
            </button>
            <button
              onClick={() => setShowAdminLoginPrompt(false)}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg text-sm hover:bg-blue-700 transition-colors"
            >
              I'll Login
            </button>
          </div>
        </div>
      </div>
    )
  }

  // 테스트 계정 정보 표시 (ji04wonton30@gmail.com에게만, 일반 모드에서)
  if (showTestCredentials) {
    return (
      <div className="fixed top-0 left-0 right-0 z-50 bg-blue-500 text-white text-xs px-4 py-2 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-4">
          <span className="font-bold">🧪 TEST ACCOUNT INFO</span>
          <span>For development testing only</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-xs">
            <span className="font-semibold">Username:</span> Test
          </div>
          <div className="text-xs">
            <span className="font-semibold">Password:</span> Tes_19tIs_94Impo_30rtan_04t
          </div>
          <button
            onClick={() => {
              const testUrl = `${window.location.origin}?dev=1`;
              navigator.clipboard.writeText(testUrl);
              alert('✅ Test server URL copied to clipboard!');
            }}
            className="bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700"
            title="Copy test server URL with ?dev=1 parameter"
          >
            Test Server Copy
          </button>
          <button
            onClick={() => setShowTestCredentials(false)}
            className="bg-gray-600 text-white px-2 py-1 rounded text-xs hover:bg-gray-700"
            title="Hide test account info"
          >
            Hide
          </button>
        </div>
      </div>
    )
  }

  if (!isDev) return null

  const handleResetStorage = () => {
    // Confirm before resetting
    if (!confirm('⚠️ Are you sure you want to reset all localStorage data?\n\nThis will remove all your countdowns, settings, and user data. This action cannot be undone.')) {
      return
    }
    
    setIsResetting(true)
    console.log('🔧 Resetting localStorage for development mode...')
    
    try {
      // Get all localStorage keys
      const keys = Object.keys(localStorage)
      
      // Filter app-related keys
      const appKeys = keys.filter(key => 
        key.startsWith('now_then_') || 
        key.includes('countdown') || 
        key === 'guest_id' ||
        key === 'dev_user_data' ||
        key.includes('countdowns_')
      )
      
      console.log('🗑️ Removing localStorage keys:', appKeys)
      
      // Remove all app-related keys
      appKeys.forEach(key => {
        localStorage.removeItem(key)
        console.log(`✅ Removed: ${key}`)
      })
      
      // Show confirmation
      alert(`✅ Reset complete! Removed ${appKeys.length} localStorage keys.\n\nPage will reload in 2 seconds...`)
      
      // Reload the page after a short delay
      setTimeout(() => {
        window.location.reload()
      }, 2000)
      
    } catch (error) {
      console.error('Error during reset:', error)
      alert('❌ Error during reset. Please try again.')
      setIsResetting(false)
    }
  }

  const handleSwitchToProduction = () => {
    // Confirm before switching
    if (!confirm('🔧 Are you sure you want to exit development mode?\n\nThis will switch you to production mode and remove development-specific data.')) {
      return
    }
    
    setIsExiting(true)
    console.log('🔧 Switching to production mode...')
    
    try {
      // Remove dev-specific data
      localStorage.removeItem('dev_user_data')
      localStorage.removeItem('guest_id')
      
      // Create new URL without dev parameter
      const url = new URL(window.location.href)
      url.searchParams.delete('dev')
      
      console.log('🔄 Redirecting to:', url.toString())
      
      // Show confirmation
      alert('✅ Switching to production mode. You will be redirected in 2 seconds...')
      
      // Redirect to production mode after a short delay
      setTimeout(() => {
        window.location.href = url.toString()
      }, 2000)
      
    } catch (error) {
      console.error('Error during mode switch:', error)
      alert('❌ Error during mode switch. Please try again.')
      setIsExiting(false)
    }
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-400 text-black text-xs px-4 py-2 flex items-center justify-between shadow-md">
      <div className="flex items-center gap-4">
        <span className="font-bold">🔧 DEVELOPMENT MODE</span>
        <span>
          Mode: {process.env.NODE_ENV === 'development' ? 'Local Development' : 'Production + ?dev=1'}
        </span>
        <span>
          User: {devInfo?.userId || 'Loading...'} 
          {devInfo?.devUserData && ' (Dev)'}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={handleResetStorage}
          disabled={isResetting}
          className={`px-2 py-1 rounded text-xs transition-colors ${
            isResetting 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-red-500 hover:bg-red-600 cursor-pointer'
          } text-white`}
          title="Reset all app localStorage data"
        >
          {isResetting ? 'Resetting...' : 'Reset Storage'}
        </button>
        <button
          onClick={handleSwitchToProduction}
          disabled={isExiting}
          className={`px-2 py-1 rounded text-xs transition-colors ${
            isExiting 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-500 hover:bg-blue-600 cursor-pointer'
          } text-white`}
          title="Switch to production mode"
        >
          {isExiting ? 'Exiting...' : 'Exit Dev Mode'}
        </button>
      </div>
    </div>
  )
}
