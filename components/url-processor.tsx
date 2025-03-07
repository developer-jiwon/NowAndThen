"use client"

import { useEffect } from "react"
import { processUrlParameters, updateUrlWithUserId } from "@/lib/user-utils"

/**
 * This component processes URL parameters as soon as the page loads.
 * It doesn't render anything visible.
 */
export default function UrlProcessor() {
  useEffect(() => {
    // Process URL parameters on component mount
    console.log("UrlProcessor: Processing URL parameters on mount");
    try {
      // Check if we have the uid parameter in the URL
      const urlParams = new URLSearchParams(window.location.search);
      const hasUid = urlParams.has('uid');
      const hasData = urlParams.has('data');
      
      console.log("UrlProcessor: URL parameters", { hasUid, hasData });
      
      if (hasUid) {
        // Process URL parameters
        processUrlParameters();
        console.log("UrlProcessor: Processed URL parameters");
        
        // If there's data in the URL, clean it up after processing
        if (hasData) {
          const userId = urlParams.get('uid') || "";
          setTimeout(() => {
            updateUrlWithUserId(userId, false);
            console.log("UrlProcessor: Cleaned up URL by removing data parameter");
          }, 1000); // Delay to ensure data is processed first
        }
      }
    } catch (error) {
      console.error("Error processing URL parameters:", error);
    }
  }, []);
  
  // This component doesn't render anything
  return null;
} 