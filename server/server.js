const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');
const crypto = require('crypto');
const session = require('express-session');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
// 恢复nodemailer相关导入
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0'; // 监听所有网络接口
const MEMO_FILE = path.join(__dirname, '../data/memos.json');
const USERS_FILE = path.join(__dirname, '../data/users.json');
const RESET_TOKENS_FILE = path.join(__dirname, '../data/reset_tokens.json');

// 邮件发送配置
// 注意：请使用您自己的邮件服务器信息替换以下配置
// 常见服务商配置:
// Gmail: host: 'smtp.gmail.com', port: 587
// QQ邮箱: host: 'smtp.qq.com', port: 587
// 163邮箱: host: 'smtp.163.com', port: 25
const emailTransporter = nodemailer.createTransport({
  host: 'smtp.example.com',  // 替换为您的SMTP服务器
  port: 587,
  secure: false,
  auth: {
    user: 'your-email@example.com', // 替换为您的邮箱
    pass: 'your-password'  // 替换为您的密码或应用专用密码
  }
});

// 安全中间件
app.use(helmet({
  contentSecurityPolicy: false // 如果您使用了CDN需要禁用CSP，否则可以开启
}));

// 设置速率限制
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 限制每个IP 15分钟内最多100次请求
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: '请求频率过高，请稍后再试' }
});

// 应用限速到所有请求
app.use('/api/', apiLimiter);

// 配置CORS，允许前端访问
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true // 允许携带凭证（cookies、authorization headers等）
}));

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../public')));
app.use(session({
  secret: 'memo-app-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production', // 在生产环境使用HTTPS
    maxAge: 3600000, // 1小时过期
    sameSite: 'lax' // 防止CSRF攻击
  }
}));

// 确保文件存在
async function ensureFile(filePath, defaultContent = []) {
  try {
    await fs.access(filePath);
  } catch (error) {
    await fs.writeFile(filePath, JSON.stringify(defaultContent));
  }
}

// 读取文件内容
async function readJsonFile(filePath) {
  await ensureFile(filePath);
  const data = await fs.readFile(filePath, 'utf8');
  return JSON.parse(data);
}

// 写入文件内容
async function writeJsonFile(filePath, data) {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

// 读取所有备忘录
async function readMemos() {
  return readJsonFile(MEMO_FILE);
}

// 写入备忘录到文件
async function writeMemos(memos) {
  await writeJsonFile(MEMO_FILE, memos);
}

// 读取所有用户
async function readUsers() {
  return readJsonFile(USERS_FILE);
}

// 写入用户到文件
async function writeUsers(users) {
  await writeJsonFile(USERS_FILE, users);
}

// 读取所有重置令牌
async function readResetTokens() {
  return readJsonFile(RESET_TOKENS_FILE);
}

// 写入重置令牌到文件
async function writeResetTokens(tokens) {
  await writeJsonFile(RESET_TOKENS_FILE, tokens);
}

// 生成盐值和密码哈希
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return { salt, hash };
}

// 验证密码
function validatePassword(password, hash, salt) {
  const hashVerify = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return hash === hashVerify;
}

// 中间件：检查用户是否已登录
function requireAuth(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ error: '请先登录' });
  }
  next();
}

// 注册新用户
app.post('/api/register', async (req, res) => {
  try {
    const { username, password, email } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: '用户名和密码不能为空' });
    }
    
    const users = await readUsers();
    
    // 检查用户名是否已存在
    if (users.some(user => user.username === username)) {
      return res.status(400).json({ error: '用户名已存在' });
    }
    
    // 如果提供了邮箱，检查邮箱是否已存在
    if (email && users.some(user => user.email === email)) {
      return res.status(400).json({ error: '邮箱已被注册' });
    }
    
    // 散列密码
    const { salt, hash } = hashPassword(password);
    
    // 创建新用户
    const newUser = {
      id: Date.now().toString(),
      username,
      email: email || null, // 保存邮箱（如果提供）
      hash,
      salt,
      createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    await writeUsers(users);
    
    // 自动登录
    req.session.userId = newUser.id;
    
    res.status(201).json({ id: newUser.id, username: newUser.username });
  } catch (error) {
    res.status(500).json({ error: '注册失败' });
  }
});

