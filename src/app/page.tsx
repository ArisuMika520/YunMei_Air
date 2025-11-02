'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useUserStore } from '@/store/userStore';

export default function HomePage() {
  const router = useRouter();
  const { locks, defaultLockId } = useUserStore();

  useEffect(() => {
    // 检查是否有门锁数据，决定跳转到哪个页面
    const timer = setTimeout(() => {
      if (defaultLockId) {
        // 如果有默认锁，直接跳转到默认锁详情页
        router.push(`/lock/${defaultLockId}`);
      } else if (locks.length > 0) {
        // 如果有锁但没有默认锁，跳转到列表页
      router.push('/locks');
    } else {
        // 没有锁，跳转到登录页
      router.push('/login');
    }
    }, 1500); // 显示1.5秒启动画面

    return () => clearTimeout(timer);
  }, [locks, defaultLockId, router]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex min-h-screen items-center justify-center"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="text-center"
      >
        {/* Logo动画 */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ 
            duration: 0.8, 
            ease: [0.34, 1.56, 0.64, 1],
            delay: 0.2 
          }}
          className="w-32 h-32 mx-auto mb-8 bg-primary-500 rounded-3xl shadow-lg flex items-center justify-center"
        >
          <svg className="w-20 h-20 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </motion.div>

        {/* 标题 */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="text-5xl font-bold text-gradient mb-4"
        >
          云梅Air
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="text-neutral-500 mb-12"
        >
          智能门锁 · 一触即开
        </motion.p>

        {/* Loading动画 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="flex items-center justify-center gap-2"
        >
          <motion.div
            className="w-3 h-3 bg-primary-400 rounded-full"
            animate={{ y: [-10, 0, -10] }}
            transition={{ 
              duration: 0.6, 
              repeat: Infinity, 
              ease: 'easeInOut',
              delay: 0 
            }}
          />
          <motion.div
            className="w-3 h-3 bg-primary-400 rounded-full"
            animate={{ y: [-10, 0, -10] }}
            transition={{ 
              duration: 0.6, 
              repeat: Infinity, 
              ease: 'easeInOut',
              delay: 0.15 
            }}
          />
          <motion.div
            className="w-3 h-3 bg-primary-400 rounded-full"
            animate={{ y: [-10, 0, -10] }}
            transition={{ 
              duration: 0.6, 
              repeat: Infinity, 
              ease: 'easeInOut',
              delay: 0.3 
            }}
          />
        </motion.div>

        {/* 版本信息 */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="text-xs text-neutral-400 mt-12"
        >
          v0.1.0
        </motion.p>
      </motion.div>
    </motion.div>
  );
}
