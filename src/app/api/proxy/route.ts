/**
 * Next.js API 路由 - 透明代理
 * 用于绕过浏览器 CORS 限制
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // 从 URL 参数获取目标信息
    const searchParams = request.nextUrl.searchParams;
    const targetUrl = searchParams.get('targetUrl');
    const method = searchParams.get('method') || 'POST';

    if (!targetUrl) {
      return NextResponse.json(
        { error: '缺少 targetUrl 参数' },
        { status: 400 }
      );
    }

    console.log('[API Proxy] 收到请求:', {
      targetUrl,
      method,
      headers: Object.fromEntries(request.headers.entries())
    });

    // 获取请求体（如果有）
    let bodyData: any = null;
    const contentType = request.headers.get('content-type');
    
    if (contentType?.includes('application/json')) {
      try {
        bodyData = await request.json();
        console.log('[API Proxy] 请求体:', bodyData);
      } catch (e) {
        console.log('[API Proxy] 无请求体或解析失败');
      }
    }

    // 构建目标请求
    let finalUrl = targetUrl;
    const requestInit: RequestInit = {
      method: method,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'YunmeiAir/1.0'
      }
    };

    // 将认证头部转发到目标服务器
    const authHeaders = ['token_data', 'token_userId', 'tokenUserId'];
    authHeaders.forEach(header => {
      const value = request.headers.get(header);
      if (value) {
        requestInit.headers = {
          ...requestInit.headers,
          [header]: value
        };
      }
    });

    // 根据方法处理请求体
    if (method === 'POST' && bodyData) {
      // 将 JSON 转换为 URL 编码格式
      const formData = new URLSearchParams();
      Object.entries(bodyData).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
      requestInit.body = formData.toString();
      console.log('[API Proxy] POST body:', formData.toString());
    } else if (method === 'GET' && bodyData) {
      // GET 请求将参数添加到 URL
      const params = new URLSearchParams();
      Object.entries(bodyData).forEach(([key, value]) => {
        params.append(key, String(value));
      });
      finalUrl = `${targetUrl}?${params.toString()}`;
      console.log('[API Proxy] GET URL:', finalUrl);
    }

    console.log('[API Proxy] 发送请求到:', finalUrl);
    console.log('[API Proxy] 请求配置:', {
      method: requestInit.method,
      headers: requestInit.headers,
      bodyLength: requestInit.body?.toString().length || 0
    });

    // 发送请求到目标服务器
    const response = await fetch(finalUrl, requestInit);
    
    console.log('[API Proxy] 目标服务器响应:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    });

    // 获取响应数据
    const responseText = await response.text();
    console.log('[API Proxy] 响应内容:', responseText.substring(0, 500));

    // 尝试解析为 JSON
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      console.error('[API Proxy] JSON 解析失败，返回原始文本');
      responseData = { rawResponse: responseText };
    }

    // 返回响应（带 CORS 头部）
    return NextResponse.json(responseData, {
      status: response.status,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, token_data, token_userId, tokenUserId'
      }
    });

  } catch (error) {
    console.error('[API Proxy] 错误:', error);
    return NextResponse.json(
      { 
        error: '代理请求失败',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

// 处理 OPTIONS 预检请求
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, token_data, token_userId, tokenUserId'
    }
  });
}

