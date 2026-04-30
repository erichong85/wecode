@echo off
REM Git 工作流快捷命令 - 创建新功能分支

set /p feature_name="请输入功能名称: "
if "%feature_name%"=="" (
    echo 错误: 功能名称不能为空
    pause
    exit /b
)

echo.
echo 从 develop 创建新功能分支...
git checkout develop
git pull origin develop
git checkout -b feature/%feature_name%

echo.
echo ✅ 功能分支 feature/%feature_name% 已创建
pause
