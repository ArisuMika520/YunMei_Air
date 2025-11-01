/**
 * 用户状态管理（Zustand）
 * 替代原项目的 Pinia Store
 */

'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User } from '@/lib/entities/User';
import { Lock } from '@/lib/entities/Lock';

interface UserState {
  // 用户信息
  user: User | null;
  // 门锁列表
  locks: Lock[];

  // Actions
  setUser: (user: User | null) => void;
  setLocks: (locks: Lock[]) => void;
  addLock: (lock: Lock) => void;
  removeLock: (lockId: string) => void;
  clearAll: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      locks: [],

      setUser: (user) => set({ user }),

      setLocks: (locks) => set({ locks }),

      addLock: (lock) => set((state) => {
        // 检查是否已存在
        const exists = state.locks.some(l => l.id === lock.id);
        if (exists) {
          return state;
        }
        return { locks: [...state.locks, lock] };
      }),

      removeLock: (lockId) => set((state) => ({
        locks: state.locks.filter(l => l.id !== lockId)
      })),

      clearAll: () => set({ user: null, locks: [] })
    }),
    {
      name: 'yunmei-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user ? state.user.toJSON() : null,
        locks: state.locks.map(lock => lock.toJSON())
      }),
      onRehydrateStorage: () => (state) => {
        // 反序列化时恢复对象实例
        if (state) {
          if (state.user) {
            state.user = User.fromJSON(state.user);
          }
          state.locks = state.locks.map((lockData: any) => Lock.fromJSON(lockData));
        }
      }
    }
  )
);
