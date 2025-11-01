'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/userStore';

export default function HomePage() {
  const router = useRouter();
  const { locks } = useUserStore();

  useEffect(() => {
    // 检查是否有门锁数据，决定跳转到哪个页面
    if (locks.length > 0) {
      router.push('/locks');
    } else {
      router.push('/login');
    }
  }, [locks, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">云莓Air</h1>
        <p className="text-gray-500">智能门锁蓝牙解锁</p>
        <div className="mt-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        </div>
      </div>
    </div>
  );
}
