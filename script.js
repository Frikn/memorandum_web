// 从本地存储加载备忘录
let memos = JSON.parse(localStorage.getItem('memos')) || [];

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
    
    memos.forEach((memo, index) => {
        const memoElement = document.createElement('div');
        memoElement.className = memo.completed ? 'memo-item completed' : 'memo-item';
        
        let dueDateHtml = '';
        if (memo.dueDate) {
            dueDateHtml = `<span class="memo-date">截止日期: ${formatDate(memo.dueDate)}</span>`;
        }
        
        memoElement.innerHTML = `
            <h3>${memo.title}</h3>
            <p>${memo.content}</p>
            ${dueDateHtml}
            <span class="memo-date">创建于: ${memo.date}</span>
            <div class="memo-actions">
                <button onclick="toggleComplete(${index})"><i class="fas ${memo.completed ? 'fa-undo' : 'fa-check'}"></i> ${memo.completed ? '取消完成' : '完成'}</button>
                <button onclick="editMemo(${index})"><i class="fas fa-edit"></i> 编辑</button>
                <button class="delete-btn" onclick="deleteMemo(${index})"><i class="fas fa-trash"></i> 删除</button>
            </div>
        `;
        memoList.appendChild(memoElement);
    });
}

// 添加新备忘录
function addMemo() {
    const titleInput = document.getElementById('memoTitle');
    const contentInput = document.getElementById('memoContent');
    const dueDateInput = document.getElementById('memoDate');
    
    const title = titleInput.value.trim();
    const content = contentInput.value.trim();
    const dueDate = dueDateInput.value;
    
    if (title && content) {
        const now = new Date();
        const dateOptions = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        
        memos.push({
            title,
            content,
            dueDate: dueDate,
            date: now.toLocaleDateString('zh-CN', dateOptions),
            completed: false
        });
        
        // 保存到本地存储
        localStorage.setItem('memos', JSON.stringify(memos));
        
        // 清空输入框
        titleInput.value = '';
        contentInput.value = '';
        dueDateInput.value = '';
        
        // 重新渲染列表
        renderMemos();
    } else {
        alert('请填写标题和内容！');
    }
}

// 删除备忘录
function deleteMemo(index) {
    if (confirm('确定要删除这条备忘录吗？')) {
        memos.splice(index, 1);
        localStorage.setItem('memos', JSON.stringify(memos));
        renderMemos();
    }
}

// 编辑备忘录
function editMemo(index) {
    const memo = memos[index];
    const titleInput = document.getElementById('memoTitle');
    const contentInput = document.getElementById('memoContent');
    const dueDateInput = document.getElementById('memoDate');
    
    titleInput.value = memo.title;
    contentInput.value = memo.content;
    
    if (memo.dueDate) {
        dueDateInput.value = memo.dueDate;
    }
    
    // 删除原备忘录
    memos.splice(index, 1);
    localStorage.setItem('memos', JSON.stringify(memos));
    renderMemos();
    
    // 滚动到输入区域
    document.querySelector('.memo-input').scrollIntoView({ behavior: 'smooth' });
}

// 切换备忘录完成状态
function toggleComplete(index) {
    memos[index].completed = !memos[index].completed;
    localStorage.setItem('memos', JSON.stringify(memos));
    renderMemos();
}

// 页面加载时渲染备忘录
document.addEventListener('DOMContentLoaded', renderMemos); 