"use client"

import { useEffect } from "react"
import { getUserId, updateUrlWithUserId } from "@/lib/user-utils"

/**
 * This component ensures that data is properly shared across browsers
 * by adding the user ID parameter to the URL if it's not already there.
 */
export default function CrossBrowserDataHandler() {
  useEffect(() => {
    // Only run in browser
    if (typeof window === "undefined") return;
    
    console.log("CrossBrowserDataHandler: Initializing");
    
    // Check if we have the uid parameter in the URL
    const urlParams = new URLSearchParams(window.location.search);
    const hasUid = urlParams.has('uid');
    
    console.log("CrossBrowserDataHandler: URL parameters", { hasUid });
    
    // If we don't have a uid in the URL, add it
    if (!hasUid) {
      console.log("CrossBrowserDataHandler: Adding uid parameter to URL");
      
      try {
        // Get the current user ID
        const userId = getUserId();
        
        // Update the URL with just the user ID
        updateUrlWithUserId(userId, false);
        
        console.log("CrossBrowserDataHandler: Added uid parameter to URL");
      } catch (error) {
        console.error("CrossBrowserDataHandler: Error adding uid parameter to URL", error);
      }
    }
    
    // Set up an event listener to handle localStorage changes
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key && event.key.includes('countdowns_')) {
        try {
          // Get the current user ID
          const userId = localStorage.getItem("now_then_user_id");
          if (!userId) return;
          
          // Ensure the URL has the user ID
          updateUrlWithUserId(userId, false);
          
          console.log("CrossBrowserDataHandler: Updated URL after localStorage change");
        } catch (error) {
          console.error("CrossBrowserDataHandler: Error updating URL after localStorage change", error);
        }
      }
    };
    
    // Listen for storage events
    window.addEventListener('storage', handleStorageChange);
    
    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
  
  // This component doesn't render anything
  return null;
} 