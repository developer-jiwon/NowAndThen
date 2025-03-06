export interface Countdown {
  id: string
  title: string
  date: string
  description?: string
  hidden: boolean
  pinned?: boolean
  originalCategory?: "custom" | "general" | "personal" // "custom" is deprecated but kept for backward compatibility
  isCountUp?: boolean
}

export interface TimeRemaining {
  total: number
  days: number
  hours: number
  minutes: number
  seconds: number
  isCountUp?: boolean
}

