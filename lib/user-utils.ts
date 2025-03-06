import { v4 as uuidv4 } from "uuid";

// Key for storing the user ID in localStorage
const USER_ID_KEY = "now_then_user_id";

/**
 * Gets the current user's ID, or creates a new one if it doesn't exist
 * This allows each user to have their own set of countdowns
 */
export function getUserId(): string {
  // Check if we're in a browser environment
  if (typeof window === "undefined") {
    console.log("Not in browser environment");
    return "";
  }

  // Try to get the existing user ID from localStorage
  let userId = localStorage.getItem(USER_ID_KEY);
  console.log("Retrieved userId from localStorage:", userId);

  // If no user ID exists, create a new one and store it
  if (!userId) {
    userId = uuidv4();
    console.log("Generated new userId:", userId);
    localStorage.setItem(USER_ID_KEY, userId);
  }

  return userId;
}

/**
 * Creates a user-specific storage key for the given base key
 * This ensures each user has their own storage space
 */
export function getUserStorageKey(baseKey: string): string {
  const userId = getUserId();
  return `${userId}_${baseKey}`;
} 