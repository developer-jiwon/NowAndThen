"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff, Trash2, Pin, PinOff, Edit, X, Check, Calendar, MessageSquare } from "lucide-react"
import type { Countdown, TimeRemaining } from "@/lib/types"
import { calculateTimeRemaining, isDateInPast, standardizeDate, formatDateString } from "@/lib/countdown-utils"
import { motion, AnimatePresence, easeOut } from "framer-motion"

// Modern, cohesive color palette
const countUpColor = "#e11d48"; // Clean red for count up (past events)
const countDownColor = "#16a34a"; // Clean green for count down (future events)
const customTabCountdownColor = "#2563eb"; // Clean blue for custom tab countdowns

// Modern UI colors
const neutralDark = "#1f2937"; // Modern dark gray
const neutralLight = "#f9fafb"; // Clean light background
const neutralMedium = "#6b7280"; // Balanced medium gray

// Animation variants for countdown cards
const countdownCardVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.3,
      ease: easeOut
    }
  },
  hover: {
    y: -2,
    transition: { 
      duration: 0.2,
      ease: easeOut
    }
  }
};

// Animation variants for countup cards
const countupCardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { 
      duration: 0.3,
      ease: easeOut
    }
  },
  hover: {
    scale: 1.02,
    transition: { 
      duration: 0.2,
      ease: easeOut
    }
  }
};

// Animation variants for icon dots
const iconDotVariants = {
  hidden: { scale: 0, opacity: 0 },
  visible: (i: number) => ({
    scale: 1,
    opacity: 1,
    transition: {
      delay: i * 0.1,
      duration: 0.3,
      ease: easeOut
    }
  }),
  hover: {
    scale: 1.1,
    transition: {
      duration: 0.2,
      ease: easeOut
    }
  },
  tap: {
    scale: 0.9,
    transition: {
      duration: 0.1
    }
  }
};

// Number animation variants for countdown
const countdownNumberVariants = {
  initial: { opacity: 0, y: 5 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.3,
      ease: easeOut
    }
  },
  exit: {
    opacity: 0,
    y: -5,
    transition: {
      duration: 0.2
    }
  }
};

// Number animation variants for countup
const countupNumberVariants = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { 
    opacity: 1, 
    scale: 1,
    transition: { 
      duration: 0.3,
      ease: easeOut
    }
  },
  exit: {
    opacity: 0,
    scale: 1.1,
    transition: {
      duration: 0.2
    }
  }
};

// 1. Smaller, more compact action buttons with Fern Green gradient
const actionBtnBase = "w-4 h-4 rounded border border-[#4E724C]/30 bg-gradient-to-br from-[#4E724C] to-[#3A5A38] text-white flex items-center justify-center cursor-pointer shadow-sm hover:from-[#5A7F58] hover:to-[#4A6A48] transition-all duration-150 p-0.5";
const actionBtnActive = "bg-gradient-to-br from-[#4E724C] to-[#3A5A38] text-white border-[#4E724C] hover:from-[#5A7F58] hover:to-[#4A6A48]";
const actionBtnPinned = "bg-gradient-to-br from-[#4E724C] to-[#3A5A38] text-white border-[#4E724C] hover:from-[#5A7F58] hover:to-[#4A6A48]"; // Fern Green gradient for pinned
const actionBtnRed = "bg-gradient-to-br from-[#4E724C] to-[#3A5A38] text-white border-[#4E724C] hover:from-[#5A7F58] hover:to-[#4A6A48]";
const actionBtnGreen = "bg-gradient-to-br from-[#4E724C] to-[#3A5A38] text-white border-[#4E724C] hover:from-[#5A7F58] hover:to-[#4A6A48]";
const actionBtnGray = "bg-gradient-to-br from-[#4E724C] to-[#3A5A38] text-white border-[#4E724C] hover:from-[#5A7F58] hover:to-[#4A6A48]";

interface CountdownCardProps {
  countdown: Countdown
  onRemove: (id: string) => void
  onToggleVisibility: (id: string) => void
  onTogglePin?: (id: string) => void
  onEdit?: (id: string) => void
  onUpdateMemo?: (id: string, memo: string) => void
  category: string
}

