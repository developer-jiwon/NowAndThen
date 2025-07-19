import { v4 as uuidv4 } from "uuid"
import type { Countdown, TimeRemaining } from "./types"
import { getUserStorageKey } from "./user-utils"

// Utility function to standardize date format and handling
export function standardizeDate(dateInput: string): string {
  // If empty or invalid, return empty string
  if (!dateInput) {
    return '';
  }
  
  // If it's already in YYYY-MM-DD format, return as is
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
    return dateInput;
  }
  
  // If it has a time component, extract just the date part
  if (dateInput.includes('T')) {
    const datePart = dateInput.split('T')[0];
    return datePart;
  }
  
  // Handle MM/DD/YYYY format directly without using Date object
  const mmddRegex = /^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})$/;
  const match = dateInput.match(mmddRegex);
  
  if (match) {
    const month = String(parseInt(match[1])).padStart(2, '0');
    const day = String(parseInt(match[2])).padStart(2, '0');
    let year = match[3];
    
    // Handle 2-digit years
    if (year.length === 2) {
      year = `20${year}`;
    }
    
    const result = `${year}-${month}-${day}`;
    return result;
  }
  
  // For HTML date input (which should already be YYYY-MM-DD)
  // But just in case, let's handle it directly
  try {
    // Split by common separators and try to determine format
    const parts = dateInput.split(/[\/\-\.]/);
    
    if (parts.length === 3) {
      // Try to determine if it's MM/DD/YYYY or YYYY/MM/DD
      let year, month, day;
      
      // If first part is 4 digits, assume YYYY-MM-DD
      if (parts[0].length === 4) {
        [year, month, day] = parts;
      } 
      // If last part is 4 digits, assume MM-DD-YYYY
      else if (parts[2].length === 4) {
        [month, day, year] = parts;
      }
      // Default to MM-DD-YYYY and hope for the best
      else {
        [month, day, year] = parts;
        // If year is 2 digits, assume it's 2000+
        if (year.length === 2) {
          year = `20${year}`;
        }
      }
      
      // Ensure proper padding
      month = String(parseInt(month)).padStart(2, '0');
      day = String(parseInt(day)).padStart(2, '0');
      
      const result = `${year}-${month}-${day}`;
      return result;
    }
  } catch (error) {
    console.error("Error parsing date parts:", error);
  }
  
  // Last resort: log the issue and return the input
  console.error("Could not standardize date format:", dateInput);
  return dateInput;
}

// Utility function to determine if a date is in the past
export function isDateInPast(dateString: string): boolean {
  // Get today's date in YYYY-MM-DD format
  const now = new Date();
  const todayFormatted = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  
  // Direct string comparison
  return dateString < todayFormatted;
}

// Calculate time remaining for a countdown or elapsed for a countup
export function calculateTimeRemaining(targetDateString: string, isCountUp = false): TimeRemaining {
  // Get current time
  const now = new Date();
  const nowYear = now.getFullYear();
  const nowMonth = now.getMonth() + 1; // 0-indexed to 1-indexed
  const nowDay = now.getDate();
  
  // Parse the target date directly from the string (expected format: YYYY-MM-DD)
  let targetYear, targetMonth, targetDay;
  
  try {
    // Try to parse the date parts directly
    const dateParts = targetDateString.split('-');
    if (dateParts.length === 3) {
      targetYear = parseInt(dateParts[0]);
      targetMonth = parseInt(dateParts[1]);
      targetDay = parseInt(dateParts[2]);
    } else {
      // If not in YYYY-MM-DD format, try to create a Date object
      const targetDate = new Date(targetDateString);
      targetYear = targetDate.getFullYear();
      targetMonth = targetDate.getMonth() + 1; // 0-indexed to 1-indexed
      targetDay = targetDate.getDate();
    }
  } catch (error) {
    console.error("Error parsing date:", error);
    // Return a default value in case of error
    return {
      total: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isToday: false,
      isTomorrow: false,
      isCountUp: isCountUp
    };
  }
  
  // Check if the date is today
  const isToday = targetYear === nowYear && targetMonth === nowMonth && targetDay === nowDay;
  
  // Check if the date is tomorrow
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const isTomorrow = targetYear === tomorrow.getFullYear() && 
                     targetMonth === (tomorrow.getMonth() + 1) && 
                     targetDay === tomorrow.getDate();
  
  // Calculate days difference using a simple date difference calculation
  // Create date objects with time set to midnight to avoid time-of-day issues
  const targetDateObj = new Date(targetYear, targetMonth - 1, targetDay, 0, 0, 0, 0);
  const nowDateObj = new Date(nowYear, nowMonth - 1, nowDay, 0, 0, 0, 0);
  
  // Calculate the difference in days
  const diffTime = Math.abs(targetDateObj.getTime() - nowDateObj.getTime());
  let days = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  // Special case for tomorrow: always show 1 day
  if (isTomorrow && !isCountUp) {
    days = 1;
  }
  
  // Special case for today: always show 0 days
  if (isToday) {
    days = 0;
  }
  
  // Return the time remaining object
  return {
    total: diffTime,
    days: days,
    hours: 0, // We're only displaying days
    minutes: 0,
    seconds: 0,
    isToday: isToday,
    isTomorrow: isTomorrow,
    isCountUp: isCountUp
  };
}

