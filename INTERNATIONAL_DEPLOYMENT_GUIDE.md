# 🌍 国际网站部署与数据同步指南

## ✅ 部署方案已准备完成

您现在拥有一个完整的国际部署解决方案，支持全球数据同步！

## 🎯 **解决方案概览**

### **双重管理面板**
- 🏠 **本地管理**: 只显示本地数据的简洁界面
- 🌍 **全球管理**: 可同步和查看全球数据的高级界面

### **密码验证流程**
1. 点击logo → 输入密码 `123456`
2. 选择管理面板类型：
   - **确定**: 进入本地数据管理 (`admin.html`)
   - **取消**: 进入全球数据管理 (`remote-admin.html`)

## 🚀 **部署方案**

### **方案1: 云服务器部署** ⭐ 推荐

#### **1. 选择云服务商**
- **腾讯云**: 适合国内外访问
- **阿里云**: 有海外节点
- **AWS**: 全球节点最多
- **DigitalOcean**: 价格实惠
- **Vercel/Netlify**: 静态网站部署

#### **2. 服务器配置**
```bash
# 最低配置建议
CPU: 1核
内存: 1GB
存储: 20GB SSD
带宽: 1Mbps

# 推荐配置
CPU: 2核
内存: 2GB
存储: 40GB SSD
带宽: 5Mbps
```

#### **3. 部署步骤**
```bash
# 1. 上传项目文件到服务器
scp -r /Users/a13279557336/Desktop/OSDI/ user@your-server:/var/www/osdi/

# 2. 安装Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. 安装依赖
cd /var/www/osdi
npm install

# 4. 配置环境变量
echo "PORT=3000" > .env
echo "EXPORT_AUTH_KEY=your-secret-key-here" >> .env

# 5. 启动服务
npm start

# 6. 使用PM2守护进程 (推荐)
npm install -g pm2
pm2 start server.js --name "osdi-survey"
pm2 startup
pm2 save
```

### **方案2: 静态网站部署** (仅前端)

#### **适用平台**
- **Vercel**: 免费，支持自定义域名
- **Netlify**: 免费，易于部署
- **GitHub Pages**: 免费，需要公开仓库

#### **部署文件**
只需要这些文件：
```
index.html          # 主问卷页面
style.css           # 样式文件
script.js           # 前端逻辑
admin.html          # 本地管理页面
remote-admin.html   # 全球管理页面
images/             # Logo文件夹
```

#### **注意事项**
- 静态部署无后端数据库
- 数据只保存在localStorage
- 需要手动导出/导入数据

## 🔗 **数据同步方案**

### **方案A: 实时API同步** ⭐ 推荐

#### **国外网站设置**
在国外网站部署完整版本（包含server.js）：

```javascript
// 国外网站提供数据导出API
https://your-international-site.com/api/survey/export

// 响应格式
{
  "export_time": "2024-01-15T10:30:00.000Z",
  "version": "1.0",
  "source": "OSDI Survey System",
  "total_records": 150,
  "submissions": [
    {
      "participant_name": "John Doe",
      "submission_time": "2024-01-15T09:45:00.000Z",
      "overall_osdi": 25.5
    }
    // ... 更多数据
  ]
}
```

#### **本地管理使用**
1. 打开全球管理面板：点击logo → 输入密码 → 取消
2. 配置远程URL：`https://your-international-site.com/api/survey/export`
3. 设置认证密钥（可选）：`your-secret-key`
4. 点击"🔄 Sync Remote Data"同步数据

### **方案B: 文件导出导入**

#### **国外网站操作**
1. 定期访问：`https://your-site.com/api/survey/export-csv`
2. 下载CSV文件
3. 发送给您或上传到共享存储

#### **本地管理操作**
1. 在全球管理面板选择"CSV File"
2. 输入CSV文件URL或手动上传
3. 同步数据到本地查看

### **方案C: 云数据库共享** (高级)

#### **数据库选择**
- **PostgreSQL**: 推荐，支持远程连接
- **MySQL**: 常用，价格便宜
- **MongoDB**: NoSQL，适合复杂数据
- **Firebase**: Google云数据库，简单易用

#### **配置示例** (PostgreSQL)
```javascript
// 修改server.js使用云数据库
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// 国外和本地都连接同一个数据库
```

## 🛡️ **安全配置**

### **API安全**
```javascript
// 设置认证密钥
export EXPORT_AUTH_KEY="osdi-secure-key-2024"

// 请求时使用
curl -H "Authorization: Bearer osdi-secure-key-2024" \
     https://your-site.com/api/survey/export
```

