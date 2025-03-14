// API基础URL
const API_URL = window.APP_CONFIG.API_BASE_URL;

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

// 显示成功消息
function showSuccess(formElement, message) {
    // 移除已有的错误或成功消息
    const existingMessage = formElement.querySelector('.error-message, .success-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // 创建成功消息元素
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    
    // 将成功消息插入表单的顶部
    formElement.insertBefore(successDiv, formElement.firstChild);
}

// 处理忘记密码表单
if (document.getElementById('forgotPasswordForm')) {
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');
    
    forgotPasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('username').value.trim();
        const email = document.getElementById('email').value.trim();
        
        // 验证表单
        if (!username || !email) {
            return showError(forgotPasswordForm, '用户名和邮箱不能为空');
        }
        
        try {
            const response = await fetch(`${API_URL}/forgot-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, email })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                return showError(forgotPasswordForm, data.error || '处理请求失败，请稍后再试');
            }
            
            // 清空表单
            document.getElementById('username').value = '';
            document.getElementById('email').value = '';
            
            // 显示成功消息
            showSuccess(forgotPasswordForm, '如果您的账户存在，我们已发送密码重置链接到您的邮箱');
        } catch (error) {
            showError(forgotPasswordForm, '处理请求失败，请检查网络连接');
        }
    });
}

// 密码重置功能
document.addEventListener('DOMContentLoaded', () => {
    // 获取重置密码表单
    const resetForm = document.getElementById('resetPasswordForm');
    if (!resetForm) return;

    // 获取URL中的token参数
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    
    // 如果有token，设置到隐藏域中
    if (token) {
        document.getElementById('resetToken').value = token;
    } else {
        // 未提供token，显示错误
        resetForm.innerHTML = `
            <div class="error-message">
                <h3>无效的重置链接</h3>
                <p>您使用的密码重置链接无效或已过期。</p>
                <p><a href="forgot-password.html">请点击此处申请新的重置链接</a></p>
            </div>
        `;
        return;
    }

    // 密码强度验证
    const passwordInput = document.getElementById('password');
    if (passwordInput) {
        passwordInput.addEventListener('input', function() {
            updatePasswordStrengthIndicator(this.value);
        });
    }

    // 表单提交处理
    resetForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        // 验证两次密码是否一致
        if (password !== confirmPassword) {
            showError(resetForm, '两次输入的密码不一致');
            return;
        }
        
        // 验证密码强度
        const strengthResult = checkPasswordStrength(password);
        if (strengthResult.score < 2) {
            showError(resetForm, '密码强度太弱，请按照建议修改密码');
            return;
        }
        
        /* 注释掉网络请求部分
        try {
            const response = await fetch(`${API_URL}/reset-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    token,
                    password
                })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                showError(resetForm, data.error || '重置密码失败，请稍后再试');
                return;
            }
            
            // 重置成功
            resetForm.innerHTML = `
                <div class="success-message">
                    <h3>密码重置成功！</h3>
                    <p>您的密码已经成功重置。</p>
                    <p><a href="login.html">点击此处登录</a></p>
                </div>
            `;
        } catch (error) {
            console.error('重置密码时出错:', error);
            showError(resetForm, '重置密码失败，请检查网络连接');
        }
        */
        
        // 模拟重置密码（本地模式，无网络请求）
        console.log('模拟密码重置:', { token, password });
        
        // 显示成功消息
        resetForm.innerHTML = `
            <div class="success-message">
                <h3>密码重置成功！</h3>
                <p>（本地模式）您的密码已经成功重置。</p>
                <p><a href="login.html">点击此处登录</a></p>
            </div>
        `;
    });
}); 