"use client"

import { useState, useEffect } from "react"

export function Clock({ size }: { size?: 'sm' }) {
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

  // Responsive size classes
  const containerClass = size === 'sm'
    ? "inline-flex items-center backdrop-blur-sm px-1 py-0.5 rounded-md ml-0.5 transition-all duration-300 select-none"
    : "inline-flex items-center backdrop-blur-sm px-2 py-1 rounded-md ml-2 transition-all duration-300 select-none"
  const timeClass = size === 'sm'
    ? "font-mono text-[10px] font-medium tracking-wide"
    : "font-mono text-xs font-medium tracking-wide"
  const tzClass = size === 'sm'
    ? "text-[8px] font-normal tracking-wide uppercase ml-0.5"
    : "text-[10px] font-normal tracking-wide uppercase ml-1"
  const dotClass = size === 'sm' ? "w-0.5 h-0.5" : "w-1 h-1"

  return (
    <div 
      className={containerClass}
      style={{
        background: `linear-gradient(135deg, ${white}05, ${charcoal}05)`,
        border: `1px solid ${charcoal}10`,
        boxShadow: `0 1px 4px rgba(0,0,0,0.02)`,
      }}
    >
      <div className="flex items-center gap-1">
        <div className={dotClass + " rounded-full animate-pulse"} style={{ backgroundColor: `${charcoal}70` }} />
        <span 
          className={timeClass}
          style={{ color: charcoal }}
        >
          {formattedTime}
        </span>
      </div>
      <span 
        className={tzClass}
        style={{ color: `${charcoal}80` }}
      >
        {timezone}
      </span>
    </div>
  )
} 