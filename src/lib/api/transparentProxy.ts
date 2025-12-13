/**
 * 透明代理客户端
 * 用于绕过CORS限制，安全地转发HTTP请求
 */

export class TransparentProxyClient {
  private proxyUrl: string;

  constructor(proxyUrl?: string) {
    // 优先使用本地 API 路由，避免 CORS 问题
    this.proxyUrl = proxyUrl || process.env.NEXT_PUBLIC_PROXY_URL || '/api/proxy';

    console.log('[TransparentProxy] 使用代理 URL:', this.proxyUrl);
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

    const proxyParams = new URLSearchParams({
      targetUrl: targetUrl,
      method: method
    });

    const finalProxyUrl = `${this.proxyUrl}?${proxyParams.toString()}`;

    console.log('[TransparentProxy] 最终代理URL:', finalProxyUrl);

    const requestInit: RequestInit = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers  // 认证头部（token_data, token_userId, tokenUserId）
      }
    };

    console.log('[TransparentProxy] 发送的头部:', requestInit.headers);

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
