/**
 * Web Bluetooth Hook
 * 用于React组件中的蓝牙操作
 * 支持设备缓存和清理
 */

'use client';

import { useState, useCallback } from 'react';
import { Lock } from '../entities/Lock';
import { unlockProcess, isBLESupported, disconnectAll, disconnectLock, getCacheStats } from '../utils/ble';

export interface BLEState {
  isUnlocking: boolean;
  progress: number;
  message: string;
  error: string | null;
}

export function useBLE() {
  const [state, setState] = useState<BLEState>({
    isUnlocking: false,
    progress: 0,
    message: '',
    error: null
  });

  /**
   * 解锁门锁
   */
  const unlock = useCallback(async (lock: Lock): Promise<boolean> => {
    if (!isBLESupported()) {
      setState(prev => ({
        ...prev,
        error: '此浏览器不支持蓝牙功能'
      }));
      return false;
    }

    setState({
      isUnlocking: true,
      progress: 0,
      message: '准备解锁...',
      error: null
    });

    try {
      await unlockProcess(lock, (progress, message) => {
        setState({
          isUnlocking: true,
          progress,
          message,
          error: null
        });
      });

      setState({
        isUnlocking: false,
        progress: 100,
        message: '解锁成功！',
        error: null
      });

      return true;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '解锁失败';

      setState({
        isUnlocking: false,
        progress: 0,
        message: '',
        error: errorMessage
      });

      return false;
    }
  }, []);

  const reset = useCallback(() => {
    setState({
      isUnlocking: false,
      progress: 0,
      message: '',
      error: null
    });
  }, []);

  const checkSupport = useCallback((): boolean => {
    return isBLESupported();
  }, []);

  const cleanup = useCallback(() => {
    disconnectAll();
  }, []);

  const disconnect = useCallback((lockId: string) => {
    disconnectLock(lockId);
  }, []);

  const getStats = useCallback(() => {
    return getCacheStats();
  }, []);

  return {
    ...state,
    unlock,
    reset,
    checkSupport,
    cleanup,
    disconnect,
    getStats
  };
}
