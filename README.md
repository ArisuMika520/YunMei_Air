# 云梅Air - 智能门锁应用

基于 Next.js 14 + TypeScript + PWA 重构的云梅门锁蓝牙解锁应用。

## 📋 项目特性

- ✅ **Next.js 14 App Router** - 最新的Next.js架构
- ✅ **TypeScript** - 完整的类型安全
- ✅ **PWA支持** - 可安装、离线使用
- ✅ **Web Bluetooth API** - 原生蓝牙门锁解锁
- ✅ **Zustand状态管理** - 轻量级状态管理
- ✅ **Tailwind CSS** - 现代化UI设计
- ✅ **透明代理** - 安全的跨域请求转发
- ✅ **完全客户端** - 门锁密钥不经过服务器

## 🏗️ 项目结构

```
YunMei_Air/
├── src/
│   ├── app/                    # Next.js App Router 页面
│   │   ├── login/              # 登录页面
│   │   ├── locks/              # 门锁列表页面
│   │   ├── layout.tsx          # 根布局
│   │   ├── page.tsx            # 首页（重定向逻辑）
│   │   └── globals.css         # 全局样式
│   ├── lib/                    # 核心库
│   │   ├── entities/           # 实体类
│   │   │   ├── Lock.ts         # 门锁实体
│   │   │   └── User.ts         # 用户实体
│   │   ├── utils/              # 工具函数
│   │   │   ├── ble.ts          # 蓝牙工具函数
│   │   │   └── password.ts     # 密码生成算法
│   │   ├── hooks/              # React Hooks
│   │   │   └── useBLE.ts       # 蓝牙Hook
│   │   └── api/                # API 客户端
│   │       ├── transparentProxy.ts  # 透明代理客户端
│   │       └── yunmeiClient.ts      # 云梅API客户端
│   └── store/                  # 状态管理
│       └── userStore.ts        # 用户Store (Zustand)
├── public/                     # 静态资源
│   └── manifest.json           # PWA manifest
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

## ⚠️ 遇到 "Failed to fetch" 错误？

**立即执行以下步骤：**

### 方法 1: 使用一键修复脚本（推荐）

```powershell
cd YunMei_Air
.\fix-env.ps1
```

> **注意**: 使用 `fix-env.ps1`（英文版）避免 PowerShell 编码问题

### 方法 2: 手动修复

1. **确认 `.env.local` 存在且正确**
2. **重启开发服务器**（最重要！）
   ```bash
   # 在终端按 Ctrl+C 停止
   # 然后重新运行
   npm run dev
   ```
3. **访问诊断页面测试**
   ```
   http://localhost:3000/debug
   ```

📖 **详细说明**：查看 `重要-必读.md`

---

## 🚀 快速开始

### 前置条件

- Node.js 18+
- npm 或 yarn
- 支持Web Bluetooth的浏览器（Chrome/Edge）
- **已部署的透明代理服务器**（见下文）

### 步骤 1: 部署透明代理（必需）

**推荐方式：一键部署到 Vercel**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/ArisuMika520/transparent-proxy-vercel)

或查看详细指南：[transparent-proxy-vercel 仓库](https://github.com/ArisuMika520/transparent-proxy-vercel)

部署完成后，你会得到一个代理 URL，例如：
```
https://your-proxy.vercel.app/api/proxy
```

### 步骤 2: 安装依赖

```bash
cd YunMei_Air
npm install
```

### 步骤 3: 配置环境变量

创建 `.env.local` 文件：

```bash
# 透明代理 URL（必填 - 使用你在步骤1部署的代理地址）
NEXT_PUBLIC_PROXY_URL=https://your-proxy.vercel.app/api/proxy

# 云梅 API Base URL（可选，使用默认值即可）
NEXT_PUBLIC_API_BASE_URL=https://base.yunmeitech.com
```

💡 **提示**: 请将 `your-proxy` 替换为你的实际 Vercel 项目名称。

📖 **详细配置**: 参见 [ENV_CONFIG.md](./ENV_CONFIG.md)

### 步骤 4: 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000)

### 步骤 5: 测试修复（可选）

我们提供了一个独立的测试页面来验证 API 修复：

```bash
# 在浏览器中打开
start test-api-fix.html  # Windows
open test-api-fix.html   # macOS
```

详细测试步骤见 [QUICK_TEST.md](./QUICK_TEST.md)

### 构建生产版本

```bash
npm run build
npm start
```

## 📱 PWA 功能

### ✨ 新特性 (2025-10-31)

- ✅ **完整 PWA 支持** - next-pwa 插件集成
- ✅ **离线访问** - Service Worker 智能缓存
- ✅ **安装提示** - 自动显示安装提示组件
- ✅ **应用快捷方式** - 长按图标快速解锁
- ✅ **优化图标** - 支持 Maskable 图标（Android）

### 🚀 快速开始

**3 分钟完成 PWA 配置**：查看 [PWA_QUICKSTART.md](./PWA_QUICKSTART.md)

**完整指南**：查看 [PWA_GUIDE.md](./PWA_GUIDE.md)

### 📱 安装步骤

#### Chrome (桌面/Android)
1. 访问应用URL
2. 点击地址栏右侧的"安装"图标 或 底部弹出的安装提示
3. 确认安装

#### iOS Safari
1. 访问应用URL
2. 点击分享按钮 📤
3. 选择"添加到主屏幕"
4. 完成！

### 🎨 生成图标

```bash
# 打开图标生成器
start YunMei_Air/scripts/generate-pwa-icons.html
```

详见：[PWA_QUICKSTART.md](./PWA_QUICKSTART.md)

## 🔐 安全架构

### 透明代理

- 代理服务器**不解析**请求体内容
- 门锁密钥**不经过**服务器
- 所有敏感数据**仅存在**于用户浏览器

### 数据流

```
用户浏览器
    ↓ 加密请求
