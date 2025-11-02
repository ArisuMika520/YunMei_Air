/**
 * 离线功能提供者
 * 管理 Service Worker 注册、离线检测、网络状态
 * 适用于所有浏览器（包括 iOS Safari、Bluefy）
 * 
 * 降级支持：
 * - 在不支持 Service Worker 的浏览器（如 Bluefy）中，应用仍可正常工作
 * - 核心功能（蓝牙开锁、数据存储）不依赖 Service Worker
 */

'use client';

import { useEffect, useState } from 'react';
import { registerServiceWorker } from '@/lib/utils/registerServiceWorker';
import { offlineDetector } from '@/lib/utils/offlineDetector';

export default function OfflineProvider({ children }: { children: React.ReactNode }) {
  const [browserCapabilities, setBrowserCapabilities] = useState({
    serviceWorker: false,
    bluetooth: false,
    indexedDB: false,
    cache: false
  });

  useEffect(() => {
    const capabilities = {
      serviceWorker: 'serviceWorker' in navigator,
      bluetooth: 'bluetooth' in navigator,
      indexedDB: 'indexedDB' in window,
      cache: 'caches' in window
    };
    
    setBrowserCapabilities(capabilities);
    
    console.log('[OfflineProvider] 浏览器能力检测:');
    console.log('[OfflineProvider]', capabilities.serviceWorker ? '支持' : '不支持', 'Service Worker');
    console.log('[OfflineProvider]', capabilities.bluetooth ? '支持' : '不支持', 'Web Bluetooth');
    console.log('[OfflineProvider]', capabilities.indexedDB ? '支持' : '不支持', 'IndexedDB');
    console.log('[OfflineProvider]', capabilities.cache ? '支持' : '不支持', 'Cache Storage');

    // 尝试注册 Service Worker（如果支持）
    registerServiceWorker().then((result: any) => {
      if (result?.success) {
        console.log('[OfflineProvider] Service Worker 初始化成功');
      } else if (result?.reason === 'not-supported') {
        console.warn('[OfflineProvider] Service Worker 不支持，使用降级模式');
        console.info('[OfflineProvider] 核心功能（蓝牙开锁、数据存储）仍然可用');
      } else {
        console.error('[OfflineProvider] Service Worker 初始化失败');
      }
    });

    // 监听网络状态
    const unsubscribe = offlineDetector.subscribe((isOnline) => {
      if (isOnline) {
        console.log('[OfflineProvider] 网络已恢复');
      } else {
        console.log('[OfflineProvider] 已离线，蓝牙功能仍可用');
      }
    });

    const currentStatus = offlineDetector.isOnline() ? '在线' : '离线';
    console.log('[OfflineProvider] 当前网络状态:', currentStatus);

    // 如果是 Bluefy 或类似浏览器，显示友好提示
    if (!capabilities.serviceWorker && capabilities.bluetooth) {
      console.info('[OfflineProvider] 检测到蓝牙浏览器（如 Bluefy）');
      console.info('[OfflineProvider] 应用将在降级模式下运行：');
      console.info('[OfflineProvider]    支持 蓝牙开锁功能完全可用');
      console.info('[OfflineProvider]    支持 本地数据存储可用');
      console.info('[OfflineProvider]    需要联网才能加载页面');
    }

    return () => {
      unsubscribe();
    };
  }, []);

  return <>{children}</>;
}

