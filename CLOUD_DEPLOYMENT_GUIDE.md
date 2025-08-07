# 🌐 云端部署指南

本指南将帮助您将OSDI调查系统部署到云端，让其他人可以访问并提交数据。

## 🚀 快速部署方案

### 方案1：使用Render.com（推荐）

Render.com提供免费托管服务，支持Node.js应用。

#### 步骤：

1. **注册Render账户**
   - 访问 [render.com](https://render.com)
   - 使用GitHub账户登录

2. **连接GitHub仓库**
   - 点击"New Web Service"
   - 选择您的GitHub仓库：`liangrenjie873/osdi-survey-`

3. **配置部署设置**
   ```
   Name: osdi-survey
   Environment: Node
   Build Command: npm install
   Start Command: npm start
   ```

4. **设置环境变量**
   ```
   NODE_ENV=production
   PORT=10000
   ```

5. **部署**
   - 点击"Create Web Service"
   - 等待部署完成（约2-3分钟）

### 方案2：使用Railway.app

Railway提供简单的部署体验。

#### 步骤：

1. **注册Railway账户**
   - 访问 [railway.app](https://railway.app)
   - 使用GitHub账户登录

2. **导入项目**
   - 点击"New Project"
   - 选择"Deploy from GitHub repo"
   - 选择您的仓库

3. **自动部署**
   - Railway会自动检测Node.js项目
   - 自动部署到云端

### 方案3：使用Vercel

Vercel适合前端应用，但需要调整配置。

#### 步骤：

1. **安装Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **部署**
   ```bash
   vercel
   ```

3. **配置serverless函数**
   - 创建`api`文件夹
   - 将API路由移到serverless函数中

## 🗄️ 数据库配置

### 选项1：MongoDB Atlas（推荐）

1. **创建MongoDB Atlas账户**
   - 访问 [mongodb.com/atlas](https://mongodb.com/atlas)
   - 注册免费账户

2. **创建集群**
   - 选择免费套餐（M0）
   - 选择云提供商和地区
   - 创建集群

3. **配置数据库访问**
   - 创建数据库用户
   - 设置密码

4. **配置网络访问**
   - 添加IP地址：`0.0.0.0/0`（允许所有IP）

5. **获取连接字符串**
   ```
   mongodb+srv://username:password@cluster.mongodb.net/osdi-survey?retryWrites=true&w=majority
   ```

6. **设置环境变量**
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/osdi-survey?retryWrites=true&w=majority
   DATABASE_TYPE=mongodb
   ```

### 选项2：使用Render的内置数据库

Render提供PostgreSQL数据库服务。

1. **创建数据库**
   - 在Render控制台创建PostgreSQL数据库
   - 获取连接字符串

2. **修改代码**
   - 安装PostgreSQL驱动：`npm install pg`
   - 修改数据库连接代码

## 🔧 本地测试云端配置

1. **安装依赖**
   ```bash
   npm install
   ```

2. **创建环境变量文件**
   ```bash
   cp env.example .env
   ```

3. **配置MongoDB连接**
   - 编辑`.env`文件
   - 设置`MONGODB_URI`和`DATABASE_TYPE=mongodb`

4. **测试云端服务器**
   ```bash
   node server-cloud.js
   ```

5. **访问测试**
   - 主页面：http://localhost:3000
   - 管理员界面：http://localhost:3000/admin.html
   - 健康检查：http://localhost:3000/api/health

## 📊 数据迁移

### 从本地SQLite迁移到MongoDB

1. **导出本地数据**
   ```bash
   sqlite3 survey.db "SELECT * FROM surveys;" > local_data.json
   ```

2. **创建迁移脚本**
   ```javascript
   // migrate.js
   const { MongoClient } = require('mongodb');
   const fs = require('fs');
   
   async function migrateData() {
     const client = new MongoClient(process.env.MONGODB_URI);
     await client.connect();
     const db = client.db('osdi-survey');
     
     const localData = JSON.parse(fs.readFileSync('local_data.json', 'utf8'));
     
     for (const record of localData) {
       await db.collection('surveys').insertOne(record);
     }
     
     console.log('Migration completed');
     client.close();
   }
   
   migrateData();
   ```

3. **运行迁移**
   ```bash
   node migrate.js
   ```

## 🔒 安全配置

### 环境变量设置

```bash
# 生产环境
NODE_ENV=production
PORT=10000

# 数据库
MONGODB_URI=your_mongodb_connection_string
DATABASE_TYPE=mongodb

# 安全
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### CORS配置

确保允许您的域名访问API：

```javascript
app.use(cors({
  origin: ['https://your-app-name.onrender.com', 'http://localhost:3000'],
  credentials: true
}));
```

## 📈 监控和维护

### 健康检查

访问 `/api/health` 端点检查服务状态：

```bash
curl https://your-app-name.onrender.com/api/health
```

### 日志监控

- Render：在控制台查看实时日志
- Railway：在仪表板查看日志
- Vercel：在部署页面查看函数日志

### 数据备份

1. **定期导出数据**
   ```bash
   curl https://your-app-name.onrender.com/api/survey/export > backup.json
   ```

2. **设置自动备份**
   - 使用GitHub Actions
   - 配置定时任务

## 🚨 故障排除

### 常见问题

1. **部署失败**
   - 检查`package.json`中的依赖
   - 确保`start`脚本正确
   - 查看构建日志

2. **数据库连接失败**
   - 检查MongoDB Atlas网络设置
   - 验证连接字符串
   - 确认数据库用户权限

3. **API返回错误**
   - 检查CORS配置
   - 验证环境变量
   - 查看服务器日志

### 调试命令

```bash
# 检查应用状态
curl -I https://your-app-name.onrender.com

# 测试API端点
curl https://your-app-name.onrender.com/api/health

# 查看构建日志
# 在部署平台的控制台查看
```

## 🎯 部署检查清单

- [ ] 代码已推送到GitHub
- [ ] 环境变量已配置
- [ ] 数据库已设置
- [ ] 域名已配置（可选）
- [ ] SSL证书已启用
- [ ] 健康检查通过
- [ ] 测试数据提交成功
- [ ] 管理员界面可访问

## 📞 获取帮助

如果遇到问题：

1. 查看部署平台的文档
2. 检查GitHub Issues
3. 查看服务器日志
4. 联系技术支持

---

部署完成后，您的调查系统就可以被全球用户访问了！🌍 