export default function CountdownCard({
  countdown,
  onRemove,
  onToggleVisibility,
  onTogglePin,
  onEdit,
  onUpdateMemo,
  category,
}: CountdownCardProps) {
  // Use the exact date from the countdown
  const exactDate = countdown.date;
  
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
  // Default: always show memo section
  const [showMemo, setShowMemo] = useState<boolean>(true);
  const [isEditingMemo, setIsEditingMemo] = useState(false);
  const [memoText, setMemoText] = useState(countdown.memo || "");

  // Sync memoText with countdown.memo when it changes, but don't override while editing
  useEffect(() => {
    if (!isEditingMemo) {
      setMemoText(countdown.memo || "");
    }
  }, [countdown.memo, isEditingMemo]);

  // Update the time remaining every second
  useEffect(() => {
    // Calculate initial time
    const updateTime = () => {
      const newTimeRemaining = calculateTimeRemaining(exactDate, isCountUp);
      setTimeRemaining(newTimeRemaining);
      
      // Removed in-page Notification API popup to avoid random-time alerts when visiting the page
      // Push-based reminders (SW/Server) now handle arrival notifications reliably
    };
    
    // Update immediately
    updateTime();
    
    // Set up interval for updates
    const timer = setInterval(updateTime, 1000);
    
    // Clean up interval on unmount
    return () => clearInterval(timer);
  }, [exactDate, isCountUp, countdown.date, isTomorrow, countdown.title]);
  
  const isPinned = countdown.pinned || false;

  // Use the original title always
  const headerTitle = countdown.title;

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    onRemove(countdown.id);
    setShowDeleteConfirm(false);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  const handleMemoSave = async () => {
    if (onUpdateMemo) {
      await onUpdateMemo(countdown.id, memoText);
    }
    setIsEditingMemo(false);
    // Keep showing the just-saved value locally to avoid flicker if server returns stale data briefly
    setMemoText((prev) => prev);
  };

  const handleMemoCancel = () => {
    setMemoText(countdown.memo || "");
    setIsEditingMemo(false);
  };

  // Choose the appropriate animation variants based on countdown/countup type
  const cardVariants = isCountUp ? countupCardVariants : countdownCardVariants;
  const numberVariants = isCountUp ? countupNumberVariants : countdownNumberVariants;
  
  // Choose the appropriate color based on countdown/countup type
  const cardColor = isCountUp ? countUpColor : 
                   (category === "custom" ? customTabCountdownColor : countDownColor);

  // Clean, modern, compact card style
  const borderStyle = {
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: '#e5e7eb',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    background: '#ffffff',
    position: 'relative' as 'relative',
    width: '100%',
    maxWidth: '280px',
    minWidth: '0',
    minHeight: '100px',
    height: 'auto',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column' as 'column',
    padding: '12px 10px',
  };

  return (
    <motion.div 
      className="mb-2 mx-auto relative w-full max-w-xs sm:max-w-[350px]"
      initial="hidden"
      animate="visible"
      whileHover="hover"
      variants={cardVariants}
      style={{ overflow: 'visible' }}
    >
      {/* Delete confirmation overlay */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div 
            className="absolute inset-0 bg-black/15 backdrop-blur-[1px] z-50 flex items-center justify-center px-4 rounded-[16px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white/90 p-1.5 rounded-md shadow-sm text-center w-full max-w-[160px] border border-gray-200/30">
              <p className="text-gray-700 mb-1 text-[11px] font-normal">Delete this timer?</p>
              <div className="flex justify-center gap-1.5">
                <button 
                  className="text-[15px] py-0 px-1 min-w-0 h-6 rounded-sm bg-transparent border border-gray-300/50 hover:bg-gray-100/50 transition-colors"
                  onClick={cancelDelete}
                  aria-label="Cancel"
                >
                  ×
                </button>
                <button 
                  className="text-[15px] py-0 px-1 min-w-0 h-6 rounded-sm bg-transparent border border-gray-300/50 hover:bg-gray-100/50 transition-colors flex items-center justify-center"
                  onClick={confirmDelete}
                  aria-label="Delete"
                >
                  <Trash2 className="h-3 w-3 text-gray-600" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Action buttons: hidden for holidays tab */}
      {category !== 'holidays' && (
        <div className="absolute top-0.5 left-1 z-20 flex flex-row gap-1.5 bg-white/95 rounded-2xl shadow-lg px-2 py-0.5 border border-gray-100"
          style={{ minHeight: '20px' }}
        >
          <div
            className={`w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center rounded-full bg-gradient-to-br from-[#4E724C] to-[#3A5A38] text-white border border-[#4E724C] shadow-sm hover:from-[#5A7F58] hover:to-[#4A6A48] hover:border-[#4E724C] active:from-[#3A5A38] active:to-[#2A4A28] transition-all duration-150 p-0 ${category === 'hidden' ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}
            onClick={() => {
              if (category === 'hidden') return;
              if (onTogglePin) {
                onTogglePin(countdown.id);
              }
            }}
          >
            <Pin className={`w-3 h-3 sm:w-3.5 sm:h-3.5`} />
          </div>
          <div
            className={`w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center rounded-full bg-gradient-to-br from-[#4E724C] to-[#3A5A38] text-white border border-[#4E724C] shadow-sm hover:from-[#5A7F58] hover:to-[#4A6A48] hover:border-[#4E724C] active:from-[#3A5A38] active:to-[#2A4A28] transition-all duration-150 p-0`}
            onClick={() => onToggleVisibility(countdown.id)}
          >
            {category === "hidden" ? <Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> : (countdown.hidden ? <Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> : <EyeOff className="w-3 h-3 sm:w-3.5 sm:h-3.5" />)}
          </div>
          {onEdit && (
            <div
              className="w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center rounded-full bg-gradient-to-br from-[#4E724C] to-[#3A5A38] text-white border border-[#4E724C] shadow-sm hover:from-[#5A7F58] hover:to-[#4A6A48] hover:border-[#4E724C] active:from-[#3A5A38] active:to-[#2A4A28] transition-all duration-150 p-0"
              onClick={() => onEdit(countdown.id)}
            >
              <Edit className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </div>
          )}

          <div
            className="w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center rounded-full bg-gradient-to-br from-[#4E724C] to-[#3A5A38] text-white border border-[#4E724C] shadow-sm hover:from-[#5A7F58] hover:to-[#4A6A48] hover:border-[#4E724C] active:from-[#3A5A38] active:to-[#2A4A28] transition-all duration-150 p-0"
            onClick={handleDeleteClick}
          >
            <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </div>
          <div
            className={`w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center rounded-full ${memoText ? 'bg-gradient-to-br from-[#4E724C] to-[#3A5A38] border-[#4E724C] hover:from-[#5A7F58] hover:to-[#4A6A48] hover:border-[#4E724C]' : 'bg-gradient-to-br from-[#4E724C] to-[#3A5A38] border-[#4E724C] hover:from-[#5A7F58] hover:to-[#4A6A48] hover:border-[#4E724C]'} text-white border shadow-sm active:from-[#3A5A38] active:to-[#2A4A28] transition-all duration-150 p-0`}
            onClick={() => setShowMemo(!showMemo)}
          >
            <MessageSquare className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </div>
        </div>
      )}
      
      {/* Card with illustrative style */}
      <div 
        className="flex flex-col min-h-[120px] p-0 mt-4" 
        style={borderStyle}
      >
        {/* Title section */}
        <div className="w-full mb-1 min-h-[22px] flex items-center justify-center">
          <h3 className="text-xs sm:text-base font-semibold text-gray-800 text-center break-words text-wrap max-h-10 overflow-hidden leading-tight line-clamp-2">
            {headerTitle}
          </h3>
        </div>
        <div className="w-full h-px bg-gray-100 mb-2"></div>
        {/* Main countdown display */}
        <div className="flex-1 flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div 
              key={timeRemaining.days}
              variants={numberVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="flex items-center justify-center"
            >
              <span className={`text-xl sm:text-2xl md:text-3xl font-bold font-serif text-center ${isCountUp ? 'text-red-500' : 'text-green-600'}`}>
                <span className="inline-block mr-1">
                  {timeRemaining.isCountUp ? "+" : "−"}
                </span>
                {timeRemaining.days}
              </span>
            </motion.div>
          </AnimatePresence>
          <span className="text-[10px] sm:text-[11px] uppercase mt-1 font-medium tracking-wide text-gray-600 text-center">
            {timeRemaining.isCountUp ? "Days Passed" : "Days Remaining"}
          </span>
        </div>
        {/* Memo section - always visible */}
        <div className="w-full mt-2">
          <div className="border-t border-gray-100 pt-2">
            {isEditingMemo ? (
              <div className="space-y-2">
                <textarea
                  value={memoText}
                  onChange={(e) => setMemoText(e.target.value)}
                  placeholder="Enter your memo..."
                  maxLength={300}
                  className="w-full text-base p-2 border border-[#4E724C]/30 rounded-md resize-none focus:outline-none focus:ring-1 focus:ring-[#4E724C]/20 focus:border-[#4E724C] transition-all duration-200"
                  rows={3}
                />
                <div className="flex gap-1">
                  <button
                    onClick={handleMemoSave}
                    className="flex-1 text-[10px] sm:text-[11px] py-1 px-2 bg-gradient-to-r from-[#4E724C] to-[#3A5A38] text-white rounded-md hover:from-[#5A7F58] hover:to-[#4A6A48] transition-all duration-200"
                  >
                    Save
                  </button>
                  <button
                    onClick={handleMemoCancel}
                    className="flex-1 text-[10px] sm:text-[11px] py-1 px-2 bg-white text-[#4E724C] rounded-md hover:bg-[#4E724C]/5 border border-[#4E724C]/30 hover:border-[#4E724C] transition-all duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-1 h-12 flex flex-col">
                {memoText ? (
                  <div className="text-[10px] sm:text-[11px] text-gray-700 bg-gray-50 p-1.5 rounded-md overflow-x-auto overflow-y-auto max-w-full flex-1">
                    <div className="whitespace-pre-wrap break-words">
                      {memoText}
                    </div>
                  </div>
                ) : (
                  <p className="text-[10px] sm:text-[11px] text-gray-500 italic flex-1 flex items-start">
                    No memo
                  </p>
                )}
                <button
                  onClick={() => setIsEditingMemo(true)}
                  className="text-[9px] sm:text-[10px] text-[#4E724C] hover:text-[#3A5A38] transition-colors mt-auto"
                >
                  {memoText ? 'Edit' : 'Add memo'}
                </button>
              </div>
            )}
          </div>
        </div>
        {/* Footer with date */}
        <div className="w-full flex items-center justify-center mt-2">
          <div className="flex items-center justify-center gap-1 px-1.5 py-0.5 bg-gray-100 rounded-full">
            <Calendar className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-gray-500 flex-shrink-0" />
            <p className="text-[10px] sm:text-[11px] text-gray-600 whitespace-nowrap">
              {formatDateString(exactDate)}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

