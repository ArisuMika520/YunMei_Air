'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserStore } from '@/store/userStore';
import { useBLE } from '@/lib/hooks/useBLE';
import { Lock } from '@/lib/entities/Lock';
import { useToast } from '@/lib/hooks/useToast';
import { ToastContainer } from '@/components/Toast';
import { ShareLockDialog } from '@/components/ShareLockDialog';
import { 
  fadeVariants,
  buttonVariants,
  modalBackdropVariants,
  modalVariants,
  successIconVariants,
  errorIconVariants,
  lockIconVariants
} from '@/lib/animations/variants';
import { feedback } from '@/lib/utils/interactions';

export default function LockDetailPage() {
  const router = useRouter();
  const params = useParams();
  const lockId = decodeURIComponent(params.id as string);
  
  const { locks, defaultLockId, setDefaultLock, sideButtonPosition, canRemoveLock, removeLock } = useUserStore();
  const { unlock, isUnlocking, progress, message, error: bleError } = useBLE();
  const { toasts, toast, removeToast } = useToast();

  const [lock, setLock] = useState<Lock | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showShareWarning, setShowShareWarning] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // 长按分享按钮相关状态
  const [isLongPressing, setIsLongPressing] = useState(false);
  const [longPressProgress, setLongPressProgress] = useState(0);
  const [showLongPressTip, setShowLongPressTip] = useState(false);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const [progressInterval, setProgressInterval] = useState<NodeJS.Timeout | null>(null);
  const [tipDismissTimer, setTipDismissTimer] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // 查找当前门锁
    const foundLock = locks.find(l => l.id === lockId);
    
    if (foundLock) {
      // 只在初次加载或门锁数据真正变化时更新
      setLock(prevLock => {
        // 初次加载
        if (!prevLock) {
          setIsInitialized(true);
          return foundLock;
        }
        // 检查是否有实质性变化（label 可能会改变）
        if (prevLock.label !== foundLock.label) {
          return foundLock;
        }
        // 其他情况保持原有数据，避免重新渲染
        return prevLock;
      });
    } else if (locks.length > 0 && isInitialized) {
      // 如果有门锁数据但找不到当前门锁，跳转到列表页
      toast.error('门锁不存在', '请重新选择');
      router.push('/locks');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lockId, locks, router]);

  // 清理定时器
  useEffect(() => {
    return () => {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
      }
      if (progressInterval) {
        clearInterval(progressInterval);
      }
      if (tipDismissTimer) {
        clearTimeout(tipDismissTimer);
      }
    };
  }, [longPressTimer, progressInterval, tipDismissTimer]);

  const handleUnlock = async () => {
    if (!lock) return;
    
    feedback.buttonClick();
    setShowDialog(true);

    const success = await unlock(lock);

    if (success) {
      feedback.success();
      toast.success('解锁成功', '门已打开');
      // 延迟关闭对话框
      setTimeout(() => {
        setShowDialog(false);
      }, 2000);
    } else {
      feedback.error();
    }
  };

  const handleSetAsDefault = () => {
    if (!lock) return;
    feedback.buttonClick();
    setDefaultLock(lock.id);
    toast.success('设置成功', '已设为默认门锁');
  };

  const handleBackToList = () => {
    feedback.buttonClick();
    router.push('/locks');
  };

  // 长按分享按钮处理
  const LONG_PRESS_DURATION = 800; // 长按时间（毫秒）
  const PROGRESS_UPDATE_INTERVAL = 20; // 进度更新间隔（毫秒）

  const handleSharePressStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (!lock) return;
    
    e.preventDefault();
    setIsLongPressing(true);
    setLongPressProgress(0);

    // 开始进度动画
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min((elapsed / LONG_PRESS_DURATION) * 100, 100);
      setLongPressProgress(progress);

      if (progress >= 100) {
        clearInterval(interval);
      }
    }, PROGRESS_UPDATE_INTERVAL);
    setProgressInterval(interval);

    // 设置长按完成定时器
    const timer = setTimeout(() => {
      handleShare();
      handleSharePressEnd();
    }, LONG_PRESS_DURATION);
    setLongPressTimer(timer);
  };

  const handleSharePressEnd = () => {
    setIsLongPressing(false);
    setLongPressProgress(0);

    // 清理定时器和进度
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
    if (progressInterval) {
      clearInterval(progressInterval);
      setProgressInterval(null);
    }

    // 如果进度不足，显示提示
    if (longPressProgress > 0 && longPressProgress < 100) {
      setShowLongPressTip(true);
      
      // 自动隐藏提示
      const dismissTimer = setTimeout(() => {
        setShowLongPressTip(false);
      }, 3000);
      setTipDismissTimer(dismissTimer);
    }
  };

  const handleShare = () => {
    if (!lock) return;
    feedback.buttonClick();
    setShowShareWarning(true);
  };

  const handleConfirmShare = () => {
    feedback.buttonClick();
    setShowShareWarning(false);
    setShowShareDialog(true);
  };

  const handleDeleteClick = () => {
    if (!lock) return;
    feedback.buttonClick();
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    if (!lock) return;
    feedback.buttonClick();
    removeLock(lock.id);
    toast.success('删除成功', '门锁已从列表中移除');
    setTimeout(() => {
      router.push('/locks');
    }, 500);
  };

  if (!lock) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 border-4 border-primary-400 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  const isDefault = defaultLockId === lock.id;

  return (
    <>
      {/* 长按提示软弹窗 */}
      <AnimatePresence>
        {showLongPressTip && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-0 left-0 right-0 z-[60] safe-top"
          >
            <div className="mx-auto w-[calc(100%-2rem)] max-w-2xl mt-2 sm:mt-4">
              <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl shadow-2xl flex items-center gap-3 sm:gap-4 border border-amber-400">
                {/* 图标 */}
                <div className="flex-shrink-0">
                  <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                
                {/* 文字内容 */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm sm:text-base font-bold mb-0.5 sm:mb-1 tracking-wide">需要长按 0.8 秒</p>
                  <p className="text-xs sm:text-sm text-amber-50 tracking-wide">按住分享按钮直到进度条填满</p>
                </div>
                
                {/* 关闭按钮 */}
                <button
                  onClick={() => {
                    setShowLongPressTip(false);
                    if (tipDismissTimer) {
                      clearTimeout(tipDismissTimer);
                    }
                  }}
                  className="flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-amber-400/30 hover:bg-amber-400/50 active:bg-amber-400/60 flex items-center justify-center transition-colors"
                >
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="min-h-screen safe-top safe-bottom flex flex-col">
        {/* 顶部导航 - 固定定位 */}
        <header className="glass fixed top-0 left-0 right-0 z-50 border-b border-neutral-100 safe-top">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
            <motion.button
              onClick={handleBackToList}
              whileTap="tap"
              className="w-10 h-10 rounded-xl bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center transition-colors active:scale-[0.97]"
            >
              <svg className="w-5 h-5 text-neutral-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </motion.button>
            
            <div className="flex-1">
              <h1 className="text-xl font-bold text-gradient">门锁详情</h1>
            </div>

            {/* 设置按钮 */}
            <motion.button
              onClick={() => {
                feedback.buttonClick();
                router.push('/settings');
              }}
              whileTap="tap"
              className="w-10 h-10 rounded-xl bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center transition-colors active:scale-[0.97]"
            >
              <svg className="w-5 h-5 text-neutral-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </motion.button>
          </div>
        </header>

        {/* 主内容区域 - 添加顶部 padding 避免被 fixed header 遮挡 */}
        <main className="flex-1 flex flex-col max-w-3xl mx-auto w-full px-4 sm:px-6 py-8 pt-24 pb-32">
          {/* 门锁大卡片 */}
          <motion.div
            key={lock.id}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="card p-6 mb-6 relative overflow-hidden"
          >
            {/* 右上角按钮组 */}
            <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
              {/* 分享按钮 */}
              <motion.button
                onMouseDown={handleSharePressStart}
                onMouseUp={handleSharePressEnd}
                onMouseLeave={handleSharePressEnd}
                onTouchStart={handleSharePressStart}
                onTouchEnd={handleSharePressEnd}
                onTouchCancel={handleSharePressEnd}
                onContextMenu={(e) => e.preventDefault()}
                variants={buttonVariants}
                initial="idle"
                whileHover="hover"
                animate={isLongPressing ? 'tap' : 'idle'}
                className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white shadow-md hover:shadow-lg flex items-center justify-center transition-all group overflow-hidden select-none touch-none"
                style={{ 
                  WebkitUserSelect: 'none',
                  WebkitTouchCallout: 'none',
                  userSelect: 'none'
                }}
                title="长按分享门锁"
              >
                {/* 进度条背景 */}
                {isLongPressing && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: longPressProgress / 100 }}
                    className="absolute inset-0 bg-blue-500/20 rounded-full"
                    style={{
                      transformOrigin: 'center',
                    }}
                  />
                )}
                
                {/* 进度环 */}
                {isLongPressing && (
                  <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="4"
                      className="text-blue-500"
                      strokeDasharray={`${2 * Math.PI * 45}`}
                      strokeDashoffset={`${2 * Math.PI * 45 * (1 - longPressProgress / 100)}`}
                      strokeLinecap="round"
                      style={{ transition: 'none' }}
                    />
                  </svg>
                )}
                
                <svg className={`w-5 h-5 sm:w-6 sm:h-6 relative z-10 transition-colors ${isLongPressing ? 'text-blue-600' : 'text-blue-500 group-hover:text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </motion.button>

              {/* 默认标签 */}
              {isDefault && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                >
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary-500 text-white text-xs font-medium rounded-full shadow-sm">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span>默认</span>
                  </span>
                </motion.div>
              )}
            </div>
            
            {/* 卡片内容 */}
            <div className="relative z-10">
              {/* 顶部区域 - 图标和名称 */}
              <div className="flex items-center gap-4 mb-6">
                {/* 锁图标 - 更小更简洁 */}
                <motion.div
                  initial={{ scale: 0, rotate: -90 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.1, duration: 0.4, type: 'spring', stiffness: 200 }}
                  className="w-16 h-16 bg-primary-500 rounded-2xl flex items-center justify-center flex-shrink-0"
                >
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </motion.div>

                {/* 门锁名称 */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 }}
                  className="flex-1 min-w-0"
                >
                  <h2 className="text-2xl font-bold text-neutral-900 truncate">
                    {lock.label}
                  </h2>
                </motion.div>
              </div>

              {/* 门锁信息 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-4 mb-6"
              >
                {/* 锁编号 */}
                <div className="flex items-center justify-between py-3 border-b border-neutral-100">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                    </svg>
                    <span className="text-neutral-500 text-sm">锁编号</span>
                  </div>
                  <span className="text-neutral-900 font-mono text-sm">{lock.lockNo.slice(0, 12)}...</span>
                </div>
                
                {/* 连接状态 */}
                <div className="flex items-center justify-between py-3 border-b border-neutral-100">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-success-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                    </svg>
                    <span className="text-neutral-500 text-sm">连接方式</span>
                  </div>
                  <span className="text-neutral-900 text-sm font-medium">蓝牙 BLE</span>
                </div>

                {/* 安全等级 */}
                <div className="flex items-center justify-between py-3 border-b border-neutral-100">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span className="text-neutral-500 text-sm">安全等级</span>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-success-100 text-success-700 text-xs font-medium rounded-full">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>加密传输</span>
                  </span>
                </div>

                {/* 默认状态 */}
                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-neutral-500 text-sm">默认门锁</span>
                  </div>
                  {isDefault ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary-500 text-white text-xs font-medium rounded-full">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span>是</span>
                    </span>
                  ) : (
                    <span className="text-neutral-400 text-sm">否</span>
                  )}
                </div>
              </motion.div>

              {/* 操作按钮组 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="space-y-3"
              >
                {/* 设为默认按钮 */}
                {!isDefault && (
                  <motion.button
                    onClick={handleSetAsDefault}
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                    className="w-full py-3 px-6 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                    <span>设为默认门锁</span>
                  </motion.button>
                )}

                {/* 删除按钮（仅分享获得的门锁） */}
                {canRemoveLock(lock.id) && (
                  <motion.button
                    onClick={handleDeleteClick}
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                    className="w-full py-3 px-6 rounded-xl bg-error-500 hover:bg-error-600 text-white font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span>删除门锁</span>
                  </motion.button>
                )}
              </motion.div>
            </div>
          </motion.div>

          {/* 占位符，确保按钮在底部 */}
          <div className="flex-1" />

          {/* 侧边快捷解锁区域 - 方便手腕/手掌操作 */}
          {sideButtonPosition !== 'off' && (
            <motion.div
              initial={{ x: sideButtonPosition === 'left' ? -100 : 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.4 }}
              className={`fixed ${sideButtonPosition === 'left' ? 'left-0' : 'right-0'} top-1/2 -translate-y-1/2 z-10`}
            >
              <motion.button
                onClick={handleUnlock}
                disabled={isUnlocking}
                whileTap={{ scale: 0.9 }}
                className={`w-20 h-32 bg-primary-500/90 hover:bg-primary-600 backdrop-blur-sm ${sideButtonPosition === 'left' ? 'rounded-r-2xl' : 'rounded-l-2xl'} shadow-xl flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed`}
                style={{ touchAction: 'manipulation' }}
              >
                <div className="flex flex-col items-center gap-2">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                  </svg>
                  <span className="text-white text-xs font-bold rotate-0 writing-mode-vertical">快速</span>
                </div>
              </motion.button>
            </motion.div>
          )}

          {/* 底部开锁按钮 - 固定在底部，方便单手操作 */}
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="fixed bottom-0 left-0 right-0 px-6 pb-8 pt-4 bg-gradient-to-t from-white via-white to-transparent z-10"
            style={{ paddingBottom: 'max(2rem, env(safe-area-inset-bottom) + 1rem)' }}
          >
            {/* 大号主按钮 - 增大触摸区域 */}
            <motion.button
              onClick={handleUnlock}
              disabled={isUnlocking}
              variants={buttonVariants}
              initial="idle"
              whileHover="hover"
              whileTap={{ scale: 0.96 }}
              className="btn-primary w-full h-16 text-lg font-bold rounded-3xl shadow-2xl active:shadow-lg transition-all relative overflow-hidden disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {/* 按钮背景动效 */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-primary-400 to-primary-600 opacity-0"
                whileHover={{ opacity: 0.2 }}
                transition={{ duration: 0.2 }}
              />
              
              {/* 点击涟漪效果 */}
              <motion.div
                className="absolute inset-0 bg-white rounded-3xl"
                initial={{ scale: 0, opacity: 0.5 }}
                whileTap={{ scale: 2, opacity: 0 }}
                transition={{ duration: 0.5 }}
              />
              
              {isUnlocking ? (
                <span className="flex items-center justify-center gap-3 relative z-10">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-6 h-6 border-3 border-white border-t-transparent rounded-full"
                  />
                  <span>解锁中...</span>
                </span>
              ) : (
                <span className="flex items-center justify-center gap-3 relative z-10">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                  </svg>
                  <span>一键解锁</span>
                </span>
              )}
            </motion.button>
            
            {/* 视觉提示 - 向上滑动手势 */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 0.5, y: 0 }}
              transition={{ delay: 1, duration: 0.5 }}
              className="text-center text-xs text-neutral-400 mt-2"
            >
              轻触即可解锁
            </motion.div>
          </motion.div>
        </main>

        {/* 解锁进度对话框 */}
        <AnimatePresence mode="wait">
          {showDialog && (
            <>
              {/* 背景遮罩 */}
              <motion.div
                variants={modalBackdropVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={() => {
                  if (bleError || progress === 100) {
                    setShowDialog(false);
                  }
                }}
              >
                {/* 对话框 */}
                <motion.div
                  variants={modalVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  onClick={(e) => e.stopPropagation()}
                  className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative"
                >
                  {/* 关闭按钮 */}
                  {(bleError || progress === 100) && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 }}
                      onClick={() => {
                        feedback.buttonClick();
                        setShowDialog(false);
                      }}
                      className="absolute top-4 right-4 w-10 h-10 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center transition-colors"
                    >
                      <svg className="w-5 h-5 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </motion.button>
                  )}

                  {/* 标题 */}
                  <motion.h3
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-2xl font-bold text-neutral-900 mb-6 text-center"
                  >
                    {lock.label}
                  </motion.h3>

                  {/* 状态图标 */}
                  <div className="flex justify-center mb-6">
                    {bleError ? (
                      // 错误图标
                      <motion.div
                        variants={errorIconVariants}
                        initial="hidden"
                        animate={["visible", "shake"]}
                        className="w-24 h-24 bg-error-100 rounded-full flex items-center justify-center"
                      >
                        <svg className="w-14 h-14 text-error-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </motion.div>
                    ) : progress === 100 ? (
                      // 成功图标
                      <motion.div
                        variants={successIconVariants}
                        initial="hidden"
                        animate="visible"
                        className="w-24 h-24 bg-success-500 rounded-full flex items-center justify-center shadow-lg"
                      >
                        <motion.svg
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 0.5, delay: 0.3 }}
                          className="w-14 h-14 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <motion.path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </motion.svg>
                      </motion.div>
                    ) : (
                      // 解锁中图标
                      <motion.div
                        variants={lockIconVariants}
                        animate="unlocking"
                        className="w-24 h-24 bg-error-500 rounded-full flex items-center justify-center shadow-lg"
                      >
                        <svg className="w-14 h-14 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </motion.div>
                    )}
                  </div>

                  {/* 状态文字 */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center mb-6"
                  >
                    <p className={`text-lg font-semibold ${
                      bleError ? 'text-error-600' :
                      progress === 100 ? 'text-success-600' :
                      'text-primary-600'
                    }`}>
                      {bleError ? '解锁失败' : progress === 100 ? '解锁成功！' : message}
                    </p>
                  </motion.div>

                  {/* 进度条 */}
                  {!bleError && progress < 100 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-6"
                    >
                      {/* 百分比 */}
                      <div className="flex justify-center mb-3">
                        <motion.span
                          key={progress}
                          initial={{ scale: 1.2, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="text-3xl font-bold text-primary-500"
                        >
                          {progress}%
                        </motion.span>
                      </div>

                      {/* 进度条 */}
                      <div className="relative h-3 bg-neutral-100 rounded-full overflow-hidden">
                        <motion.div
                          className="absolute inset-y-0 left-0 bg-primary-500 rounded-full"
                          initial={{ width: '0%' }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        >
                          {/* 光效动画 */}
                          <motion.div
                            className="absolute inset-0 bg-white/20 rounded-full"
                            animate={{ x: ['-100%', '200%'] }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                          />
                        </motion.div>
                      </div>
                    </motion.div>
                  )}

                  {/* 错误信息 */}
                  {bleError && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-error-50 border-2 border-error-200 text-error-700 px-4 py-3 rounded-2xl text-sm mb-6"
                    >
                      <p className="font-medium mb-1">错误详情</p>
                      <p>{bleError}</p>
                    </motion.div>
                  )}

                  {/* 关闭按钮 (底部) */}
                  {(bleError || progress === 100) && (
                    <motion.button
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      onClick={() => {
                        feedback.buttonClick();
                        setShowDialog(false);
                      }}
                      variants={buttonVariants}
                      whileHover="hover"
                      whileTap="tap"
                      className={`w-full py-3 px-6 rounded-xl font-medium transition-all ${
                        bleError
                          ? 'bg-neutral-200 hover:bg-neutral-300 text-neutral-800'
                          : 'bg-success-500 hover:bg-success-600 text-white'
                      }`}
                    >
                      {bleError ? '关闭' : '完成'}
                    </motion.button>
                  )}
                </motion.div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* 分享危险警告对话框 */}
      <AnimatePresence mode="wait">
        {showShareWarning && (
          <motion.div
            variants={modalBackdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowShareWarning(false)}
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-5 border-4 border-error-500 max-h-[90vh] overflow-y-auto"
            >
              {/* 危险图标 */}
              <div className="text-center mb-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                  className="w-16 h-16 bg-error-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg"
                >
                  <motion.svg
                    animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="w-10 h-10 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </motion.svg>
                </motion.div>

                <motion.h3
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-xl font-bold text-error-600 mb-2"
                >
                  ⚠️ 危险操作
                </motion.h3>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="space-y-3 text-left text-sm"
                >
                  {/* 警告信息卡片 */}
                  <div className="bg-error-50 border border-error-200 rounded-xl p-3">
                    <p className="text-error-800 font-semibold mb-1 text-xs flex items-center gap-1.5">
                      <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      操作不可逆转
                    </p>
                    <p className="text-error-700 text-xs leading-relaxed">
                      分享将暴露蓝牙密钥
                    </p>
                  </div>

                  {/* 安全提示 */}
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                    <p className="text-amber-800 font-semibold mb-1 text-xs flex items-center gap-1.5">
                      <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                      仅分享给
                    </p>
                    <ul className="text-amber-700 text-xs space-y-0.5 ml-5">
                      <li>• 非常信任的人</li>
                      <li>• 自己的其他设备</li>
                    </ul>
                  </div>

                  {/* 风险说明 */}
                  <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-3">
                    <p className="text-neutral-700 text-xs leading-relaxed">
                      <span className="font-semibold text-neutral-900 block mb-1">对方可以：</span>
                      <span className="text-success-600">✓</span> 随时解锁<br/>
                      <span className="text-success-600">✓</span> 继续分享<br/>
                      <span className="text-error-600 font-semibold">✗ 无法撤销权限</span>
                    </p>
                  </div>
                </motion.div>
              </div>

              {/* 操作按钮 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-col gap-2"
              >
                {/* 确认分享按钮 */}
                <motion.button
                  onClick={handleConfirmShare}
                  variants={buttonVariants}
                  initial="idle"
                  whileHover="hover"
                  whileTap="tap"
                  className="w-full py-3 px-4 rounded-xl bg-error-500 hover:bg-error-600 text-white font-bold transition-colors shadow-lg text-sm"
                >
                  我已了解，继续分享
                </motion.button>

                {/* 取消按钮 */}
                <motion.button
                  onClick={() => {
                    feedback.buttonClick();
                    setShowShareWarning(false);
                  }}
                  variants={buttonVariants}
                  initial="idle"
                  whileHover="hover"
                  whileTap="tap"
                  className="w-full py-2.5 px-4 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-medium transition-colors text-sm"
                >
                  取消
                </motion.button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 分享对话框 */}
      <ShareLockDialog
        lock={lock}
        isOpen={showShareDialog}
        onClose={() => setShowShareDialog(false)}
      />

      {/* 删除确认对话框 */}
      <AnimatePresence mode="wait">
        {showDeleteConfirm && (
          <motion.div
            variants={modalBackdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-error-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-error-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-neutral-900 mb-2">确认删除</h3>
                <p className="text-neutral-500">
                  确定要删除「{lock?.label}」吗？<br/>
                  此操作不可恢复
                </p>
              </div>

              <div className="flex gap-3">
                <motion.button
                  onClick={() => {
                    feedback.buttonClick();
                    setShowDeleteConfirm(false);
                  }}
                  variants={buttonVariants}
                  initial="idle"
                  whileHover="hover"
                  whileTap="tap"
                  className="flex-1 py-3 px-6 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-900 font-medium transition-colors"
                >
                  取消
                </motion.button>
                <motion.button
                  onClick={handleConfirmDelete}
                  variants={buttonVariants}
                  initial="idle"
                  whileHover="hover"
                  whileTap="tap"
                  className="flex-1 py-3 px-6 rounded-xl bg-error-500 hover:bg-error-600 text-white font-medium transition-colors"
                >
                  确认删除
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast通知容器 */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </>
  );
}

