/**
 * 返回按钮组件
 */

'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { feedback } from '@/lib/utils/interactions';
import { buttonVariants } from '@/lib/animations/variants';

interface BackButtonProps {
  className?: string;
}

export default function BackButton({ className = '' }: BackButtonProps) {
  const router = useRouter();

  return (
    <motion.button
      onClick={() => {
        feedback.buttonClick();
        router.back();
      }}
      variants={buttonVariants}
      initial="idle"
      whileHover="hover"
      whileTap="tap"
      className={`p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors ${className}`}
      aria-label="返回"
    >
      <svg className="w-6 h-6 text-neutral-700 dark:text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
    </motion.button>
  );
}

