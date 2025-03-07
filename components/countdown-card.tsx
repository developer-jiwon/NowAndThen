"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff, Trash2, Pin, PinOff, Clock, Edit, X, Check } from "lucide-react"
import type { Countdown, TimeRemaining } from "@/lib/types"
import { calculateTimeRemaining, isDateInPast, standardizeDate, formatDateString } from "@/lib/countdown-utils"

// Define colors for past and future events
const countUpColor = "#E5E1E6"; // Light lavender for count up
const countDownColor = "#87CEEB"; // Sky blue for count down

interface CountdownCardProps {
  countdown: Countdown
  onRemove: (id: string) => void
  onToggleVisibility: (id: string) => void
  onTogglePin?: (id: string) => void
  onEdit?: (id: string) => void
  category: string
}

export default function CountdownCard({
  countdown,
  onRemove,
  onToggleVisibility,
  onTogglePin,
  onEdit,
  category,
}: CountdownCardProps) {
  // Use the exact date from the countdown
  const exactDate = countdown.date;
  console.log("CountdownCard using exact date:", exactDate);
  
  // Determine if the date is in the past using our utility function
  const isPastDate = isDateInPast(exactDate);
  
  // Check if the date is today
  const checkIsToday = () => {
    const today = new Date();
    const targetDate = new Date(exactDate);
    return today.getFullYear() === targetDate.getFullYear() &&
           today.getMonth() === targetDate.getMonth() &&
           today.getDate() === targetDate.getDate();
  };
  
  // Check if the date is tomorrow
  const checkIsTomorrow = () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    const targetDate = new Date(exactDate);
    return tomorrow.getFullYear() === targetDate.getFullYear() &&
           tomorrow.getMonth() === targetDate.getMonth() &&
           tomorrow.getDate() === targetDate.getDate();
  };
  
  // Determine if the date is today or tomorrow
  const isToday = checkIsToday();
  const isTomorrow = checkIsTomorrow();
  
  // Determine if this is a count-up event (past date or explicitly set as countUp)
  // Today's date should be treated as a countdown unless explicitly set as countUp
  const isCountUp = countdown.isCountUp || (isPastDate && !isToday);
  
  // Initialize time remaining state
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>({
    total: 0,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isCountUp: isCountUp
  });
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Update the time remaining every second
  useEffect(() => {
    // Calculate initial time
    const updateTime = () => {
      const newTimeRemaining = calculateTimeRemaining(exactDate, isCountUp);
      console.log("Time remaining for", countdown.title, ":", newTimeRemaining);
      
      // The tomorrow check is now handled directly in calculateTimeRemaining
      // No need for additional check here
      
      setTimeRemaining(newTimeRemaining);
    };
    
    // Update immediately
    updateTime();
    
    // Set up interval for updates
    const timer = setInterval(updateTime, 1000);
    
    // Clean up interval on unmount
    return () => clearInterval(timer);
  }, [exactDate, isCountUp, countdown.date, countdown.title, isTomorrow]);
  
  const isCustom = category === "custom" || (category === "pinned" && countdown.originalCategory === "custom");
  const isPinned = countdown.pinned || false;

  // Determine header color based on countdown/countup type
  const headerStyle = isCountUp
    ? { backgroundColor: countUpColor, color: '#333333' }
    : { backgroundColor: countDownColor, color: '#333333' };

  // Determine header title - only show special text for tomorrow
  let headerTitle = countdown.title;
  if (isTomorrow) {
    headerTitle = "Tomorrow";
  }

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
    // Auto-hide after 5 seconds
    setTimeout(() => {
      setShowDeleteConfirm(false);
    }, 5000);
  };

  const confirmDelete = () => {
    onRemove(countdown.id);
    setShowDeleteConfirm(false);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  return (
    <Card className="overflow-hidden border-charcoal/10 transition-all hover:shadow-md relative">
      {showDeleteConfirm && (
        <div className="absolute inset-0 bg-white/30 backdrop-blur-[1px] z-10 flex items-center justify-center">
          <div className="bg-white/50 p-1.5 rounded-md shadow-sm text-[10px] text-center max-w-[70%] border border-charcoal/10">
            <p className="text-charcoal mb-1.5">Delete this timer?</p>
            <div className="flex justify-center gap-2">
              <Button 
                size="sm" 
                variant="outline" 
                className="h-6 px-1.5 text-[10px] border-charcoal/20 text-charcoal hover:bg-charcoal/5"
                onClick={cancelDelete}
              >
                <X className="h-2.5 w-2.5 mr-1" /> Cancel
              </Button>
              <Button 
                size="sm" 
                variant="destructive" 
                className="h-6 px-1.5 text-[10px] bg-red-500/70 hover:bg-red-500/80"
                onClick={confirmDelete}
              >
                <Check className="h-2.5 w-2.5 mr-1" /> Confirm
              </Button>
            </div>
          </div>
        </div>
      )}
      <CardHeader 
        className="py-2 sm:py-3 relative flex items-center justify-center min-h-[50px] sm:min-h-[60px]"
        style={headerStyle}
      >
        {/* Left side icons */}
        <div className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5 sm:gap-1">
          {onTogglePin && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 sm:h-7 sm:w-7 text-current hover:bg-white/10"
              onClick={() => onTogglePin(countdown.id)}
              title={isPinned ? "Unpin" : "Pin"}
            >
              {isPinned ? <PinOff className="h-3 w-3 sm:h-4 sm:w-4" /> : <Pin className="h-3 w-3 sm:h-4 sm:w-4" />}
            </Button>
          )}
          {isCountUp && <Clock className="h-3 w-3 sm:h-4 sm:w-4 ml-1" />}
        </div>
        
        {/* Right side icons */}
        <div className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5 sm:gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 sm:h-7 sm:w-7 text-current hover:bg-white/10"
            onClick={() => onToggleVisibility(countdown.id)}
            title={countdown.hidden ? "Show" : "Hide"}
          >
            {category === "hidden" ? <Eye className="h-3 w-3 sm:h-4 sm:w-4" /> : (countdown.hidden ? <Eye className="h-3 w-3 sm:h-4 sm:w-4" /> : <EyeOff className="h-3 w-3 sm:h-4 sm:w-4" />)}
          </Button>
          {onEdit && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 sm:h-7 sm:w-7 text-current hover:bg-white/10"
              onClick={() => onEdit(countdown.id)}
              title="Edit"
            >
              <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          )}
          {(
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 sm:h-7 sm:w-7 text-current hover:bg-white/10"
              onClick={handleDeleteClick}
              title="Remove"
            >
              <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          )}
        </div>
        
        <CardTitle className="font-merriweather text-center text-sm sm:text-base px-12 sm:px-16">{headerTitle}</CardTitle>
      </CardHeader>
      <CardContent className="pt-4 sm:pt-6 px-3 sm:px-6">
        <div className="font-merriweather text-charcoal">
          <div className="flex flex-col items-center justify-center text-center">
            <span className="text-5xl sm:text-6xl md:text-7xl font-bold">
              {timeRemaining.days}
            </span>
            <span className="text-sm sm:text-base uppercase mt-2 font-semibold tracking-wider">{timeRemaining.isCountUp ? "Days Since" : "Days Until"}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-0 pb-3 sm:pb-4 px-3 sm:px-6">
        <div className="w-full text-center">
          {countdown.description && (
            <p className="text-xs sm:text-sm text-gray-700 font-medium mb-1">
              {countdown.description}
            </p>
          )}
          <p className="text-xs text-gray-500">
            {formatDateString(exactDate)}
          </p>
        </div>
      </CardFooter>
    </Card>
  )
}

