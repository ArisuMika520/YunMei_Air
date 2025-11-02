'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserStore } from '@/store/userStore';
import { useBLE } from '@/lib/hooks/useBLE';
import { Lock } from '@/lib/entities/Lock';
import { useToast } from '@/lib/hooks/useToast';
import { ToastContainer } from '@/components/Toast';
import { ScanLockDialog } from '@/components/ScanLockDialog';
import { ShareLockDialog } from '@/components/ShareLockDialog';
import { LockListSkeleton } from '@/components/Skeleton';
import { 
  fadeVariants,
  buttonVariants,
  modalBackdropVariants,
  modalVariants,
  successIconVariants,
  errorIconVariants,
  lockIconVariants,
  progressBarVariants
} from '@/lib/animations/variants';
import { feedback } from '@/lib/utils/interactions';

export default function LocksPage() {
  const router = useRouter();
  const { locks, user, defaultLockId, setDefaultLock, clearAll, addSharedLock } = useUserStore();
  const { unlock, isUnlocking, progress, message, error: bleError } = useBLE();
  const { toasts, toast, removeToast } = useToast();

  const [selectedLock, setSelectedLock] = useState<Lock | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [showScanDialog, setShowScanDialog] = useState(false);
  const [showShareWarning, setShowShareWarning] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [lockToShare, setLockToShare] = useState<Lock | null>(null);
  
  const [longPressProgress, setLongPressProgress] = useState<{[key: string]: number}>({});
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const [isLongPressing, setIsLongPressing] = useState<string | null>(null);
  
  const [showLongPressTip, setShowLongPressTip] = useState(false);
  const [tipDismissTimer, setTipDismissTimer] = useState<NodeJS.Timeout | null>(null);
  
  // 加载状态
  const [isLoading, setIsLoading] = useState(true);

  // 模拟加载数据（等待 Zustand hydration）
  useEffect(() => {
    // 短暂延迟以确保数据已加载
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);

  // 自动跳转到默认门锁（仅在会话首次访问时）
  useEffect(() => {
    if (isLoading) return;
    
    // 检查是否已经完成过自动跳转
    const hasAutoNavigated = sessionStorage.getItem('hasAutoNavigated');
    
    if (!hasAutoNavigated && defaultLockId && locks.length > 0) {
      const defaultLock = locks.find(lock => lock.id === defaultLockId);
      if (defaultLock) {
        // 标记已完成自动跳转
        sessionStorage.setItem('hasAutoNavigated', 'true');
        
        const timer = setTimeout(() => {
          router.push(`/lock/${defaultLockId}`);
        }, 100);
        
        return () => clearTimeout(timer);
      }
    }
  }, [defaultLockId, locks, router, isLoading]);

  useEffect(() => {
    return () => {
      if (longPressTimer) {
        clearInterval(longPressTimer);
      }
      if (tipDismissTimer) {
        clearTimeout(tipDismissTimer);
      }
    };
  }, [longPressTimer, tipDismissTimer]);
  
  const showLongPressTipBriefly = () => {
    setShowLongPressTip(true);
    
    if (tipDismissTimer) {
      clearTimeout(tipDismissTimer);
    }
    
    const timer = setTimeout(() => {
      setShowLongPressTip(false);
    }, 3000);
    
    setTipDismissTimer(timer);
  };

  const handleUnlock = async (lock: Lock) => {
    feedback.buttonClick();
    setSelectedLock(lock);
    setShowDialog(true);

    const success = await unlock(lock);

    if (success) {
      feedback.success();
      toast.success('解锁成功', '门已打开');
      setTimeout(() => {
        setShowDialog(false);
        setSelectedLock(null);
      }, 2000);
    } else {
      feedback.error();
    }
  };

  const handleViewDetail = (lock: Lock) => {
    feedback.buttonClick();
    router.push(`/lock/${lock.id}`);
  };

  const handleSetAsDefault = (lock: Lock, e: React.MouseEvent) => {
    e.stopPropagation();
    feedback.buttonClick();
    setDefaultLock(lock.id);
    toast.success('设置成功', `${lock.label} 已设为默认门锁`);
  };

  const handleLogout = () => {
    feedback.buttonClick();
    toast.warning('确认退出', '确定要退出登录吗？', 5000);
    setTimeout(() => {
      clearAll();
      // 清除自动跳转标记，下次登录后可以再次自动跳转
      sessionStorage.removeItem('hasAutoNavigated');
      router.push('/login');
    }, 1000);
  };

  const handleScanSuccess = (lock: Lock) => {
    try {
      addSharedLock(lock);
      feedback.success();
      toast.success('添加成功', `${lock.label} 已添加到您的门锁列表`);
    } catch (error: any) {
      feedback.error();
      toast.error('添加失败', error.message || '该门锁已存在');
    }
  };

  const handleShareLongPressStart = (lock: Lock, e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    setIsLongPressing(lock.id);
    feedback.buttonClick();
    
    const LONG_PRESS_DURATION = 800;
    const INTERVAL = 10;
    const totalSteps = LONG_PRESS_DURATION / INTERVAL;
    let currentStep = 0;
    
    const timer = setInterval(() => {
      currentStep++;
      const progress = (currentStep / totalSteps) * 100;
      
      setLongPressProgress(prev => ({ ...prev, [lock.id]: progress }));
      
      if (currentStep >= totalSteps) {
        clearInterval(timer);
        setLongPressProgress(prev => ({ ...prev, [lock.id]: 0 }));
        setIsLongPressing(null);
        feedback.success();
        setLockToShare(lock);
        setShowShareWarning(true);
      }
    }, INTERVAL);
    
    setLongPressTimer(timer);
  };
  
  const handleShareLongPressEnd = (lock: Lock, e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    const currentProgress = longPressProgress[lock.id] || 0;
    
    if (longPressTimer) {
      clearInterval(longPressTimer);
      setLongPressTimer(null);
    }
    
    if (currentProgress > 0 && currentProgress < 100) {
      showLongPressTipBriefly();
      feedback.error();
    }
    
    setIsLongPressing(null);
    setLongPressProgress(prev => ({ ...prev, [lock.id]: 0 }));
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    showLongPressTipBriefly();
    feedback.buttonClick();
  };

  const handleConfirmShare = () => {
    feedback.buttonClick();
    setShowShareWarning(false);
    setShowShareDialog(true);
  };

  // 显示骨架屏
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="bg-white/80 backdrop-blur-xl shadow-sm border-b border-gray-100">
          <div className="flex items-center justify-between p-4">
            <h1 className="text-xl font-bold text-gray-800">我的门锁</h1>
            <div className="flex gap-2">
              <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
              <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
            </div>
          </div>
        </div>
        <LockListSkeleton count={3} />
      </div>
    );
  }

  if (locks.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-32 h-32 mx-auto mb-6 bg-primary-500 rounded-full shadow-lg flex items-center justify-center">
            <svg className="w-20 h-20 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>

          <h2 className="text-3xl font-bold text-neutral-900 mb-3">暂无门锁</h2>
          <p className="text-neutral-500 mb-8">请先登录获取门锁列表</p>
          
          <motion.button
            onClick={() => {
              feedback.buttonClick();
              router.push('/login');
            }}
            whileTap="tap"
            className="btn-primary active:scale-[0.97]"
          >
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              <span>前往登录</span>
            </span>
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <>
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
                <div className="flex-shrink-0">
                  <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm sm:text-base font-bold mb-0.5 sm:mb-1 tracking-wide">需要长按 0.8 秒</p>
                  <p className="text-xs sm:text-sm text-amber-50 tracking-wide">按住分享按钮直到进度条填满</p>
                </div>
                
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

      <div className="min-h-screen safe-top safe-bottom">
        <header className="glass fixed top-0 left-0 right-0 z-50 border-b border-neutral-100 safe-top">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
              <h1 className="text-2xl font-bold text-gradient">我的门锁</h1>
            {user && (
                <p className="text-sm text-neutral-500 mt-1">欢迎回来~ 共 {locks.length} 个门锁</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <motion.button
              onClick={() => {
                feedback.buttonClick();
                router.push('/settings');
              }}
              variants={buttonVariants}
              initial="idle"
              whileHover="hover"
              whileTap="tap"
              className="px-4 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-medium transition-colors"
            >
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>设置</span>
              </span>
            </motion.button>
            <motion.button
            onClick={handleLogout}
              variants={buttonVariants}
              initial="idle"
              whileHover="hover"
              whileTap="tap"
              className="px-4 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-medium transition-colors"
            >
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>退出</span>
              </span>
            </motion.button>
          </div>
        </div>
        </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {locks.map((lock) => {
              const isDefault = defaultLockId === lock.id;
              
              return (
                <motion.div
              key={lock.id}
                  whileTap="tap"
                  onClick={() => handleViewDetail(lock)}
                  className="card p-5 relative overflow-hidden group cursor-pointer active:scale-[0.98] select-none"
                  style={{ 
                    WebkitUserSelect: 'none',
                    userSelect: 'none'
                  }}
                >
                  <div className="absolute top-3 right-3 z-20 flex gap-2">
                    {lock.isShared && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-500 text-white text-xs font-medium rounded-full shadow-sm">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                        </svg>
                        <span>分享</span>
                      </span>
                    )}
                    {isDefault && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary-500 text-white text-xs font-medium rounded-full shadow-sm">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span>默认</span>
                      </span>
                    )}
                  </div>
                  
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className="w-12 h-12 bg-primary-500 rounded-xl flex items-center justify-center flex-shrink-0"
                      >
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-neutral-900 truncate mb-1">
                    {lock.label}
                  </h3>
                        <p className="text-xs text-neutral-500 truncate">
                          {lock.lockNo.slice(0, 12)}...
                  </p>
                </div>
              </div>

                    <div className="flex gap-2">
                      <motion.button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUnlock(lock);
                        }}
                disabled={isUnlocking}
                        whileTap="tap"
                        className="btn-primary flex-1 py-2.5 text-sm rounded-xl shadow-md active:scale-[0.97]"
                      >
                        {isUnlocking && selectedLock?.id === lock.id ? (
                          <span className="flex items-center justify-center gap-2">
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                              className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                            />
                            <span>解锁中</span>
                          </span>
                        ) : (
                          <span className="flex items-center justify-center gap-1.5">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                            </svg>
                            <span>解锁</span>
                          </span>
                        )}
                      </motion.button>

                      <motion.button
                        onClick={(e) => handleShareClick(e)}
                        onMouseDown={(e) => handleShareLongPressStart(lock, e)}
                        onMouseUp={(e) => handleShareLongPressEnd(lock, e)}
                        onMouseLeave={(e) => handleShareLongPressEnd(lock, e)}
                        onTouchStart={(e) => handleShareLongPressStart(lock, e)}
                        onTouchEnd={(e) => handleShareLongPressEnd(lock, e)}
                        onContextMenu={(e) => e.preventDefault()}
                        whileTap="tap"
                        className="relative px-3 py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition-colors active:scale-[0.97] overflow-hidden select-none touch-none"
                        style={{ 
                          WebkitUserSelect: 'none',
                          WebkitTouchCallout: 'none',
                          userSelect: 'none'
                        }}
                        title="长按分享门锁"
                      >
                        <motion.div
                          className="absolute inset-0 bg-amber-400/30 origin-left"
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: (longPressProgress[lock.id] || 0) / 100 }}
                          transition={{ duration: 0.01 }}
                        />
                        
                        <svg 
                          className={`w-4 h-4 relative z-10 transition-colors ${isLongPressing === lock.id ? 'text-amber-600' : ''}`} 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                        </svg>
                      </motion.button>

                      {!isDefault && (
                        <motion.button
                          onClick={(e) => handleSetAsDefault(lock, e)}
                          whileTap="tap"
                          className="px-3 py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition-colors active:scale-[0.97]"
                          title="设为默认"
              >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                          </svg>
                        </motion.button>
                      )}
            </div>
        </div>
                </motion.div>
              );
            })}
          </div>
      </main>

        <AnimatePresence mode="wait">
      {showDialog && selectedLock && (
            <>
              <motion.div
                variants={modalBackdropVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={() => {
                  if (bleError || progress === 100) {
                    setShowDialog(false);
                    setSelectedLock(null);
                  }
                }}
              >
                <motion.div
                  variants={modalVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  onClick={(e) => e.stopPropagation()}
                  className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative"
                >
                  {(bleError || progress === 100) && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 }}
                      onClick={() => {
                        feedback.buttonClick();
                        setShowDialog(false);
                        setSelectedLock(null);
                      }}
                      className="absolute top-4 right-4 w-10 h-10 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center transition-colors"
                    >
                      <svg className="w-5 h-5 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </motion.button>
                  )}

                  <motion.h3
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-2xl font-bold text-neutral-900 mb-6 text-center"
                  >
              {selectedLock.label}
                  </motion.h3>

                  <div className="flex justify-center mb-6">
                    {bleError ? (
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
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.25 }}
                        className="w-24 h-24 bg-success-500 rounded-full flex items-center justify-center shadow-lg"
                      >
                        <svg className="w-14 h-14 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </motion.div>
                    ) : (
                      <motion.div
                        variants={lockIconVariants}
                        animate="unlocking"
                        className="w-24 h-24 bg-primary-500 rounded-full flex items-center justify-center shadow-lg"
                      >
                        <svg className="w-14 h-14 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </motion.div>
                    )}
                  </div>

                  <div className="text-center mb-6">
                    <p className={`text-lg font-semibold ${
                      bleError ? 'text-error-600' :
                      progress === 100 ? 'text-success-600' :
                      'text-primary-600'
                    }`}>
                      {bleError ? '解锁失败' : progress === 100 ? '解锁成功！' : message}
                    </p>
                  </div>

                  {!bleError && progress < 100 && (
                    <div className="mb-6">
                      <div className="flex justify-center mb-3">
                        <span className="text-3xl font-bold text-primary-500">
                          {progress}%
                        </span>
            </div>

                      <div className="relative h-3 bg-neutral-100 rounded-full overflow-hidden">
                        <div 
                          className="absolute inset-y-0 left-0 bg-primary-500 rounded-full transition-all duration-300 ease-out"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {bleError && (
                    <div
                      className="bg-error-50 border-2 border-error-200 text-error-700 px-4 py-3 rounded-2xl text-sm mb-6"
                    >
                      <p className="font-medium mb-1">错误详情</p>
                      <p>{bleError}</p>
                    </div>
                  )}

            {(bleError || progress === 100) && (
                    <motion.button
                      whileTap="tap"
                onClick={() => {
                        feedback.buttonClick();
                  setShowDialog(false);
                  setSelectedLock(null);
                }}
                      className={`w-full py-3 px-6 rounded-xl font-medium transition-all active:scale-[0.97] ${
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

        <motion.button
          onClick={() => {
            feedback.buttonClick();
            setShowScanDialog(true);
          }}
          variants={buttonVariants}
          initial="idle"
          whileHover="hover"
          whileTap="tap"
          className="fixed bottom-8 right-8 w-16 h-16 bg-primary-500 hover:bg-primary-600 text-white rounded-full shadow-2xl flex items-center justify-center z-40 active:scale-95 transition-all"
          style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
        </motion.button>
      </div>

      <ScanLockDialog 
        isOpen={showScanDialog}
        onClose={() => setShowScanDialog(false)}
        onSuccess={handleScanSuccess}
      />

      <AnimatePresence mode="wait">
        {showShareWarning && lockToShare && (
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

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-col gap-2"
              >
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

                <motion.button
                  onClick={() => {
                    feedback.buttonClick();
                    setShowShareWarning(false);
                    setLockToShare(null);
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
      {lockToShare && (
        <ShareLockDialog
          lock={lockToShare}
          isOpen={showShareDialog}
          onClose={() => {
            setShowShareDialog(false);
            setLockToShare(null);
          }}
        />
      )}

      <ToastContainer toasts={toasts} onClose={removeToast} />
    </>
  );
}
