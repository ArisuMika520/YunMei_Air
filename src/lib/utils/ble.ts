/**
 * Web Bluetooth API 工具函数
 * 基于原项目 yunmei_unintelligent_pwa/src/utils/ble.js
 * 设备缓存和并行密码生成
 */

import { Lock } from '../entities/Lock';
import { generatePassword, dataViewToUint8Array } from './password';
import { bleCache } from './bleCache';
import { measurePerformance } from './performance';

/**
 * 请求蓝牙设备
 * @param serviceUuid 蓝牙服务UUID
 * @returns BluetoothDevice
 */
export async function requestDevice(serviceUuid: string): Promise<BluetoothDevice> {
  if (!navigator.bluetooth) {
    throw new Error('此浏览器不支持Web Bluetooth API');
  }

  const device = await navigator.bluetooth.requestDevice({
    filters: [{ services: [serviceUuid.toLowerCase()] }]
  });

  return device;
}

/**
 * 连接到GATT服务器
 * @param device BluetoothDevice
 * @returns BluetoothRemoteGATTServer
 */
export async function connectGATT(device: BluetoothDevice): Promise<BluetoothRemoteGATTServer> {
  if (!device.gatt) {
    throw new Error('设备不支持GATT');
  }

  const server = await device.gatt.connect();
  return server;
}

/**
 * 获取蓝牙特征
 * @param server GATT服务器
 * @param serviceUuid 服务UUID
 * @param characteristicUuid 特征UUID
 * @returns BluetoothRemoteGATTCharacteristic
 */
export async function getCharacteristic(
  server: BluetoothRemoteGATTServer,
  serviceUuid: string,
  characteristicUuid: string
): Promise<BluetoothRemoteGATTCharacteristic> {
  const service = await server.getPrimaryService(serviceUuid.toLowerCase());
  const characteristic = await service.getCharacteristic(characteristicUuid.toLowerCase());
  return characteristic;
}

/**
 * 写入数据到蓝牙特征
 * @param characteristic 蓝牙特征
 * @param data 要写入的数据
 */
export async function writeCharacteristic(
  characteristic: BluetoothRemoteGATTCharacteristic,
  data: DataView | Uint8Array | ArrayBuffer
): Promise<void> {
  let buffer: ArrayBuffer;
  
  if (data instanceof DataView) {
    const uint8 = new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
    const copy = new Uint8Array(uint8);
    buffer = copy.buffer;
  } else if (data instanceof Uint8Array) {
    const copy = new Uint8Array(data);
    buffer = copy.buffer;
  } else {
    buffer = data;
  }
  
  await characteristic.writeValue(buffer);
}

/**
 * 完整的解锁流程
 * @param lock 门锁对象
 * @param onProgress 进度回调 (progress: 0-100, message: string)
 */
export async function unlockProcess(
  lock: Lock,
  onProgress?: (progress: number, message: string) => void
): Promise<void> {
  return measurePerformance('蓝牙解锁', async () => {
    try {
      const cached = bleCache.get(lock.id);
      
      if (cached) {
        console.log('[BLE] 使用缓存连接，快速解锁');
        
        onProgress?.(20, '正在连接...');
        
        onProgress?.(40, '准备解锁指令...');
        const password = generatePassword(lock.secret);
        
        onProgress?.(70, '发送解锁指令...');
        
        try {
          if (!cached.server.connected) {
            console.warn('[BLE] 缓存的连接已断开，尝试重新连接...');
            throw new Error('Connection lost');
          }
          
          await writeCharacteristic(cached.characteristic, password);
          onProgress?.(100, '解锁成功！');
          
          return;
        
      } catch (writeError) {
        console.warn('[BLE] 缓存连接失败，尝试重新连接...', writeError);
        bleCache.remove(lock.id);
        
        try {
          if (cached.device.gatt) {
            onProgress?.(30, '重新连接中...');
            
            if (cached.device.gatt.connected) {
              cached.device.gatt.disconnect();
            }
            
            const server = await cached.device.gatt.connect();
            
            onProgress?.(50, '获取服务...');
            const characteristic = await getCharacteristic(
              server,
              lock.serviceUuid,
              lock.characteristicUuid
            );
            
            onProgress?.(80, '发送解锁指令...');
            await writeCharacteristic(characteristic, password);
            
            bleCache.set(lock.id, cached.device, server, characteristic);
            
            onProgress?.(100, '解锁成功！');
            return;
          }
        } catch (reconnectError) {
          console.warn('[BLE] 重连失败，将执行完整流程', reconnectError);
        }
      }
    }
    
    console.log('[BLE] 执行完整连接流程');
    
    onProgress?.(0, '请求蓝牙设备...');
    const device = await requestDevice(lock.serviceUuid);

    onProgress?.(15, '设备已找到');

    onProgress?.(20, '连接中...');
    const [server, password] = await Promise.all([
      connectGATT(device),
      Promise.resolve(generatePassword(lock.secret))
    ]);

    onProgress?.(50, '已连接到设备');

    onProgress?.(60, '获取蓝牙特征...');
    const characteristic = await getCharacteristic(
      server,
      lock.serviceUuid,
      lock.characteristicUuid
    );

    onProgress?.(80, '发送解锁指令...');
    await writeCharacteristic(characteristic, password);

    onProgress?.(95, '指令已发送');

    bleCache.set(lock.id, device, server, characteristic);

    onProgress?.(100, '解锁成功！');

    } catch (error) {
      bleCache.remove(lock.id);
      
      if (error instanceof Error) {
        throw new Error(`解锁失败: ${error.message}`);
      }
      throw error;
    }
  }, { cached: !!bleCache.get(lock.id) });
}

export function disconnectAll(): void {
  console.log('[BLE] 断开所有连接');
  bleCache.clear();
}

export function disconnectLock(lockId: string): void {
  console.log('[BLE] 断开门锁连接:', lockId);
  bleCache.remove(lockId);
}

export function getCacheStats() {
  return bleCache.getStats();
}

export function isBLESupported(): boolean {
  return typeof navigator !== 'undefined' && 'bluetooth' in navigator;
}
