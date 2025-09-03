import { v4 as uuidv4 } from "uuid";
import type { Countdown } from "./types";

// Key for storing the user ID in localStorage
const USER_ID_KEY = "now_then_user_id";
// Flag to track if we've already processed URL data
const URL_DATA_PROCESSED_KEY = "now_then_url_data_processed";
// Flag to track if data has been imported in this browser
const DATA_IMPORTED_KEY = "now_then_data_imported";

/**
 * Checks if we're in development mode (either NODE_ENV or URL parameter)
 */
function isDevelopmentMode(): boolean {
  if (typeof window === "undefined") return process.env.NODE_ENV === 'development';
  
  // Check URL parameter for forcing dev mode (only in production)
  const urlParams = new URLSearchParams(window.location.search);
  const devMode = urlParams.get('dev');
  
  // 로컬 개발환경: 항상 개발 모드
  // 배포된 사이트: ?dev=1이 있을 때만 개발 모드 (로그인된 사용자만)
  let isDevMode = false;
  
  if (process.env.NODE_ENV === 'development') {
    isDevMode = true;
  } else if (process.env.NODE_ENV === 'production' && (devMode === '1' || devMode === 'true')) {
    // 배포 후 테스트 모드는 로그인된 사용자만 접근 가능
    // 여기서는 사용자 인증 상태를 확인할 수 없으므로 false
    isDevMode = false;
  }
  
  // Log dev mode status for debugging
  if (isDevMode && devMode === '1') {
    console.log('🔧 Development mode forced via ?dev=1 parameter (production only)');
  } else if (isDevMode && process.env.NODE_ENV === 'development') {

  }
  
  return isDevMode;
}

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
  
  // Development environment: Use a consistent user ID
  if (isDevelopmentMode()) {
    const devUserId = 'dev-user-local';
    const existingUserId = localStorage.getItem(USER_ID_KEY);
    
    // If we already have the dev user ID, use it
    if (existingUserId === devUserId) {
      return devUserId;
    }
    
    // Set the dev user ID
    localStorage.setItem(USER_ID_KEY, devUserId);
    isDevelopmentMode() && console.log("Using dev userId:", devUserId);
    return devUserId;
  }
  
  // Production: Try to get from localStorage
  let userId = localStorage.getItem(USER_ID_KEY);
  
  // If no user ID exists, create a new one and store it
  if (!userId) {
    userId = generateShortId();
    process.env.NODE_ENV === 'development' && console.log("Generated new userId:", userId);
    localStorage.setItem(USER_ID_KEY, userId);
  } else if (userId.length > 8) {
    // If the ID is too long (from a previous version or deployment), truncate it
    userId = userId.substring(0, 8);
    localStorage.setItem(USER_ID_KEY, userId);
  }
  
  return userId;
}

/**
 * Creates a shareable URL that includes countdown data
 * This URL can be opened on any device to access the same countdowns
 */
export function createShareableUrl(): string {
  if (typeof window === "undefined") return "";
  
  try {
    // Export all countdown data
    const dataString = exportCountdownsToShareableString();
    
    // Create a URL with data parameter only
    const url = new URL(window.location.origin + window.location.pathname);
    
    // For sharing purposes, we include the data parameter
    if (dataString) {
      url.searchParams.set('data', dataString);
    }
    
    process.env.NODE_ENV === 'development' && console.log("Created shareable URL with data for sharing purposes");
    return url.toString();
  } catch (error) {
    console.error("Error creating shareable URL:", error);
    return window.location.href;
  }
}

/**
 * Checks for and processes URL parameters (data only)
 * This should be called once when the application loads
 */
export function processUrlParameters(): void {
  if (typeof window === "undefined") return;
  
  process.env.NODE_ENV === 'development' && console.log("Processing URL parameters...");
  
  // Get URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const sharedData = urlParams.get('data');
  
  process.env.NODE_ENV === 'development' && console.log("URL parameters:", { hasSharedData: !!sharedData });
  
  // Process shared data if present
  if (sharedData) {
    const userId = getOrCreateUserId();
    const hasLocalData = checkForLocalData(userId);
    
    if (!hasLocalData) {
      process.env.NODE_ENV === 'development' && console.log("Found shared data in URL and no local data, importing...");
      
      try {
        // Import the data
        importCountdownsFromSharedData(sharedData, userId);
        
        process.env.NODE_ENV === 'development' && console.log("Data imported successfully from URL");
        
        // Set a flag to indicate that we've processed the URL data
        localStorage.setItem(URL_DATA_PROCESSED_KEY, 'true');
        
        // Clean up the URL by removing the data parameter
        cleanUpUrl();
      } catch (error) {
        console.error("Error importing shared data from URL:", error);
      }
    } else {
      process.env.NODE_ENV === 'development' && console.log("Found shared data in URL but local data exists, using local data");
      
      // Clean up the URL by removing the data parameter
      cleanUpUrl();
    }
  }
}

/**
 * Gets the current user's ID from localStorage or creates a new one
 * This allows each user to have their own set of countdowns
 */
export function getUserId(): string {
  // Check if we're in a browser environment
  if (typeof window === "undefined") {
    process.env.NODE_ENV === 'development' && console.log("Not in browser environment");
    return "";
  }

  // Process URL parameters if they exist (for shared data only)
  processUrlParameters();
  
  // Get the user ID (either from localStorage or newly generated)
  const userId = getOrCreateUserId();
  
  return userId;
}

