'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageSquare, Palette, Globe } from 'lucide-react';

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
      title: 'Now & Then v1.0',
      subtitle: 'New features have been added!',
      memoTitle: 'Memo Feature',
      memoDesc: 'Add and edit personal memos for each countdown.',
      designTitle: 'New Design',
      designDesc: 'Enhanced UI with Fern Green gradient buttons and Tea Rose color scheme.',
      confirm: 'Got it',
      version: 'Version 1.0 • August 2025'
    },
    ko: {
      title: 'Now & Then v1.0',
      subtitle: '새로운 기능들이 추가되었습니다!',
      memoTitle: '메모 기능',
      memoDesc: '각 카운트다운에 개인 메모를 추가하고 편집할 수 있습니다.',
      designTitle: '새로운 디자인',
      designDesc: 'Fern Green 그라데이션 버튼과 Tea Rose 색상 조합으로 더욱 세련된 UI를 제공합니다.',
      confirm: '확인',
      version: '버전 1.0 • 2025년 8월'
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
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#4E724C] to-[#3A5A38] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <MessageSquare className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">{currentContent.memoTitle}</h3>
                  <p className="text-xs text-gray-600 mt-1">
                    {currentContent.memoDesc}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#4E724C] to-[#3A5A38] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Palette className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">{currentContent.designTitle}</h3>
                  <p className="text-xs text-gray-600 mt-1">
                    {currentContent.designDesc}
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