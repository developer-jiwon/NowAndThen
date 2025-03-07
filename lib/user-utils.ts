import { v4 as uuidv4 } from "uuid";

// Key for storing the user ID in localStorage
const USER_ID_KEY = "now_then_user_id";

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
 * Gets the current user's ID from URL query parameter, localStorage, or creates a new one
 * This allows each user to have their own set of countdowns and share them via URL
 */
export function getUserId(): string {
  // Check if we're in a browser environment
  if (typeof window === "undefined") {
    console.log("Not in browser environment");
    return "";
  }

  // First check if there's a user ID in the URL query parameters
  const urlParams = new URLSearchParams(window.location.search);
  const urlUserId = urlParams.get('uid');
  
  if (urlUserId) {
    console.log("Retrieved userId from URL:", urlUserId);
    
    // Store this URL-provided ID in localStorage for future visits
    localStorage.setItem(USER_ID_KEY, urlUserId);
    return urlUserId;
  }

  // If no user ID in URL, try to get from localStorage
  let userId = localStorage.getItem(USER_ID_KEY);
  console.log("Retrieved userId from localStorage:", userId);

  // If no user ID exists, create a new one and store it
  if (!userId) {
    userId = generateShortId();
    console.log("Generated new userId:", userId);
    localStorage.setItem(USER_ID_KEY, userId);
    
    // Update the URL with the new user ID without reloading the page
    updateUrlWithUserId(userId);
  } else {
    // If we have a userId from localStorage but not in URL, update the URL
    updateUrlWithUserId(userId);
  }

  return userId;
}

/**
 * Updates the URL with the user ID as a query parameter without reloading the page
 */
export function updateUrlWithUserId(userId: string): void {
  if (typeof window === "undefined") return;
  
  const url = new URL(window.location.href);
  url.searchParams.set('uid', userId);
  
  // Update the URL without reloading the page
  window.history.replaceState({}, '', url.toString());
}

/**
 * Creates a user-specific storage key for the given base key
 * This ensures each user has their own storage space
 */
export function getUserStorageKey(baseKey: string): string {
  const userId = getUserId();
  return `${userId}_${baseKey}`;
} 