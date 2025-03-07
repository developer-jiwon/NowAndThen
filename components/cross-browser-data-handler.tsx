"use client"

import { useEffect } from "react"
import { getUserId, exportCountdownsToShareableString } from "@/lib/user-utils"

/**
 * This component ensures that data is properly shared across browsers
 * by adding the data parameter to the URL if it's not already there.
 */
export default function CrossBrowserDataHandler() {
  useEffect(() => {
    // Only run in browser
    if (typeof window === "undefined") return;
    
    console.log("CrossBrowserDataHandler: Initializing");
    
    // Check if we have the data parameter in the URL
    const urlParams = new URLSearchParams(window.location.search);
    const hasData = urlParams.has('data');
    const hasUid = urlParams.has('uid');
    
    console.log("CrossBrowserDataHandler: URL parameters", { hasData, hasUid });
    
    // If we don't have data in the URL but we have a uid, add the data parameter
    if (!hasData && hasUid) {
      console.log("CrossBrowserDataHandler: Adding data parameter to URL");
      
      try {
        // Get the current user ID
        const userId = getUserId();
        
        // Export all countdown data
        const dataString = exportCountdownsToShareableString();
        
        if (dataString) {
          // Add the data parameter to the URL
          const url = new URL(window.location.href);
          url.searchParams.set('data', dataString);
          
          // Update the URL without reloading the page
          window.history.replaceState({}, '', url.toString());
          
          console.log("CrossBrowserDataHandler: Added data parameter to URL");
          
          // Reload the page to ensure the data is processed
          setTimeout(() => {
            window.location.reload();
          }, 500);
        }
      } catch (error) {
        console.error("CrossBrowserDataHandler: Error adding data parameter to URL", error);
      }
    }
  }, []);
  
  // This component doesn't render anything
  return null;
} 