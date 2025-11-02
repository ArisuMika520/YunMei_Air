/**
 * 离线功能提供者
 * 管理 Service Worker 注册、离线检测、网络状态
 * 适用于所有浏览器（包括 iOS Safari）
 */

'use client';

import { useEffect } from 'react';
import { registerServiceWorker } from '@/lib/utils/registerServiceWorker';
import { offlineDetector } from '@/lib/utils/offlineDetector';

export default function OfflineProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    registerServiceWorker().then(() => {
      console.log('[OfflineProvider] Service Worker 初始化完成');
    });

    const unsubscribe = offlineDetector.subscribe((isOnline) => {
      if (isOnline) {
        console.log('[OfflineProvider] 网络已恢复，可以同步数据');
      } else {
        console.log('[OfflineProvider] 已离线，蓝牙功能仍可用');
      }
    });

    console.log('[OfflineProvider] 当前网络状态:', offlineDetector.isOnline() ? '在线' : '离线');
    
    console.log('[OfflineProvider] 浏览器能力:', {
      serviceWorker: 'serviceWorker' in navigator,
      bluetooth: 'bluetooth' in navigator,
      indexedDB: 'indexedDB' in window,
      cache: 'caches' in window
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return <>{children}</>;
}

