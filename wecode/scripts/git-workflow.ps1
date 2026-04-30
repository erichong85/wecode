# Git 工作流快捷脚本 (PowerShell 版本)

# 1. 创建新功能分支
function New-Feature {
    param([string]$Name)
    
    if (-not $Name) {
        Write-Host "错误: 请提供功能名称" -ForegroundColor Red
        Write-Host "用法: New-Feature '功能名'"
        return
    }
    
    Write-Host "从 develop 创建新功能分支..." -ForegroundColor Yellow
    git checkout develop
    git pull origin develop
    git checkout -b "feature/$Name"
    Write-Host "✅ 功能分支 feature/$Name 已创建" -ForegroundColor Green
}

# 2. 提交到当前分支
function Save-Code {
    param([string]$Message)
    
    if (-not $Message) {
        Write-Host "错误: 请提供提交信息" -ForegroundColor Red
        Write-Host "用法: Save-Code '提交信息'"
        return
    }
    
    git add .
    git commit -m $Message
    git push
    Write-Host "✅ 代码已保存并推送" -ForegroundColor Green
}

# 3. 合并到 develop（测试环境）
function Deploy-Test {
    $currentBranch = git branch --show-current
    Write-Host "将 $currentBranch 合并到 develop..." -ForegroundColor Yellow
    
    git checkout develop
    git pull origin develop
    git merge $currentBranch
    git push origin develop
    
    Write-Host "✅ 已部署到测试环境（Vercel Preview）" -ForegroundColor Green
    Write-Host "查看部署状态: https://vercel.com/dashboard" -ForegroundColor Yellow
}

# 4. 发布到生产环境
function Deploy-Prod {
    $confirm = Read-Host "确认要发布到生产环境吗? (y/n)"
    
    if ($confirm -ne 'y') {
        Write-Host "取消发布" -ForegroundColor Red
        return
    }
    
    Write-Host "合并 develop 到 main..." -ForegroundColor Yellow
    git checkout main
    git pull origin main
    git merge develop
    git push origin main
    
    Write-Host "✅ 已发布到生产环境" -ForegroundColor Green
    Write-Host "Vercel: https://xiyunai.cn" -ForegroundColor Green
    Write-Host "EdgeOne: 将在 3-5 分钟后更新" -ForegroundColor Green
}

# 5. 紧急回滚
function Rollback-Version {
    Write-Host "警告: 这将回滚到上一个版本!" -ForegroundColor Red
    $confirm = Read-Host "确认执行? (y/n)"
    
    if ($confirm -ne 'y') {
        Write-Host "取消回滚" -ForegroundColor Red
        return
    }
    
    git checkout main
    git revert HEAD --no-edit
    git push origin main
    
    Write-Host "✅ 已回滚到上一版本" -ForegroundColor Green
}

# 6. 查看状态
function Show-Status {
    Write-Host "=== Git 状态 ===" -ForegroundColor Yellow
    git status
    Write-Host ""
    Write-Host "=== 最近 5 次提交 ===" -ForegroundColor Yellow
    git log --oneline -5
    Write-Host ""
    Write-Host "=== 当前分支 ===" -ForegroundColor Yellow
    git branch --show-current
}

# 使用说明
Write-Host "Git 工作流脚本已加载" -ForegroundColor Green
Write-Host ""
Write-Host "可用命令:"
Write-Host "  New-Feature '功能名'        - 创建新功能分支"
Write-Host "  Save-Code '提交信息'        - 提交并推送代码"
Write-Host "  Deploy-Test                 - 部署到测试环境"
Write-Host "  Deploy-Prod                 - 发布到生产环境"
Write-Host "  Rollback-Version            - 紧急回滚"
Write-Host "  Show-Status                 - 查看状态"
Write-Host ""
Write-Host "示例:"
Write-Host "  New-Feature 'user-profile'"
Write-Host "  Save-Code 'feat: 添加用户资料页'"
Write-Host "  Deploy-Test"
