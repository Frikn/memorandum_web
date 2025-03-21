# 多用户备忘录应用

这是一个简单的多用户备忘录Web应用，允许多个用户共享和管理备忘录。现在支持通过互联网访问！

## 功能特点

- 创建、编辑、删除和标记完成备忘录
- 设置备忘录截止日期
- 多用户系统，数据隔离
- 密码强度验证
- 支持互联网访问
- 实时更新
- 美观的用户界面

## 安装步骤

1. 确保您已安装 [Node.js](https://nodejs.org/) (推荐版本 14.x 或更高)。

2. 克隆或下载此存储库到本地计算机。

3. 在项目根目录打开命令行，安装依赖项：

```bash
npm install
```

## 本地运行应用

1. 启动服务器：

```bash
npm start
```

或者在开发模式下运行（自动重启）：

```bash
npm run dev
```

2. 服务器将运行在 http://localhost:3000。

3. 在浏览器中打开 http://localhost:3000 以使用应用程序。

## 互联网部署指南

要让应用通过互联网访问，请按照以下步骤操作：

### 1. 配置服务器

1. 在config.js中，更新`prod`环境的API URL：

```javascript
prod: {
    API_BASE_URL: 'http://your-server-ip-or-domain.com/api'
    // 如果使用HTTPS： 'https://your-domain.com/api'
}
```

### 2. 部署到服务器

有以下几种部署选项：

#### 选项A：使用自己的服务器

1. 将应用程序文件复制到您的服务器。

2. 安装依赖项：

```bash
npm install
```

3. 在生产模式下启动服务器：

```bash
npm run start:prod
```

4. 使用PM2等工具保持应用运行（推荐）：

```bash
npm install -g pm2
pm2 start server.js --name "memo-app" -- --env production
```

#### 选项B：使用云服务提供商

您可以将应用部署到各种云服务提供商，如：

- Heroku
- AWS
- Azure
- Google Cloud
- Vercel
- Netlify (前端) + Heroku (后端)

按照您选择的云服务提供商的具体部署指南操作。

### 3. 配置域名和HTTPS (推荐)

为了增强安全性，强烈建议配置域名和HTTPS：

1. 购买域名并将其指向您的服务器IP。
2. 使用Let's Encrypt等免费服务配置HTTPS。
3. 更新config.js中的URL为您的HTTPS域名。

### 4. 端口转发设置

如果您在家庭网络或具有防火墙的网络中运行服务器，需要设置端口转发：

1. 在路由器上设置端口转发，将外部端口（通常为80/443）转发到内部服务器的端口（3000）。
2. 如有必要，配置防火墙允许这些端口的流量。

### 安全注意事项

在公共互联网上部署应用时需要考虑以下安全措施：

1. **始终使用HTTPS**：保护用户凭据和数据传输。
2. **定期备份数据**：备份`memos.json`和`users.json`文件。
3. **监控日志**：检查是否有可疑活动。
4. **更新依赖项**：定期运行`npm audit`并更新依赖项。
5. **考虑使用更安全的数据存储**：对于生产环境，考虑使用MongoDB或MySQL等数据库替代文件存储。

## 技术栈

- 前端：HTML, CSS, JavaScript
- 后端：Node.js, Express.js
- 数据存储：JSON文件（本地存储）
- 安全：密码哈希、会话管理、CORS、速率限制

## 配置

- 默认端口是3000，可以通过环境变量 `PORT` 更改。
- 备忘录数据存储在项目根目录下的 `memos.json` 文件中。
- 用户数据存储在项目根目录下的 `users.json` 文件中。

## 注意事项

- 在生产环境中，建议使用数据库而不是文件存储。
- 定期备份数据文件。
- 如需更高级的功能，如团队协作、实时更新等，请考虑使用更复杂的架构。
