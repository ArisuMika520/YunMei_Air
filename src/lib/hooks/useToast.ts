'use client';

import { useState, useCallback, useMemo } from 'react';
import { ToastProps, ToastType } from '@/components/Toast';
import { generateId } from '@/lib/utils/interactions';

export interface ToastOptions {
  title: string;
  message?: string;
  duration?: number;
  type?: ToastType;
}

export const useToast = () => {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback(
    (options: ToastOptions) => {
      const id = generateId();
      const toast: ToastProps = {
        id,
        type: options.type || 'info',
        title: options.title,
        message: options.message,
        duration: options.duration ?? 3000,
        onClose: removeToast,
      };

      setToasts((prev) => [...prev, toast]);
      return id;
    },
    [removeToast]
  );

  // 使用 useMemo 来缓存 toast 对象，避免每次渲染都创建新对象
  const toast = useMemo(
    () => ({
      success: (title: string, message?: string, duration?: number) => {
        return addToast({ title, message, duration, type: 'success' });
      },
      error: (title: string, message?: string, duration?: number) => {
        return addToast({ title, message, duration, type: 'error' });
      },
      warning: (title: string, message?: string, duration?: number) => {
        return addToast({ title, message, duration, type: 'warning' });
      },
      info: (title: string, message?: string, duration?: number) => {
        return addToast({ title, message, duration, type: 'info' });
      },
      custom: (options: ToastOptions) => {
        return addToast(options);
      },
      remove: removeToast,
      clear: () => setToasts([]),
    }),
    [addToast, removeToast]
  );

  return { toasts, toast, removeToast };
};

