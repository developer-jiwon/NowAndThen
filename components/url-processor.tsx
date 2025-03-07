"use client"

import { useEffect } from "react"
import { processUrlParameters } from "@/lib/user-utils"

/**
 * This component processes URL parameters as soon as the page loads.
 * It doesn't render anything visible.
 */
export default function UrlProcessor() {
  useEffect(() => {
    // Process URL parameters on component mount
    console.log("UrlProcessor: Processing URL parameters on mount");
    try {
      // Check if we have data in the URL
      const urlParams = new URLSearchParams(window.location.search);
      const hasData = urlParams.has('data');
      
      console.log("UrlProcessor: URL has data parameter:", hasData);
      
      // Process URL parameters
      processUrlParameters();
      
      // If we don't have data in the URL but we have a uid, try to get data from localStorage
      if (!hasData && urlParams.has('uid')) {
        console.log("UrlProcessor: URL has uid but no data, checking localStorage");
        
        // This will be handled by the processUrlParameters function
      }
    } catch (error) {
      console.error("Error processing URL parameters:", error);
    }
  }, []);
  
  // This component doesn't render anything
  return null;
} 