### **网站安全**
- ✅ 使用HTTPS证书
- ✅ 设置防火墙规则
- ✅ 定期备份数据
- ✅ 监控访问日志

### **密码安全**
```javascript
// 可在script.js中修改管理密码
if (password === 'your-new-secure-password') {
    // 进入管理面板
}
```

## 📋 **部署检查清单**

### **部署前准备**
- [ ] 购买域名和服务器
- [ ] 准备SSL证书
- [ ] 备份本地数据
- [ ] 测试所有功能

### **国外网站部署**
- [ ] 上传所有文件到服务器
- [ ] 安装Node.js和依赖
- [ ] 配置环境变量
- [ ] 启动服务并测试
- [ ] 配置域名和SSL
- [ ] 测试问卷提交功能
- [ ] 测试数据导出API

### **本地管理配置**
- [ ] 测试密码验证
- [ ] 测试本地管理面板
- [ ] 配置远程数据同步
- [ ] 测试数据同步功能
- [ ] 验证数据显示正确

## 🌐 **域名配置示例**

### **DNS设置**
```
类型    名称                值
A       survey             your-server-ip
A       www.survey         your-server-ip
CNAME   api.survey         survey.your-domain.com
```

### **Nginx配置** (如果使用Nginx)
```nginx
server {
    listen 80;
    server_name survey.your-domain.com;
    
    # 重定向到HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name survey.your-domain.com;
    
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 📊 **使用流程**

### **国外用户**
1. 访问：`https://survey.your-domain.com`
2. 填写OSDI问卷
3. 查看评分结果
4. 数据自动保存到云端

### **您的管理**
1. 本地访问：`http://localhost:8000`
2. 点击logo输入密码
3. 选择全球管理面板
4. 同步查看全球数据

### **数据同步**
- **自动**: 每30秒自动刷新数据
- **手动**: 点击刷新按钮
- **远程**: 输入远程URL同步

## 💡 **推荐部署方案**

### **小规模使用** (< 100人/月)
- **前端**: Vercel/Netlify免费托管
- **数据**: localStorage + 定期手动导出
- **成本**: $0/月

### **中等规模** (100-1000人/月)  ⭐ 推荐
- **服务器**: DigitalOcean $10/月
- **域名**: $10/年
- **SSL**: Let's Encrypt免费
- **数据**: SQLite + API同步
- **成本**: ~$11/月

### **大规模使用** (> 1000人/月)
- **服务器**: AWS/腾讯云 $50/月
- **数据库**: 云数据库 $20/月
- **CDN**: 全球加速 $10/月
- **成本**: ~$80/月

## 🚀 **快速部署脚本**

我已经为您准备了自动部署脚本：

```bash
# 创建deploy.sh
cat > deploy.sh << 'EOF'
#!/bin/bash
echo "🌍 OSDI Survey International Deployment"
echo "======================================"

# 1. 检查Node.js
node --version || { echo "请先安装Node.js"; exit 1; }

# 2. 安装依赖
npm install

# 3. 创建环境配置
echo "PORT=3000" > .env
echo "EXPORT_AUTH_KEY=osdi-export-$(date +%Y)" >> .env

# 4. 测试启动
echo "🚀 Starting server..."
npm start &
SERVER_PID=$!

# 等待服务启动
sleep 5

# 5. 测试API
echo "🧪 Testing API endpoints..."
curl -s http://localhost:3000/api/survey/export > /dev/null && echo "✅ Export API works" || echo "❌ Export API failed"

# 6. 显示信息
echo ""
echo "🎉 Deployment completed!"
echo "📊 Survey URL: http://localhost:3000"
echo "🔧 Admin Panel: http://localhost:3000 (click logo)"
echo "🌍 Export API: http://localhost:3000/api/survey/export"
echo ""
echo "🔑 Admin Password: 123456"
echo "🗝️  Export Auth Key: osdi-export-$(date +%Y)"

# 停止测试服务
kill $SERVER_PID
EOF

chmod +x deploy.sh
```

---

**🎉 现在您已经拥有完整的国际部署解决方案！** 

**📞 需要帮助？**
- 国外网站部署完成后，提供URL给我，我可以帮您测试数据同步
- 如有技术问题，随时联系我进行调试
- 建议先在测试服务器上验证功能，再正式部署

**🌍 全球数据，本地管理，轻松实现！** ✨