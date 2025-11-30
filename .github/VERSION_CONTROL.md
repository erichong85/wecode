# HostGenie 版本管理指南

## 分支策略

```
main (生产环境 - Vercel Production + EdgeOne)
  ↓
develop (测试环境 - Vercel Preview)
  ↓
feature/* (功能分支 - 本地开发)
```

## 快速开始

### Windows 用户（推荐）

1. **加载快捷命令**
```powershell
. .\scripts\git-workflow.ps1
```

2. **使用命令**
```powershell
# 创建新功能
New-Feature 'user-profile'

# 保存代码
Save-Code 'feat: 添加用户资料功能'

# 部署到测试环境
Deploy-Test

# 发布到生产环境
Deploy-Prod
```

### Linux/Mac 用户

```bash
# 赋予执行权限
chmod +x scripts/git-workflow.sh

# 使用脚本
./scripts/git-workflow.sh new user-profile
./scripts/git-workflow.sh save 'feat: 添加功能'
./scripts/git-workflow.sh test
./scripts/git-workflow.sh prod
```

---

## 日常工作流程

### 1. 开发新功能

```powershell
# 创建功能分支
New-Feature 'new-dashboard'

# 编写代码...

# 保存进度（可以多次）
Save-Code 'feat: 添加仪表盘骨架'
Save-Code 'feat: 完成图表组件'
```

### 2. 测试功能

```powershell
# 部署到测试环境
Deploy-Test

# → Vercel 自动部署 Preview 环境
# 访问 Vercel Dashboard 查看 Preview URL
# 在 Preview 环境测试功能
```

### 3. 发布到生产

```powershell
# 测试通过后，发布到生产环境
Deploy-Prod

# → Vercel Production: https://xiyunai.cn
# → EdgeOne: 3-5 分钟后更新
```

---

## 紧急情况处理

### 回滚版本

```powershell
# 方法 1: 使用脚本（推荐）
Rollback-Version

# 方法 2: 手动回滚
git checkout main
git revert HEAD
git push origin main
```

### 查看历史版本

```powershell
# 查看提交历史
git log --oneline -10

# 回滚到指定版本
git checkout main
git reset --hard <commit-id>
git push --force origin main
```

---

## Commit 信息规范

格式：`<类型>: <描述>`

**类型：**
- `feat` - 新功能
- `fix` - Bug 修复
- `refactor` - 重构
- `style` - 样式调整
- `docs` - 文档更新
- `chore` - 构建/配置

**示例：**
```
feat: 实现用户点赞功能
fix: 修复登录按钮点击无响应
refactor: 优化数据库查询性能
style: 调整导航栏样式
```

---

## Vercel 环境配置

### 生产环境（Production）
- 分支：`main`
- 域名：`xiyunai.cn`
- 自动部署：✅

### 测试环境（Preview）
- 分支：`develop` + 所有 `feature/*`
- 域名：Vercel 自动生成
- 自动部署：✅

**配置步骤：**
1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 选择项目 → Settings → Git
3. Production Branch: `main`
4. 勾选 "Automatically deploy all branches"

---

## EdgeOne 配置

EdgeOne 只部署 `main` 分支：

1. 访问 [EdgeOne 控制台](https://console.cloud.tencent.com/edgeone)
2. 项目设置 → Git 集成
3. 分支：`main`
4. 自动部署：✅

---

## 常用命令速查

| 操作 | PowerShell 命令 | Git 命令 |
|------|----------------|----------|
| 创建功能分支 | `New-Feature 'name'` | `git checkout -b feature/name` |
| 保存代码 | `Save-Code 'msg'` | `git add . && git commit -m 'msg' && git push` |
| 部署测试 | `Deploy-Test` | 合并到 develop 并推送 |
| 发布生产 | `Deploy-Prod` | 合并到 main 并推送 |
| 紧急回滚 | `Rollback-Version` | `git revert HEAD` |
| 查看状态 | `Show-Status` | `git status && git log` |

---

## 版本号管理（可选）

为重要版本打标签：

```powershell
# 打标签
git tag -a v1.0.0 -m "发布点赞收藏功能"
git push origin v1.0.0

# 查看所有标签
git tag

# 回滚到标签版本
git checkout v1.0.0
```

---

## 注意事项

⚠️ **重要规则：**
1. 永远不要直接在 `main` 分支开发
2. 测试通过后才合并到 `main`
3. 紧急 Bug 可以直接在 `main` 修复后立即发布
4. 每天至少提交一次代码

✅ **最佳实践：**
- 功能开发完成立即合并，避免分支过时
- 使用 Vercel Preview 测试，不要直接部署生产
- 重要版本打 tag，方便回滚
- Commit 信息清晰明确

---

## 下次启动电脑时

```powershell
# 进入项目目录
cd C:\Users\dell\Downloads\hostgenie

# 加载快捷命令
. .\scripts\git-workflow.ps1

# 开始工作！
```

或者将加载命令添加到 PowerShell 配置文件，每次自动加载：
```powershell
notepad $PROFILE
# 添加一行：
# . "C:\Users\dell\Downloads\hostgenie\scripts\git-workflow.ps1"
```