透明代理 (不解析内容)
    ↓ 转发
云梅API服务器
    ↓ 加密响应
透明代理 (不解析内容)
    ↓ 转发
用户浏览器 (解密并存储到LocalStorage)
```

## 🔧 核心功能

### 1. 登录流程

```typescript
import { YunmeiClient } from '@/lib/api/yunmeiClient';

const client = new YunmeiClient();

// 1. 登录
const user = await client.login(username, password);

// 2. 获取学校列表
const schools = await client.getSchools();

// 3. 获取门锁列表
const locks = await client.getLocks(
  school.schoolNo,
  school.serverUrl,
  school.token,
  username
);
```

### 2. 蓝牙解锁

```typescript
import { useBLE } from '@/lib/hooks/useBLE';

const { unlock, progress, message } = useBLE();

// 解锁门锁
await unlock(lock);
```

### 3. 状态管理

```typescript
import { useUserStore } from '@/store/userStore';

const { locks, user, setLocks } = useUserStore();
```

## 📊 技术对比

| 原项目 | YunMei Air |
|--------|-----------|
| Vue 3 | React 18 + Next.js 14 |
| Pinia | Zustand |
| Vue Router | Next.js App Router |
| Element Plus | Tailwind CSS |
| Vite | Next.js (Turbopack) |
| vite-plugin-pwa | 手动PWA配置 |

## 🎯 浏览器兼容性

### 必需功能
- ✅ Web Bluetooth API
- ✅ LocalStorage
- ✅ Service Worker (PWA)

### 支持的浏览器
- ✅ Chrome 56+
- ✅ Edge 79+
- ✅ Opera 43+
- ✅ Android Chrome
- ❌ Firefox (不支持Web Bluetooth)
- ❌ Safari (不支持Web Bluetooth)

## 🔧 最新修复 (2025-10-31)

### ✅ API 调用问题修复

**问题**: 登录和数据获取失败  
**原因**: 客户端发送 JSON body，但云梅 API 期望 URL 查询字符串  

**修复内容**:
1. ✅ 修复 `transparentProxy.ts` - 使用 URL 参数传递目标信息
2. ✅ 代理自动转换 JSON body 为查询字符串
3. ✅ 支持认证头正确转发（token_data, token_userId, tokenUserId）
4. ✅ 完善错误处理和日志记录

**相关文档**:
- [API_FIX_SUMMARY.md](./API_FIX_SUMMARY.md) - 详细修复说明
- [QUICK_TEST.md](./QUICK_TEST.md) - 快速测试指南
- [ENV_CONFIG.md](./ENV_CONFIG.md) - 环境变量配置

**测试状态**: ✅ 代理服务器测试通过，等待完整应用测试

## 🐛 常见问题

### Q: "透明代理 URL 未配置" 错误？
A: 
1. 确保创建了 `.env.local` 文件
2. 文件中包含 `NEXT_PUBLIC_PROXY_URL=...`
3. 重启开发服务器 `npm run dev`

详见 [ENV_CONFIG.md](./ENV_CONFIG.md)

### Q: 蓝牙连接失败？
A: 确保：
1. 使用支持Web Bluetooth的浏览器（Chrome/Edge）
2. 网站使用HTTPS（localhost除外）
3. 蓝牙已开启
4. 门锁在附近且已开启

### Q: 登录失败？
A: 检查：
1. 透明代理是否正常运行（访问 `https://your-proxy.vercel.app/api/health`）
2. 环境变量配置是否正确
3. 用户名密码是否正确
4. 查看浏览器控制台日志

### Q: PWA安装后无法使用？
A: 需要：
1. 使用HTTPS部署
2. 配置正确的manifest.json
3. Service Worker正常运行

### Q: 如何调试 API 调用？
A: 
1. 打开 `test-api-fix.html` 进行独立测试
2. 查看浏览器控制台 (F12 → Console)
3. 查看网络请求 (F12 → Network)
4. 查看 Vercel 函数日志

## 📝 开发计划

- [x] 添加next-pwa插件支持 ✅ (2025-10-31)
- [ ] 实现门锁分享功能
- [ ] 添加解锁历史记录
- [ ] 支持多用户管理
- [ ] 优化蓝牙连接稳定性
- [ ] 添加暗黑模式
- [ ] 部署到服务器（推荐本地/局域网部署）

## 🤝 贡献

欢迎提交Issue和Pull Request！

## 📄 许可证

MIT License

## 🔗 相关链接

- [原项目 (Vue 3)](../yunmei_unintelligent_pwa)
- [透明代理服务器](../transparent-proxy-vercel)
- [项目分析文档](../云梅PWA项目分析与React-NextJS复刻指南.md)
- [Next.js 文档](https://nextjs.org/docs)
- [Web Bluetooth API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Bluetooth_API)
