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
  primaryHue: number;
  backgroundImage: string | null;
  backgroundOpacity: number;
  overlayOpacity: number;
  componentOpacity: number;
}

interface UserState {
  user: User | null;
  locks: Lock[];
  defaultLockId: string | null;
  sideButtonPosition: 'left' | 'right' | 'off';
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
      sideButtonPosition: 'left',
      themeConfig: {
        primaryHue: 222,
        backgroundImage: null,
        backgroundOpacity: 1,
        overlayOpacity: 0.3,
        componentOpacity: 0.95
      },

      setUser: (user) => set({ user }),

      setLocks: (locks) => set((state) => {
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
        const exists = state.locks.some(l => l.id === lock.id);
        if (exists) {
          return state;
        }
        return { locks: [...state.locks, lock] };
      }),

      addSharedLock: (lock) => set((state) => {
        const exists = state.locks.some(l => l.id === lock.id);
        if (exists) {
          throw new Error('该门锁已存在');
        }
        const sharedLock = new Lock(
          lock.label,
          lock.mac,
          lock.characteristicUuid,
          lock.serviceUuid,
          lock.secret,
          lock.username,
          lock.schoolNo,
          lock.lockNo,
          true
        );
        return { locks: [...state.locks, sharedLock] };
      }),

      removeLock: (lockId) => set((state) => ({
        locks: state.locks.filter(l => l.id !== lockId),
        defaultLockId: state.defaultLockId === lockId ? null : state.defaultLockId
      })),

      canRemoveLock: (lockId) => {
        const state = get();
        const lock = state.locks.find(l => l.id === lockId);
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
