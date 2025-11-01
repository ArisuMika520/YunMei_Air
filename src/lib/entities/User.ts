/**
 * 用户实体类
 * 基于原项目 yunmei_unintelligent_pwa/src/entity/User.js
 */

export class User {
  userId: string;      // 用户ID
  telephone: string;   // 手机号
  token: string;       // 认证token
  realName: string;    // 真实姓名

  constructor(
    userId: string,
    telephone: string,
    token: string,
    realName: string
  ) {
    this.userId = userId;
    this.telephone = telephone;
    this.token = token;
    this.realName = realName;
  }

  /**
   * 从API响应创建User实例
   */
  static fromResponse(response: any): User {
    return new User(
      response.userId || response.o?.userId || '',
      response.userTel || response.o?.userTel || '',
      response.token || response.o?.token || '',
      response.realName || response.o?.realName || ''
    );
  }

  /**
   * 转换为JSON对象（用于存储）
   */
  toJSON() {
    return {
      userId: this.userId,
      telephone: this.telephone,
      token: this.token,
      realName: this.realName
    };
  }

  /**
   * 从JSON对象创建User实例
   */
  static fromJSON(json: any): User {
    return new User(
      json.userId || '',
      json.telephone || '',
      json.token || '',
      json.realName || ''
    );
  }
}

/**
 * 学校信息接口
 */
export interface School {
  schoolNo: string;       // 学校编号
  schoolName: string;     // 学校名称
  serverUrl: string;      // 学校服务器URL
  token: string;          // 学校token（会刷新）
}
