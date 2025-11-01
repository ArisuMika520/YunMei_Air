/**
 * Web Bluetooth API 工具函数
 * 基于原项目 yunmei_unintelligent_pwa/src/utils/ble.js
 */

import { Lock } from '../entities/Lock';
import { generatePassword, dataViewToUint8Array } from './password';

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
  data: DataView | Uint8Array
): Promise<void> {
  const value = data instanceof DataView ? dataViewToUint8Array(data) : data;
  await characteristic.writeValue(new Uint8Array(value));
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
  try {
    // Step 1: 请求设备 (0-20%)
    onProgress?.(0, '请求蓝牙设备...');
    const device = await requestDevice(lock.serviceUuid);

    onProgress?.(20, '设备已找到');

    // Step 2: 连接GATT服务器 (20-40%)
    onProgress?.(30, '连接中...');
    const server = await connectGATT(device);

    onProgress?.(40, '已连接到设备');

    // Step 3: 获取特征 (40-60%)
    onProgress?.(50, '获取蓝牙特征...');
    const characteristic = await getCharacteristic(
      server,
      lock.serviceUuid,
      lock.characteristicUuid
    );

    onProgress?.(60, '特征已获取');

    // Step 4: 生成密码并写入 (60-90%)
    onProgress?.(70, '生成解锁密码...');
    const password = generatePassword(lock.secret);

    onProgress?.(80, '发送解锁指令...');
    await writeCharacteristic(characteristic, password);

    onProgress?.(90, '指令已发送');

    // Step 5: 完成 (90-100%)
    onProgress?.(100, '解锁成功！');

    // 延迟断开连接
    setTimeout(() => {
      device.gatt?.disconnect();
    }, 1000);

  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`解锁失败: ${error.message}`);
    }
    throw error;
  }
}

/**
 * 检查浏览器是否支持Web Bluetooth
 */
export function isBLESupported(): boolean {
  return typeof navigator !== 'undefined' && 'bluetooth' in navigator;
}
