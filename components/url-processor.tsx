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
    processUrlParameters();
  }, []);
  
  // This component doesn't render anything
  return null;
} 