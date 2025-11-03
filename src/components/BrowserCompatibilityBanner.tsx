/**
 * 浏览器兼容性提示横幅
 * 在不支持 Service Worker 的浏览器中显示友好提示（如 Bluefy）
 */

'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

export default function BrowserCompatibilityBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const isDismissed = localStorage.getItem('compatibility-banner-dismissed');
    if (isDismissed) {
      setDismissed(true);
      return;
    }

    const hasServiceWorker = 'serviceWorker' in navigator;
    const hasBluetooth = 'bluetooth' in navigator;

    if (!hasServiceWorker && hasBluetooth) {
      setShowBanner(true);
    }
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('compatibility-banner-dismissed', 'true');
  };

  if (dismissed) return null;

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-50 bg-blue-50 dark:bg-blue-900/30 border-b border-blue-200 dark:border-blue-800"
        >
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-start gap-3">
              <InformationCircleIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              
              <div className="flex-1 min-w-0">
                <p className="text-sm text-blue-900 dark:text-blue-100 font-medium">
                  蓝牙浏览器模式
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                  检测到您正在使用不支持离线缓存的浏览器（如 Bluefy）。
                  核心功能（蓝牙开锁、数据存储）完全可用，但需要联网加载页面。
                </p>
              </div>

              <button
                onClick={handleDismiss}
                className="flex-shrink-0 p-1 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-800/50 transition-colors"
                aria-label="关闭提示"
              >
                <XMarkIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

