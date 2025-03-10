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
  } else if (userId.length > 8) {
    // If the ID is too long (from a previous version or deployment), truncate it
    userId = userId.substring(0, 8);
    localStorage.setItem(USER_ID_KEY, userId);
  }
  
  return userId;
}

/**
 * Creates a shareable URL that includes both the user ID and all countdown data
 * This URL can be opened on any device to access the same countdowns
 * For sharing purposes, we include the data parameter
 */
export function createShareableUrl(): string {
  if (typeof window === "undefined") return "";
  
  try {
    // Get the current user ID
    const userId = getOrCreateUserId();
    
    // Export all countdown data
    const dataString = exportCountdownsToShareableString();
    
    // Create a URL with both the user ID and data
    // Use absolute URL to ensure it works across different domains
    const url = new URL(window.location.origin + window.location.pathname);
    url.searchParams.set('uid', userId);
    
    // For sharing purposes, we include the data parameter
    if (dataString) {
      url.searchParams.set('data', dataString);
    }
    
    console.log("Created shareable URL with data for sharing purposes");
    return url.toString();
  } catch (error) {
    console.error("Error creating shareable URL:", error);
    return window.location.href;
  }
}

/**
 * Checks for and processes URL parameters (uid and data)
 * This should be called once when the application loads
 */
export function processUrlParameters(): void {
  if (typeof window === "undefined") return;
  
  console.log("Processing URL parameters...");
  
  // Get URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const urlUserId = urlParams.get('uid');
  const sharedData = urlParams.get('data');
  
  console.log("URL parameters:", { urlUserId, hasSharedData: !!sharedData });
  
  // Process the user ID from URL if present
  if (urlUserId) {
    console.log("Setting user ID from URL:", urlUserId);
    
    // Ensure the ID is not too long
    const shortUrlUserId = urlUserId.length > 8 ? urlUserId.substring(0, 8) : urlUserId;
    localStorage.setItem(USER_ID_KEY, shortUrlUserId);
    
    // Check if we already have data in localStorage for this user
    const hasLocalData = checkForLocalData(shortUrlUserId);
    
    // Process shared data if present and we don't have local data
    if (sharedData && !hasLocalData) {
      console.log("Found shared data in URL and no local data, importing...");
      
      try {
        // Import the data
        importCountdownsFromSharedData(sharedData, shortUrlUserId);
        
        console.log("Data imported successfully from URL");
        
        // Set a flag to indicate that we've processed the URL data
        localStorage.setItem(URL_DATA_PROCESSED_KEY, 'true');
        
        // Clean up the URL by removing the data parameter
        updateUrlWithUserId(shortUrlUserId, false);
      } catch (error) {
        console.error("Error importing shared data from URL:", error);
      }
    } else if (sharedData && hasLocalData) {
      console.log("Found shared data in URL but local data exists, using local data");
      
      // Clean up the URL by removing the data parameter
      updateUrlWithUserId(shortUrlUserId, false);
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
 * No longer includes the data parameter to keep URLs shorter
 */
export function updateUrlWithUserId(userId: string, includeData: boolean = false): void {
  if (typeof window === "undefined") return;
  
  console.log("Updating URL with user ID:", userId);
  
  try {
    const url = new URL(window.location.href);
    
    // Set the user ID parameter
    url.searchParams.set('uid', userId);
    
    // Remove any existing data parameter to keep the URL clean
    if (url.searchParams.has('data')) {
      url.searchParams.delete('data');
    }
    
    // Update the URL without reloading the page
    window.history.replaceState({}, '', url.toString());
    console.log("URL updated successfully with only user ID");
  } catch (error) {
    console.error("Error updating URL:", error);
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
    console.log("Starting import of shared data...");
    
    // Decode the base64 string and parse the JSON
    const jsonString = atob(sharedData);
    const importData = JSON.parse(jsonString) as Record<string, Countdown[]>;
    
    // Get the user ID (either provided or from localStorage/new)
    const userId = specificUserId || getOrCreateUserId();
    console.log("Importing data for user ID:", userId);
    
    // Track if we've imported any countdowns
    let importedCount = 0;
    
    // Import countdowns for each category
    Object.entries(importData).forEach(([category, countdowns]) => {
      if (!countdowns || !Array.isArray(countdowns) || countdowns.length === 0) {
        console.log(`No countdowns to import for category: ${category}`);
        return;
      }
      
      console.log(`Importing ${countdowns.length} countdowns for category: ${category}`);
      
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
              importedCount++;
            }
          });
          
          // Save the merged data
          localStorage.setItem(storageKey, JSON.stringify(existingCountdowns));
          console.log(`Merged ${importedCount} countdowns for category: ${category}`);
        } catch (error) {
          console.error(`Error merging ${category} countdowns:`, error);
          // If there's an error, just overwrite with the imported data
          localStorage.setItem(storageKey, JSON.stringify(countdowns));
          importedCount += countdowns.length;
          console.log(`Overwrote with ${countdowns.length} countdowns for category: ${category}`);
        }
      } else {
        // No existing data, just save the imported data
        localStorage.setItem(storageKey, JSON.stringify(countdowns));
        importedCount += countdowns.length;
        console.log(`Saved ${countdowns.length} new countdowns for category: ${category}`);
      }
    });
    
    console.log(`Successfully imported ${importedCount} shared countdowns`);
    
    // Set a flag to indicate data has been imported
    localStorage.setItem(DATA_IMPORTED_KEY, 'true');
    
    // No page reload or notification - removed as requested
  } catch (error) {
    console.error("Error importing shared data:", error);
  }
}

/**
 * Checks if there is any data in localStorage for the given user ID
 */
function checkForLocalData(userId: string): boolean {
  const categories = ["general", "personal", "custom", "hidden"];
  
  for (const category of categories) {
    const storageKey = getUserStorageKey(`countdowns_${category}`, userId);
    const storedData = localStorage.getItem(storageKey);
    
    if (storedData) {
      try {
        const countdowns = JSON.parse(storedData);
        if (countdowns && Array.isArray(countdowns) && countdowns.length > 0) {
          return true;
        }
      } catch (error) {
        console.error(`Error parsing ${category} countdowns:`, error);
      }
    }
  }
  
  return false;
} 