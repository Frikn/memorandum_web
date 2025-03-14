// API基础URL
const API_URL = window.APP_CONFIG.API_BASE_URL + '/memos';
const AUTH_API_URL = window.APP_CONFIG.API_BASE_URL;

// 从服务器加载备忘录
let memos = [];
let currentUser = null;

// 检查认证状态
async function checkAuth() {
    /* 注释掉网络请求部分
    try {
        const response = await fetch(`${AUTH_API_URL}/me`, {
            credentials: 'include'
        });
        
        if (!response.ok) {
            // 未登录，重定向到登录页面
            window.location.href = 'login.html';
            return false;
        }
        
        currentUser = await response.json();
        updateUserInfo();
        return true;
    } catch (error) {
        console.error('认证检查失败:', error);
        showNotification('无法连接到服务器，请检查网络连接', 'error');
        return false;
    }
    */
    
    // 模拟本地认证
    const savedUser = localStorage.getItem('currentUser');
    if (!savedUser) {
        // 未登录，重定向到登录页面
        window.location.href = 'login.html';
        return false;
    }
    
    try {
        currentUser = JSON.parse(savedUser);
        updateUserInfo();
        return true;
    } catch (error) {
        console.error('解析用户数据出错:', error);
        localStorage.removeItem('currentUser');
        window.location.href = 'login.html';
        return false;
    }
}

// 更新用户信息显示
function updateUserInfo() {
    if (currentUser) {
        document.getElementById('username').textContent = currentUser.username;
    }
}

// 处理登出
function setupLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            /* 注释掉网络请求部分
            try {
                const response = await fetch(`${AUTH_API_URL}/logout`, {
                    method: 'POST',
                    credentials: 'include'
                });
                
                if (response.ok) {
                    window.location.href = 'login.html';
                }
            } catch (error) {
                console.error('登出失败:', error);
                showNotification('登出失败，请稍后再试', 'error');
            }
            */
            
            // 模拟本地登出
            localStorage.removeItem('currentUser');
            window.location.href = 'login.html';
        });
    }
}

// 加载备忘录列表
async function loadMemos() {
    /* 注释掉网络请求部分
    try {
        const response = await fetch(API_URL, {
            credentials: 'include'
        });
        
        if (!response.ok) {
            throw new Error('加载备忘录失败');
        }
        
        memos = await response.json();
        renderMemos();
    } catch (error) {
        console.error('加载备忘录失败:', error);
        showNotification('加载备忘录失败，请稍后再试', 'error');
    }
    */
    
    // 从本地存储加载备忘录（模拟）
    try {
        const savedMemos = localStorage.getItem('memos');
        memos = savedMemos ? JSON.parse(savedMemos) : getSampleMemos();
        localStorage.setItem('memos', JSON.stringify(memos));
        renderMemos();
    } catch (error) {
        console.error('加载备忘录失败:', error);
        memos = getSampleMemos();
        localStorage.setItem('memos', JSON.stringify(memos));
        renderMemos();
    }
}

// 获取示例备忘录数据
function getSampleMemos() {
    return [
        {
            id: '1',
            title: '欢迎使用备忘录',
            content: '这是一个示例备忘录。您可以添加、编辑和删除备忘录。',
            date: new Date().toISOString().split('T')[0],
            created_at: new Date().toISOString(),
            completed: false
        },
        {
            id: '2',
            title: '购物清单',
            content: '1. 水果\n2. 蔬菜\n3. 牛奶\n4. 面包',
            date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
            created_at: new Date().toISOString(),
            completed: false
        }
    ];
}

