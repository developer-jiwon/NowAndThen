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
      title: 'Now & Then v2.0',
      subtitle: 'Major update with PWA support and smart notifications.',
      pwaTitle: 'PWA Support',
      pwaDesc: 'Install on home screen and use like a native app with offline support.',
      notificationTitle: 'Smart Notifications',
      notificationDesc: 'Get notified 1, 3, or 7 days before important events with modern UI.',
      uiTitle: 'Modern UI/UX',
      uiDesc: 'Elegant toggle switches, optimized spacing, and mobile-friendly design.',
      performanceTitle: 'Performance Boost',
      performanceDesc: 'Faster, smoother experience with improved animations and responsiveness.',
      confirm: 'Awesome',
      version: 'Version 2.0 • January 2025'
    },
    ko: {
      title: 'Now & Then v2.0',
      subtitle: 'PWA 지원과 스마트 알림이 추가된 대규모 업데이트.',
      pwaTitle: 'PWA 지원',
      pwaDesc: '홈 화면에 설치하고 네이티브 앱처럼 사용, 오프라인에서도 동작.',
      notificationTitle: '스마트 알림',
      notificationDesc: '1일/3일/7일 전에 자동 알림, 모던한 설정 UI로 편리하게.',
      uiTitle: '모던한 UI/UX',
      uiDesc: '세련된 토글 스위치, 최적화된 간격, 모바일 친화적 디자인.',
      performanceTitle: '성능 향상',
      performanceDesc: '더 빠르고 부드러운 애니메이션과 반응성.',
      confirm: '훌륭해요',
      version: '버전 2.0 • 2025년 1월'
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
                  <Globe className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">{currentContent.pwaTitle}</h3>
                  <p className="text-xs text-gray-600 mt-1">
                    {currentContent.pwaDesc}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#4E724C] to-[#3A5A38] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <MessageSquare className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">{currentContent.notificationTitle}</h3>
                  <p className="text-xs text-gray-600 mt-1">
                    {currentContent.notificationDesc}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#4E724C] to-[#3A5A38] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Palette className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">{currentContent.uiTitle}</h3>
                  <p className="text-xs text-gray-600 mt-1">
                    {currentContent.uiDesc}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#4E724C] to-[#3A5A38] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">{currentContent.performanceTitle}</h3>
                  <p className="text-xs text-gray-600 mt-1">
                    {currentContent.performanceDesc}
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