<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# HostGenie - HTML 托管平台

一个基于 Next.js 的现代化 HTML 托管平台，支持用户上传、管理和分享静态网页。

## ✨ 功能特性

- 🚀 快速部署静态 HTML 网站
- 👤 用户认证系统（注册/登录）
- 💾 基于 Supabase 的数据存储
- 🤖 AI 辅助功能（Google Gemini）
- 📊 用户仪表板和网站管理
- 🔗 自定义短链接
- ⭐ 收藏和点赞功能

## 🚀 本地开发

### 前置要求

- Node.js 18+
- npm 或 yarn

### 快速开始

1. **克隆仓库**
   ```bash
   git clone <your-repo-url>
   cd hostgenie
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **配置环境变量**
   ```bash
   # 复制环境变量模板
   cp .env.example .env.local
   
   # 编辑 .env.local，填入你的 API 密钥
   ```

4. **启动开发服务器**
   ```bash
   npm run dev
   ```

5. **访问应用**
   
   打开浏览器访问 [http://localhost:3000](http://localhost:3000)

## 📦 部署

### 部署到 Vercel（推荐用于测试）

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/hostgenie)

### 部署到阿里云服务器（推荐用于生产）

完整的阿里云服务器部署教程，请查看：
- 📖 [阿里云部署指南](./deploy/README.md)
- 🤖 [GitHub Actions 自动部署配置](./.github/GITHUB_ACTIONS_SETUP.md)

**快速部署**：

```bash
# 1. SSH 连接到服务器
ssh root@你的服务器IP

# 2. 运行初始化脚本
wget https://raw.githubusercontent.com/yourusername/hostgenie/main/deploy/setup-server.sh
sudo bash setup-server.sh

# 3. 克隆代码
cd /var/www
git clone <your-repo-url> hostgenie
cd hostgenie

# 4. 配置环境变量
cp .env.example .env.local
nano .env.local

# 5. 构建并启动
npm install
npm run build
pm2 start ecosystem.config.cjs
```

详细步骤和故障排除请参考部署指南。

## 🔧 技术栈

- **框架**: Next.js 16
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **数据库**: Supabase (PostgreSQL)
- **AI**: Google Gemini API
- **部署**: Vercel / 阿里云 ECS
- **进程管理**: PM2
- **Web 服务器**: Nginx

## 📁 项目结构

```
hostgenie/
├── app/                    # Next.js App Router
├── components/             # React 组件
├── views/                  # 页面视图
├── lib/                    # 工具库
├── services/               # 服务层（API 调用）
├── public/                 # 静态资源
├── deploy/                 # 部署配置文件
│   ├── nginx.conf         # Nginx 配置
│   ├── setup-server.sh    # 服务器初始化脚本
│   └── deploy.sh          # 自动部署脚本
├── .github/
│   └── workflows/
│       └── deploy.yml     # GitHub Actions 自动部署
├── ecosystem.config.cjs   # PM2 配置
├── Dockerfile             # Docker 配置
└── next.config.ts         # Next.js 配置
```

## 🛠️ 可用脚本

```bash
npm run dev      # 启动开发服务器
npm run build    # 构建生产版本
npm start        # 启动生产服务器
npm run lint     # 运行代码检查
```

## 🔐 环境变量

创建 `.env.local` 文件，配置以下变量：

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key

# Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# 生产环境
NODE_ENV=production
PORT=3000
```

## 📝 开发工作流

### Git 分支策略

- `main` - 生产环境分支
- `develop` - 开发分支
- `feature/*` - 功能分支

### 快捷脚本（Windows）

项目包含以下批处理脚本：

- `测试环境.bat` - 提交到 develop 分支
- `生产环境.bat` - 合并到 main 分支并发布
- `查看状态.bat` - 查看 Git 状态
- `保存代码.bat` - 快速提交代码

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 🔗 相关链接

- [Next.js 文档](https://nextjs.org/docs)
- [Supabase 文档](https://supabase.io/docs)
- [Tailwind CSS 文档](https://tailwindcss.com/docs)
- [阿里云 ECS](https://www.aliyun.com/product/ecs)

---

**部署相关文档**：
- [阿里云服务器部署完整指南](./deploy/README.md)
- [GitHub Actions 自动部署配置](./.github/GITHUB_ACTIONS_SETUP.md)
- [Nginx 配置说明](./deploy/nginx.conf)

