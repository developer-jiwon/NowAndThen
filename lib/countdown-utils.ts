import { v4 as uuidv4 } from "uuid"
import type { Countdown, TimeRemaining } from "./types"

// Utility function to standardize date format and handling
export function standardizeDate(dateInput: string): string {
  // If it's already in YYYY-MM-DD format, return as is
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
    return dateInput;
  }
  
  // If it has a time component, extract just the date part
  if (dateInput.includes('T')) {
    return dateInput.split('T')[0];
  }
  
  // For any other format, create a date object and format it
  try {
    const date = new Date(dateInput);
    // Use UTC methods to avoid timezone issues
    const year = date.getUTCFullYear();
    // Add 1 to month because getUTCMonth() returns 0-11
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error("Error standardizing date:", error);
    return dateInput; // Return original if parsing fails
  }
}

// Utility function to determine if a date is in the past
export function isDateInPast(dateString: string): boolean {
  // Standardize the date format first
  const standardizedDate = standardizeDate(dateString);
  
  // Create date objects for comparison
  const targetDate = new Date(standardizedDate);
  targetDate.setHours(0, 0, 0, 0); // Start of the target day
  
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Start of today
  
  // A date is in the past if it's strictly before today
  return targetDate < today;
}

// Calculate time remaining for a countdown or elapsed for a countup
export function calculateTimeRemaining(targetDateString: string, isCountUp = false): TimeRemaining {
  // Get current time
  const now = new Date();
  
  // Standardize the date format
  const standardizedDate = standardizeDate(targetDateString);
  
  // Create a date object for the target date
  let targetDateObj: Date;
  
  // Check if the date is today
  const checkIsToday = () => {
    const today = new Date();
    const target = new Date(standardizedDate);
    
    return today.getFullYear() === target.getFullYear() &&
           today.getMonth() === target.getMonth() &&
           today.getDate() === target.getDate();
  };
  
  // Check if the date is tomorrow
  const checkIsTomorrow = () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    const target = new Date(standardizedDate);
    return tomorrow.getFullYear() === target.getFullYear() &&
           tomorrow.getMonth() === target.getMonth() &&
           tomorrow.getDate() === target.getDate();
  };
  
  // Determine if the date is today or tomorrow
  const isToday = checkIsToday();
  const isTomorrow = checkIsTomorrow();
  
  console.log("Date check:", { standardizedDate, isToday, isTomorrow, isCountUp });
  
  // Create target date object based on the standardized date
  const targetDateParsed = new Date(standardizedDate);
  
  if (isCountUp) {
    // For all count-up events, use the start of the day (midnight 00:00:00)
    targetDateObj = new Date(targetDateParsed);
    targetDateObj.setHours(0, 0, 0, 0);
    console.log("Count-up target:", targetDateObj.toISOString());
  } else if (isToday) {
    // For countdown on today's date, use end of day (23:59:59)
    const todayEndOfDay = new Date();
    todayEndOfDay.setHours(23, 59, 59, 999);
    targetDateObj = todayEndOfDay;
    console.log("Today's end of day for countdown:", targetDateObj.toISOString());
  } else {
    // For all other countdowns (including tomorrow), use the start of the day
    targetDateObj = new Date(targetDateParsed);
    targetDateObj.setHours(0, 0, 0, 0);
    console.log("Countdown target:", targetDateObj.toISOString());
  }
  
  // Calculate the difference in milliseconds
  let diff: number;
  
  if (isCountUp) {
    // For count-up, calculate time elapsed since target date
    diff = now.getTime() - targetDateObj.getTime();
    console.log("Count-up diff:", diff, "ms");
  } else {
    // For countdown, calculate time remaining until target date
    diff = targetDateObj.getTime() - now.getTime();
    console.log("Countdown diff:", diff, "ms");
  }

  // Ensure we don't have negative values for display
  const total = Math.max(0, diff);

  // Calculate days
  let days = Math.floor(total / (1000 * 60 * 60 * 24));
  
  // Special case for tomorrow: always show at least 1 day
  if (isTomorrow && !isCountUp) {
    // For tomorrow's date, always show 1 day remaining regardless of hours
    days = 1;
  }
  
  // We'll keep these values at 0 since we're only displaying days
  const hours = 0;
  const minutes = 0;
  const seconds = 0;

  // Return the time remaining object
  return {
    total,
    days,
    hours,
    minutes,
    seconds,
    isCountUp,
  };
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
        date: `${nextYear}-01-01`,
        description: `Countdown to ${nextYear}`,
        hidden: false,
        pinned: false,
        isCountUp: false,
      },
      // Canadian Holidays
      {
        id: uuidv4(),
        title: "Canada Day",
        date: `${currentYear}-07-01`,
        description: "National Day of Canada",
        hidden: false,
        pinned: false,
        isCountUp: false,
      },
      {
        id: uuidv4(),
        title: "Thanksgiving (Canada)",
        date: `${currentYear}-10-09`,
        description: "Canadian Thanksgiving",
        hidden: false,
        pinned: false,
        isCountUp: false,
      },
      {
        id: uuidv4(),
        title: "Christmas",
        date: `${currentYear}-12-25`,
        description: "Christmas Day",
        hidden: false,
        pinned: true,
        isCountUp: false,
      },
      // Korean Holidays
      {
        id: uuidv4(),
        title: "Seollal (Korean New Year)",
        date: `${currentYear}-02-10`,
        description: "Korean Lunar New Year",
        hidden: false,
        pinned: false,
        isCountUp: false,
      },
      {
        id: uuidv4(),
        title: "Chuseok (Korean Thanksgiving)",
        date: `${currentYear}-09-17`,
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
        date: `${currentYear}-06-15`,
        description: "Add your actual birth date",
        hidden: false,
        pinned: true,
        isCountUp: false,
      },
      {
        id: uuidv4(),
        title: "Mom's Birthday",
        date: `${currentYear}-03-20`,
        description: "Add your mom's actual birth date",
        hidden: false,
        pinned: false,
        isCountUp: false,
      },
      {
        id: uuidv4(),
        title: "Dad's Birthday",
        date: `${currentYear}-09-05`,
        description: "Add your dad's actual birth date",
        hidden: false,
        pinned: false,
        isCountUp: false,
      },
      {
        id: uuidv4(),
        title: "Best Friend's Birthday",
        date: `${currentYear}-11-12`,
        description: "Add your friend's actual birth date",
        hidden: false,
        pinned: false,
        isCountUp: false,
      },
      // Countup examples
      {
        id: uuidv4(),
        title: "First Job Anniversary",
        date: `${lastYear}-03-15`,
        description: "Time since starting my first job",
        hidden: false,
        pinned: false,
        isCountUp: true,
      },
      {
        id: uuidv4(),
        title: "Relationship Anniversary",
        date: `${lastYear}-08-22`,
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
    const storedCountdowns = localStorage.getItem(`countdowns_${category}`) || "[]"
    try {
      const countdowns: Countdown[] = JSON.parse(storedCountdowns)
      const pinnedFromCategory = countdowns
        .filter((countdown) => countdown.pinned)
        .map((countdown) => ({
          ...countdown,
          originalCategory: category as "general" | "personal" | "custom"
        }))

      pinnedCountdowns = [...pinnedCountdowns, ...pinnedFromCategory]
    } catch (error) {
      console.error(`Error parsing countdowns for category ${category}:`, error)
    }
  })

  return pinnedCountdowns
}

