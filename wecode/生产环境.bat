@echo off
REM Git 工作流快捷命令 - 发布到生产环境

echo.
echo ⚠️  警告: 这将发布到生产环境！
echo.
set /p confirm="确认发布? (y/n): "

if /i not "%confirm%"=="y" (
    echo 已取消发布
    pause
    exit /b
)

echo.
echo 合并 develop 到 main...
git checkout main
git pull origin main
git merge develop
git push origin main

echo.
echo ✅ 已发布到生产环境
echo Vercel: https://xiyunai.cn
echo EdgeOne: 将在 3-5 分钟后更新
pause