// Get default countdowns based on category
export function getDefaultCountdowns(category: string): Countdown[] {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  
  // Helper to format date as YYYY-MM-DD
  const formatDate = (date: Date) => {
    return date.toISOString().slice(0, 10);
  };
  
  // Helper to add days to today
  const addDays = (days: number) => {
    const date = new Date(today);
    date.setDate(today.getDate() + days);
    return formatDate(date);
  };
  
  // Helper to subtract days from today (for count-up events)
  const subtractDays = (days: number) => {
    const date = new Date(today);
    date.setDate(today.getDate() - days);
    return formatDate(date);
  };

  switch (category) {
    case "general":
      return [
        {
          id: "sample-general-1",
          title: "Q4 Report Due",
          date: addDays(15),
          isCountUp: false,
          hidden: false,
          pinned: true,
          originalCategory: "general"
        },
        {
          id: "sample-general-2", 
          title: "Team Meeting",
          date: addDays(3),
          isCountUp: false,
          hidden: false,
          pinned: false,
          originalCategory: "general"
        },
        {
          id: "sample-general-3",
          title: "Project Deadline",
          date: addDays(30),
          isCountUp: false,
          hidden: false,
          pinned: false,
          originalCategory: "general"
        }
      ];
      
    case "personal":
      return [
        {
          id: "sample-personal-1",
          title: "Mom's Birthday",
          date: addDays(45),
          isCountUp: false,
          hidden: false,
          pinned: true,
          originalCategory: "personal"
        },
        {
          id: "sample-personal-2",
          title: "Vacation",
          date: addDays(67),
          isCountUp: false,
          hidden: false,
          pinned: false,
          originalCategory: "personal"
        },
        {
          id: "sample-personal-3",
          title: "Anniversary",
          date: addDays(23),
          isCountUp: false,
          hidden: false,
          pinned: false,
          originalCategory: "personal"
        },
        {
          id: "sample-personal-4",
          title: "Graduation Day",
          date: subtractDays(5),
          isCountUp: true,
          hidden: false,
          pinned: false,
          originalCategory: "personal"
        }
      ];
      
    case "custom":
      return []; // Custom 탭에는 샘플 데이터 없음
      
    default:
      return [];
  }
}

// Get countdowns from localStorage or default ones
export function getCountdowns(category: string): Countdown[] {
  if (typeof window === "undefined") {
    return []
  }

  const storageKey = getUserStorageKey(`countdowns_${category}`)
  const storedCountdowns = localStorage.getItem(storageKey)
  const samplesDeletedKey = `samples_deleted_${category}`

  if (storedCountdowns) {
    return JSON.parse(storedCountdowns)
  }

  // Check if user has previously deleted samples for this category
  const samplesDeleted = localStorage.getItem(samplesDeletedKey)
  
  if (samplesDeleted === 'true') {
    // User has deleted samples before, don't show them again
    return []
  }

  // Show sample data for new users
  return getDefaultCountdowns(category)
}

// Get all pinned countdowns from all categories
export function getAllPinnedCountdowns(specificUserId?: string): Countdown[] {
  if (typeof window === "undefined") {
    return [];
  }

  const categories = ["general", "personal", "custom"];
  let pinnedCountdowns: Countdown[] = [];

  categories.forEach((category) => {
    const storageKey = getUserStorageKey(`countdowns_${category}`, specificUserId);
    const storedCountdowns = localStorage.getItem(storageKey) || "[]";
    try {
      const countdowns: Countdown[] = JSON.parse(storedCountdowns);
      const pinnedFromCategory = countdowns
        .filter((countdown) => countdown.pinned)
        .map((countdown) => ({
          ...countdown,
          originalCategory: category as "general" | "personal" | "custom",
        }));

      pinnedCountdowns = [...pinnedCountdowns, ...pinnedFromCategory];
    } catch (error) {
      console.error(`Error parsing countdowns for category ${category}:`, error);
    }
  });

  return pinnedCountdowns;
}

// Utility function specifically for handling HTML date input values
// HTML date inputs return values in YYYY-MM-DD format
export function handleHtmlDateInput(dateInput: string): string {
  // Just return the exact input without any processing
  return dateInput;
}

// Format a date string (YYYY-MM-DD) to a human-readable format
export function formatDateString(dateString: string): string {
  // Try to parse the date parts directly
  try {
    const dateParts = dateString.split('-');
    if (dateParts.length === 3) {
      const year = parseInt(dateParts[0]);
      const month = parseInt(dateParts[1]);
      const day = parseInt(dateParts[2]);
      
      // Create a date object with the exact parts, but use UTC to avoid timezone issues
      const date = new Date(Date.UTC(year, month - 1, day));
      
      // Format the date using Intl.DateTimeFormat for better localization
      return new Intl.DateTimeFormat('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        timeZone: 'UTC' // Use UTC to avoid timezone shifts
      }).format(date);
    }
  } catch (error) {
    console.error("Error formatting date string:", error);
  }
  
  // Fallback: if the date can't be parsed, just return it as is
  return dateString;
}

