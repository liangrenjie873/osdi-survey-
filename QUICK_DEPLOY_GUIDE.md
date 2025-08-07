# 🚀 快速部署指南

## 步骤1：在Render.com上部署

### 1. 注册Render账户
- 访问：https://render.com
- 点击"Get Started for Free"
- 选择"Continue with GitHub"
- 授权访问您的GitHub账户

### 2. 创建Web Service
- 点击"New +"按钮
- 选择"Web Service"
- 点击"Connect"连接到GitHub

### 3. 选择您的仓库
- 搜索：`liangrenjie873/osdi-survey-`
- 点击"Connect"

### 4. 配置设置
```
Name: osdi-survey
Environment: Node
Region: 选择离您最近的地区
Branch: main
Build Command: npm install
Start Command: npm start
```

### 5. 设置环境变量
点击"Environment"标签，添加：
```
NODE_ENV=production
PORT=10000
```

### 6. 部署
- 点击"Create Web Service"
- 等待部署完成（约2-3分钟）

## 步骤2：获取您的公开URL

部署完成后，您将获得类似这样的URL：
```
https://osdi-survey.onrender.com
```

## 步骤3：测试您的应用

### 测试主页面
访问：`https://your-app-name.onrender.com`

### 测试管理员界面
访问：`https://your-app-name.onrender.com/admin.html`

### 测试API
```bash
curl https://your-app-name.onrender.com/api/health
```

## 步骤4：分享给其他人

现在您可以分享这个URL给任何人，他们都可以：
- 访问调查页面
- 提交问卷数据
- 查看实时统计

## 步骤5：查看数据

在管理员界面中，您可以看到：
- 所有用户提交的数据
- 实时统计信息
- 数据导出功能

## 🔧 故障排除

### 如果部署失败：
1. 检查构建日志
2. 确保所有依赖都已安装
3. 验证环境变量设置

### 如果应用无法访问：
1. 检查服务状态
2. 查看错误日志
3. 重新部署

## 📊 监控您的应用

在Render控制台中，您可以：
- 查看实时日志
- 监控性能
- 管理环境变量
- 重启服务

---

部署完成后，您的OSDI调查系统就可以被全球用户访问了！🌍 