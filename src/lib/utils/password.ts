/**
 * 门锁密码生成算法
 */

export function generatePassword(secret: string): DataView {
  const buffer = new ArrayBuffer(1024);
  const view = new DataView(buffer);
  let offset = 0;

  let randomNum = Math.floor(Math.random() * 1000000);

  view.setUint8(offset++, 0xD0);

  const dataLength = secret.length + 2 + 2 + 10;
  view.setUint8(offset++, dataLength);

  for (let i = 0; i < secret.length; i++) {
    view.setUint8(offset++, secret.charCodeAt(i));
  }

  view.setUint8(offset++, 0xA5);

  for (let i = 0; i < 6; i++) {
    view.setUint8(offset++, randomNum % 10);
    randomNum = Math.floor(randomNum / 10);
  }

  view.setUint8(offset++, 73);  // 'I'
  view.setUint8(offset++, 68);  // 'D'
  view.setUint8(offset++, 48);  // '0'
  view.setUint8(offset++, 49);  // '1'

  view.setUint8(offset++, 0xA7);

  return new DataView(buffer, 0, offset);
}

export function dataViewToUint8Array(dataView: DataView): Uint8Array {
  return new Uint8Array(dataView.buffer, dataView.byteOffset, dataView.byteLength);
}

export function debugPassword(dataView: DataView): string {
  const bytes: string[] = [];
  for (let i = 0; i < dataView.byteLength; i++) {
    const byte = dataView.getUint8(i);
    bytes.push('0x' + byte.toString(16).padStart(2, '0').toUpperCase());
  }
  return bytes.join(' ');
}
