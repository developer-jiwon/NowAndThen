"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff, Trash2, Pin, PinOff, Edit, X, Check, Calendar } from "lucide-react"
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

// 1. Smaller, more compact action buttons
const actionBtnBase = "w-4 h-4 rounded border border-gray-200 bg-white flex items-center justify-center cursor-pointer shadow-sm hover:bg-gray-100 transition-colors duration-150 p-0.5";
const actionBtnActive = "bg-gray-800 text-white border-gray-800";
const actionBtnPinned = "bg-[#166534] text-white border-[#166534] hover:bg-[#15803d] hover:border-[#15803d]"; // dark forest green for pinned
const actionBtnRed = "bg-red-50 border-red-200 text-red-600 hover:bg-red-100";
const actionBtnGreen = "bg-green-50 border-green-200 text-green-600 hover:bg-green-100";
const actionBtnGray = "bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100";

interface CountdownCardProps {
  countdown: Countdown
  onRemove: (id: string) => void
  onToggleVisibility: (id: string) => void
  onTogglePin?: (id: string) => void
  onEdit?: (id: string) => void
  onDuplicate?: (id: string) => void
  category: string
}

export default function CountdownCard({
  countdown,
  onRemove,
  onToggleVisibility,
  onTogglePin,
  onEdit,
  onDuplicate,
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

  // Update the time remaining every second
  useEffect(() => {
    // Calculate initial time
    const updateTime = () => {
      const newTimeRemaining = calculateTimeRemaining(exactDate, isCountUp);
      setTimeRemaining(newTimeRemaining);
    };
    
    // Update immediately
    updateTime();
    
    // Set up interval for updates
    const timer = setInterval(updateTime, 1000);
    
    // Clean up interval on unmount
    return () => clearInterval(timer);
  }, [exactDate, isCountUp, countdown.date, isTomorrow]);
  
  const isPinned = countdown.pinned || false;

  // Determine header title - only show special text for tomorrow
  let headerTitle = countdown.title;
  if (isTomorrow) {
    headerTitle = "Tomorrow";
  }

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
    borderColor: isCountUp ? '#fca5a5' : '#6ee7b7', // red for countup, green for countdown
    borderRadius: '10px',
    boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
    background: isCountUp 
      ? '#fef2f2' // Light red background for countup
      : (category === "custom" 
         ? '#eff6ff' // Light blue background for custom
         : '#f0fdf4'), // Light green background for countdown
    position: 'relative' as 'relative',
    width: '100%',
    maxWidth: '320px',
    minWidth: '0',
    minHeight: '140px',
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
      
      {/* Action buttons: floating outside top-right like a bookmark/tab */}
      <div className="absolute -top-4 -right-2 z-20 flex flex-row gap-1 bg-white/90 rounded-xl shadow-md px-1.5 py-1 border border-gray-100"
        style={{ minHeight: '28px' }}
      >
        <div
          className={`${actionBtnBase} ${isPinned ? 'bg-[#059669] text-white border-[#059669] hover:bg-[#047857] hover:border-[#047857] shadow-lg ring-2 ring-[#10b981] ring-opacity-30' : actionBtnGray} ${category === 'hidden' ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}
          onClick={() => {
            if (category === 'hidden') return;
            if (onTogglePin) {
              onTogglePin(countdown.id);
            }
          }}
        >
          <Pin className={`h-3 w-3 ${isPinned ? 'fill-white' : ''}`} />
        </div>
        <div
          className={`${actionBtnBase} ${countdown.hidden ? actionBtnActive : actionBtnGray}`}
          onClick={() => onToggleVisibility(countdown.id)}
        >
          {category === "hidden" ? <Eye className="h-3 w-3" /> : (countdown.hidden ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />)}
        </div>
        {onEdit && (
          <div
            className={`${actionBtnBase} ${actionBtnGray}`}
            onClick={() => onEdit(countdown.id)}
          >
            <Edit className="h-3 w-3" />
          </div>
        )}
        {onDuplicate && (
          <div
            className={`${actionBtnBase} ${actionBtnGreen}`}
            onClick={() => onDuplicate(countdown.id)}
          >
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        <div
          className={`${actionBtnBase} ${actionBtnRed}`}
          onClick={handleDeleteClick}
        >
          <Trash2 className="h-3 w-3" />
        </div>
      </div>
      
      {/* Card with illustrative style */}
      <div 
        className="flex flex-col min-h-[120px] p-0" 
        style={borderStyle}
      >
        {/* Title section */}
        <div className="w-full mb-0.5 min-h-[22px] flex items-center justify-center">
          <h3 className="text-xs font-semibold text-gray-800 font-serif text-center break-words text-wrap max-h-10 overflow-hidden leading-tight line-clamp-2">
            {headerTitle}
          </h3>
        </div>
        {/* Divider */}
        <div className="w-full h-px bg-gray-200 mb-2"></div>
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
              <span className={`text-2xl sm:text-3xl font-bold font-serif text-center ${isCountUp ? 'text-red-500' : 'text-green-600'}`}>
                <span className="inline-block mr-1">
                  {timeRemaining.isCountUp ? "+" : "−"}
                </span>
                {timeRemaining.days}
              </span>
            </motion.div>
          </AnimatePresence>
          <span className="text-[10px] uppercase mt-0.5 font-medium tracking-wide text-gray-600 text-center">
            {timeRemaining.isCountUp ? "Days Passed" : "Days Remaining"}
          </span>
        </div>
        {/* Footer with date */}
        <div className="w-full flex items-center justify-center mt-2">
          <div className="flex items-center justify-center gap-1 px-2 py-0.5 bg-gray-100 rounded-full">
            <Calendar className="h-3 w-3 text-gray-500 flex-shrink-0" />
            <p className="text-[11px] text-gray-600 whitespace-nowrap">
              {formatDateString(exactDate)}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