// 用户登录
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: '用户名和密码不能为空' });
    }
    
    const users = await readUsers();
    const user = users.find(u => u.username === username);
    
    if (!user || !validatePassword(password, user.hash, user.salt)) {
      return res.status(401).json({ error: '用户名或密码不正确' });
    }
    
    // 设置会话
    req.session.userId = user.id;
    
    res.json({ id: user.id, username: user.username });
  } catch (error) {
    res.status(500).json({ error: '登录失败' });
  }
});

// 获取当前用户信息
app.get('/api/me', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: '未登录' });
  }
  
  try {
    const users = await readUsers();
    const user = users.find(u => u.id === req.session.userId);
    
    if (!user) {
      req.session.destroy();
      return res.status(404).json({ error: '用户不存在' });
    }
    
    res.json({ id: user.id, username: user.username });
  } catch (error) {
    res.status(500).json({ error: '获取用户信息失败' });
  }
});

// 用户登出
app.post('/api/logout', (req, res) => {
  req.session.destroy();
  res.json({ message: '已登出' });
});

// 路由：获取当前用户的备忘录
app.get('/api/memos', requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId;
    const memos = await readMemos();
    
    // 过滤出用户自己的备忘录
    const userMemos = memos.filter(memo => memo.userId === userId);
    
    res.json(userMemos);
  } catch (error) {
    res.status(500).json({ error: '无法读取备忘录' });
  }
});

// 路由：添加新备忘录
app.post('/api/memos', requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId;
    const memos = await readMemos();
    const newMemo = {
      id: Date.now().toString(),
      userId: userId,
      title: req.body.title,
      content: req.body.content,
      date: req.body.date,
      completed: false,
      createdAt: new Date().toISOString()
    };
    
    memos.push(newMemo);
    await writeMemos(memos);
    
    res.status(201).json(newMemo);
  } catch (error) {
    res.status(500).json({ error: '无法添加备忘录' });
  }
});

// 路由：更新备忘录
app.put('/api/memos/:id', requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId;
    const memos = await readMemos();
    const id = req.params.id;
    
    // 查找备忘录并验证所有权
    const memoIndex = memos.findIndex(memo => memo.id === id && memo.userId === userId);
    
    if (memoIndex === -1) {
      return res.status(404).json({ error: '备忘录不存在或无权访问' });
    }
    
    memos[memoIndex] = {
      ...memos[memoIndex],
      ...req.body,
      userId: userId, // 确保用户ID不变
      updatedAt: new Date().toISOString()
    };
    
    await writeMemos(memos);
    res.json(memos[memoIndex]);
  } catch (error) {
    res.status(500).json({ error: '无法更新备忘录' });
  }
});

// 路由：删除备忘录
app.delete('/api/memos/:id', requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId;
    const memos = await readMemos();
    const id = req.params.id;
    
    // 查找要删除的备忘录的索引，确保只能删除自己的备忘录
    const initialLength = memos.length;
    const newMemos = memos.filter(memo => !(memo.id === id && memo.userId === userId));
    
    if (newMemos.length === initialLength) {
      return res.status(404).json({ error: '备忘录不存在或无权访问' });
    }
    
    await writeMemos(newMemos);
    res.json({ message: '备忘录已删除' });
  } catch (error) {
    res.status(500).json({ error: '无法删除备忘录' });
  }
});

// 添加生成随机字符串的辅助函数
async function generateRandomString(length) {
  try {
    // 使用动态import导入crypto-random-string
    const { default: randomString } = await import('crypto-random-string');
    return randomString({length: length, type: 'url-safe'});
  } catch (error) {
    // 如果导入失败，使用crypto模块的替代方案
    console.error('动态导入crypto-random-string失败，使用替代方案:', error);
    return crypto.randomBytes(Math.ceil(length / 2))
      .toString('hex')
      .slice(0, length);
  }
}

