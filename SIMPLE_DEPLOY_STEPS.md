# 🚀 简单部署步骤

## 步骤1：访问Render.com

1. 打开浏览器，访问：https://render.com
2. 点击"Get Started for Free"
3. 选择"Continue with GitHub"
4. 授权访问您的GitHub账户

## 步骤2：创建Web Service

1. 点击"New +"按钮
2. 选择"Web Service"
3. 点击"Connect"连接到GitHub

## 步骤3：选择您的仓库

1. 在搜索框中输入：`liangrenjie873/osdi-survey-`
2. 找到您的仓库并点击"Connect"

## 步骤4：配置设置

填写以下信息：
```
Name: osdi-survey
Environment: Node
Region: 选择离您最近的地区
Branch: main
Build Command: npm install
Start Command: npm start
```

## 步骤5：设置环境变量

1. 点击"Environment"标签
2. 添加以下变量：
```
NODE_ENV=production
PORT=10000
```

## 步骤6：部署

1. 点击"Create Web Service"
2. 等待部署完成（约2-3分钟）

## 步骤7：获取您的URL

部署完成后，您将获得类似这样的URL：
```
https://osdi-survey-xxxxx.onrender.com
```

## 步骤8：测试您的应用

访问以下链接测试：
- 主页面：`https://your-app-name.onrender.com`
- 管理员界面：`https://your-app-name.onrender.com/admin.html`
- 测试页面：`https://your-app-name.onrender.com/test-admin.html`

## 管理员密码
- 密码：`123456`

## 故障排除

如果遇到问题：
1. 检查Render控制台的部署日志
2. 确认GitHub仓库连接正确
3. 等待部署完成（可能需要几分钟）
4. 检查环境变量设置

---

完成这些步骤后，您的应用就可以被全球用户访问了！ 