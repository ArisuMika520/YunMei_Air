/**
 * 透明代理客户端
 * 用于绕过CORS限制，安全地转发HTTP请求
 */

export class TransparentProxyClient {
  private proxyUrl: string;

  constructor(proxyUrl?: string) {
    this.proxyUrl = proxyUrl || process.env.NEXT_PUBLIC_PROXY_URL || '';

    if (!this.proxyUrl) {
      throw new Error(
        '透明代理 URL 未配置！\n' +
        '请在项目根目录创建 .env.local 文件并添加：\n' +
        'NEXT_PUBLIC_PROXY_URL=https://yunmei.arisumika.top/proxy\n\n' +
        '如果使用 PM2 部署，请在 ecosystem.config.js 的 env_production 中添加该环境变量。'
      );
    }
  }

  /**
   * 发送请求到透明代理
   * @param targetUrl 目标API的完整URL
   * @param options 请求选项
   */
  async request<T = any>(
    targetUrl: string,
    options: {
      method?: 'GET' | 'POST';
      body?: any;
      headers?: Record<string, string>;
    } = {}
  ): Promise<T> {
    const { method = 'POST', body, headers = {} } = options;

    console.log('[TransparentProxy] 发起请求:', {
      proxyUrl: this.proxyUrl,
      targetUrl,
      method,
      hasBody: !!body,
      headers
    });

    // 关键修复：使用新格式（通过 URL 参数传递目标信息）
    // 代理会自动将 body 转换为查询字符串发送给云梅 API
    const proxyParams = new URLSearchParams({
      targetUrl: targetUrl,
      method: method
    });

    const finalProxyUrl = `${this.proxyUrl}?${proxyParams.toString()}`;

    console.log('[TransparentProxy] 最终代理URL:', finalProxyUrl);

    // 将数据作为 JSON 发送给代理
    // 代理会负责转换为云梅 API 期望的查询字符串格式
    const requestInit: RequestInit = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers  // 认证头部（token_data, token_userId, tokenUserId）
      }
    };

    // 只有当有 body 时才添加
    if (body && typeof body === 'object' && Object.keys(body).length > 0) {
      requestInit.body = JSON.stringify(body);
    }

    const response = await fetch(finalProxyUrl, requestInit);

    if (!response.ok) {
      // 尝试获取详细错误信息
      let errorDetails = '';
      try {
        const text = await response.text();
        errorDetails = text ? `\n服务器响应: ${text.substring(0, 500)}` : '';
      } catch (e) {
        // 忽略解析错误
      }

      console.error('[TransparentProxy] 请求失败:', {
        status: response.status,
        statusText: response.statusText,
        targetUrl
      });

      const errorMsg = response.status === 404 
        ? `代理端点不存在 (404)！\n请检查 NEXT_PUBLIC_PROXY_URL 配置：${this.proxyUrl}\n\n可能原因：\n1. 代理服务未启动\n2. URL 配置错误\n3. 网络连接问题`
        : `HTTP ${response.status}: ${response.statusText}${errorDetails}`;
      throw new Error(errorMsg);
    }

    const data = await response.json();
    console.log('[TransparentProxy] 响应成功:', {
      targetUrl,
      dataType: typeof data
    });

    return data;
  }
}
