# 云梅 Air (YunMei Air)

云梅不智能的 Next.js 重现版 + 全新功能，部分核心技术来源于[云梅不智能PWA](https://github.com/zxy19/yunmei_unintelligent_pwa)

一个现代化、高性能的云梅智能门锁管理应用，基于 Next.js 14 + TypeScript + Tailwind CSS 构建。

## ✨ 特性

- 🔐 **智能门锁管理** - 支持蓝牙 BLE 连接和远程解锁
- 🎨 **现代化 UI** - 精美的渐变设计和流畅的动画效果
- 📱 **PWA 支持** - 可安装为原生应用，支持离线使用
- 🚀 **高性能** - 基于 Next.js 14 App Router，极速体验
- 🔒 **安全可靠** - 内置本地代理，保护你的隐私
- 🌐 **灵活部署** - 支持 Vercel、Docker、PM2 等多种部署方式

## 🚀 快速开始

### 使用现成的部署

访问在线版本：**[yunmei.arisumika.top](https://yunmei.arisumika.top)**

### 本地开发

```bash
# 1. 克隆项目
git clone https://github.com/your-username/YunMei_Air.git
cd YunMei_Air

# 2. 安装依赖
npm install

# 3. 启动开发服务器
npm run dev

# 4. 打开浏览器访问
# http://localhost:3001
```

就这么简单！无需配置任何环境变量，应用会自动使用内置的本地代理。

## ⚙️ 代理配置（可选）

### 默认配置

**无需任何配置**，应用会自动使用内置的 `/api/proxy` 路由，完全避免 CORS 问题。

### 使用外部代理节点

如果你需要使用外部代理节点，只需修改 `.env.local` 文件：

```bash
# 创建 .env.local 文件
NEXT_PUBLIC_PROXY_URL=https://yunmei.arisumika.top/api/proxy
```

然后重启开发服务器：

```bash
npm run dev
```

**详细配置指南：** 查看 [代理配置指南](./PROXY_CONFIG_GUIDE.md)

## 📦 部署

### Vercel 部署（推荐）

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/YunMei_Air)

1. 点击上面的按钮
2. 登录 Vercel
3. 导入项目
4. 点击 Deploy

就完成了！

### PM2 部署（生产环境）

```bash
# 1. 构建项目
npm run build

# 2. 安装 PM2
npm install -g pm2

# 3. 启动应用
pm2 start ecosystem.config.js --env production

# 4. 设置开机自启
pm2 save
pm2 startup

# 5. 查看日志
pm2 logs yunmei-air
```

### Docker 部署

```bash
# 构建镜像
docker build -t yunmei-air .

# 运行容器
docker run -d -p 3090:3090 --name yunmei-air yunmei-air
```

## 📚 文档

- [代理配置指南](./PROXY_CONFIG_GUIDE.md) - 如何配置和切换代理节点
- [环境变量配置](./ENV_CONFIG.md) - 完整的环境变量说明
- [环境变量示例](./ENV_EXAMPLE.md) - `.env.local` 配置示例
- [安全分析](./SECURITY_ANALYSIS.md) - 安全性分析和最佳实践
- [设计系统](./DESIGN_SYSTEM.md) - UI 设计规范
- [更新日志](./CHANGELOG.md) - 版本更新记录

## 🛠️ 技术栈

- **框架：** Next.js 14 (App Router)
- **语言：** TypeScript
- **样式：** Tailwind CSS
- **动画：** Framer Motion
- **状态管理：** Zustand
- **蓝牙：** Web Bluetooth API
- **PWA：** next-pwa

## 🔧 开发

### 项目结构

```
YunMei_Air/
├── src/
│   ├── app/              # Next.js App Router 页面
│   │   ├── api/          # API 路由
│   │   │   └── proxy/    # 内置代理路由
│   │   ├── login/        # 登录页面
│   │   ├── locks/        # 门锁列表页面
│   │   └── lock/[id]/    # 门锁详情页面
│   ├── components/       # React 组件
│   ├── lib/              # 工具库
│   │   ├── api/          # API 客户端
│   │   ├── hooks/        # 自定义 Hooks
│   │   └── utils/        # 工具函数
│   └── store/            # 状态管理
├── public/               # 静态资源
├── ecosystem.config.js   # PM2 配置
└── package.json
```

### 可用脚本

```bash
# 开发
npm run dev          # 启动开发服务器

# 构建
npm run build        # 构建生产版本
npm run start        # 启动生产服务器

# 代码检查
npm run lint         # 运行 ESLint
npm run type-check   # 运行 TypeScript 类型检查
```

## 🤝 贡献

欢迎贡献代码！请查看 [贡献指南](./CONTRIBUTING.md)（如果有的话）。

## 📄 开源协议

本项目遵从 `MIT` 开源协议

## 🙏 致谢

- [云梅不智能PWA](https://github.com/zxy19/yunmei_unintelligent_pwa) - 核心技术来源
- 所有贡献者和使用者

## 📞 联系方式

- **Issues：** [GitHub Issues](https://github.com/your-username/YunMei_Air/issues)
- **讨论：** [GitHub Discussions](https://github.com/your-username/YunMei_Air/discussions)

---

**⭐ 如果这个项目对你有帮助，请给个 Star！**
