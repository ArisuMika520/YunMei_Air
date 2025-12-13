'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { YunmeiClient } from '@/lib/api/yunmeiClient';
import { useUserStore } from '@/store/userStore';
import { useToast } from '@/lib/hooks/useToast';
import { ToastContainer } from '@/components/Toast';
import { fadeVariants, buttonVariants, inputVariants } from '@/lib/animations/variants';
import { feedback } from '@/lib/utils/interactions';

export default function LoginPage() {
  const router = useRouter();
  const { user, setUser, setLocks } = useUserStore();
  const { toasts, toast, removeToast } = useToast();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      console.log('[Login] 检测到已登录用户，自动跳转到门锁列表');
      router.replace('/locks');
    }
  }, [user, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    feedback.buttonClick();
    setLoading(true);

    try {
      const client = new YunmeiClient();

      const user = await client.login(username, password);
      console.log('登录成功:', user);
      setUser(user);

      const schools = await client.getSchools();
      console.log('学校列表:', schools);

      if (schools.length === 0) {
        throw new Error('未找到关联的学校');
      }

      const school = schools[0];
      const locks = await client.getLocks(
        school.schoolNo,
        school.serverUrl,
        school.token,
        username
      );

      console.log('门锁列表:', locks);

      setLocks(locks);

      // 检查门锁列表是否为空
      if (locks.length === 0) {
        toast.warning('登录成功', '但未找到关联的门锁');
        feedback.success();
        // 仍然跳转到门锁列表页，让用户看到空状态
        setTimeout(() => {
          router.push('/locks');
        }, 1500);
      } else {
        toast.success('登录成功', '正在跳转...');
        feedback.success();
        // 清除自动跳转标记，允许下次进入时自动跳转到默认门锁
        sessionStorage.removeItem('hasAutoNavigated');
        setTimeout(() => {
          // 跳转到门锁列表，让列表页处理自动跳转到默认门锁
          router.push('/locks');
        }, 1000);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '登录失败';
      toast.error('登录失败', errorMessage);
      feedback.error();
      console.error('登录错误:', err);
      setLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center px-4 py-8 safe-top safe-bottom">
        <div className="max-w-md w-full">
          <div className="absolute top-0 left-0 w-96 h-96 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-breathing" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-breathing" style={{ animationDelay: '1s' }} />

          <div className="relative card glass p-8">
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-center mb-8"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, duration: 0.5, type: 'spring', stiffness: 200 }}
                className="w-20 h-20 mx-auto mb-4 bg-primary-500 rounded-3xl shadow-lg flex items-center justify-center"
              >
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </motion.div>

              <h1 className="text-4xl font-bold text-gradient mb-2">云梅Air</h1>
              <p className="text-neutral-500">智能门锁 · 一触即开</p>
            </motion.div>

            <motion.form
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              onSubmit={handleLogin}
              className="space-y-5"
            >
          <div>
                <label htmlFor="username" className="block text-sm font-medium text-neutral-700 mb-2">
              手机号
            </label>
                <motion.div
                  initial="idle"
                  whileFocus="focus"
                  className="relative"
                >
            <input
              id="username"
              type="tel"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={loading}
                    className="input-primary"
              placeholder="请输入手机号"
                    autoComplete="tel"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                </motion.div>
          </div>

          <div>
                <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-2">
              密码
            </label>
                <motion.div
                  initial="idle"
                  whileFocus="focus"
                  className="relative"
                >
            <input
              id="password"
                    type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
                    className="input-primary pr-12"
              placeholder="请输入密码"
                    autoComplete="current-password"
            />
                  <button
                    type="button"
                    onClick={() => {
                      setShowPassword(!showPassword);
                      feedback.buttonClick();
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-primary-400 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    )}
                  </button>
                </motion.div>
          </div>

              <motion.button
            type="submit"
            disabled={loading || !username || !password}
                variants={buttonVariants}
                initial="idle"
                whileHover="hover"
                whileTap="tap"
                className="btn-primary w-full relative overflow-hidden"
          >
            {loading ? (
                  <span className="flex items-center justify-center gap-3">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                    />
                    <span>登录中...</span>
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                    <span>登录</span>
                  </span>
            )}
              </motion.button>
            </motion.form>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="mt-6 text-center"
            >
              <p className="text-sm text-neutral-500">
                首次登录将自动获取您的门锁列表
              </p>
            </motion.div>
        </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="text-center text-xs text-neutral-400 mt-6"
          >
            v1.0.1 · Made by ArisuMika❤️
          </motion.p>
        </div>
      </div>

      <ToastContainer toasts={toasts} onClose={removeToast} />
    </>
  );
}
