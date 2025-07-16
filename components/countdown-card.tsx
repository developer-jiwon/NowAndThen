"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff, Trash2, Pin, PinOff, Edit, X, Check, Calendar } from "lucide-react"
import type { Countdown, TimeRemaining } from "@/lib/types"
import { calculateTimeRemaining, isDateInPast, standardizeDate, formatDateString } from "@/lib/countdown-utils"
import { motion, AnimatePresence, easeOut } from "framer-motion"

// Define colors for past and future events
const countUpColor = "#f1c0c0"; // Soft pink/light coral for count up
const countDownColor = "#8BCFBE"; // Mint/seafoam green for count down (keeping the original)
const charcoalColor = "#36454F"; // Illustrative charcoal color
const customTabCountdownColor = "#6495ED"; // New color: Cornflower Blue for custom tab countdowns

// 2024 Pantone trendy colors
const pantoneBlack = "#2D2926"; // Pantone Black
const pantoneWhite = "#F5F5F5"; // Pantone White/Off-White
const pantoneCream = "#F2EFE9"; // Pantone Cream
const pantoneGray = "#8E8E8E"; // Pantone Gray

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

  // Illustrative border style
  const borderStyle = {
    borderWidth: '2px',
    borderStyle: 'solid',
    borderColor: 'rgba(54, 69, 79, 0.25)', // 75% transparent charcoal
    borderRadius: '16px',
    boxShadow: `3px 3px 0 rgba(54, 69, 79, 0.25)`, // 75% transparent charcoal shadow
    background: isCountUp 
      ? 'rgba(241, 192, 192, 0.25)' // Countup background
      : (category === "custom" 
         ? 'rgba(100, 149, 237, 0.25)' // Custom tab countdown background (Cornflower Blue)
         : 'rgba(139, 207, 190, 0.25)'), // Regular countdown background
    position: 'relative' as 'relative',
    width: '100%',
    maxWidth: '350px',
    minHeight: '200px',
    height: 'auto',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column' as 'column'
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
              <p className="text-gray-700 mb-1 text-[11px] font-normal">Delete timer?</p>
              <div className="flex justify-center gap-1.5">
                <button 
                  className="text-[15px] py-0 px-1 min-w-0 h-6 rounded-sm bg-transparent border border-gray-300/50 hover:bg-gray-100/50 transition-colors"
                  onClick={cancelDelete}
                  aria-label="Cancel"
                >
                  ×
                </button>
                <button 
                  className="text-[15px] py-0 px-1 min-w-0 h-6 rounded-sm bg-transparent border border-gray-300/50 hover:bg-gray-100/50 transition-colors"
                  onClick={confirmDelete}
                  aria-label="Delete"
                >
                  🗑️
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Action dots positioned outside the card */}
      <div className="absolute -left-3 sm:-left-3 -left-2 top-1/2 transform -translate-y-1/2 flex flex-col gap-2 sm:gap-3 z-10">
        <motion.div
          custom={0}
          variants={iconDotVariants}
          whileHover="hover"
          whileTap="tap"
          className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center cursor-pointer shadow-md ${isPinned ? 'bg-[#14532d]' : 'bg-[#F2EFE9]'} ${category === 'hidden' ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}
          onClick={() => {
            if (category === 'hidden') return; // hidden 탭에서는 동작하지 않음
            if (onTogglePin) {
              onTogglePin(countdown.id);
            } else {
              console.error("❌❌❌ onTogglePin prop is missing! ❌❌❌");
            }
          }}
        >
          {isPinned ? <PinOff className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-white" /> : <Pin className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-[#2D2926]" />}
        </motion.div>
        
        <motion.div
          custom={1}
          variants={iconDotVariants}
          whileHover="hover"
          whileTap="tap"
          className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center cursor-pointer shadow-md ${countdown.hidden ? 'bg-[#2D2926]' : 'bg-[#F2EFE9]'}`}
          onClick={() => onToggleVisibility(countdown.id)}
        >
          {category === "hidden" ? <Eye className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-[#F5F5F5]" /> : (countdown.hidden ? <Eye className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-[#F5F5F5]" /> : <EyeOff className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-[#2D2926]" />)}
        </motion.div>
        
        {onEdit && (
          <motion.div
            custom={2}
            variants={iconDotVariants}
            whileHover="hover"
            whileTap="tap"
            className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#8E8E8E] flex items-center justify-center cursor-pointer shadow-md"
            onClick={() => onEdit(countdown.id)}
          >
            <Edit className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-[#F5F5F5]" />
          </motion.div>
        )}
        
        <motion.div
          custom={3}
          variants={iconDotVariants}
          whileHover="hover"
          whileTap="tap"
          className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#2D2926] flex items-center justify-center cursor-pointer shadow-md"
          onClick={handleDeleteClick}
        >
          <Trash2 className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-[#F5F5F5]" />
        </motion.div>
      </div>
      
      {/* Card with illustrative style */}
      <div className="p-2 sm:p-5 flex flex-col min-h-[140px] sm:min-h-[200px]" style={{ ...borderStyle, borderRadius: '16px', minHeight: undefined }}>
        {/* Decorative corner accents - now inside the card */}
        
        {/* Title section */}
        <div className="w-full mb-1">
          <div className="relative flex items-center justify-center gap-1 mb-1">
            <h3 className="text-[14px] sm:text-lg font-semibold text-gray-800 font-serif text-center break-words text-wrap max-h-12 overflow-hidden leading-tight line-clamp-2" style={{display: 'block'}}>
              {headerTitle}
            </h3>
          </div>
        </div>
        
        {/* Simple divider without circle */}
        <div className="w-full h-[1.5px] bg-gray-300 opacity-80 mb-2 sm:mb-3"></div>
        
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
              <span className="text-xl sm:text-5xl font-bold font-serif text-center" style={{ color: cardColor }}>
                <span className="inline-block mr-2">
                  {timeRemaining.isCountUp ? "+" : "−"}
                </span>
                {timeRemaining.days}
              </span>
            </motion.div>
          </AnimatePresence>
          
          <span className="text-[10px] sm:text-xs uppercase mt-0.5 font-medium tracking-wider text-gray-600 text-center">
            {timeRemaining.isCountUp ? "Days Since" : "Days Until"}
          </span>
        </div>
        
        {/* Footer with date */}
        <div className="w-full flex items-center justify-center mt-2 sm:mt-3 mb-1">
          <div className="flex items-center justify-center gap-1 px-2 sm:px-3 py-0.5 sm:py-1 bg-[#36454F]/10 rounded-full">
            <Calendar className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-gray-500 flex-shrink-0" />
            <p className="text-[10px] sm:text-xs text-gray-600 whitespace-nowrap">
              {formatDateString(exactDate)}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

