/**
 * 离线检测和自动重连工具
 * 适用于所有浏览器（包括不支持 PWA 的 iOS Safari）
 */

'use client';

export class OfflineDetector {
  private listeners: Set<(isOnline: boolean) => void> = new Set();
  private checkInterval: NodeJS.Timeout | null = null;
  private readonly CHECK_INTERVAL = 30000; // 30秒检查一次

  constructor() {
    if (typeof window !== 'undefined') {
      this.init();
    }
  }

  private init() {
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);

    this.startPeriodicCheck();
  }

  private handleOnline = () => {
    console.log('[OfflineDetector] 网络已连接');
    this.notifyListeners(true);
  };

  private handleOffline = () => {
    console.log('[OfflineDetector] 网络已断开');
    this.notifyListeners(false);
  };

  private startPeriodicCheck() {
    this.checkInterval = setInterval(() => {
      if (navigator.onLine) {
        fetch('/favicon.ico', { 
          method: 'HEAD',
          cache: 'no-cache'
        })
          .then(() => {
          })
          .catch(() => {
          });
      }
    }, this.CHECK_INTERVAL);
  }

  private notifyListeners(isOnline: boolean) {
    this.listeners.forEach(listener => {
      try {
        listener(isOnline);
      } catch (error) {
        console.error('[OfflineDetector] 监听器执行出错:', error);
      }
    });
  }


  subscribe(listener: (isOnline: boolean) => void): () => void {
    this.listeners.add(listener);
    
    return () => {
      this.listeners.delete(listener);
    };
  }


  isOnline(): boolean {
    return navigator.onLine;
  }


  destroy() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', this.handleOnline);
      window.removeEventListener('offline', this.handleOffline);
    }
    
    this.listeners.clear();
  }
}

export const offlineDetector = new OfflineDetector();

