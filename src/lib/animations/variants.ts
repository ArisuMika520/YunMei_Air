/**
 * 动画配置
 */

import { Variants } from 'framer-motion';

export const fadeVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

export const modalBackdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.15 } },
  exit: { opacity: 0, transition: { duration: 0.1 } },
};

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

export const buttonVariants: Variants = {
  tap: {
    scale: 0.97,
    transition: { duration: 0.1 },
  },
};

export const inputVariants: Variants = {
  error: {
    x: [-5, 5, -5, 5, 0],
    transition: { duration: 0.3 },
  },
};


export const lockIconVariants: Variants = {
  locked: {
    rotate: 0,
    scale: 1,
  },
  unlocking: {
    rotate: [0, -10, 10, -10, 10, -5, 5, 0],
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

export const successIconVariants: Variants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { duration: 0.25 },
  },
};

export const errorIconVariants: Variants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: { scale: 1, opacity: 1, transition: { duration: 0.2 } },
  shake: {
    x: [-8, 8, -8, 8, 0],
    transition: { duration: 0.4 },
  },
};

export const progressBarVariants: Variants = {
  initial: { scaleX: 0, originX: 0 },
  animate: (progress: number) => ({
    scaleX: progress / 100,
    transition: { duration: 0.3, ease: 'easeOut' },
  }),
};


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
