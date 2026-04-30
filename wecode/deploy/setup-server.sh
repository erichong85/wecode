#!/bin/bash
# 服务器初始化脚本 - 首次部署时运行
# 使用方法: sudo bash setup-server.sh

set -e

echo "========================================="
echo "🔧 初始化阿里云服务器环境"
echo "========================================="

# 更新系统
echo "📦 更新系统包..."
apt update && apt upgrade -y

# 安装 Node.js (使用 NodeSource)
echo "📦 安装 Node.js 20.x..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# 安装 Git
echo "📦 安装 Git..."
apt install -y git

# 安装 Nginx
echo "📦 安装 Nginx..."
apt install -y nginx

# 安装 PM2
echo "📦 安装 PM2..."
npm install -g pm2

# 创建应用目录
echo "📁 创建应用目录..."
mkdir -p /var/www/hostgenie
mkdir -p /var/www/hostgenie/logs

# 配置防火墙
echo "🔥 配置防火墙..."
ufw allow 22
ufw allow 80
ufw allow 443
ufw --force enable

# 显示安装的版本
echo ""
echo "========================================="
echo "✅ 环境安装完成！"
echo "========================================="
echo "Node.js: $(node -v)"
echo "npm: $(npm -v)"
echo "PM2: $(pm2 -v)"
echo "Git: $(git --version)"
echo "Nginx: $(nginx -v 2>&1)"
echo "========================================="
echo ""
echo "📝 下一步操作:"
echo "1. 克隆代码到 /var/www/hostgenie"
echo "2. 配置 .env.local 环境变量"
echo "3. 运行 npm install && npm run build"
echo "4. 配置 Nginx (复制 deploy/nginx.conf)"
echo "5. 申请 SSL 证书"
echo "6. 启动应用: pm2 start ecosystem.config.cjs"
echo "========================================="
