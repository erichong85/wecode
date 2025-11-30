#!/bin/bash
# 服务器端部署脚本
# 使用方法: ./deploy.sh

set -e  # 遇到错误立即退出

echo "========================================="
echo "🚀 开始部署 HostGenie"
echo "========================================="

# 配置变量
APP_NAME="hostgenie"
APP_DIR="/var/www/hostgenie"
GIT_REPO="https://github.com/yourusername/hostgenie.git"  # 替换为你的仓库地址
BRANCH="main"

# 颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}📁 切换到应用目录...${NC}"
cd $APP_DIR

echo -e "${YELLOW}📥 拉取最新代码...${NC}"
git pull origin $BRANCH

echo -e "${YELLOW}📦 安装依赖...${NC}"
npm install --production=false

echo -e "${YELLOW}🔨 构建应用...${NC}"
npm run build

echo -e "${YELLOW}🔄 重启 PM2 进程...${NC}"
pm2 restart $APP_NAME || pm2 start ecosystem.config.cjs

echo -e "${YELLOW}💾 保存 PM2 配置...${NC}"
pm2 save

echo -e "${GREEN}✅ 部署完成！${NC}"
echo "========================================="
echo "📊 查看日志: pm2 logs $APP_NAME"
echo "📈 查看状态: pm2 status"
echo "========================================="
