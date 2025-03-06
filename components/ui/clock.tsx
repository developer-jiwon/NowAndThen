"use client"

import { useState, useEffect } from "react"

export function Clock() {
  const [time, setTime] = useState<Date | null>(null)
  const [timezone, setTimezone] = useState("")
  
  // Pantone white and charcoal colors
  const white = "#FFFFFF"
  const charcoal = "#333333"

  useEffect(() => {
    // Set initial time on client-side only
    const now = new Date()
    setTime(now)
    
    // Update time every second
    const timer = setInterval(() => {
      const newTime = new Date()
      setTime(newTime)
    }, 1000)

    // Get timezone
    try {
      // Get abbreviated timezone name if possible
      const timezoneName = Intl.DateTimeFormat().resolvedOptions().timeZone;
      // Try to get a shorter version for display
      const shortTimezone = timezoneName.split('/').pop()?.replace(/_/g, " ") || timezoneName;
      setTimezone(shortTimezone)
    } catch (error) {
      setTimezone("Local")
    }

    return () => clearInterval(timer)
  }, [])

  // Only render on client-side after time is set
  if (!time) {
    return null
  }

  // Format time as HH:MM
  const formattedTime = time.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })

  return (
    <div 
      className="inline-flex items-center backdrop-blur-sm px-2 py-1 rounded-md ml-2 transition-all duration-300 select-none"
      style={{
        background: `linear-gradient(135deg, ${white}05, ${charcoal}05)`,
        border: `1px solid ${charcoal}10`,
        boxShadow: `0 1px 4px rgba(0,0,0,0.02)`,
      }}
    >
      <div className="flex items-center gap-1">
        <div className="w-1 h-1 rounded-full animate-pulse" style={{ backgroundColor: `${charcoal}70` }} />
        <span 
          className="font-mono text-xs font-medium tracking-wide"
          style={{ color: charcoal }}
        >
          {formattedTime}
        </span>
      </div>
      <span 
        className="text-[10px] font-normal tracking-wide uppercase ml-1"
        style={{ color: `${charcoal}80` }}
      >
        {timezone}
      </span>
    </div>
  )
} 