"use client"

import { useState, useEffect } from "react"
import { Eye, EyeOff, Trash2, Pin, Edit, Calendar, MessageSquare } from "lucide-react"
import type { Countdown, TimeRemaining } from "@/lib/types"
import { calculateTimeRemaining, isDateInPast, formatDateString } from "@/lib/countdown-utils"
import { motion, AnimatePresence } from "framer-motion"

interface CountdownCompactProps {
  countdown: Countdown
  onRemove: (id: string) => void
  onToggleVisibility: (id: string) => void
  onTogglePin?: (id: string) => void
  onEdit?: (id: string) => void
  onUpdateMemo?: (id: string, memo: string) => void
  category: string
}

export default function CountdownCompact({
  countdown,
  onRemove,
  onToggleVisibility,
  onTogglePin,
  onEdit,
  onUpdateMemo,
  category,
}: CountdownCompactProps) {
  const exactDate = countdown.date;
  const isPastDate = isDateInPast(exactDate);
  
  const checkIsToday = () => {
    const today = new Date();
    const targetDate = new Date(exactDate);
    return today.getFullYear() === targetDate.getFullYear() &&
           today.getMonth() === targetDate.getMonth() &&
           today.getDate() === targetDate.getDate();
  };
  
  const isToday = checkIsToday();
  const isCountUp = countdown.isCountUp || (isPastDate && !isToday);
  
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>({
    total: 0,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isCountUp: isCountUp
  });
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showMemo, setShowMemo] = useState<boolean>(!!(countdown.memo && countdown.memo.trim() !== ""));
  const [isEditingMemo, setIsEditingMemo] = useState(false);
  const [memoText, setMemoText] = useState(countdown.memo || "");

  useEffect(() => {
    if (!isEditingMemo) {
      setMemoText(countdown.memo || "");
    }
  }, [countdown.memo, isEditingMemo]);

  useEffect(() => {
    if (isEditingMemo) return;
    const hasMemo = !!(countdown.memo && countdown.memo.trim() !== "");
    setShowMemo(hasMemo);
  }, [countdown.memo, isEditingMemo]);

  useEffect(() => {
    const updateTime = () => {
      const newTimeRemaining = calculateTimeRemaining(exactDate, isCountUp);
      setTimeRemaining(newTimeRemaining);
    };
    
    updateTime();
    const timer = setInterval(updateTime, 1000);
    
    return () => clearInterval(timer);
  }, [exactDate, isCountUp]);

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
  };

  const handleMemoCancel = () => {
    setMemoText(countdown.memo || "");
    setIsEditingMemo(false);
  };

  return (
    <motion.div 
      className="w-full border border-gray-200 rounded-lg bg-white hover:shadow-sm transition-all duration-200 relative cursor-pointer"
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ x: 2 }}
      onClick={() => {
        if (onEdit) {
          onEdit(countdown.id);
        }
      }}
    >
      {/* Delete confirmation overlay */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div 
            className="absolute inset-0 bg-black/10 backdrop-blur-[1px] z-50 flex items-center justify-center rounded-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white p-2 rounded-md shadow-md text-center border border-gray-200">
              <p className="text-gray-700 mb-2 text-xs font-medium">Delete this timer?</p>
              <div className="flex justify-center gap-2">
                <button 
                  className="text-xs py-1 px-2 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                  onClick={cancelDelete}
                >
                  Cancel
                </button>
                <button 
                  className="text-xs py-1 px-2 bg-red-500 hover:bg-red-600 text-white rounded transition-colors"
                  onClick={confirmDelete}
                >
                  Delete
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="p-3">
        <div className="flex items-center justify-between">
          {/* Left: Title and Date */}
          <div className="flex-1 min-w-0 mr-2">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-sm font-semibold text-gray-800 truncate">
                {countdown.title}
              </h3>
              {countdown.pinned && (
                <Pin className="w-3 h-3 text-[#4E724C] flex-shrink-0" />
              )}
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Calendar className="w-3 h-3" />
              <span>{formatDateString(exactDate)}</span>
            </div>
          </div>

          {/* Center: Countdown Display */}
          <div className="text-center mr-2">
            <div className={`text-lg font-bold font-serif ${isCountUp ? 'text-red-500' : 'text-green-600'}`}>
              <span className="text-xs mr-1">
                {timeRemaining.isCountUp ? "+" : "−"}
              </span>
              {timeRemaining.days}
            </div>
            <div className="text-[9px] uppercase tracking-wide text-gray-500">
              {timeRemaining.isCountUp ? "Days Passed" : "Days Left"}
            </div>
          </div>

          {/* Right: Action Buttons */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${category === 'hidden' ? 'opacity-50 cursor-not-allowed' : 'bg-gray-100 hover:bg-[#4E724C] hover:text-white'}`}
              onClick={(e) => {
                e.stopPropagation();
                if (category === 'hidden') return;
                if (onTogglePin) {
                  onTogglePin(countdown.id);
                }
              }}
              disabled={category === 'hidden'}
            >
              <Pin className="w-3.5 h-3.5" />
            </button>
            <button
              className="w-7 h-7 rounded-full bg-gray-100 hover:bg-[#4E724C] hover:text-white flex items-center justify-center transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onToggleVisibility(countdown.id);
              }}
            >
              {category === "hidden" ? <Eye className="w-3.5 h-3.5" /> : (countdown.hidden ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />)}
            </button>
            <button
              className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${memoText ? 'bg-blue-100 text-blue-600 hover:bg-blue-200' : 'bg-gray-100 hover:bg-[#4E724C] hover:text-white'}`}
              onClick={(e) => {
                e.stopPropagation();
                setShowMemo(!showMemo);
              }}
            >
              <MessageSquare className="w-3.5 h-3.5" />
            </button>
            <button
              className="w-7 h-7 rounded-full bg-gray-100 hover:bg-red-500 hover:text-white flex items-center justify-center transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteClick(e);
              }}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Expandable Memo Section */}
        <AnimatePresence>
          {showMemo && (
            <motion.div 
              className="mt-3 pt-3 border-t border-gray-100"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              {isEditingMemo ? (
                <div className="space-y-2">
                  <textarea
                    value={memoText}
                    onChange={(e) => setMemoText(e.target.value)}
                    placeholder="Enter your memo..."
                    maxLength={300}
                    className="w-full text-base p-2 border border-[#4E724C]/30 rounded resize-none focus:outline-none focus:ring-1 focus:ring-[#4E724C]/20 focus:border-[#4E724C] transition-all duration-200"
                    rows={2}
                  />
                  <div className="flex gap-1">
                    <button
                      onClick={handleMemoSave}
                      className="text-xs py-1 px-2 bg-[#4E724C] text-white rounded hover:bg-[#3A5A38] transition-colors"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleMemoCancel}
                      className="text-xs py-1 px-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  {memoText ? (
                    <div className="text-xs text-gray-700 bg-gray-50 p-2 rounded max-h-16 overflow-y-auto">
                      <div className="whitespace-pre-wrap break-words">
                        {memoText}
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500 italic">
                      No memo
                    </p>
                  )}
                  <button
                    onClick={() => setIsEditingMemo(true)}
                    className="text-xs text-[#4E724C] hover:text-[#3A5A38] transition-colors"
                  >
                    {memoText ? 'Edit' : 'Add memo'}
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}