// 添加备忘录
async function addMemo() {
    const titleInput = document.getElementById('memoTitle');
    const contentInput = document.getElementById('memoContent');
    const dateInput = document.getElementById('memoDate');
    
    const title = titleInput.value.trim();
    const content = contentInput.value.trim();
    const date = dateInput.value;
    
    if (!title || !content) {
        showNotification('标题和内容不能为空', 'error');
        return;
    }
    
    const newMemo = {
        id: Date.now().toString(),
        title,
        content,
        date: date || new Date().toISOString().split('T')[0],
        created_at: new Date().toISOString(),
        completed: false
    };
    
    /* 注释掉网络请求部分
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newMemo),
            credentials: 'include'
        });
        
        if (!response.ok) {
            throw new Error('添加备忘录失败');
        }
        
        const addedMemo = await response.json();
        memos.unshift(addedMemo);
        renderMemos();
        
        // 清空输入框
        titleInput.value = '';
        contentInput.value = '';
        dateInput.value = '';
        
        showNotification('备忘录添加成功', 'success');
    } catch (error) {
        console.error('添加备忘录失败:', error);
        showNotification('添加备忘录失败，请稍后再试', 'error');
    }
    */
    
    // 模拟添加备忘录（本地存储）
    try {
        memos.unshift(newMemo);
        localStorage.setItem('memos', JSON.stringify(memos));
        renderMemos();
        
        // 清空输入框
        titleInput.value = '';
        contentInput.value = '';
        dateInput.value = '';
        
        showNotification('备忘录添加成功', 'success');
    } catch (error) {
        console.error('添加备忘录失败:', error);
        showNotification('添加备忘录失败，请稍后再试', 'error');
    }
}

// 删除备忘录
async function deleteMemo(id) {
    if (!confirm('确定要删除这个备忘录吗？')) {
        return;
    }
    
    /* 注释掉网络请求部分
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        
        if (!response.ok) {
            throw new Error('删除备忘录失败');
        }
        
        // 从数组中移除备忘录
        memos = memos.filter(memo => memo.id !== id);
        renderMemos();
        
        showNotification('备忘录删除成功', 'success');
    } catch (error) {
        console.error('删除备忘录失败:', error);
        showNotification('删除备忘录失败，请稍后再试', 'error');
    }
    */
    
    // 模拟删除备忘录（本地存储）
    try {
        // 从数组中移除备忘录
        memos = memos.filter(memo => memo.id !== id);
        localStorage.setItem('memos', JSON.stringify(memos));
        renderMemos();
        
        showNotification('备忘录删除成功', 'success');
    } catch (error) {
        console.error('删除备忘录失败:', error);
        showNotification('删除备忘录失败，请稍后再试', 'error');
    }
}

// 编辑备忘录
let editingMemoId = null;

function startEditMemo(id) {
    const memo = memos.find(m => m.id === id);
    if (!memo) return;
    
    editingMemoId = id;
    
    document.getElementById('memoTitle').value = memo.title;
    document.getElementById('memoContent').value = memo.content;
    document.getElementById('memoDate').value = memo.date;
    
    // 修改添加按钮为保存按钮
    const addBtn = document.querySelector('.add-btn');
    addBtn.innerHTML = '<i class="fas fa-save"></i> 保存修改';
    addBtn.onclick = () => saveMemoEdit();
    
    // 滚动到表单
    document.querySelector('.memo-input').scrollIntoView({ behavior: 'smooth' });
}

async function saveMemoEdit() {
    if (!editingMemoId) return;
    
    const titleInput = document.getElementById('memoTitle');
    const contentInput = document.getElementById('memoContent');
    const dateInput = document.getElementById('memoDate');
    
    const title = titleInput.value.trim();
    const content = contentInput.value.trim();
    const date = dateInput.value;
    
    if (!title || !content) {
        showNotification('标题和内容不能为空', 'error');
        return;
    }
    
    const updatedMemo = {
        title,
        content,
        date: date || new Date().toISOString().split('T')[0],
        updated_at: new Date().toISOString()
    };
    
    // 模拟更新备忘录（本地存储）
    try {
        // 更新本地数组
        const index = memos.findIndex(m => m.id === editingMemoId);
        if (index !== -1) {
            // 保留id、created_at和completed状态
            updatedMemo.id = memos[index].id;
            updatedMemo.created_at = memos[index].created_at;
            updatedMemo.completed = memos[index].completed || false;
            memos[index] = updatedMemo;
        }
        
        localStorage.setItem('memos', JSON.stringify(memos));
        renderMemos();
        resetMemoForm();
        
        showNotification('备忘录更新成功', 'success');
    } catch (error) {
        console.error('更新备忘录失败:', error);
        showNotification('更新备忘录失败，请稍后再试', 'error');
    }
}

