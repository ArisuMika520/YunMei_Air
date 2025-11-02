/**
 * 离线指示器
 * 在页面底部显示当前是否为离线模式
 */

'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { offlineDetector } from '@/lib/utils/offlineDetector';

export default function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const [showIndicator, setShowIndicator] = useState(false);

  useEffect(() => {
    const online = offlineDetector.isOnline();
    setIsOnline(online);
    
    if (!online) {
      setShowIndicator(true);
    }

    const unsubscribe = offlineDetector.subscribe((online) => {
      setIsOnline(online);
      
      if (!online) {
        setShowIndicator(true);
      } else {
        setShowIndicator(false);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <AnimatePresence>
      {showIndicator && !isOnline && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-auto z-40"
        >
          <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-3 rounded-2xl shadow-2xl backdrop-blur-lg flex items-center gap-3">
            <div className="relative flex-shrink-0">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-3 h-3 bg-white rounded-full"
              />
              <motion.div
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 bg-white rounded-full"
              />
            </div>
            
            <div className="flex-1">
              <div className="font-medium text-sm">离线模式</div>
              <div className="text-xs opacity-90">蓝牙开锁功能正常可用</div>
            </div>
            
            <button
              onClick={() => setShowIndicator(false)}
              className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
              aria-label="关闭提示"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

