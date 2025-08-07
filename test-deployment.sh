#!/bin/bash

echo "🧪 测试云端部署..."

# 等待用户输入URL
echo "请输入您的Render应用URL（例如：https://osdi-survey.onrender.com）："
read APP_URL

echo ""
echo "🔍 测试应用状态..."

# 测试主页面
echo "📄 测试主页面..."
curl -s -o /dev/null -w "主页面状态: %{http_code}\n" "$APP_URL"

# 测试管理员界面
echo "📊 测试管理员界面..."
curl -s -o /dev/null -w "管理员界面状态: %{http_code}\n" "$APP_URL/admin.html"

# 测试API健康检查
echo "🔧 测试API健康检查..."
curl -s "$APP_URL/api/health" | jq '.' 2>/dev/null || curl -s "$APP_URL/api/health"

echo ""
echo "✅ 测试完成！"
echo ""
echo "📋 测试结果说明："
echo "- 状态码200：正常"
echo "- 状态码404：页面不存在"
echo "- 状态码500：服务器错误"
echo ""
echo "🌐 您的应用URL：$APP_URL"
echo "📊 管理员界面：$APP_URL/admin.html"
echo ""
echo "🎉 现在您可以分享这个URL给其他人测试了！" 