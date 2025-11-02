/**
 * 高性能存储工具
 * 使用 IndexedDB 替代 LocalStorage，提供更大容量和异步 API
 */

import { get, set, del, clear, createStore } from 'idb-keyval';

// 创建自定义存储实例（仅在浏览器环境）
const customStore = typeof window !== 'undefined' 
  ? createStore('yunmei-db', 'yunmei-store')
  : null as any;

export const storage = {
  async get<T>(key: string): Promise<T | undefined> {
    if (!customStore) return undefined;
    try {
      return await get<T>(key, customStore);
    } catch (error) {
      console.error('[Storage] 获取数据失败:', key, error);
      return undefined;
    }
  },

  async set(key: string, value: any): Promise<void> {
    if (!customStore) return;
    try {
      await set(key, value, customStore);
    } catch (error) {
      console.error('[Storage] 设置数据失败:', key, error);
      throw error;
    }
  },

  async delete(key: string): Promise<void> {
    if (!customStore) return;
    try {
      await del(key, customStore);
    } catch (error) {
      console.error('[Storage] 删除数据失败:', key, error);
      throw error;
    }
  },

  async clear(): Promise<void> {
    if (!customStore) return;
    try {
      await clear(customStore);
    } catch (error) {
      console.error('[Storage] 清空数据失败:', error);
      throw error;
    }
  }
};

export const createIndexedDBStorage = () => ({
  getItem: async (name: string): Promise<string | null> => {
    try {
      const value = await storage.get<string>(name);
      return value || null;
    } catch (error) {
      console.error('[Storage] getItem 失败:', error);
      return null;
    }
  },
  
  setItem: async (name: string, value: string): Promise<void> => {
    try {
      await storage.set(name, value);
    } catch (error) {
      console.error('[Storage] setItem 失败:', error);
    }
  },
  
  removeItem: async (name: string): Promise<void> => {
    try {
      await storage.delete(name);
    } catch (error) {
      console.error('[Storage] removeItem 失败:', error);
    }
  }
});

export async function migrateFromLocalStorage(keys: string[]): Promise<void> {
  if (typeof window === 'undefined') return;
  
  console.log('[Storage] 开始迁移 LocalStorage 数据到 IndexedDB...');
  
  for (const key of keys) {
    try {
      const localValue = localStorage.getItem(key);
      if (localValue) {
        await storage.set(key, localValue);
        console.log(`[Storage] 已迁移: ${key}`);
      }
    } catch (error) {
      console.error(`[Storage] 迁移失败: ${key}`, error);
    }
  }
  
  console.log('[Storage] 迁移完成');
}

