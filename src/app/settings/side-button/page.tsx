'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useUserStore } from '@/store/userStore';
import { feedback } from '@/lib/utils/interactions';
import { useToast } from '@/lib/hooks/useToast';
import { ToastContainer } from '@/components/Toast';
import { buttonVariants } from '@/lib/animations/variants';

export default function SideButtonPage() {
  const router = useRouter();
  const { sideButtonPosition, setSideButtonPosition } = useUserStore();
  const { toasts, toast, removeToast } = useToast();

  const handlePositionChange = (position: 'left' | 'right' | 'off') => {
    feedback.buttonClick();
    setSideButtonPosition(position);
    
    const messages = {
      left: '已设置为左侧显示',
      right: '已设置为右侧显示',
      off: '已关闭侧边按钮'
    };
    
    toast.success('设置已保存', messages[position]);
  };

  const options = [
    {
      value: 'left' as const,
      label: '左侧显示',
      description: '适合右手操作，手腕可轻松触及',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
        </svg>
      )
    },
    {
      value: 'right' as const,
      label: '右侧显示',
      description: '适合左手操作，更加灵活',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
        </svg>
      )
    },
    {
      value: 'off' as const,
      label: '关闭显示',
      description: '隐藏侧边快捷按钮',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
        </svg>
      )
    }
  ];

  return (
    <>
      <div className="min-h-screen safe-top safe-bottom">
        {/* 头部导航 - 固定定位 */}
        <header className="glass fixed top-0 left-0 right-0 z-50 border-b border-neutral-100 safe-top">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
            <motion.button
              onClick={() => {
                feedback.buttonClick();
                router.back();
              }}
              variants={buttonVariants}
              initial="idle"
              whileHover="hover"
              whileTap="tap"
              className="p-2 rounded-xl hover:bg-neutral-100 transition-colors"
            >
              <svg className="w-6 h-6 text-neutral-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </motion.button>
            <h1 className="text-2xl font-bold text-gradient">侧边快捷按钮</h1>
          </div>
        </header>

        {/* 主内容 */}
        <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
          {/* 按钮位置选择 */}
          <section className="card p-6 mb-6">
            <div className="space-y-3">
              {options.map((option) => {
                const isSelected = sideButtonPosition === option.value;
                
                return (
                  <motion.button
                    key={option.value}
                    onClick={() => handlePositionChange(option.value)}
                    variants={buttonVariants}
                    initial="idle"
                    whileHover="hover"
                    whileTap="tap"
                    className={`w-full p-4 rounded-2xl border-2 transition-all text-left ${
                      isSelected
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-neutral-200 bg-white hover:border-neutral-300'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {/* 图标 */}
                      <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                        isSelected
                          ? 'bg-primary-500 text-white'
                          : 'bg-neutral-100 text-neutral-600'
                      }`}>
                        {option.icon}
                      </div>
                      
                      {/* 文字内容 */}
                      <div className="flex-1 min-w-0">
                        <h3 className={`font-bold mb-1 transition-colors ${
                          isSelected ? 'text-primary-700' : 'text-neutral-900'
                        }`}>
                          {option.label}
                        </h3>
                        <p className="text-sm text-neutral-500">{option.description}</p>
                      </div>
                      
                      {/* 选中指示器 */}
                      <div className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        isSelected
                          ? 'border-primary-500 bg-primary-500'
                          : 'border-neutral-300 bg-white'
                      }`}>
                        {isSelected && (
                          <motion.svg
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-4 h-4 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </motion.svg>
                        )}
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </section>

          {/* 使用说明 */}
          <section className="card p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-100 mb-6">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-blue-900 mb-2">💡 使用提示</h3>
                <ul className="space-y-2 text-sm text-blue-800">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">•</span>
                    <span><strong>请根据自己使用习惯来设置</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">•</span>
                    <span>侧边按钮在门锁详情页显示，用于快速操作</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* 预览示意图 */}
          <section className="card p-6">
            <h3 className="font-bold text-neutral-900 mb-4">预览效果</h3>
            <div className="relative bg-neutral-100 rounded-2xl h-96 overflow-hidden">
              {/* 模拟手机屏幕 */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <p className="text-neutral-600 font-medium">门锁详情页</p>
                </div>
              </div>

              {/* 侧边按钮示意 */}
              {sideButtonPosition !== 'off' && (
                <motion.div
                  initial={{ x: sideButtonPosition === 'left' ? -100 : 100 }}
                  animate={{ x: 0 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                  className={`absolute ${sideButtonPosition === 'left' ? 'left-0' : 'right-0'} top-1/2 -translate-y-1/2`}
                >
                  <div className={`w-16 h-24 bg-primary-500 ${sideButtonPosition === 'left' ? 'rounded-r-xl' : 'rounded-l-xl'} shadow-xl flex items-center justify-center`}>
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                    </svg>
                  </div>
                </motion.div>
              )}

              {/* 底部按钮示意 */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <div className="w-full h-14 bg-primary-500 rounded-2xl shadow-xl flex items-center justify-center">
                  <span className="text-white font-bold text-sm">一键解锁</span>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>

      <ToastContainer toasts={toasts} onClose={removeToast} />
    </>
  );
}

