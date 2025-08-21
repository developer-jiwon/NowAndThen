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
      title: 'Now & Then v1.2',
      subtitle: 'New features for better organization.',
      listViewTitle: 'Compact List View',
      listViewDesc: 'Toggle between card and list layouts for your preference.',
      groupingTitle: 'Smart Grouping',
      groupingDesc: 'Auto-organize timers by Today, Tomorrow, This Week.',
      memoTitle: 'Enhanced Memos',
      memoDesc: 'Full memo support in both card and list views.',
      confirm: 'Explore Now',
      version: 'Version 1.2 • August 2025'
    },
    ko: {
      title: 'Now & Then v1.2',
      subtitle: '더 나은 정리를 위한 새로운 기능.',
      listViewTitle: '컴팩트 리스트 뷰',
      listViewDesc: '카드와 리스트 레이아웃을 선호에 맞게 전환하세요.',
      groupingTitle: '스마트 그룹핑',
      groupingDesc: '오늘, 내일, 이번 주로 타이머를 자동 정리합니다.',
      memoTitle: '메모 기능 강화',
      memoDesc: '카드와 리스트 뷰 모두에서 완전한 메모 지원.',
      confirm: '살펴보기',
      version: '버전 1.2 • 2025년 8월'
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 6H21M8 12H21M8 18H21M3 6H3.01M3 12H3.01M3 18H3.01" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">{currentContent.listViewTitle}</h3>
                  <p className="text-xs text-gray-600 mt-1">
                    {currentContent.listViewDesc}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#4E724C] to-[#3A5A38] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">{currentContent.groupingTitle}</h3>
                  <p className="text-xs text-gray-600 mt-1">
                    {currentContent.groupingDesc}
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