/**
 * Cleans up the URL by removing parameters
 */
export function cleanUpUrl(): void {
  if (typeof window === "undefined") return;
  
  try {
    const url = new URL(window.location.href);
    
    // Remove data parameter to keep the URL clean
    if (url.searchParams.has('data')) {
      url.searchParams.delete('data');
    }
    
    // Update the URL without reloading the page
    window.history.replaceState({}, '', url.toString());
    process.env.NODE_ENV === 'development' && console.log("URL cleaned up successfully");
  } catch (error) {
    console.error("Error cleaning up URL:", error);
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
    process.env.NODE_ENV === 'development' && console.log("Starting import of shared data...");
    
    // Decode the base64 string and parse the JSON
    const jsonString = atob(sharedData);
    const importData = JSON.parse(jsonString) as Record<string, Countdown[]>;
    
    // Get the user ID (either provided or from localStorage/new)
    const userId = specificUserId || getOrCreateUserId();
    process.env.NODE_ENV === 'development' && console.log("Importing data for user ID:", userId);
    
    // Track if we've imported any countdowns
    let importedCount = 0;
    
    // Import countdowns for each category
    Object.entries(importData).forEach(([category, countdowns]) => {
      if (!countdowns || !Array.isArray(countdowns) || countdowns.length === 0) {
        process.env.NODE_ENV === 'development' && console.log(`No countdowns to import for category: ${category}`);
        return;
      }
      
      process.env.NODE_ENV === 'development' && console.log(`Importing ${countdowns.length} countdowns for category: ${category}`);
      
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
          process.env.NODE_ENV === 'development' && console.log(`Merged ${importedCount} countdowns for category: ${category}`);
        } catch (error) {
          console.error(`Error merging ${category} countdowns:`, error);
          // If there's an error, just overwrite with the imported data
          localStorage.setItem(storageKey, JSON.stringify(countdowns));
          importedCount += countdowns.length;
          process.env.NODE_ENV === 'development' && console.log(`Overwrote with ${countdowns.length} countdowns for category: ${category}`);
        }
      } else {
        // No existing data, just save the imported data
        localStorage.setItem(storageKey, JSON.stringify(countdowns));
        importedCount += countdowns.length;
        process.env.NODE_ENV === 'development' && console.log(`Saved ${countdowns.length} new countdowns for category: ${category}`);
      }
    });
    
    process.env.NODE_ENV === 'development' && console.log(`Successfully imported ${importedCount} shared countdowns`);
    
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

/**
 * Development utilities - only available in development mode
 */
export const devUtils = {
  /**
   * Reset all localStorage data (for development/testing)
   */
  resetLocalStorage: () => {
    if (!isDevelopmentMode()) {
      console.warn('devUtils.resetLocalStorage() is only available in development mode');
      return;
    }
    
    const keys = Object.keys(localStorage);
    const appKeys = keys.filter(key => 
      key.startsWith('now_then_') || 
      key.includes('countdown') || 
      key === 'guest_id' ||
      key === 'dev_user_data'
    );
    
    appKeys.forEach(key => localStorage.removeItem(key));
    console.log('Reset localStorage keys:', appKeys);
    
    // Reload to reinitialize
    window.location.reload();
  },
  
  /**
   * Switch to production mode (remove dev parameter and use real auth)
   */
  switchToProductionMode: () => {
    if (!isDevelopmentMode()) {
      console.warn('Already in production mode');
      return;
    }
    
    const url = new URL(window.location.href);
    url.searchParams.delete('dev');
    
    // Clear dev data
    localStorage.removeItem('dev_user_data');
    
    window.location.href = url.toString();
  },
  
  /**
   * Switch to development mode (add dev parameter)
   */
  switchToDevelopmentMode: () => {
    const url = new URL(window.location.href);
    url.searchParams.set('dev', '1');
    window.location.href = url.toString();
  },
  
  /**
   * Get development mode URL for testing (useful for production testing)
   */
  getDevModeUrl: () => {
    const url = new URL(window.location.href);
    url.searchParams.set('dev', '1');
    return url.toString();
  },
  
  /**
   * Copy development mode URL to clipboard
   */
  copyDevModeUrl: async () => {
    const devUrl = devUtils.getDevModeUrl();
    try {
      await navigator.clipboard.writeText(devUrl);
      console.log('✅ Development mode URL copied to clipboard:', devUrl);
      return true;
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      console.log('Development mode URL:', devUrl);
      return false;
    }
  },
  
  /**
   * Get current mode info
   */
  getModeInfo: () => {
    return {
      isDevelopmentMode: isDevelopmentMode(),
      nodeEnv: process.env.NODE_ENV,
      hasDevParam: typeof window !== "undefined" && new URLSearchParams(window.location.search).get('dev') === '1',
      userId: getOrCreateUserId(),
      guestId: typeof window !== "undefined" ? localStorage.getItem('guest_id') : null
    };
  }
};

// Make devUtils globally available in development
if (typeof window !== "undefined" && isDevelopmentMode()) {
  (window as any).devUtils = devUtils;
} 