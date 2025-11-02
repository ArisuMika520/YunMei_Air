/**
 * Air 轻量化动画配置
 * 只保留核心体验动画，提升加载速度
 */

import { Variants } from 'framer-motion';

// ==================== 基础动画（保留） ====================

// 简单淡入淡出
export const fadeVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

// 模态框背景
export const modalBackdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.15 } },
  exit: { opacity: 0, transition: { duration: 0.1 } },
};

// 模态框（轻量）
export const modalVariants: Variants = {
  hidden: { opacity: 0, scale: 0.98 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.2 }
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    transition: { duration: 0.15 }
  },
};

// ==================== 核心交互动画 ====================

// 按钮点击反馈（重要，保留）
export const buttonVariants: Variants = {
  tap: {
    scale: 0.97,
    transition: { duration: 0.1 },
  },
};

// 输入框错误抖动（重要，保留）
export const inputVariants: Variants = {
  error: {
    x: [-5, 5, -5, 5, 0],
    transition: { duration: 0.3 },
  },
};

// ==================== 门锁核心动画（保留，这个很重要） ====================

// 门锁图标晃动 - 核心体验动画
export const lockIconVariants: Variants = {
  locked: {
    rotate: 0,
    scale: 1,
  },
  unlocking: {
    rotate: [0, -10, 10, -10, 10, -5, 5, 0], // 晃动效果
    scale: [1, 1.05, 1],
    transition: {
      duration: 0.5,
      ease: 'easeInOut',
      repeat: Infinity,
      repeatDelay: 0.2,
    },
  },
  unlocked: {
    scale: 1.1,
    transition: {
      duration: 0.3,
      ease: 'easeOut',
    },
  },
};

// 成功图标（简化）
export const successIconVariants: Variants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { duration: 0.25 },
  },
};

// 错误图标抖动
export const errorIconVariants: Variants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: { scale: 1, opacity: 1, transition: { duration: 0.2 } },
  shake: {
    x: [-8, 8, -8, 8, 0],
    transition: { duration: 0.4 },
  },
};

// 进度条
export const progressBarVariants: Variants = {
  initial: { scaleX: 0, originX: 0 },
  animate: (progress: number) => ({
    scaleX: progress / 100,
    transition: { duration: 0.3, ease: 'easeOut' },
  }),
};

// ==================== Toast 通知（保留） ====================

export const toastVariants: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.2 },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: { duration: 0.15 },
  },
};

// ==================== 加载动画（简化） ====================

export const spinVariants: Variants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      ease: 'linear',
      repeat: Infinity,
    },
  },
};
