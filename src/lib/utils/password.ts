/**
 * 门锁密码生成算法
 * 基于原项目 yunmei_unintelligent_pwa/src/utils/unlock.js
 *
 * 协议格式:
 * [0xD0] [长度] [密钥] [0xA5] [随机6位数] [ID01] [0xA7]
 */

/**
 * 生成门锁解锁密码
 * @param secret 门锁密钥
 * @returns DataView 包含完整密码的二进制数据
 */
export function generatePassword(secret: string): DataView {
  const buffer = new ArrayBuffer(1024);
  const view = new DataView(buffer);
  let offset = 0;

  // 生成6位随机数 (000000-999999)
  let randomNum = Math.floor(Math.random() * 1000000);

  // 1. 协议头: 0xD0 (208)
  view.setUint8(offset++, 0xD0);

  // 2. 数据长度 = secret长度 + 0xA5(1) + 随机数(6) + ID01(4) + 0xA7(1)
  const dataLength = secret.length + 2 + 2 + 10;
  view.setUint8(offset++, dataLength);

  // 3. 写入密钥字符串
  for (let i = 0; i < secret.length; i++) {
    view.setUint8(offset++, secret.charCodeAt(i));
  }

  // 4. 分隔符: 0xA5 (165)
  view.setUint8(offset++, 0xA5);

  // 5. 写入6位随机数，每一位单独作为一个字节（关键修复！）
  // 原项目逻辑：将6位数的每一位（0-9）分别写入
  for (let i = 0; i < 6; i++) {
    view.setUint8(offset++, randomNum % 10);
    randomNum = Math.floor(randomNum / 10);
  }

  // 6. 设备标识: 73, 68, 48, 49 (对应 'I', 'D', '0', '1')
  view.setUint8(offset++, 73);  // 'I'
  view.setUint8(offset++, 68);  // 'D'
  view.setUint8(offset++, 48);  // '0'
  view.setUint8(offset++, 49);  // '1'

  // 7. 结束符: 0xA7 (167)
  view.setUint8(offset++, 0xA7);

  // 返回实际使用的数据视图
  return new DataView(buffer, 0, offset);
}

/**
 * 将DataView转换为Uint8Array（用于蓝牙写入）
 */
export function dataViewToUint8Array(dataView: DataView): Uint8Array {
  return new Uint8Array(dataView.buffer, dataView.byteOffset, dataView.byteLength);
}

/**
 * 调试：打印密码的十六进制表示
 */
export function debugPassword(dataView: DataView): string {
  const bytes: string[] = [];
  for (let i = 0; i < dataView.byteLength; i++) {
    const byte = dataView.getUint8(i);
    bytes.push('0x' + byte.toString(16).padStart(2, '0').toUpperCase());
  }
  return bytes.join(' ');
}
