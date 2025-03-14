const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');
const crypto = require('crypto');
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 3000;
const MEMO_FILE = path.join(__dirname, 'memos.json');
const USERS_FILE = path.join(__dirname, 'users.json');

// 中间件
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(bodyParser.json());
app.use(express.static('.'));
app.use(session({
  secret: 'memo-app-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 3600000 } // 1小时过期
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
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: '用户名和密码不能为空' });
    }
    
    const users = await readUsers();
    
    // 检查用户名是否已存在
    if (users.some(user => user.username === username)) {
      return res.status(400).json({ error: '用户名已存在' });
    }
    
    // 散列密码
    const { salt, hash } = hashPassword(password);
    
    // 创建新用户
    const newUser = {
      id: Date.now().toString(),
      username,
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

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
}); 