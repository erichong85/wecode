# 阿里云服务器部署文件说明

本目录包含了将 HostGenie 部署到阿里云服务器所需的所有配置文件和脚本。

## 📁 文件结构

```
deploy/
├── nginx.conf           # Nginx 反向代理配置
├── setup-server.sh      # 服务器初始化脚本
├── deploy.sh           # 自动部署脚本
├── docker-compose.yml  # Docker Compose 配置
└── README.md           # 本文件
```

## 🚀 快速开始

### 方法 1: PM2 + Nginx 部署

1. **在服务器上运行初始化脚本**:
   ```bash
   sudo bash setup-server.sh
   ```

2. **克隆代码并配置**:
   ```bash
   cd /var/www
   git clone <your-repo> hostgenie
   cd hostgenie
   nano .env.local  # 配置环境变量
   ```

3. **构建并启动**:
   ```bash
   npm install
   npm run build
   pm2 start ecosystem.config.cjs
   ```

4. **配置 Nginx**:
   ```bash
   sudo cp deploy/nginx.conf /etc/nginx/sites-available/hostgenie
   sudo ln -s /etc/nginx/sites-available/hostgenie /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

### 方法 2: Docker 部署

```bash
cd /var/www/hostgenie/deploy
docker-compose up -d
```

## 📖 详细文档

请查看完整的部署指南获取详细说明和故障排除：
- 部署指南位于项目根目录的 artifacts 文件夹中

## 🔧 常用命令

### PM2 管理
```bash
pm2 status          # 查看状态
pm2 logs hostgenie  # 查看日志
pm2 restart hostgenie  # 重启应用
```

### Nginx 管理
```bash
sudo nginx -t       # 测试配置
sudo systemctl restart nginx  # 重启 Nginx
sudo tail -f /var/log/nginx/hostgenie_error.log  # 查看错误日志
```

### Docker 管理
```bash
docker-compose ps           # 查看状态
docker-compose logs -f      # 查看日志
docker-compose restart      # 重启服务
```

## 🔐 SSL 证书

使用 Let's Encrypt 免费证书:
```bash
sudo certbot --nginx -d xiyunai.cn -d www.xiyunai.cn
```

## ⚠️ 注意事项

1. **环境变量**: 确保 `.env.local` 文件包含所有必需的环境变量
2. **防火墙**: 开放 80、443、22 端口
3. **域名备案**: .cn 域名必须完成 ICP 备案
4. **文件权限**: 确保应用目录有正确的读写权限
