// API基础URL
const API_URL = 'http://localhost:3000/api/memos';
const AUTH_API_URL = 'http://localhost:3000/api';

// 从服务器加载备忘录
let memos = [];
let currentUser = null;

// 检查认证状态
async function checkAuth() {
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
        });
    }
}

// 获取所有备忘录
async function fetchMemos() {
    try {
        const response = await fetch(API_URL, {
            credentials: 'include'
        });
        
        if (response.status === 401) {
            // 未认证，重定向到登录页面
            window.location.href = 'login.html';
            return;
        }
        
        if (!response.ok) {
            throw new Error('获取备忘录失败');
        }
        
        memos = await response.json();
        renderMemos();
    } catch (error) {
        console.error('获取备忘录时出错:', error);
        showNotification('无法连接到服务器，请检查网络连接', 'error');
    }
}

// 显示通知
function showNotification(message, type = 'info') {
    // 创建通知元素
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // 添加到页面
    document.body.appendChild(notification);
    
    // 3秒后移除
    setTimeout(() => {
        notification.classList.add('hide');
        setTimeout(() => notification.remove(), 500);
    }, 3000);
}

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

// 渲染备忘录列表
function renderMemos() {
    const memoList = document.getElementById('memoList');
    memoList.innerHTML = '';
    
    if (memos.length === 0) {
        memoList.innerHTML = '<div class="empty-message">没有备忘录，添加一个吧！</div>';
        return;
    }
    
    memos.forEach((memo) => {
        const memoElement = document.createElement('div');
        memoElement.className = memo.completed ? 'memo-item completed' : 'memo-item';
        
        let dueDateHtml = '';
        if (memo.date) {
            dueDateHtml = `<span class="memo-date">截止日期: ${formatDate(memo.date)}</span>`;
        }
        
        memoElement.innerHTML = `
            <h3>${memo.title}</h3>
            <p>${memo.content}</p>
            ${dueDateHtml}
            <span class="memo-date">创建于: ${formatDate(memo.createdAt)}</span>
            <div class="memo-actions">
                <button onclick="toggleComplete('${memo.id}')"><i class="fas ${memo.completed ? 'fa-undo' : 'fa-check'}"></i> ${memo.completed ? '取消完成' : '完成'}</button>
                <button onclick="editMemo('${memo.id}')"><i class="fas fa-edit"></i> 编辑</button>
                <button class="delete-btn" onclick="deleteMemo('${memo.id}')"><i class="fas fa-trash"></i> 删除</button>
            </div>
        `;
        memoList.appendChild(memoElement);
    });
}

// 添加新备忘录
async function addMemo() {
    const titleInput = document.getElementById('memoTitle');
    const contentInput = document.getElementById('memoContent');
    const dueDateInput = document.getElementById('memoDate');
    
    const title = titleInput.value.trim();
    const content = contentInput.value.trim();
    const date = dueDateInput.value;
    
    if (title && content) {
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
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
                throw new Error('添加备忘录失败');
            }
            
            // 清空输入框
            titleInput.value = '';
            contentInput.value = '';
            dueDateInput.value = '';
            
            // 重新获取备忘录列表
            await fetchMemos();
            showNotification('备忘录添加成功！', 'success');
        } catch (error) {
            console.error('添加备忘录时出错:', error);
            showNotification('添加备忘录失败，请稍后再试', 'error');
        }
    } else {
        showNotification('请填写标题和内容！', 'warning');
    }
}

// 删除备忘录
async function deleteMemo(id) {
    if (confirm('确定要删除这条备忘录吗？')) {
        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            
            if (response.status === 401) {
                window.location.href = 'login.html';
                return;
            }
            
            if (!response.ok) {
                throw new Error('删除备忘录失败');
            }
            
            await fetchMemos();
            showNotification('备忘录已删除', 'success');
        } catch (error) {
            console.error('删除备忘录时出错:', error);
            showNotification('删除备忘录失败，请稍后再试', 'error');
        }
    }
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
async function toggleComplete(id) {
    const memo = getMemoById(id);
    if (!memo) return;
    
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                completed: !memo.completed
            }),
            credentials: 'include'
        });
        
        if (response.status === 401) {
            window.location.href = 'login.html';
            return;
        }
        
        if (!response.ok) {
            throw new Error('更新备忘录状态失败');
        }
        
        await fetchMemos();
    } catch (error) {
        console.error('更新备忘录状态时出错:', error);
        showNotification('更新备忘录状态失败，请稍后再试', 'error');
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