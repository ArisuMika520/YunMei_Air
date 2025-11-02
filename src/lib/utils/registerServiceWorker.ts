/**
 * Service Worker 注册工具
 * 适用于所有浏览器，包括不支持 PWA 安装的 iOS Safari
 * 主要功能：离线缓存、快速加载
 */

'use client';

export async function registerServiceWorker() {
  if (typeof window === 'undefined') {
    return;
  }

  if (!('serviceWorker' in navigator)) {
    console.log('[SW] 浏览器不支持 Service Worker');
    return;
  }

  try {
    if (document.readyState === 'loading') {
      await new Promise(resolve => {
        window.addEventListener('DOMContentLoaded', resolve, { once: true });
      });
    }

    console.log('[SW] 开始注册 Service Worker...');

    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/'
    });

    console.log('[SW] Service Worker 注册成功:', registration.scope);

    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      console.log('[SW] 发现新版本 Service Worker');

      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('[SW] 新版本已安装，等待激活');
            
          }
        });
      }
    });

    if (registration.waiting) {
      console.log('[SW] 有新版本等待激活');
    }

    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (refreshing) return;
      refreshing = true;
      console.log('[SW] Service Worker 已更新，准备刷新页面');
    });

  } catch (error) {
    console.error('[SW] Service Worker 注册失败:', error);
  }
}

/**
 * 检查 Service Worker 状态
 */
export function getServiceWorkerStatus(): {
  supported: boolean;
  registered: boolean;
  active: boolean;
} {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return { supported: false, registered: false, active: false };
  }

  return {
    supported: true,
    registered: !!navigator.serviceWorker.controller,
    active: !!navigator.serviceWorker.controller
  };
}

export async function unregisterServiceWorker() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return false;
  }

  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    
    for (const registration of registrations) {
      await registration.unregister();
      console.log('[SW] Service Worker 已注销');
    }
    
    return true;
  } catch (error) {
    console.error('[SW] 注销失败:', error);
    return false;
  }
}

export async function clearAllCaches() {
  if (typeof window === 'undefined' || !('caches' in window)) {
    return false;
  }

  try {
    const cacheNames = await caches.keys();
    
    await Promise.all(
      cacheNames.map(cacheName => {
        console.log('[Cache] 删除缓存:', cacheName);
        return caches.delete(cacheName);
      })
    );
    
    console.log('[Cache] 所有缓存已清除');
    return true;
  } catch (error) {
    console.error('[Cache] 清除缓存失败:', error);
    return false;
  }
}


export async function getCacheStats(): Promise<{
  cacheNames: string[];
  totalSize: number;
  itemCount: number;
}> {
  if (typeof window === 'undefined' || !('caches' in window)) {
    return { cacheNames: [], totalSize: 0, itemCount: 0 };
  }

  try {
    const cacheNames = await caches.keys();
    let totalSize = 0;
    let itemCount = 0;

    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName);
      const requests = await cache.keys();
      itemCount += requests.length;

      for (const request of requests) {
        const response = await cache.match(request);
        if (response) {
          const blob = await response.blob();
          totalSize += blob.size;
        }
      }
    }

    return {
      cacheNames,
      totalSize,
      itemCount
    };
  } catch (error) {
    console.error('[Cache] 获取缓存统计失败:', error);
    return { cacheNames: [], totalSize: 0, itemCount: 0 };
  }
}

