/**
 * 兼容原始 PHP 代理的客户端
 * 用于连接格式为 { method, url, data, header, cookie } 的旧代理
 */

export class LegacyProxyClient {
  private proxyUrl: string;

  constructor(proxyUrl?: string) {
    this.proxyUrl = proxyUrl || process.env.NEXT_PUBLIC_PROXY_URL || '';

    if (!this.proxyUrl) {
      throw new Error(
        '代理 URL 未配置！\n' +
        '请在项目根目录创建 .env.local 文件并添加：\n' +
        'NEXT_PUBLIC_PROXY_URL=https://your-proxy.vercel.app/api/proxy-legacy\n' +
        '或者：\n' +
        'NEXT_PUBLIC_PROXY_URL=https://xypp.cc/proxyHTTP.php\n'
      );
    }
  }

  /**
   * 发送请求到兼容旧格式的代理
   * @param targetUrl 目标API的完整URL
   * @param options 请求选项
   */
  async request<T = any>(
    targetUrl: string,
    options: {
      method?: 'GET' | 'POST';
      data?: any;
      headers?: string[];  // 字符串数组格式: ["token_data: xxx", "token_userId: yyy"]
      cookie?: string;
    } = {}
  ): Promise<T> {
    const { method = 'POST', data, headers = [], cookie = '' } = options;

    console.log('[LegacyProxy] 发起请求:', {
      proxyUrl: this.proxyUrl,
      targetUrl,
      method,
      hasData: !!data,
      headersCount: headers.length
    });

    // 构造旧格式的请求体
    const requestBody: any = {
      method: method.toLowerCase(),
      url: targetUrl,
    };

    if (data) {
      requestBody.data = data;
    }

    if (headers.length > 0) {
      requestBody.header = headers;
    }

    if (cookie) {
      requestBody.cookie = cookie;
    }

    console.log('[LegacyProxy] 请求体:', requestBody);

    // 判断代理类型
    const isFormProxy = this.proxyUrl.includes('proxyHTTP.php');

    let response: Response;

    if (isFormProxy) {
      // PHP 代理使用 application/x-www-form-urlencoded
      const formData = new URLSearchParams();
      formData.append('method', requestBody.method);
      formData.append('url', requestBody.url);
      
      if (requestBody.data) {
        formData.append('data', JSON.stringify(requestBody.data));
      }
      
      if (requestBody.header) {
        formData.append('header', JSON.stringify(requestBody.header));
      }
      
      if (requestBody.cookie) {
        formData.append('cookie', requestBody.cookie);
      }

      response = await fetch(this.proxyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString()
      });
    } else {
      // Vercel 代理使用 application/json
      response = await fetch(this.proxyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });
    }

    if (!response.ok) {
      // 尝试获取详细错误信息
      let errorDetails = '';
      try {
        const text = await response.text();
        errorDetails = text ? `\n服务器响应: ${text.substring(0, 500)}` : '';
      } catch (e) {
        // 忽略解析错误
      }

      console.error('[LegacyProxy] 请求失败:', {
        status: response.status,
        statusText: response.statusText,
        targetUrl
      });

      const errorMsg = response.status === 404 
        ? `代理端点不存在 (404)！\n请检查 NEXT_PUBLIC_PROXY_URL 配置：${this.proxyUrl}\n\n可能原因：\n1. 代理服务未启动\n2. URL 配置错误\n3. 网络连接问题`
        : `HTTP ${response.status}: ${response.statusText}${errorDetails}`;
      throw new Error(errorMsg);
    }

    const result = await response.json();
    console.log('[LegacyProxy] 响应成功:', {
      targetUrl,
      dataType: typeof result
    });

    return result;
  }
}


