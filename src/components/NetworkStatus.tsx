'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { offlineDetector } from '@/lib/utils/offlineDetector';

export default function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    setIsOnline(offlineDetector.isOnline());

    const unsubscribe = offlineDetector.subscribe((online) => {
      setIsOnline(online);
      setShowNotification(true);
      
      if (online) {
        setTimeout(() => {
          setShowNotification(false);
        }, 3000);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <AnimatePresence>
      {showNotification && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
        >
          <motion.div
            className={`
              px-6 py-3 rounded-full shadow-2xl backdrop-blur-lg
              flex items-center gap-3
              ${isOnline 
                ? 'bg-green-500/90 text-white' 
                : 'bg-orange-500/90 text-white'
              }
            `}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          >
            {isOnline ? (
              <>
                <motion.div
                  initial={{ rotate: 0 }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                  className="w-5 h-5"
                >
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </motion.div>
                <span className="font-medium">网络已恢复</span>
              </>
            ) : (
              <>
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                  className="w-5 h-5"
                >
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414" />
                  </svg>
                </motion.div>
                <div>
                  <div className="font-medium">离线模式</div>
                  <div className="text-xs opacity-90">蓝牙开锁仍可使用</div>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