// 请求重置密码
app.post('/api/forgot-password', async (req, res) => {
  try {
    const { username, email } = req.body;
    
    if (!username || !email) {
      return res.status(400).json({ error: '用户名和邮箱不能为空' });
    }
    
    const users = await readUsers();
    const user = users.find(u => u.username === username && u.email === email);
    
    if (!user) {
      // 为了安全，返回成功消息，即使用户不存在
      return res.json({ message: '如果您的账户存在，我们已发送密码重置链接到您的邮箱' });
    }
    
    // 生成重置令牌，使用我们的辅助函数
    const resetToken = await generateRandomString(64);
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // 令牌1小时后过期
    
    // 保存重置令牌
    const resetTokens = await readResetTokens();
    resetTokens.push({
      userId: user.id,
      token: resetToken,
      expiresAt: expiresAt.toISOString()
    });
    
    await writeResetTokens(resetTokens);
    
    // 构建重置链接
    const resetLink = `${req.protocol}://${req.get('host')}/reset-password.html?token=${resetToken}`;
    
    // 发送重置邮件
    const mailOptions = {
      from: '"备忘录应用" <noreply@example.com>',
      to: user.email,
      subject: '密码重置请求',
      html: `
        <h3>您好，${user.username}</h3>
        <p>我们收到了您的密码重置请求。请点击下面的链接重置密码：</p>
        <p><a href="${resetLink}" target="_blank">${resetLink}</a></p>
        <p>该链接将在1小时后失效。</p>
        <p>如果您没有请求重置密码，请忽略此邮件。</p>
        <p>谢谢！</p>
        <p>备忘录应用团队</p>
      `
    };
    
    await emailTransporter.sendMail(mailOptions);
    
    res.json({ message: '如果您的账户存在，我们已发送密码重置链接到您的邮箱' });
  } catch (error) {
    console.error('密码重置请求处理失败:', error);
    res.status(500).json({ error: '发送重置链接失败' });
  }
});

// 验证重置令牌
app.get('/api/verify-reset-token/:token', async (req, res) => {
  try {
    const { token } = req.params;
    
    if (!token) {
      return res.json({ valid: false });
    }
    
    const resetTokens = await readResetTokens();
    const tokenData = resetTokens.find(t => t.token === token);
    
    if (!tokenData) {
      return res.json({ valid: false });
    }
    
    // 检查令牌是否过期
    if (new Date(tokenData.expiresAt) < new Date()) {
      return res.json({ valid: false });
    }
    
    res.json({ valid: true });
  } catch (error) {
    res.status(500).json({ valid: false, error: '验证令牌失败' });
  }
});

// 重置密码
app.post('/api/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;
    
    if (!token || !password) {
      return res.status(400).json({ error: '令牌和新密码不能为空' });
    }
    
    const resetTokens = await readResetTokens();
    const tokenIndex = resetTokens.findIndex(t => t.token === token);
    
    if (tokenIndex === -1) {
      return res.status(404).json({ error: '重置令牌不存在' });
    }
    
    const tokenData = resetTokens[tokenIndex];
    
    // 检查令牌是否过期
    if (new Date(tokenData.expiresAt) < new Date()) {
      return res.status(401).json({ error: '重置令牌已过期' });
    }
    
    // 获取用户并更新密码
    const users = await readUsers();
    const userIndex = users.findIndex(u => u.id === tokenData.userId);
    
    if (userIndex === -1) {
      return res.status(404).json({ error: '用户不存在' });
    }
    
    // 散列新密码
    const { salt, hash } = hashPassword(password);
    
    // 更新用户密码
    users[userIndex].salt = salt;
    users[userIndex].hash = hash;
    
    // 保存用户数据
    await writeUsers(users);
    
    // 删除已使用的令牌
    resetTokens.splice(tokenIndex, 1);
    await writeResetTokens(resetTokens);
    
    res.json({ message: '密码已成功重置' });
  } catch (error) {
    res.status(500).json({ error: '重置密码失败' });
  }
});

// 添加简单的健康检查端点
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 确保数据目录存在
async function ensureDataDirectories() {
  try {
    // 确保data目录存在
    const dataDir = path.join(__dirname, '../data');
    try {
      await fs.access(dataDir);
    } catch (error) {
      await fs.mkdir(dataDir, { recursive: true });
    }
    
    // 创建空文件
    await ensureFile(MEMO_FILE);
    await ensureFile(USERS_FILE);
    await ensureFile(RESET_TOKENS_FILE);
    
    console.log('数据目录和文件准备就绪');
  } catch (error) {
    console.error('创建数据目录或文件失败:', error);
  }
}

// 启动服务器前准备
async function startServer() {
  await ensureDataDirectories();
  
  // 启动服务器
  app.listen(PORT, HOST, () => {
    console.log(`服务器运行在 http://${HOST}:${PORT}`);
    console.log('要从互联网访问，请确保已设置正确的端口转发或使用公网IP');
  });
}

startServer(); 