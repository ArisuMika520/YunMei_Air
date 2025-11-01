'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/userStore';
import { useBLE } from '@/lib/hooks/useBLE';
import { Lock } from '@/lib/entities/Lock';

export default function LocksPage() {
  const router = useRouter();
  const { locks, user, clearAll } = useUserStore();
  const { unlock, isUnlocking, progress, message, error: bleError } = useBLE();

  const [selectedLock, setSelectedLock] = useState<Lock | null>(null);
  const [showDialog, setShowDialog] = useState(false);

  const handleUnlock = async (lock: Lock) => {
    setSelectedLock(lock);
    setShowDialog(true);

    const success = await unlock(lock);

    if (success) {
      // 延迟关闭对话框，让用户看到成功消息
      setTimeout(() => {
        setShowDialog(false);
        setSelectedLock(null);
      }, 2000);
    }
  };

  const handleLogout = () => {
    if (confirm('确定要退出登录吗？')) {
      clearAll();
      router.push('/login');
    }
  };

  if (locks.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">暂无门锁</h2>
          <p className="text-gray-500 mb-8">请先登录获取门锁列表</p>
          <button
            onClick={() => router.push('/login')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition"
          >
            前往登录
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">我的门锁</h1>
            {user && (
              <p className="text-sm text-gray-500 mt-1">欢迎，{user.realName || user.telephone}</p>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="text-gray-600 hover:text-gray-900 text-sm font-medium"
          >
            退出登录
          </button>
        </div>
      </header>

      {/* 门锁列表 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {locks.map((lock) => (
            <div
              key={lock.id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {lock.label}
                  </h3>
                  <p className="text-sm text-gray-500">
                    锁编号: {lock.lockNo}
                  </p>
                </div>
                <div className="ml-4">
                  <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>

              <button
                onClick={() => handleUnlock(lock)}
                disabled={isUnlocking}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isUnlocking && selectedLock?.id === lock.id ? '解锁中...' : '解锁'}
              </button>
            </div>
          ))}
        </div>
      </main>

      {/* 解锁进度对话框 */}
      {showDialog && selectedLock && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {selectedLock.label}
            </h3>

            {/* 进度条 */}
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>{message}</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    bleError ? 'bg-red-500' : progress === 100 ? 'bg-green-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>

            {/* 错误信息 */}
            {bleError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
                {bleError}
              </div>
            )}

            {/* 成功图标 */}
            {progress === 100 && !bleError && (
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            )}

            {/* 关闭按钮 */}
            {(bleError || progress === 100) && (
              <button
                onClick={() => {
                  setShowDialog(false);
                  setSelectedLock(null);
                }}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition"
              >
                关闭
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