// 渲染备忘录列表
function renderMemos() {
    const memoList = document.getElementById('memoList');
    if (!memoList) return;
    
    if (memos.length === 0) {
        memoList.innerHTML = '<div class="no-memos">还没有备忘录，点击上方添加按钮创建一个吧！</div>';
        return;
    }
    
    memoList.innerHTML = '';
    
    // 按创建日期排序（最新的在前面）
    const sortedMemos = [...memos].sort((a, b) => {
        return new Date(b.created_at) - new Date(a.created_at);
    });
    
    sortedMemos.forEach(memo => {
        const memoCard = document.createElement('div');
        memoCard.className = memo.completed ? 'memo-card completed' : 'memo-card';
        
        // 判断是否已过期
        const isOverdue = memo.date && new Date(memo.date) < new Date() && new Date(memo.date).setHours(0,0,0,0) !== new Date().setHours(0,0,0,0);
        if (isOverdue && !memo.completed) {
            memoCard.classList.add('overdue');
        }
        
        // 格式化日期
        const dueDateText = memo.date ? formatDate(memo.date) : '无截止日期';
        
        // 设置完成按钮文本和类名
        const completeButtonText = memo.completed ? 
            '<i class="fas fa-undo"></i> 取消完成' : 
            '<i class="fas fa-check"></i> 完成';
        const completeButtonClass = memo.completed ? 
            'complete-btn undo' : 
            'complete-btn';
        
        memoCard.innerHTML = `
            <h3>${memo.title}</h3>
            <div class="memo-date">${dueDateText}</div>
            <p>${memo.content.replace(/\n/g, '<br>')}</p>
            <div class="card-actions">
                <button class="${completeButtonClass}" onclick="toggleComplete('${memo.id}')">
                    ${completeButtonText}
                </button>
                <button class="edit-btn" onclick="startEditMemo('${memo.id}')">
                    <i class="fas fa-edit"></i> 编辑
                </button>
                <button class="delete-btn" onclick="deleteMemo('${memo.id}')">
                    <i class="fas fa-trash-alt"></i> 删除
                </button>
            </div>
        `;
        
        memoList.appendChild(memoCard);
    });
}

// 重置备忘录表单
function resetMemoForm() {
    const titleInput = document.getElementById('memoTitle');
    const contentInput = document.getElementById('memoContent');
    const dateInput = document.getElementById('memoDate');
    
    titleInput.value = '';
    contentInput.value = '';
    dateInput.value = '';
    
    editingMemoId = null;
    
    // 恢复添加按钮
    const addBtn = document.querySelector('.add-btn');
    addBtn.innerHTML = '<i class="fas fa-plus"></i> 添加备忘录';
    addBtn.onclick = () => addMemo();
}

// 显示通知消息
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // 3秒后自动消失
    setTimeout(() => {
        notification.classList.add('hide');
        setTimeout(() => {
            notification.remove();
        }, 500);
    }, 3000);
}

// 主函数
document.addEventListener('DOMContentLoaded', async () => {
    // 添加CSS样式到头部
    const notificationStyle = document.createElement('style');
    notificationStyle.textContent = `
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 4px;
            font-size: 14px;
            z-index: 1000;
            animation: slideIn 0.3s forwards;
            max-width: 300px;
            box-shadow: 0 3px 6px rgba(0,0,0,0.16);
        }
        
        .notification.hide {
            animation: slideOut 0.3s forwards;
        }
        
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        
        .notification.success {
            background-color: #43a047;
            color: white;
        }
        
        .notification.error {
            background-color: #e53935;
            color: white;
        }
        
        .notification.warning {
            background-color: #fb8c00;
            color: white;
        }
        
        .notification.info {
            background-color: #039be5;
            color: white;
        }
        
        .overdue {
            border-left: 4px solid #e53935;
        }
    `;
    document.head.appendChild(notificationStyle);
    
    // 检查用户是否已登录
    if (await checkAuth()) {
        // 加载备忘录
        await loadMemos();
        
        // 设置登出按钮
        setupLogout();
        
        // 设置添加按钮事件
        const addBtn = document.querySelector('.add-btn');
        if (addBtn) {
            addBtn.onclick = () => addMemo();
        }
    }
});

