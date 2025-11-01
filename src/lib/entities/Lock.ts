/**
 * 门锁实体类
 * 基于原项目 yunmei_unintelligent_pwa/src/entity/Lock.js
 */

export class Lock {
  label: string;              // 门锁标签（如：东区宿舍-101）
  mac: string;                // MAC地址
  characteristicUuid: string; // 蓝牙特征UUID
  serviceUuid: string;        // 蓝牙服务UUID
  secret: string;             // 门锁密钥
  username: string;           // 用户名（MD5加密后）
  schoolNo: string;           // 学校编号
  lockNo: string;             // 锁编号

  constructor(
    label: string,
    mac: string,
    characteristicUuid: string,
    serviceUuid: string,
    secret: string,
    username: string,
    schoolNo: string,
    lockNo: string
  ) {
    this.label = label;
    this.mac = mac;
    this.characteristicUuid = characteristicUuid;
    this.serviceUuid = serviceUuid;
    this.secret = secret;
    this.username = username;
    this.schoolNo = schoolNo;
    this.lockNo = lockNo;
  }

  /**
   * 序列化为字符串（用于分享）
   * @param headless 是否不包含URL头部
   * @returns Base64编码的字符串
   */
  toString(headless: boolean = false): string {
    const body = [
      this.label,
      this.mac,
      this.characteristicUuid,
      this.serviceUuid,
      this.secret,
      this.username,
      this.schoolNo,
      this.lockNo
    ].join('|');

    const encoded = Buffer.from(body, 'utf-8').toString('base64');
    const prefix = headless ? '' : `${window.location.origin}/lock/`;
    return `${prefix}${encoded}`;
  }

  /**
   * 从URL反序列化
   * @param url 包含Base64编码数据的URL
   * @returns Lock实例
   */
  static fromUrl(url: string): Lock {
    // 提取Base64部分
    const base64Part = url.split('/').pop() || '';
    const decoded = Buffer.from(base64Part, 'base64').toString('utf-8');
    const parts = decoded.split('|');

    if (parts.length !== 8) {
      throw new Error('Invalid lock URL format');
    }

    return new Lock(
      parts[0], // label
      parts[1], // mac
      parts[2], // characteristicUuid
      parts[3], // serviceUuid
      parts[4], // secret
      parts[5], // username
      parts[6], // schoolNo
      parts[7]  // lockNo
    );
  }

  /**
   * 从JSON对象创建Lock实例
   */
  static fromJSON(json: any): Lock {
    return new Lock(
      json.label || '',
      json.mac || '',
      json.characteristicUuid || json.lockCharacterUuid || '',
      json.serviceUuid || json.lockServiceUuid || '',
      json.secret || json.lockSecret || '',
      json.username || '',
      json.schoolNo || '',
      json.lockNo || ''
    );
  }

  /**
   * 转换为JSON对象（用于存储）
   */
  toJSON() {
    return {
      label: this.label,
      mac: this.mac,
      characteristicUuid: this.characteristicUuid,
      serviceUuid: this.serviceUuid,
      secret: this.secret,
      username: this.username,
      schoolNo: this.schoolNo,
      lockNo: this.lockNo
    };
  }

  /**
   * 生成唯一ID（用于列表key）
   */
  get id(): string {
    return `${this.schoolNo}_${this.lockNo}`;
  }
}
