/**
 * 离线功能测试页面
 * 帮助用户检查和测试离线功能
 */

'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import BackButton from '@/components/BackButton';
import { 
  getServiceWorkerStatus, 
  getCacheStats,
  clearAllCaches,
  unregisterServiceWorker 
} from '@/lib/utils/registerServiceWorker';
import { offlineDetector } from '@/lib/utils/offlineDetector';

interface CacheStats {
  cacheNames: string[];
  totalSize: number;
  itemCount: number;
}

export default function OfflineTestPage() {
  const [swStatus, setSwStatus] = useState({ supported: false, registered: false, active: false });
  const [cacheStats, setCacheStats] = useState<CacheStats>({ cacheNames: [], totalSize: 0, itemCount: 0 });
  const [isOnline, setIsOnline] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadStats();
    
    const unsubscribe = offlineDetector.subscribe((online) => {
      setIsOnline(online);
    });
    
    setIsOnline(offlineDetector.isOnline());
    
    return () => unsubscribe();
  }, []);

  const loadStats = async () => {
    const status = getServiceWorkerStatus();
    setSwStatus(status);
    
    const stats = await getCacheStats();
    setCacheStats(stats);
  };

  const handleClearCaches = async () => {
    if (!confirm('确定要清除所有缓存吗？清除后需要重新加载应用。')) {
      return;
    }
    
    setLoading(true);
    
    try {
      await clearAllCaches();
      alert('缓存已清除！');
      await loadStats();
    } catch (error) {
      alert('清除失败：' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setLoading(false);
    }
  };

  const handleUnregisterSW = async () => {
    if (!confirm('确定要注销 Service Worker 吗？这将禁用离线功能。')) {
      return;
    }
    
    setLoading(true);
    
    try {
      await unregisterServiceWorker();
      alert('Service Worker 已注销！刷新页面生效。');
      await loadStats();
    } catch (error) {
      alert('注销失败：' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setLoading(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const checkItems = [
    {
      label: 'Service Worker 支持',
      value: swStatus.supported,
      description: '浏览器是否支持 Service Worker'
    },
    {
      label: 'Service Worker 已注册',
      value: swStatus.registered,
      description: 'Service Worker 是否已成功注册'
    },
    {
      label: 'Service Worker 已激活',
      value: swStatus.active,
      description: 'Service Worker 是否正在控制页面'
    },
    {
      label: '蓝牙 API 支持',
      value: typeof navigator !== 'undefined' && 'bluetooth' in navigator,
      description: '浏览器是否支持 Web Bluetooth API'
    },
    {
      label: 'IndexedDB 支持',
      value: typeof window !== 'undefined' && 'indexedDB' in window,
      description: '浏览器是否支持 IndexedDB'
    },
    {
      label: 'Cache API 支持',
      value: typeof window !== 'undefined' && 'caches' in window,
      description: '浏览器是否支持 Cache Storage'
    }
  ];

  return (
    <div className="min-h-screen p-6 pb-24">
      <BackButton />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gradient mb-2">离线功能测试</h1>
          <p className="text-neutral-500">检查离线功能状态和浏览器兼容性</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`card p-6 mb-6 ${isOnline ? 'border-l-4 border-green-500' : 'border-l-4 border-orange-500'}`}
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold mb-1">
                {isOnline ? '在线模式' : '离线模式'}
              </h2>
              <p className="text-sm text-neutral-500">
                {isOnline ? '网络连接正常' : '网络连接不可用，蓝牙功能仍可使用'}
              </p>
            </div>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            >
              <svg className="w-8 h-8 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-6 mb-6"
        >
          <h2 className="text-xl font-bold mb-4">功能检查</h2>
          
          <div className="space-y-3">
            {checkItems.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.05 }}
                className="flex items-start gap-3 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50"
              >
                <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                  item.value ? 'bg-green-500' : 'bg-red-500'
                }`}>
                  {item.value ? (
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="font-medium text-sm">{item.label}</div>
                  <div className="text-xs text-neutral-500 mt-0.5">{item.description}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="card p-6 mb-6"
        >
          <h2 className="text-xl font-bold mb-4">缓存统计</h2>
          
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center p-4 rounded-xl bg-primary-50 dark:bg-primary-900/20">
              <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                {cacheStats.cacheNames.length}
              </div>
              <div className="text-xs text-neutral-500 mt-1">缓存数量</div>
            </div>
            
            <div className="text-center p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {cacheStats.itemCount}
              </div>
              <div className="text-xs text-neutral-500 mt-1">缓存项</div>
            </div>
            
            <div className="text-center p-4 rounded-xl bg-green-50 dark:bg-green-900/20">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {formatBytes(cacheStats.totalSize)}
              </div>
              <div className="text-xs text-neutral-500 mt-1">总大小</div>
            </div>
          </div>
          
          {cacheStats.cacheNames.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                缓存列表：
              </div>
              {cacheStats.cacheNames.map((name, index) => (
                <div
                  key={index}
                  className="text-xs font-mono p-2 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
                >
                  {name}
                </div>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="card p-6 mb-6"
        >
          <h2 className="text-xl font-bold mb-4">调试操作</h2>
          
          <div className="space-y-3">
            <button
              onClick={loadStats}
              disabled={loading}
              className="w-full btn btn-secondary"
            >
              刷新状态
            </button>
            
            <button
              onClick={handleClearCaches}
              disabled={loading || !swStatus.supported}
              className="w-full btn bg-orange-500 hover:bg-orange-600 text-white"
            >
              清除所有缓存
            </button>
            
            <button
              onClick={handleUnregisterSW}
              disabled={loading || !swStatus.registered}
              className="w-full btn bg-red-500 hover:bg-red-600 text-white"
            >
              注销 Service Worker
            </button>
          </div>
          
          <div className="mt-4 p-3 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
            <div className="text-xs text-yellow-800 dark:text-yellow-200">
              <strong>注意：</strong> 清除缓存或注销 Service Worker 后，需要刷新页面重新加载应用。
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="card p-6"
        >
          <h2 className="text-xl font-bold mb-4">测试步骤</h2>
          
          <ol className="space-y-3 text-sm text-neutral-600 dark:text-neutral-400">
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-500 text-white flex items-center justify-center text-xs font-bold">1</span>
              <span>确保所有功能检查都是绿色</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-500 text-white flex items-center justify-center text-xs font-bold">2</span>
              <span>确认缓存已创建（缓存数量 &gt; 0）</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-500 text-white flex items-center justify-center text-xs font-bold">3</span>
              <span>打开飞行模式或断开网络</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-500 text-white flex items-center justify-center text-xs font-bold">4</span>
              <span>刷新页面，应该正常加载</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-500 text-white flex items-center justify-center text-xs font-bold">5</span>
              <span>尝试使用蓝牙开锁功能</span>
            </li>
          </ol>
        </motion.div>
      </motion.div>
    </div>
  );
}

