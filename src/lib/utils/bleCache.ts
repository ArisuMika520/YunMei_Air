/**
 * 蓝牙设备缓存管理器
 * 用于复用已连接的设备，提高开锁速度
 */

interface CachedDevice {
  device: BluetoothDevice;
  server: BluetoothRemoteGATTServer;
  characteristic: BluetoothRemoteGATTCharacteristic;
  lastUsed: number;
  lockId: string;
}

class BLECacheManager {
  private cache: Map<string, CachedDevice> = new Map();
  private readonly CACHE_TIMEOUT = 30000; // 30秒缓存时间
  private cleanupTimer: NodeJS.Timeout | null = null;

  get(lockId: string): CachedDevice | null {
    const cached = this.cache.get(lockId);
    
    if (!cached) return null;
    
    if (Date.now() - cached.lastUsed > this.CACHE_TIMEOUT) {
      console.log('[BLECache] 缓存已过期:', lockId);
      this.remove(lockId);
      return null;
    }
    
    if (!cached.server.connected) {
      console.log('[BLECache] 服务器已断开:', lockId);
      this.remove(lockId);
      return null;
    }
    
    if (!cached.device.gatt?.connected) {
      console.log('[BLECache] 设备 GATT 已断开:', lockId);
      this.remove(lockId);
      return null;
    }
    
    if (!cached.characteristic.service || !cached.characteristic.service.device) {
      console.log('[BLECache] Characteristic 已失效:', lockId);
      this.remove(lockId);
      return null;
    }
    
    cached.lastUsed = Date.now();
    return cached;
  }

  set(
    lockId: string,
    device: BluetoothDevice,
    server: BluetoothRemoteGATTServer,
    characteristic: BluetoothRemoteGATTCharacteristic
  ): void {
    this.remove(lockId);
    
    this.cache.set(lockId, {
      device,
      server,
      characteristic,
      lastUsed: Date.now(),
      lockId
    });
    
    device.addEventListener('gattserverdisconnected', () => {
      this.remove(lockId);
    });
    
    this.startCleanupTimer();
  }

  remove(lockId: string): void {
    const cached = this.cache.get(lockId);
    if (cached) {
      try {
        cached.device.gatt?.disconnect();
      } catch (error) {
        // 忽略断开连接错误
        console.warn('断开连接时出错:', error);
      }
      this.cache.delete(lockId);
    }
  }

  clear(): void {
    this.cache.forEach((cached) => {
      try {
        cached.device.gatt?.disconnect();
      } catch (error) {
      }
    });
    this.cache.clear();
    
    if (this.cleanupTimer) {
      clearTimeout(this.cleanupTimer);
      this.cleanupTimer = null;
    }
  }

  private startCleanupTimer(): void {
    if (this.cleanupTimer) return;
    
    this.cleanupTimer = setTimeout(() => {
      this.cleanupExpiredCache();
      this.cleanupTimer = null;
      
      if (this.cache.size > 0) {
        this.startCleanupTimer();
      }
    }, this.CACHE_TIMEOUT);
  }

  private cleanupExpiredCache(): void {
    const now = Date.now();
    const toRemove: string[] = [];
    
    this.cache.forEach((cached, lockId) => {
      if (now - cached.lastUsed > this.CACHE_TIMEOUT) {
        toRemove.push(lockId);
      }
    });
    
    toRemove.forEach(lockId => this.remove(lockId));
  }

  getStats() {
    return {
      size: this.cache.size,
      locks: Array.from(this.cache.keys())
    };
  }
}

export const bleCache = new BLECacheManager();

