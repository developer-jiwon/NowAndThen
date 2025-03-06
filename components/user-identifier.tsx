"use client"

import { useState, useEffect } from "react"
import { getUserId } from "@/lib/user-utils"

export default function UserIdentifier() {
  const [userId, setUserId] = useState<string>("")
  const [fullId, setFullId] = useState<string>("")
  
  useEffect(() => {
    // Get the full user ID
    const id = getUserId();
    console.log("Full user ID:", id); // Debug log
    
    // Store both the full ID and the truncated version
    setFullId(id);
    
    // Only truncate if we have an ID
    if (id && id.length > 0) {
      setUserId(id.substring(0, 8) + "...");
    } else {
      setUserId("No ID found");
    }
  }, [])
  
  if (!userId) return null
  
  return (
    <div className="text-xs text-gray-400 text-center mt-2 mb-4">
      <p>Your unique ID: {userId}</p>
      <p className="text-[10px] mt-1">Your countdowns are stored locally with this ID</p>
      <p className="text-[10px] mt-1">Full ID: {fullId}</p>
    </div>
  )
} 