import { v4 as uuidv4 } from "uuid";
import type { Countdown } from "./types";

// Key for storing the user ID in localStorage
const USER_ID_KEY = "now_then_user_id";
// Flag to track if we've already processed URL data
const URL_DATA_PROCESSED_KEY = "now_then_url_data_processed";
// Flag to track if data has been imported in this browser
const DATA_IMPORTED_KEY = "now_then_data_imported";

/**
 * Generates a shorter unique ID (8 characters) from a UUID
 */
export function generateShortId(): string {
  // Generate a full UUID
  const fullUuid = uuidv4();
  
  // Take the first 8 characters, which should still be unique enough for our purposes
  return fullUuid.substring(0, 8);
}

/**
 * Gets the user ID from localStorage or generates a new one
 * This is a helper function that doesn't check URL parameters
 */
function getOrCreateUserId(): string {
  if (typeof window === "undefined") return "";
  
  // Try to get from localStorage
  let userId = localStorage.getItem(USER_ID_KEY);
  
  // If no user ID exists, create a new one and store it
  if (!userId) {
    userId = generateShortId();
    console.log("Generated new userId:", userId);
    localStorage.setItem(USER_ID_KEY, userId);
  }
  
  return userId;
}

/**
 * Checks for and processes URL parameters (uid and data)
 * This should be called once when the application loads
 */
export function processUrlParameters(): void {
  if (typeof window === "undefined") return;
  
  // Get URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const urlUserId = urlParams.get('uid');
  const sharedData = urlParams.get('data');
  
  // If we have a user ID in the URL, use it
  if (urlUserId) {
    console.log("Setting user ID from URL:", urlUserId);
    localStorage.setItem(USER_ID_KEY, urlUserId);
    
    // If we also have shared data, import it
    if (sharedData) {
      // Check if we've already imported this data in this browser
      const dataImported = localStorage.getItem(`${DATA_IMPORTED_KEY}_${sharedData.substring(0, 10)}`);
      
      if (!dataImported) {
        console.log("Importing shared data from URL");
        try {
          importCountdownsFromSharedData(sharedData, urlUserId);
          
          // Mark this data as imported to avoid reimporting
          localStorage.setItem(`${DATA_IMPORTED_KEY}_${sharedData.substring(0, 10)}`, "true");
        } catch (error) {
          console.error("Error importing shared data:", error);
        }
      } else {
        console.log("Data already imported, skipping import");
      }
    }
  }
}

/**
 * Gets the current user's ID from URL query parameter, localStorage, or creates a new one
 * This allows each user to have their own set of countdowns and share them via URL
 */
export function getUserId(): string {
  // Check if we're in a browser environment
  if (typeof window === "undefined") {
    console.log("Not in browser environment");
    return "";
  }

  // Process URL parameters if they exist
  processUrlParameters();
  
  // Get the user ID (either from localStorage or newly generated)
  const userId = getOrCreateUserId();
  
  // Ensure the URL has the user ID
  updateUrlWithUserId(userId);
  
  return userId;
}

/**
 * Updates the URL with the user ID as a query parameter without reloading the page
 */
export function updateUrlWithUserId(userId: string): void {
  if (typeof window === "undefined") return;
  
  const url = new URL(window.location.href);
  
  // Only update if the uid parameter is different or missing
  if (url.searchParams.get('uid') !== userId) {
    url.searchParams.set('uid', userId);
    
    // Update the URL without reloading the page
    window.history.replaceState({}, '', url.toString());
  }
}

/**
 * Creates a user-specific storage key for the given base key
 * This ensures each user has their own storage space
 */
export function getUserStorageKey(baseKey: string, specificUserId?: string): string {
  const userId = specificUserId || getOrCreateUserId();
  return `${userId}_${baseKey}`;
}

/**
 * Exports all user countdowns to a compressed string that can be shared via URL
 */
export function exportCountdownsToShareableString(): string {
  if (typeof window === "undefined") return "";
  
  const userId = getOrCreateUserId();
  const categories = ["general", "personal", "custom", "hidden"];
  const exportData: Record<string, Countdown[]> = {};
  
  // Collect all countdowns from all categories
  categories.forEach(category => {
    const storageKey = getUserStorageKey(`countdowns_${category}`, userId);
    const storedData = localStorage.getItem(storageKey);
    
    if (storedData) {
      try {
        exportData[category] = JSON.parse(storedData);
      } catch (error) {
        console.error(`Error parsing ${category} countdowns:`, error);
        exportData[category] = [];
      }
    } else {
      exportData[category] = [];
    }
  });
  
  // Convert to JSON and compress using base64 encoding
  const jsonString = JSON.stringify(exportData);
  return btoa(jsonString);
}

/**
 * Imports countdowns from a shared data string
 * Takes an optional userId parameter to avoid circular dependencies
 */
export function importCountdownsFromSharedData(sharedData: string, specificUserId?: string): void {
  if (typeof window === "undefined") return;
  
  try {
    // Decode the base64 string and parse the JSON
    const jsonString = atob(sharedData);
    const importData = JSON.parse(jsonString) as Record<string, Countdown[]>;
    
    // Get the user ID (either provided or from localStorage/new)
    const userId = specificUserId || getOrCreateUserId();
    
    // Import countdowns for each category
    Object.entries(importData).forEach(([category, countdowns]) => {
      const storageKey = getUserStorageKey(`countdowns_${category}`, userId);
      
      // Check if we already have data for this category
      const existingData = localStorage.getItem(storageKey);
      
      if (existingData) {
        try {
          // Merge existing data with imported data
          const existingCountdowns = JSON.parse(existingData) as Countdown[];
          
          // Create a map of existing countdowns by ID for quick lookup
          const existingMap = new Map(existingCountdowns.map(c => [c.id, c]));
          
          // Add imported countdowns that don't already exist
          countdowns.forEach(countdown => {
            if (!existingMap.has(countdown.id)) {
              existingCountdowns.push(countdown);
            }
          });
          
          // Save the merged data
          localStorage.setItem(storageKey, JSON.stringify(existingCountdowns));
        } catch (error) {
          console.error(`Error merging ${category} countdowns:`, error);
          // If there's an error, just overwrite with the imported data
          localStorage.setItem(storageKey, JSON.stringify(countdowns));
        }
      } else {
        // No existing data, just save the imported data
        localStorage.setItem(storageKey, JSON.stringify(countdowns));
      }
    });
    
    console.log("Successfully imported shared countdowns");
  } catch (error) {
    console.error("Error importing shared data:", error);
  }
} 