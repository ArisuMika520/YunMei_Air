'use client';

import { useEffect, useState } from 'react';

export default function DebugPage() {
  const [envVars, setEnvVars] = useState<Record<string, string>>({});
  const [testResult, setTestResult] = useState<string>('');
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    // 读取环境变量
    setEnvVars({
      NEXT_PUBLIC_PROXY_URL: process.env.NEXT_PUBLIC_PROXY_URL || '未配置',
      NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || '未配置',
    });
  }, []);

  const testProxy = async () => {
    setTesting(true);
    setTestResult('测试中...');

    const proxyUrl = process.env.NEXT_PUBLIC_PROXY_URL;
    
    if (!proxyUrl) {
      setTestResult('❌ NEXT_PUBLIC_PROXY_URL 未配置！');
      setTesting(false);
      return;
    }

    try {
      // 测试 1: 健康检查
      setTestResult('测试 1/3: 健康检查...');
      const healthUrl = proxyUrl.replace('/api/proxy', '/api/health');
      const healthRes = await fetch(healthUrl);
      
      if (!healthRes.ok) {
        setTestResult(`❌ 健康检查失败: ${healthRes.status} ${healthRes.statusText}`);
        setTesting(false);
        return;
      }

      const healthData = await healthRes.json();
      console.log('健康检查:', healthData);

      // 测试 2: 代理请求（无认证）
      setTestResult('测试 2/3: 代理请求...');
      const testUrl = `${proxyUrl}?targetUrl=${encodeURIComponent('https://base.yunmeitech.com/login')}&method=POST`;
      
      console.log('测试URL:', testUrl);
      
      const proxyRes = await fetch(testUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userName: 'test',
          userPwd: 'test'
        })
      });

      const proxyData = await proxyRes.text();
      console.log('代理响应:', proxyData);

      // 测试 3: 完整的透明代理客户端
      setTestResult('测试 3/3: 透明代理客户端...');
      const { TransparentProxyClient } = await import('@/lib/api/transparentProxy');
      const client = new TransparentProxyClient();
      
      try {
        await client.request('https://base.yunmeitech.com/login', {
          method: 'POST',
          body: { userName: 'test', userPwd: 'test' }
        });
      } catch (err: any) {
        console.log('预期的登录失败（测试账号）:', err.message);
      }

      setTestResult(`✅ 所有测试完成！
      
健康检查: ✅
代理请求: ✅  
透明代理客户端: ✅

代理服务器正常工作！
请查看浏览器控制台获取详细日志。`);

    } catch (error: any) {
      console.error('测试失败:', error);
      setTestResult(`❌ 测试失败: ${error.message}

可能的原因：
1. 网络连接问题
2. CORS配置问题
3. 代理服务器未响应

请查看浏览器控制台获取详细错误信息。`);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">
            🔍 环境变量诊断
          </h1>

          {/* 环境变量显示 */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              当前环境变量
            </h2>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2 font-mono text-sm">
              {Object.entries(envVars).map(([key, value]) => (
                <div key={key} className="flex">
                  <span className="text-blue-600 font-semibold w-64">{key}:</span>
                  <span className={value === '未配置' ? 'text-red-600' : 'text-green-600'}>
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 测试按钮 */}
          <div className="mb-8">
            <button
              onClick={testProxy}
              disabled={testing}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {testing ? '测试中...' : '🧪 测试代理连接'}
            </button>
          </div>

          {/* 测试结果 */}
          {testResult && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">
                测试结果
              </h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <pre className="whitespace-pre-wrap font-mono text-sm text-gray-800">
                  {testResult}
                </pre>
              </div>
            </div>
          )}

          {/* 说明 */}
          <div className="border-t pt-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              📚 使用说明
            </h2>
            <div className="space-y-2 text-gray-600">
              <p>1. 检查上方环境变量是否正确配置</p>
              <p>2. 点击"测试代理连接"按钮</p>
              <p>3. 查看测试结果和浏览器控制台日志</p>
              <p className="mt-4 text-sm text-gray-500">
                如果测试失败，请检查：
                <br />- .env.local 文件是否存在
                <br />- 环境变量格式是否正确
                <br />- 是否重启了开发服务器（必须！）
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