// 更新当前日期和时间
function updateDateTime() {
    const now = new Date();
    
    // 更新日期
    const dateOptions = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
    const dateString = now.toLocaleDateString('zh-CN', dateOptions);
    document.getElementById('currentDate').textContent = dateString;
    
    // 更新时间
    const timeOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
    const timeString = now.toLocaleTimeString('zh-CN', timeOptions);
    document.getElementById('currentTime').textContent = timeString;
}

// 每秒更新一次时间
setInterval(updateDateTime, 1000);
updateDateTime(); // 初始化时立即更新

// 格式化日期为友好格式
function formatDate(dateString) {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('zh-CN', options);
}

// 获取指定ID的备忘录
function getMemoById(id) {
    return memos.find(memo => memo.id === id);
}

// 编辑备忘录
function editMemo(id) {
    const memo = getMemoById(id);
    if (!memo) return;
    
    const titleInput = document.getElementById('memoTitle');
    const contentInput = document.getElementById('memoContent');
    const dueDateInput = document.getElementById('memoDate');
    
    titleInput.value = memo.title;
    contentInput.value = memo.content;
    
    if (memo.date) {
        dueDateInput.value = memo.date;
    }
    
    // 保存当前编辑的备忘录ID
    document.getElementById('memoTitle').dataset.editId = id;
    
    // 更改添加按钮文本
    const addButton = document.querySelector('.add-btn');
    addButton.innerHTML = '<i class="fas fa-save"></i> 保存修改';
    addButton.onclick = saveEditedMemo;
    
    // 滚动到输入区域
    document.querySelector('.memo-input').scrollIntoView({ behavior: 'smooth' });
}

// 保存编辑后的备忘录
async function saveEditedMemo() {
    const titleInput = document.getElementById('memoTitle');
    const contentInput = document.getElementById('memoContent');
    const dueDateInput = document.getElementById('memoDate');
    const id = titleInput.dataset.editId;
    
    const title = titleInput.value.trim();
    const content = contentInput.value.trim();
    const date = dueDateInput.value;
    
    if (title && content) {
        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title,
                    content,
                    date
                }),
                credentials: 'include'
            });
            
            if (response.status === 401) {
                window.location.href = 'login.html';
                return;
            }
            
            if (!response.ok) {
                throw new Error('更新备忘录失败');
            }
            
            // 清空输入框
            titleInput.value = '';
            contentInput.value = '';
            dueDateInput.value = '';
            delete titleInput.dataset.editId;
            
            // 恢复添加按钮
            const addButton = document.querySelector('.add-btn');
            addButton.innerHTML = '<i class="fas fa-plus"></i> 添加备忘录';
            addButton.onclick = addMemo;
            
            // 重新获取备忘录列表
            await fetchMemos();
            showNotification('备忘录已更新', 'success');
        } catch (error) {
            console.error('更新备忘录时出错:', error);
            showNotification('更新备忘录失败，请稍后再试', 'error');
        }
    } else {
        showNotification('请填写标题和内容！', 'warning');
    }
}

// 切换备忘录完成状态
function toggleComplete(id) {
    const index = memos.findIndex(memo => memo.id === id);
    if (index !== -1) {
        // 切换完成状态
        memos[index].completed = !memos[index].completed;
        
        // 保存到本地存储
        localStorage.setItem('memos', JSON.stringify(memos));
        
        // 重新渲染列表
        renderMemos();
        
        // 显示通知
        const status = memos[index].completed ? '已完成' : '未完成';
        showNotification(`备忘录已标记为${status}`, 'success');
    }
}

// 页面初始化
async function initApp() {
    // 检查用户是否已登录
    const isAuthenticated = await checkAuth();
    if (isAuthenticated) {
        // 设置登出按钮
        setupLogout();
        // 获取备忘录列表
        await fetchMemos();
    }
}

// 页面加载时初始化应用
document.addEventListener('DOMContentLoaded', initApp); 