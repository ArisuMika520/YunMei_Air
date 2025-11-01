# 环境变量配置指南

## 必需配置

在项目根目录创建 `.env.local` 文件（用于本地开发）或配置环境变量（用于生产部署）。

### `.env.local` 示例

```bash
# 透明代理服务器 URL（必填）
# 使用你已部署的 Vercel 代理地址
NEXT_PUBLIC_PROXY_URL=https://your-proxy.vercel.app/api/proxy

# 云梅 API 基础 URL（可选，默认为官方地址）
NEXT_PUBLIC_API_BASE_URL=https://base.yunmeitech.com
```

## 配置方法

### 方式 1：本地开发（推荐）

1. 在项目根目录创建 `.env.local` 文件
2. 复制上面的内容并填入实际值
3. 重启开发服务器 `npm run dev`

### 方式 2：PM2 生产部署

在 `ecosystem.config.js` 的 `env_production` 中添加：

```javascript
env_production: {
  NODE_ENV: 'production',
  PORT: 3000,
  NEXT_PUBLIC_PROXY_URL: 'https://your-proxy.vercel.app/api/proxy',
  NEXT_PUBLIC_API_BASE_URL: 'https://base.yunmeitech.com'
}
```

### 方式 3：Vercel 部署

在 Vercel Dashboard → Settings → Environment Variables 中添加：
- `NEXT_PUBLIC_PROXY_URL`
- `NEXT_PUBLIC_API_BASE_URL`（可选）

## 验证配置

启动应用后，如果看到以下错误，说明配置缺失：

```
透明代理 URL 未配置！
请在项目根目录创建 .env.local 文件并添加：
NEXT_PUBLIC_PROXY_URL=https://yunmei.arisumika.top/proxy
```

## 获取代理 URL

你已经部署的透明代理服务器地址：
- GitHub 仓库：https://github.com/ArisuMika520/transparent-proxy-vercel
- 部署地址：https://your-vercel-url.vercel.app/api/proxy

替换 `your-vercel-url` 为你的实际 Vercel 项目地址。


