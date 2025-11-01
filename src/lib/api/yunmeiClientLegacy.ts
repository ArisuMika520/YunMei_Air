/**
 * 云莓API客户端 - 兼容旧代理版本
 * 使用 LegacyProxyClient 连接原始 PHP 代理格式
 */

import CryptoJS from 'crypto-js';
import { LegacyProxyClient } from './legacyProxyClient';
import { User, School } from '../entities/User';
import { Lock } from '../entities/Lock';

export class YunmeiClientLegacy {
  private proxy: LegacyProxyClient;
  private baseUrl: string;

  private userId?: string;
  private token?: string;

  constructor(proxyUrl?: string, baseUrl?: string) {
    this.proxy = new LegacyProxyClient(proxyUrl);
    this.baseUrl = baseUrl || process.env.NEXT_PUBLIC_API_BASE_URL || 'https://base.yunmeitech.com';
  }

  /**
   * 登录
   * @param username 用户名（手机号）
   * @param password 密码（明文）
   */
  async login(username: string, password: string): Promise<User> {
    // 在客户端MD5加密密码
    const hashedPassword = CryptoJS.MD5(password).toString();

    const response = await this.proxy.request(
      `${this.baseUrl}/login`,
      {
        method: 'POST',
        data: {
          userName: username,
          userPwd: hashedPassword
        }
      }
    );

    if (!response.success && response.msg) {
      throw new Error(response.msg);
    }

    // 保存认证信息
    const user = User.fromResponse(response);
    this.userId = user.userId;
    this.token = user.token;

    return user;
  }

  /**
   * 获取学校列表
   */
  async getSchools(): Promise<School[]> {
    if (!this.userId || !this.token) {
      throw new Error('请先登录');
    }

    // 构造 header 数组（旧格式）
    const authHeaders = [
      `token_data: ${this.token}`,
      `token_userId: ${this.userId}`,
      `tokenUserId: ${this.userId}`
    ];

    const response = await this.proxy.request(
      `${this.baseUrl}/userschool/getbyuserid`,
      {
        method: 'POST',
        data: { userId: this.userId },
        headers: authHeaders
      }
    );

    return response.map((school: any) => ({
      schoolNo: school.schoolNo,
      schoolName: school.school.schoolName,
      serverUrl: school.school.serverUrl,
      token: school.token
    }));
  }

  /**
   * 获取门锁列表
   * @param schoolNo 学校编号
   * @param serverUrl 学校服务器URL
   * @param schoolToken 学校token
   * @param username 用户名（用于MD5加密）
   */
  async getLocks(
    schoolNo: string,
    serverUrl: string,
    schoolToken: string,
    username: string
  ): Promise<Lock[]> {
    if (!this.userId) {
      throw new Error('请先登录');
    }

    // 构造 header 数组（旧格式）
    const authHeaders = [
      `token_data: ${schoolToken}`,
      `token_userId: ${this.userId}`,
      `tokenUserId: ${this.userId}`
    ];

    const response = await this.proxy.request(
      `${serverUrl}/dormuser/getuserlock`,
      {
        method: 'POST',
        data: {
          schoolNo: schoolNo,
          userId: this.userId
        },
        headers: authHeaders
      }
    );

    // MD5加密用户名
    const hashedUsername = CryptoJS.MD5(username).toString();

    // 构造Lock对象
    return response.map((lockData: any) => {
      const label = `${lockData.buildName}-${lockData.dormNo}`;

      return new Lock(
        label,
        lockData.lockNo,                    // MAC地址
        lockData.lockCharacterUuid,          // 特征UUID
        lockData.lockServiceUuid,            // 服务UUID
        lockData.lockSecret,                 // 密钥
        hashedUsername,                      // MD5加密的用户名
        schoolNo,
        lockData.lockNo
      );
    });
  }
}


