import { v4 as uuidv4 } from "uuid"
import type { Countdown, TimeRemaining } from "./types"

// Calculate time remaining for a countdown or elapsed for a countup
export function calculateTimeRemaining(targetDate: string, isCountUp = false): TimeRemaining {
  const now = new Date().getTime()
  const target = new Date(targetDate).getTime()
  const diff = isCountUp ? now - target : target - now

  // Always positive for countup
  const total = Math.max(0, diff)

  const seconds = Math.floor((total / 1000) % 60)
  const minutes = Math.floor((total / 1000 / 60) % 60)
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24)
  const days = Math.floor(total / (1000 * 60 * 60 * 24))

  return {
    total,
    days,
    hours,
    minutes,
    seconds,
    isCountUp,
  }
}

// Get default countdowns based on category
export function getDefaultCountdowns(category: string): Countdown[] {
  const currentYear = new Date().getFullYear()
  const nextYear = currentYear + 1
  const lastYear = currentYear - 1

  if (category === "general") {
    return [
      // New Year
      {
        id: uuidv4(),
        title: `New Year ${nextYear}`,
        date: `${nextYear}-01-01T00:00:00`,
        description: `Countdown to ${nextYear}`,
        hidden: false,
        pinned: false,
        isCountUp: false,
      },
      // Canadian Holidays
      {
        id: uuidv4(),
        title: "Canada Day",
        date: `${currentYear}-07-01T00:00:00`,
        description: "National Day of Canada",
        hidden: false,
        pinned: false,
        isCountUp: false,
      },
      {
        id: uuidv4(),
        title: "Thanksgiving (Canada)",
        date: `${currentYear}-10-09T00:00:00`,
        description: "Canadian Thanksgiving",
        hidden: false,
        pinned: false,
        isCountUp: false,
      },
      {
        id: uuidv4(),
        title: "Christmas",
        date: `${currentYear}-12-25T00:00:00`,
        description: "Christmas Day",
        hidden: false,
        pinned: true,
        isCountUp: false,
      },
      // Korean Holidays
      {
        id: uuidv4(),
        title: "Seollal (Korean New Year)",
        date: `${currentYear}-02-10T00:00:00`,
        description: "Korean Lunar New Year",
        hidden: false,
        pinned: false,
        isCountUp: false,
      },
      {
        id: uuidv4(),
        title: "Chuseok (Korean Thanksgiving)",
        date: `${currentYear}-09-17T00:00:00`,
        description: "Korean Harvest Festival",
        hidden: false,
        pinned: false,
        isCountUp: false,
      },
    ]
  } else if (category === "personal") {
    return [
      {
        id: uuidv4(),
        title: "My Birthday",
        date: `${currentYear}-06-15T00:00:00`,
        description: "Add your actual birth date",
        hidden: false,
        pinned: true,
        isCountUp: false,
      },
      {
        id: uuidv4(),
        title: "Mom's Birthday",
        date: `${currentYear}-03-20T00:00:00`,
        description: "Add your mom's actual birth date",
        hidden: false,
        pinned: false,
        isCountUp: false,
      },
      {
        id: uuidv4(),
        title: "Dad's Birthday",
        date: `${currentYear}-09-05T00:00:00`,
        description: "Add your dad's actual birth date",
        hidden: false,
        pinned: false,
        isCountUp: false,
      },
      {
        id: uuidv4(),
        title: "Best Friend's Birthday",
        date: `${currentYear}-11-12T00:00:00`,
        description: "Add your friend's actual birth date",
        hidden: false,
        pinned: false,
        isCountUp: false,
      },
      // Countup examples
      {
        id: uuidv4(),
        title: "First Job Anniversary",
        date: `${lastYear}-03-15T00:00:00`,
        description: "Time since starting my first job",
        hidden: false,
        pinned: false,
        isCountUp: true,
      },
      {
        id: uuidv4(),
        title: "Relationship Anniversary",
        date: `${lastYear}-08-22T00:00:00`,
        description: "Time since we started dating",
        hidden: false,
        pinned: true,
        isCountUp: true,
      },
    ]
  }

  return []
}

// Get countdowns from localStorage or default ones
export function getCountdowns(category: string): Countdown[] {
  if (typeof window === "undefined") {
    return []
  }

  const storedCountdowns = localStorage.getItem(`countdowns_${category}`)

  if (storedCountdowns) {
    return JSON.parse(storedCountdowns)
  }

  // If no stored countdowns, get defaults and save them
  const defaultCountdowns = getDefaultCountdowns(category)
  localStorage.setItem(`countdowns_${category}`, JSON.stringify(defaultCountdowns))

  return defaultCountdowns
}

// Get all pinned countdowns from all categories
export function getAllPinnedCountdowns(): Countdown[] {
  if (typeof window === "undefined") {
    return []
  }

  const categories = ["general", "personal", "custom"]
  let pinnedCountdowns: Countdown[] = []

  categories.forEach((category) => {
    const storedCountdowns = localStorage.getItem(`countdowns_${category}`)
    if (storedCountdowns) {
      const countdowns: Countdown[] = JSON.parse(storedCountdowns)
      const pinnedFromCategory = countdowns
        .filter((countdown) => countdown.pinned)
        .map((countdown) => ({
          ...countdown,
          originalCategory: category,
        }))

      pinnedCountdowns = [...pinnedCountdowns, ...pinnedFromCategory]
    }
  })

  return pinnedCountdowns
}

