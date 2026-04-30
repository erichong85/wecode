@echo off
REM Git 工作流快捷命令 - 部署到测试环境

for /f "tokens=*" %%i in ('git branch --show-current') do set current_branch=%%i

echo.
echo 当前分支: %current_branch%
echo 将合并到 develop 分支（测试环境）
echo.
set /p confirm="确认继续? (y/n): "

if /i not "%confirm%"=="y" (
    echo 已取消
    pause
    exit /b
)

echo.
echo 合并到 develop...
git checkout develop
git pull origin develop
git merge %current_branch%
git push origin develop

echo.
echo ✅ 已部署到测试环境
echo 查看 Vercel Preview: https://vercel.com/dashboard
pause
