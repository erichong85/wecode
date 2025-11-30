#!/bin/bash
# Git 工作流快捷脚本

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 1. 创建新功能分支
new_feature() {
    if [ -z "$1" ]; then
        echo -e "${RED}错误: 请提供功能名称${NC}"
        echo "用法: ./git-workflow.sh new feature-name"
        exit 1
    fi
    
    echo -e "${YELLOW}从 develop 创建新功能分支...${NC}"
    git checkout develop
    git pull origin develop
    git checkout -b "feature/$1"
    echo -e "${GREEN}✅ 功能分支 feature/$1 已创建${NC}"
}

# 2. 提交到当前分支
save() {
    if [ -z "$1" ]; then
        echo -e "${RED}错误: 请提供提交信息${NC}"
        echo "用法: ./git-workflow.sh save '提交信息'"
        exit 1
    fi
    
    git add .
    git commit -m "$1"
    git push
    echo -e "${GREEN}✅ 代码已保存并推送${NC}"
}

# 3. 合并到 develop（测试环境）
to_test() {
    CURRENT_BRANCH=$(git branch --show-current)
    echo -e "${YELLOW}将 $CURRENT_BRANCH 合并到 develop...${NC}"
    
    git checkout develop
    git pull origin develop
    git merge "$CURRENT_BRANCH"
    git push origin develop
    
    echo -e "${GREEN}✅ 已部署到测试环境（Vercel Preview）${NC}"
    echo -e "${YELLOW}查看部署状态: https://vercel.com/dashboard${NC}"
}

# 4. 发布到生产环境
to_prod() {
    echo -e "${YELLOW}确认要发布到生产环境吗? (y/n)${NC}"
    read -r confirm
    
    if [ "$confirm" != "y" ]; then
        echo -e "${RED}取消发布${NC}"
        exit 0
    fi
    
    echo -e "${YELLOW}合并 develop 到 main...${NC}"
    git checkout main
    git pull origin main
    git merge develop
    git push origin main
    
    echo -e "${GREEN}✅ 已发布到生产环境${NC}"
    echo -e "${GREEN}Vercel: https://xiyunai.cn${NC}"
    echo -e "${GREEN}EdgeOne: 将在 3-5 分钟后更新${NC}"
}

# 5. 紧急回滚
rollback() {
    echo -e "${RED}警告: 这将回滚到上一个版本!${NC}"
    echo -e "${YELLOW}确认执行? (y/n)${NC}"
    read -r confirm
    
    if [ "$confirm" != "y" ]; then
        echo -e "${RED}取消回滚${NC}"
        exit 0
    fi
    
    git checkout main
    git revert HEAD --no-edit
    git push origin main
    
    echo -e "${GREEN}✅ 已回滚到上一版本${NC}"
}

# 6. 查看状态
status() {
    echo -e "${YELLOW}=== Git 状态 ===${NC}"
    git status
    echo ""
    echo -e "${YELLOW}=== 最近 5 次提交 ===${NC}"
    git log --oneline -5
    echo ""
    echo -e "${YELLOW}=== 当前分支 ===${NC}"
    git branch --show-current
}

# 主菜单
case "$1" in
    new)
        new_feature "$2"
        ;;
    save)
        save "$2"
        ;;
    test)
        to_test
        ;;
    prod)
        to_prod
        ;;
    rollback)
        rollback
        ;;
    status)
        status
        ;;
    *)
        echo -e "${YELLOW}Git 工作流脚本${NC}"
        echo ""
        echo "用法:"
        echo "  ./git-workflow.sh new <功能名>     - 创建新功能分支"
        echo "  ./git-workflow.sh save '<消息>'    - 提交并推送代码"
        echo "  ./git-workflow.sh test             - 部署到测试环境"
        echo "  ./git-workflow.sh prod             - 发布到生产环境"
        echo "  ./git-workflow.sh rollback         - 紧急回滚"
        echo "  ./git-workflow.sh status           - 查看状态"
        echo ""
        echo "示例:"
        echo "  ./git-workflow.sh new user-profile"
        echo "  ./git-workflow.sh save 'feat: 添加用户资料页'"
        echo "  ./git-workflow.sh test"
        ;;
esac
