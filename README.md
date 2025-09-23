# 杜邓的赛博美学空间 | Consultant Dudengyi WebApp

[中文](#中文版本) | [English](#english-version)

---

## 中文版本

### 📋 项目简介

这是一个基于React + TypeScript + Vite构建的智能咨询Web应用，专注于美学设计咨询和个性化建议服务。该应用集成了Google Gemini AI，为用户提供专业的美学指导和咨询服务。

### ✨ 主要功能

- **智能咨询系统**: 基于AI的个性化美学咨询
- **照片指导**: 专业的拍照建议和技巧
- **问题选择**: 多维度的美学问题分析
- **报告生成**: 详细的咨询报告和建议
- **知识库**: 丰富的美学知识和案例
- **聊天功能**: 实时AI对话咨询
- **美学设计流程**: 完整的设计指导流程

### 🛠 技术栈

- **前端框架**: React 19.1.1
- **开发语言**: TypeScript
- **构建工具**: Vite 6.2.0
- **AI服务**: Google Gemini API
- **样式**: CSS Modules + 自定义样式
- **状态管理**: React Context

### 📦 安装和部署

#### 环境要求

- Node.js (推荐版本 >= 18.0.0)
- npm 或 yarn 包管理器
- Google Gemini API密钥

#### 本地开发

1. **克隆项目**
   ```bash
   git clone https://github.com/sooogooo/webapp-consultant-dudengyi.git
   cd webapp-consultant-dudengyi
   ```

2. **安装依赖**
   ```bash
   npm install
   # 或使用 yarn
   yarn install
   ```

3. **环境配置**
   - 复制 `.env.local` 文件（如果不存在请创建）
   - 设置你的 Gemini API 密钥：
   ```bash
   echo "GEMINI_API_KEY=your_gemini_api_key_here" > .env.local
   ```

4. **启动开发服务器**
   ```bash
   npm run dev
   # 或使用 yarn
   yarn dev
   ```

5. **访问应用**
   - 打开浏览器访问 `http://localhost:5173`

#### 生产环境部署

1. **构建项目**
   ```bash
   npm run build
   # 或使用 yarn
   yarn build
   ```

2. **预览构建结果**
   ```bash
   npm run preview
   # 或使用 yarn
   yarn preview
   ```

3. **部署到服务器**
   - 将 `dist` 目录中的文件上传到你的Web服务器
   - 确保服务器支持单页应用的路由重定向

#### 常见部署平台

**Vercel 部署**
```bash
# 安装 Vercel CLI
npm i -g vercel

# 部署
vercel --prod
```

**Netlify 部署**
- 连接GitHub仓库
- 构建命令: `npm run build`
- 发布目录: `dist`

**Docker 部署**
```dockerfile
# Dockerfile 示例
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 🎯 使用指南

1. **首次访问**: 进入欢迎页面，了解应用功能
2. **开始咨询**: 选择咨询类型，上传相关照片
3. **问题选择**: 根据提示选择具体的咨询问题
4. **获取建议**: AI分析后提供个性化建议
5. **查看报告**: 获取详细的咨询报告
6. **知识学习**: 浏览知识库获取更多信息

### 🔧 配置说明

#### 环境变量

- `GEMINI_API_KEY`: Google Gemini API密钥（必需）

#### 项目结构

```
├── src/
│   ├── components/          # React组件
│   │   ├── features/       # 功能组件
│   │   ├── shared/         # 共享组件
│   │   └── footer/         # 页脚组件
│   ├── services/           # API服务
│   ├── types.ts           # TypeScript类型定义
│   ├── constants.ts       # 常量定义
│   └── App.tsx            # 主应用组件
├── public/                # 静态资源
├── .env.local            # 环境变量
└── package.json          # 项目配置
```

### 🤝 贡献指南

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

### 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

### 📞 联系方式

- 项目作者: sooogooo
- 邮箱: sooogooo@gmail.com
- 项目链接: [https://github.com/sooogooo/webapp-consultant-dudengyi](https://github.com/sooogooo/webapp-consultant-dudengyi)

---

## English Version

### 📋 Project Description

This is an intelligent consultation web application built with React + TypeScript + Vite, focusing on aesthetic design consultation and personalized advisory services. The application integrates Google Gemini AI to provide professional aesthetic guidance and consultation services.

### ✨ Key Features

- **Intelligent Consultation System**: AI-powered personalized aesthetic consultation
- **Photo Guidance**: Professional photography advice and techniques
- **Problem Selection**: Multi-dimensional aesthetic problem analysis
- **Report Generation**: Detailed consultation reports and recommendations
- **Knowledge Base**: Rich aesthetic knowledge and case studies
- **Chat Functionality**: Real-time AI conversation consultation
- **Aesthetic Design Flow**: Complete design guidance workflow

### 🛠 Tech Stack

- **Frontend Framework**: React 19.1.1
- **Development Language**: TypeScript
- **Build Tool**: Vite 6.2.0
- **AI Service**: Google Gemini API
- **Styling**: CSS Modules + Custom Styles
- **State Management**: React Context

### 📦 Installation and Deployment

#### Prerequisites

- Node.js (recommended version >= 18.0.0)
- npm or yarn package manager
- Google Gemini API key

#### Local Development

1. **Clone the project**
   ```bash
   git clone https://github.com/sooogooo/webapp-consultant-dudengyi.git
   cd webapp-consultant-dudengyi
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or using yarn
   yarn install
   ```

3. **Environment configuration**
   - Copy the `.env.local` file (create if it doesn't exist)
   - Set your Gemini API key:
   ```bash
   echo "GEMINI_API_KEY=your_gemini_api_key_here" > .env.local
   ```

4. **Start development server**
   ```bash
   npm run dev
   # or using yarn
   yarn dev
   ```

5. **Access the application**
   - Open your browser and visit `http://localhost:5173`

#### Production Deployment

1. **Build the project**
   ```bash
   npm run build
   # or using yarn
   yarn build
   ```

2. **Preview build results**
   ```bash
   npm run preview
   # or using yarn
   yarn preview
   ```

3. **Deploy to server**
   - Upload files from the `dist` directory to your web server
   - Ensure your server supports single-page application routing redirects

#### Common Deployment Platforms

**Vercel Deployment**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

**Netlify Deployment**
- Connect GitHub repository
- Build command: `npm run build`
- Publish directory: `dist`

**Docker Deployment**
```dockerfile
# Dockerfile example
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 🎯 Usage Guide

1. **First Visit**: Enter the welcome page to understand app features
2. **Start Consultation**: Select consultation type and upload relevant photos
3. **Problem Selection**: Choose specific consultation questions based on prompts
4. **Get Recommendations**: Receive personalized suggestions after AI analysis
5. **View Reports**: Get detailed consultation reports
6. **Knowledge Learning**: Browse the knowledge base for more information

### 🔧 Configuration

#### Environment Variables

- `GEMINI_API_KEY`: Google Gemini API key (required)

#### Project Structure

```
├── src/
│   ├── components/          # React components
│   │   ├── features/       # Feature components
│   │   ├── shared/         # Shared components
│   │   └── footer/         # Footer components
│   ├── services/           # API services
│   ├── types.ts           # TypeScript type definitions
│   ├── constants.ts       # Constants definitions
│   └── App.tsx            # Main app component
├── public/                # Static assets
├── .env.local            # Environment variables
└── package.json          # Project configuration
```

### 🤝 Contributing

1. Fork the project
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details

### 📞 Contact

- Project Author: sooogooo
- Email: sooogooo@gmail.com
- Project Link: [https://github.com/sooogooo/webapp-consultant-dudengyi](https://github.com/sooogooo/webapp-consultant-dudengyi)
