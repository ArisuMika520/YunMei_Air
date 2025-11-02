# 云梅 Air (YunMei Air)

云梅不智能的 Next.js 重现版 + 全新功能，部分核心技术来源于[云梅不智能PWA](https://github.com/zxy19/yunmei_unintelligent_pwa)

一个现代化、高性能的云梅智能门锁管理应用，基于 Next.js 14 + TypeScript + Tailwind CSS 构建。

## 🚀 快速开始

### 使用现成的部署

访问在线版本：demo测试中

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
# http://localhost:3000
```


## 📦 部署

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

## 🛠️ 技术栈

- **框架：** Next.js 14 (App Router)
- **语言：** TypeScript
- **样式：** Tailwind CSS
- **动画：** Framer Motion
- **状态管理：** Zustand
- **蓝牙：** Web Bluetooth API
- **PWA：** next-pwa

## 🔧 开发

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

---

**⭐ 如果这个项目对你有帮助，请给个 Star！**
