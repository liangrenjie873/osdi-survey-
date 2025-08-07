# OSDI Survey System

一个现代化的在线调查系统，支持多语言界面和实时数据收集。

## 🌟 功能特性

- **多语言支持**: 中文和英文界面
- **响应式设计**: 适配各种设备屏幕
- **实时数据收集**: 支持实时数据同步和导出
- **管理员界面**: 完整的数据管理和分析功能
- **现代化UI**: 美观的渐变设计和用户体验

## 🚀 快速开始

### 本地开发

1. **克隆仓库**
```bash
git clone https://github.com/liangrenjie873/osdi-survey-.git
cd osdi-survey-
```

2. **安装依赖**
```bash
npm install
```

3. **启动开发服务器**
```bash
npm start
```

4. **访问应用**
- 主页面: http://localhost:3000
- 管理员界面: http://localhost:3000/admin.html

### 部署到生产环境

#### 使用Netlify部署

1. 将代码推送到GitHub
2. 在Netlify中连接GitHub仓库
3. 设置构建命令: `npm install && npm start`
4. 设置发布目录: `.`

#### 使用Vercel部署

1. 安装Vercel CLI: `npm i -g vercel`
2. 运行: `vercel`
3. 按照提示完成部署

## 📁 项目结构

```
OSDI/
├── index.html          # 主页面
├── admin.html          # 管理员界面
├── remote-admin.html   # 远程管理界面
├── script.js           # 主要JavaScript逻辑
├── style.css           # 样式文件
├── server.js           # 服务器端代码
├── package.json        # 项目配置
└── images/             # 图片资源
    ├── koushicare-logo.png
    └── koushicare-logo-white.png
```

## 🛠️ 技术栈

- **前端**: HTML5, CSS3, JavaScript (ES6+)
- **后端**: Node.js, Express.js
- **数据库**: 文件系统存储 (可扩展为MongoDB/MySQL)
- **部署**: Netlify, Vercel, Heroku

## 📊 功能模块

### 用户界面
- 多语言切换 (中文/英文)
- 响应式设计
- 表单验证
- 实时反馈

### 管理员功能
- 数据查看和导出
- 实时统计
- 用户管理
- 系统设置

## 🔧 配置说明

### 环境变量
```bash
PORT=3000                    # 服务器端口
NODE_ENV=production          # 环境模式
```

### 数据库配置
当前使用文件系统存储，支持扩展为其他数据库：
- MongoDB
- MySQL
- PostgreSQL

## 📈 数据导出

系统支持多种数据导出格式：
- CSV格式
- JSON格式
- Excel格式

## 🌐 国际化

支持的语言：
- 中文 (简体)
- English (英文)

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 👨‍💻 作者

**liangrenjie873**

- GitHub: [@liangrenjie873](https://github.com/liangrenjie873)

## 🙏 致谢

感谢所有为这个项目做出贡献的开发者和用户！

---

⭐ 如果这个项目对您有帮助，请给我们一个星标！