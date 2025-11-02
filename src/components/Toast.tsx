'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import { toastVariants } from '@/lib/animations/variants';
import { hapticFeedback } from '@/lib/utils/interactions';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  onClose: (id: string) => void;
}

const Toast = ({ id, type, title, message, duration = 3000, onClose }: ToastProps) => {
  useEffect(() => {
    // 触觉反馈
    if (type === 'success') {
      hapticFeedback.success();
    } else if (type === 'error') {
      hapticFeedback.error();
    } else if (type === 'warning') {
      hapticFeedback.warning();
    } else {
      hapticFeedback.light();
    }

    // 自动关闭
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose(id);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [id, type, duration, onClose]);

  // 图标配置
  const icons = {
    success: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
    error: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
    warning: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    info: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  };

  // 颜色配置
  const colors = {
    success: {
      bg: 'bg-success-50',
      text: 'text-success-700',
      icon: 'text-success-600',
      border: 'border-success-200',
    },
    error: {
      bg: 'bg-error-50',
      text: 'text-error-700',
      icon: 'text-error-600',
      border: 'border-error-200',
    },
    warning: {
      bg: 'bg-warning-50',
      text: 'text-warning-700',
      icon: 'text-warning-600',
      border: 'border-warning-200',
    },
    info: {
      bg: 'bg-primary-50',
      text: 'text-primary-700',
      icon: 'text-primary-600',
      border: 'border-primary-200',
    },
  };

  const colorConfig = colors[type];

  return (
    <motion.div
      variants={toastVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={`
        relative
        ${colorConfig.bg} ${colorConfig.border}
        border-2 rounded-2xl shadow-2xl
        p-4 pr-12
        max-w-sm w-full
        backdrop-blur-sm
      `}
    >
      <div className="flex items-start gap-3">
        {/* 图标 */}
        <div className={`
          flex-shrink-0
          w-10 h-10 rounded-xl
          ${colorConfig.bg}
          flex items-center justify-center
          ${colorConfig.icon}
        `}>
          {icons[type]}
        </div>

        {/* 内容 */}
        <div className="flex-1 min-w-0">
          <h4 className={`font-semibold ${colorConfig.text} mb-0.5`}>
            {title}
          </h4>
          {message && (
            <p className={`text-sm ${colorConfig.text} opacity-90`}>
              {message}
            </p>
          )}
        </div>

        {/* 关闭按钮 */}
        <button
          onClick={() => onClose(id)}
          className={`
            absolute top-3 right-3
            w-6 h-6 rounded-lg
            ${colorConfig.text} opacity-50 hover:opacity-100
            flex items-center justify-center
            transition-opacity duration-200
          `}
          aria-label="关闭"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* 进度条 */}
      {duration > 0 && (
        <motion.div
          className={`absolute bottom-0 left-0 right-0 h-1 ${colorConfig.bg} rounded-b-xl overflow-hidden`}
        >
          <motion.div
            className={`h-full bg-gradient-to-r ${
              type === 'success' ? 'from-success-400 to-success-600' :
              type === 'error' ? 'from-error-400 to-error-600' :
              type === 'warning' ? 'from-warning-400 to-warning-600' :
              'from-primary-400 to-secondary-400'
            }`}
            initial={{ width: '100%' }}
            animate={{ width: '0%' }}
            transition={{ duration: duration / 1000, ease: 'linear' }}
          />
        </motion.div>
      )}
    </motion.div>
  );
};

// Toast容器组件
export interface ToastContainerProps {
  toasts: ToastProps[];
  onClose: (id: string) => void;
}

export const ToastContainer = ({ toasts, onClose }: ToastContainerProps) => {
  return (
    <div className="fixed top-4 right-4 z-[9999] space-y-3 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <Toast {...toast} onClose={onClose} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default Toast;






