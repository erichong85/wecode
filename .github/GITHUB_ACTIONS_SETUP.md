# GitHub Actions 自动部署配置说明

本项目已配置 GitHub Actions 自动部署功能。每次推送代码到 `main` 分支时，会自动部署到阿里云服务器。

## 🔧 配置步骤

### 1. 生成 SSH 密钥（如果还没有）

在你的本地电脑执行：

```bash
ssh-keygen -t ed25519 -C "github-actions"
```

保存位置：`~/.ssh/github_actions_key`

### 2. 将公钥添加到服务器

```bash
# 查看公钥
cat ~/.ssh/github_actions_key.pub

# 复制公钥，然后添加到服务器的 authorized_keys
ssh root@你的服务器IP
mkdir -p ~/.ssh
echo "刚才复制的公钥" >> ~/.ssh/authorized_keys
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

### 3. 在 GitHub 仓库配置 Secrets

进入你的 GitHub 仓库：**Settings** → **Secrets and variables** → **Actions** → **New repository secret**

添加以下 Secrets：

| Name | Value | 说明 |
|------|-------|------|
| `SERVER_HOST` | 你的服务器IP | 例如: `123.123.123.123` |
| `SERVER_USER` | `root` | SSH 登录用户名 |
| `SERVER_SSH_KEY` | 私钥内容 | 执行 `cat ~/.ssh/github_actions_key` 获取 |
| `SERVER_PORT` | `22` | SSH 端口（默认22） |

**注意**: `SERVER_SSH_KEY` 的值是**私钥**的完整内容，包括 `-----BEGIN OPENSSH PRIVATE KEY-----` 和 `-----END OPENSSH PRIVATE KEY-----`

### 4. 测试自动部署

```bash
# 提交代码并推送到 main 分支
git add .
git commit -m "test: GitHub Actions deployment"
git push origin main
```

然后：
1. 访问你的 GitHub 仓库
2. 点击 **Actions** 标签
3. 查看部署进度

## 🎯 工作流程

```
本地推送代码 → GitHub → GitHub Actions → SSH 连接服务器 → 拉取代码 → 构建 → 重启应用
```

## 📊 手动触发部署

除了自动触发，你也可以手动触发部署：

1. 访问 GitHub 仓库的 **Actions** 页面
2. 选择 "Deploy to Aliyun Server" 工作流
3. 点击 **Run workflow** 按钮

## ⚠️ 常见问题

### 部署失败：Permission denied

**原因**: SSH 密钥配置错误

**解决**:
1. 确认公钥已正确添加到服务器的 `~/.ssh/authorized_keys`
2. 确认私钥已正确添加到 GitHub Secrets
3. 检查服务器的 SSH 配置是否允许密钥登录

### 部署失败：npm install 失败

**原因**: 服务器内存不足

**解决**:
1. 增加服务器内存
2. 或者在本地构建后上传构建产物（修改工作流）

### 如何查看部署日志？

在 GitHub 仓库的 **Actions** 页面，点击对应的工作流运行记录即可查看详细日志。

## 🔐 安全建议

- ✅ 使用专用的 SSH 密钥，不要使用你的个人密钥
- ✅ 定期轮换 SSH 密钥
- ✅ 使用非 root 用户部署（更安全，需要修改工作流和服务器配置）
- ✅ 配置防火墙，只允许必要的 IP 访问

## 📝 高级配置

### 仅在测试通过后部署

可以修改 `.github/workflows/deploy.yml`，添加测试步骤：

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run tests
        run: |
          npm install
          npm run test  # 需要先配置测试脚本

  deploy:
    needs: test  # 依赖测试任务
    # ... 部署步骤
```

### 部署到多个环境

可以配置不同的分支部署到不同的服务器：
- `develop` 分支 → 测试服务器
- `main` 分支 → 生产服务器
