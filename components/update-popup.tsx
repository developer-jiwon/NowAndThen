'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageSquare, Globe } from 'lucide-react';

interface UpdatePopupProps {
  isVisible: boolean;
  onClose: () => void;
}

export default function UpdatePopup({ isVisible, onClose }: UpdatePopupProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [language, setLanguage] = useState<'en' | 'ko'>('en');

  useEffect(() => {
    if (isVisible) {
      setIsOpen(true);
    }
  }, [isVisible]);

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ko' : 'en');
  };

  const content = {
    en: {
      title: 'Now & Then v1.3',
      subtitle: 'Enhanced experience and better readability.',
      holidayTitle: 'Rich Holiday Descriptions',
      holidayDesc: 'Each country\'s holidays now show cultural background and historical meaning.',
      memoTitle: 'Expanded Memo Space',
      memoDesc: 'Larger text areas, better readability, and 500-character limit.',
      sortingTitle: 'Improved Holiday Sorting',
      sortingDesc: 'Holidays now follow the same D-day priority as your personal timers.',
      confirm: 'Explore Now',
      version: 'Version 1.3 • September 2025'
    },
    ko: {
      title: 'Now & Then v1.3',
      subtitle: '향상된 경험과 더 나은 가독성.',
      holidayTitle: '풍부한 휴일 설명',
      holidayDesc: '각 나라 휴일마다 문화적 배경과 역사적 의미를 자세히 설명합니다.',
      memoTitle: '확장된 메모 공간',
      memoDesc: '더 큰 텍스트 영역, 향상된 가독성, 500자 제한으로 확대.',
      sortingTitle: '개선된 휴일 정렬',
      sortingDesc: '휴일도 개인 타이머와 동일한 D-day 우선순위로 정렬됩니다.',
      confirm: '살펴보기',
      version: '버전 1.3 • 2025년 9월'
    }
  };

  const currentContent = content[language];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        >
          <motion.div
            className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 relative"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Language toggle button */}
            <button
              onClick={toggleLanguage}
              className="absolute top-4 left-4 text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1"
            >
              <Globe className="w-4 h-4" />
              <span className="text-xs font-medium">{language.toUpperCase()}</span>
            </button>

            {/* Header */}
            <div className="text-center mb-6 pt-8">
              <h2 className="text-xl font-bold text-gray-900 mb-3">{currentContent.title}</h2>
              <p className="text-sm text-gray-600">
                {currentContent.subtitle}
              </p>
            </div>

            {/* Update features */}
            <div className="space-y-4 mb-6">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#4E724C] to-[#3A5A38] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">{currentContent.holidayTitle}</h3>
                  <p className="text-xs text-gray-600 mt-1">
                    {currentContent.holidayDesc}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#4E724C] to-[#3A5A38] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <MessageSquare className="w-3.5 h-3.5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">{currentContent.memoTitle}</h3>
                  <p className="text-xs text-gray-600 mt-1">
                    {currentContent.memoDesc}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#4E724C] to-[#3A5A38] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">{currentContent.sortingTitle}</h3>
                  <p className="text-xs text-gray-600 mt-1">
                    {currentContent.sortingDesc}
                  </p>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleClose}
                className="flex-1 bg-gradient-to-r from-[#4E724C] to-[#3A5A38] text-white py-2 px-4 rounded-lg text-sm font-medium hover:from-[#5A7F58] hover:to-[#4A6A48] transition-all duration-200"
              >
                {currentContent.confirm}
              </button>
            </div>

            {/* Version info */}
            <div className="text-center mt-4">
              <p className="text-xs text-gray-400">
                {currentContent.version}
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 