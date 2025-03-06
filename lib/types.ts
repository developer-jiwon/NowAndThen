export interface Countdown {
  id: string
  title: string
  date: string
  description?: string
  hidden: boolean
  pinned?: boolean
  originalCategory?: string
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

