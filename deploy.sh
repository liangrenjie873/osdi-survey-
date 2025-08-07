#!/bin/bash

echo "🚀 开始部署OSDI调查系统到云端..."

# 检查Git状态
echo "📋 检查Git状态..."
git status

# 提交所有更改
echo "💾 提交更改..."
git add .
git commit -m "Prepare for cloud deployment"

# 推送到GitHub
echo "📤 推送到GitHub..."
git push origin main

echo "✅ 代码已推送到GitHub"
echo ""
echo "📋 下一步操作："
echo "1. 访问 https://render.com"
echo "2. 注册账户并连接GitHub"
echo "3. 创建新的Web Service"
echo "4. 选择仓库: liangrenjie873/osdi-survey-"
echo "5. 配置设置："
echo "   - Build Command: npm install"
echo "   - Start Command: npm start"
echo "6. 点击'Create Web Service'"
echo ""
echo "🌐 部署完成后，您将获得一个公开的URL"
echo "📊 所有人都可以通过该URL访问您的调查系统" 