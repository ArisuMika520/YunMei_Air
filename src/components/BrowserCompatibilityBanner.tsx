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
  const [showDetails, setShowDetails] = useState(false);

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

  const handleSaveOfflinePage = () => {
    // 打开离线独立页面
    window.open('/offline-standalone.html', '_blank');
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
                  蓝牙浏览器模式（Bluefy 等）
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                  检测到您的浏览器不支持离线缓存。核心功能（蓝牙开锁、数据存储）完全可用，
                  但<strong>关闭浏览器后需要联网才能重新打开页面</strong>。
                </p>

                {showDetails && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-700"
                  >
                    <div className="space-y-2 text-xs text-blue-700 dark:text-blue-300">
                      <div>
                        <strong className="text-blue-900 dark:text-blue-100">可用功能：</strong>
                        <ul className="ml-4 mt-1 list-disc">
                          <li>蓝牙开锁（完全离线）</li>
                          <li>查看和管理门锁列表</li>
                          <li>修改设置和主题</li>
                          <li>数据持久化存储</li>
                        </ul>
                      </div>
                      <div>
                        <strong className="text-blue-900 dark:text-blue-100">限制：</strong>
                        <ul className="ml-4 mt-1 list-disc">
                          <li>关闭浏览器后，再次打开需要联网</li>
                          <li>手机杀后台后，需要联网才能恢复</li>
                          <li>建议保持浏览器在后台运行</li>
                        </ul>
                      </div>
                      <div className="pt-2">
                        <strong className="text-blue-900 dark:text-blue-100">解决方案：</strong>
                        <div className="mt-1">
                          我们提供了一个独立的离线页面，可以保存到主屏幕使用：
                        </div>
                        <button
                          onClick={handleSaveOfflinePage}
                          className="mt-2 px-3 py-1.5 bg-blue-600 dark:bg-blue-500 text-white rounded-lg text-xs font-medium hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
                        >
                          打开离线独立页面
                        </button>
                        <div className="mt-1 text-xs opacity-80">
                          打开后，点击浏览器菜单 → "添加到主屏幕"
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="mt-2 text-xs text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {showDetails ? '收起详情 ▲' : '查看详情和解决方案 ▼'}
                </button>
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

