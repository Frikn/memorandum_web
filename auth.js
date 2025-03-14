// API基础URL
const API_URL = 'http://localhost:3000/api';

// 密码强度等级
const STRENGTH_LEVELS = {
    0: { text: '非常弱', color: '#e74c3c' },
    1: { text: '弱', color: '#e67e22' },
    2: { text: '中等', color: '#f39c12' },
    3: { text: '强', color: '#27ae60' },
    4: { text: '非常强', color: '#2ecc71' }
};

// 检查密码强度
function checkPasswordStrength(password) {
    let strength = 0;
    const feedback = [];

    // 检查长度
    if (password.length < 8) {
        feedback.push('密码至少需要8个字符');
    } else {
        strength += 1;
    }

    // 检查是否包含大写字母
    if (!/[A-Z]/.test(password)) {
        feedback.push('建议包含至少一个大写字母');
    } else {
        strength += 1;
    }

    // 检查是否包含数字
    if (!/[0-9]/.test(password)) {
        feedback.push('建议包含至少一个数字');
    } else {
        strength += 1;
    }

    // 检查是否包含特殊字符
    if (!/[^A-Za-z0-9]/.test(password)) {
        feedback.push('建议包含至少一个特殊字符');
    } else {
        strength += 1;
    }

    return {
        score: strength,
        level: STRENGTH_LEVELS[strength],
        feedback: feedback
    };
}

// 更新密码强度指示器
function updatePasswordStrengthIndicator(password) {
    const strengthResult = checkPasswordStrength(password);
    const strengthIndicator = document.getElementById('passwordStrength');
    const feedbackElement = document.getElementById('passwordFeedback');
    
    if (strengthIndicator) {
        // 更新强度条
        strengthIndicator.style.width = `${(strengthResult.score / 4) * 100}%`;
        strengthIndicator.style.backgroundColor = strengthResult.level.color;
        
        // 更新强度文本
        const strengthTextElement = document.getElementById('strengthText');
        if (strengthTextElement) {
            strengthTextElement.textContent = strengthResult.level.text;
            strengthTextElement.style.color = strengthResult.level.color;
        }
    }
    
    // 更新反馈信息
    if (feedbackElement) {
        if (strengthResult.feedback.length > 0) {
            feedbackElement.innerHTML = strengthResult.feedback.map(item => `<li>${item}</li>`).join('');
            feedbackElement.style.display = 'block';
        } else {
            feedbackElement.style.display = 'none';
        }
    }
    
    return strengthResult;
}

// 显示错误消息
function showError(formElement, message) {
    // 移除已有的错误消息
    const existingError = formElement.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    // 创建错误消息元素
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    
    // 将错误消息插入表单的顶部
    formElement.insertBefore(errorDiv, formElement.firstChild);
}

// 处理注册表单提交
if (document.getElementById('registerForm')) {
    const registerForm = document.getElementById('registerForm');
    const passwordInput = document.getElementById('password');
    
    // 监听密码输入事件，实时更新强度指示器
    if (passwordInput) {
        passwordInput.addEventListener('input', function() {
            updatePasswordStrengthIndicator(this.value);
        });
    }
    
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        // 验证表单
        if (!username || !password) {
            return showError(registerForm, '用户名和密码不能为空');
        }
        
        if (password !== confirmPassword) {
            return showError(registerForm, '两次输入的密码不一致');
        }
        
        // 检查密码强度
        const strengthResult = checkPasswordStrength(password);
        if (strengthResult.score < 2) {
            return showError(registerForm, '密码强度太弱，请按照建议修改密码');
        }
        
        try {
            const response = await fetch(`${API_URL}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password }),
                credentials: 'include'
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                return showError(registerForm, data.error || '注册失败，请稍后再试');
            }
            
            // 注册成功，重定向到首页
            window.location.href = 'index.html';
        } catch (error) {
            showError(registerForm, '注册失败，请检查网络连接');
        }
    });
}

// 处理登录表单提交
if (document.getElementById('loginForm')) {
    const loginForm = document.getElementById('loginForm');
    
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        
        // 验证表单
        if (!username || !password) {
            return showError(loginForm, '用户名和密码不能为空');
        }
        
        try {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password }),
                credentials: 'include'
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                return showError(loginForm, data.error || '登录失败，请稍后再试');
            }
            
            // 登录成功，重定向到首页
            window.location.href = 'index.html';
        } catch (error) {
            showError(loginForm, '登录失败，请检查网络连接');
        }
    });
} 