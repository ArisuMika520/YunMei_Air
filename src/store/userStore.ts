/**
 * 用户状态管理（Zustand）
 * 替代原项目的 Pinia Store
 */

'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User } from '@/lib/entities/User';
import { Lock } from '@/lib/entities/Lock';

interface ThemeConfig {
  // 主题颜色（色相值 0-360）
  primaryHue: number;
  // 背景图片 URL
  backgroundImage: string | null;
  // 背景图片透明度 0-1
  backgroundOpacity: number;
  // 蒙版透明度 0-1
  overlayOpacity: number;
  // 组件透明度 0-1（卡片、导航栏等）
  componentOpacity: number;
}

interface UserState {
  // 用户信息
  user: User | null;
  // 门锁列表
  locks: Lock[];
  // 默认门锁ID
  defaultLockId: string | null;
  // 侧边快捷按钮位置设置：'left' | 'right' | 'off'
  sideButtonPosition: 'left' | 'right' | 'off';
  // 主题配置
  themeConfig: ThemeConfig;

  // Actions
  setUser: (user: User | null) => void;
  setLocks: (locks: Lock[]) => void;
  setDefaultLock: (lockId: string) => void;
  getDefaultLock: () => Lock | null;
  setSideButtonPosition: (position: 'left' | 'right' | 'off') => void;
  setThemeConfig: (config: Partial<ThemeConfig>) => void;
  addLock: (lock: Lock) => void;
  addSharedLock: (lock: Lock) => void;
  removeLock: (lockId: string) => void;
  canRemoveLock: (lockId: string) => boolean;
  clearAll: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      locks: [],
      defaultLockId: null,
      sideButtonPosition: 'left', // 默认在左侧
      themeConfig: {
        primaryHue: 222, // 默认蓝色 #316aef
        backgroundImage: null,
        backgroundOpacity: 1,
        overlayOpacity: 0.3,
        componentOpacity: 0.95 // 默认 95% 不透明度
      },

      setUser: (user) => set({ user }),

      setLocks: (locks) => set((state) => {
        // 如果是第一次设置锁且有锁，自动设置第一个为默认锁
        if (locks.length > 0 && !state.defaultLockId) {
          return { locks, defaultLockId: locks[0].id };
        }
        return { locks };
      }),

      setDefaultLock: (lockId) => set({ defaultLockId: lockId }),

      setSideButtonPosition: (position) => set({ sideButtonPosition: position }),

      setThemeConfig: (config) => set((state) => ({
        themeConfig: { ...state.themeConfig, ...config }
      })),

      getDefaultLock: () => {
        const state = get();
        if (!state.defaultLockId) return null;
        return state.locks.find(l => l.id === state.defaultLockId) || null;
      },

      addLock: (lock) => set((state) => {
        // 检查是否已存在
        const exists = state.locks.some(l => l.id === lock.id);
        if (exists) {
          return state;
        }
        return { locks: [...state.locks, lock] };
      }),

      addSharedLock: (lock) => set((state) => {
        // 检查是否已存在
        const exists = state.locks.some(l => l.id === lock.id);
        if (exists) {
          throw new Error('该门锁已存在');
        }
        // 标记为分享获得
        const sharedLock = new Lock(
          lock.label,
          lock.mac,
          lock.characteristicUuid,
          lock.serviceUuid,
          lock.secret,
          lock.username,
          lock.schoolNo,
          lock.lockNo,
          true // isShared = true
        );
        return { locks: [...state.locks, sharedLock] };
      }),

      removeLock: (lockId) => set((state) => ({
        locks: state.locks.filter(l => l.id !== lockId),
        // 如果删除的是默认锁，清除默认锁ID
        defaultLockId: state.defaultLockId === lockId ? null : state.defaultLockId
      })),

      canRemoveLock: (lockId) => {
        const state = get();
        const lock = state.locks.find(l => l.id === lockId);
        // 只有分享获得的门锁可以删除
        return lock?.isShared || false;
      },

      clearAll: () => set({ user: null, locks: [], defaultLockId: null })
    }),
    {
      name: 'yunmei-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user ? state.user.toJSON() : null,
        locks: state.locks.map(lock => lock.toJSON()),
        defaultLockId: state.defaultLockId,
        sideButtonPosition: state.sideButtonPosition,
        themeConfig: state.themeConfig
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
