/**
 * 云梅API客户端
 * 基于透明代理，实现完全客户端的API调用
 */

import CryptoJS from 'crypto-js';
import { TransparentProxyClient } from './transparentProxy';
import { User, School } from '../entities/User';
import { Lock } from '../entities/Lock';

export class YunmeiClient {
  private proxy: TransparentProxyClient;
  private baseUrl: string;

  private userId?: string;
  private token?: string;

  constructor(proxyUrl?: string, baseUrl?: string) {
    this.proxy = new TransparentProxyClient(proxyUrl);
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
        body: {
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

    const response = await this.proxy.request(
      `${this.baseUrl}/userschool/getbyuserid`,
      {
        method: 'POST',
        body: { userId: this.userId },
        headers: {
          'X-Token-Data': this.token,
          'X-Token-UserId': this.userId,
          'X-TokenUserId': this.userId
        }
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

    const response = await this.proxy.request(
      `${serverUrl}/dormuser/getuserlock`,
      {
        method: 'POST',
        body: {
          schoolNo: schoolNo,
          userId: this.userId
        },
        headers: {
          'X-Token-Data': schoolToken,
          'X-Token-UserId': this.userId,
          'X-TokenUserId': this.userId
        }
      }
    );

    // 检查响应格式
    if (!response) {
      throw new Error('获取门锁列表失败：服务器未返回数据');
    }

    // 检查是否是错误响应
    if (response.error || response.rawResponse) {
      const errorMsg = response.message || response.msg || '获取门锁列表失败：服务器返回了错误响应';
      console.error('[YunmeiClient] 获取门锁列表失败:', {
        error: response.error,
        message: response.message,
        rawResponse: response.rawResponse?.substring(0, 200)
      });
      throw new Error(errorMsg);
    }

    // 检查响应是否是数组格式
    let locksArray: any[];
    
    if (Array.isArray(response)) {
      locksArray = response;
    } else {
      // 检查是否是包装在对象中的数组（如 { data: [...] }）
      if (response.data && Array.isArray(response.data)) {
        locksArray = response.data;
      } else if (response.list && Array.isArray(response.list)) {
        locksArray = response.list;
      } else if (response.result && Array.isArray(response.result)) {
        locksArray = response.result;
      } else if (response.success === false && response.msg) {
        // 服务器返回了错误信息
        throw new Error(response.msg);
      } else {
        // 未知的响应格式
        console.error('[YunmeiClient] 未知的响应格式:', response);
        throw new Error('获取门锁列表失败：服务器返回了未知的响应格式');
      }
    }

    // 如果响应是空数组，返回空数组（不是错误）
    if (locksArray.length === 0) {
      console.log('[YunmeiClient] 门锁列表为空');
      return [];
    }

    // MD5加密用户名
    const hashedUsername = CryptoJS.MD5(username).toString();

    // 构造Lock对象
    return locksArray.map((lockData: any) => {
      // 验证必要字段
      if (!lockData.lockNo || !lockData.lockCharacterUuid || !lockData.lockServiceUuid || !lockData.lockSecret) {
        console.warn('[YunmeiClient] 门锁数据不完整，跳过:', lockData);
        return null;
      }

      const label = `${lockData.buildName || '未知'}-${lockData.dormNo || '未知'}`;

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
    }).filter((lock): lock is Lock => lock !== null); // 过滤掉 null 值
  }
}
