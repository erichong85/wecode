@echo off
REM Git 工作流快捷命令 - 保存代码

set /p commit_msg="请输入提交信息: "
if "%commit_msg%"=="" (
    echo 错误: 提交信息不能为空
    pause
    exit /b
)

echo.
echo 保存代码中...
git add .
git commit -m "%commit_msg%"
git push

echo.
echo ✅ 代码已保存并推送
pause
