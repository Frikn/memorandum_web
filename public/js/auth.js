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

// 认证相关功能
document.addEventListener('DOMContentLoaded', () => {
    // 获取登录表单
    const loginForm = document.getElementById('loginForm');
    // 获取注册表单
    const registerForm = document.getElementById('registerForm');
    // 获取密码重置表单
    const resetRequestForm = document.getElementById('resetRequestForm');
    
    // 从配置中获取API基础URL
    const API_BASE_URL = window.APP_CONFIG.API_BASE_URL;

    // 处理登录表单提交
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // 获取用户名和密码
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            // 注释掉网络请求部分
            /*
            try {
                // 发送登录请求
                const response = await fetch(`${API_BASE_URL}/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username, password }),
                    credentials: 'include'
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    // 登录成功，跳转到主页
                    window.location.href = '/index.html';
                } else {
                    // 显示错误消息
                    showError(data.message || '登录失败，请检查用户名和密码');
                }
            } catch (error) {
                console.error('登录请求出错:', error);
                showError('网络错误，请稍后再试');
            }
            */
            
            // 模拟登录行为（本地模式，无网络请求）
            console.log('模拟登录:', { username, password });
            
            // 简单验证（仅作为示例）
            if (username && password) {
                // 存储用户信息到本地，以便示例能继续工作
                localStorage.setItem('currentUser', JSON.stringify({ 
                    username: username,
                    isLoggedIn: true
                }));
                
                // 跳转到主页
                window.location.href = 'index.html';
            } else {
                // 显示错误
                const errorDiv = document.createElement('div');
                errorDiv.className = 'error-message';
                errorDiv.textContent = '请输入用户名和密码';
                loginForm.insertBefore(errorDiv, loginForm.firstChild);
            }
        });
    }
    
    // 处理注册表单提交
    if (registerForm) {
        const passwordInput = document.getElementById('password');
        const confirmPasswordInput = document.getElementById('confirmPassword');
        
        // 如果有密码强度条
        const strengthBar = document.querySelector('.strength-indicator');
        const strengthText = document.querySelector('.strength-text');
        
        // 密码输入时实时检查强度
        if (passwordInput && strengthBar && strengthText) {
            passwordInput.addEventListener('input', () => {
                const strength = checkPasswordStrength(passwordInput.value);
                updatePasswordStrengthUI(strength, strengthBar, strengthText);
            });
        }
        
        // 表单提交
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // 获取表单数据
            const username = document.getElementById('username').value;
            const email = document.getElementById('email').value;
            const password = passwordInput.value;
            const confirmPassword = confirmPasswordInput.value;
            
            // 验证两次密码是否一致
            if (password !== confirmPassword) {
                showError(registerForm, '两次输入的密码不一致');
                return;
            }
            
            // 验证密码强度
            const strength = checkPasswordStrength(password);
            if (strength.score < 2) {
                showError(registerForm, '密码强度不足，请设置更复杂的密码');
                return;
            }
            
            // 注释掉网络请求部分
            /*
            try {
                // 发送注册请求
                const response = await fetch(`${API_BASE_URL}/register`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username, email, password }),
                    credentials: 'include'
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    // 注册成功，显示成功消息并提供登录链接
                    registerForm.innerHTML = `
                        <div class="success-message">
                            <h3>注册成功！</h3>
                            <p>您已成功注册账号，请<a href="login.html">点击此处登录</a>。</p>
                        </div>
                    `;
                } else {
                    // 显示错误消息
                    showError(data.message || '注册失败，请稍后再试');
                }
            } catch (error) {
                console.error('注册请求出错:', error);
                showError('网络错误，请稍后再试');
            }
            */
            
            // 模拟注册行为（本地模式，无网络请求）
            console.log('模拟注册:', { username, email, password });
            
            // 存储用户信息到本地，以便示例能继续工作
            localStorage.setItem('registeredUser', JSON.stringify({ 
                username: username,
                email: email
            }));
            
            // 显示成功消息
            registerForm.innerHTML = `
                <div class="success-message">
                    <h3>注册成功！</h3>
                    <p>您已成功注册账号，请<a href="login.html">点击此处登录</a>。</p>
                </div>
            `;
        });
    }
    
    // 处理密码重置请求
    if (resetRequestForm) {
        resetRequestForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // 获取邮箱
            const email = document.getElementById('email').value;
            
            // 注释掉网络请求部分
            /*
            try {
                // 发送重置密码请求
                const response = await fetch(`${API_BASE_URL}/request-password-reset`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email })
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    // 请求成功，显示成功消息
                    resetRequestForm.innerHTML = `
                        <div class="success-message">
                            <h3>重置链接已发送</h3>
                            <p>我们已经向您的邮箱发送了一封包含密码重置链接的邮件，请查收。</p>
                            <p>如果您在几分钟内没有收到邮件，请检查垃圾邮件文件夹。</p>
                            <p><a href="login.html">返回登录页面</a></p>
                        </div>
                    `;
                } else {
                    // 显示错误消息
                    showError(data.message || '无法发送重置链接，请稍后再试');
                }
            } catch (error) {
                console.error('重置密码请求出错:', error);
                showError('网络错误，请稍后再试');
            }
            */
            
            // 模拟密码重置请求（本地模式，无网络请求）
            console.log('模拟密码重置请求:', { email });
            
            // 显示成功消息
            resetRequestForm.innerHTML = `
                <div class="success-message">
                    <h3>重置链接已发送</h3>
                    <p>在本地模式下，不会真正发送邮件。这只是一个演示。</p>
                    <p><a href="login.html">返回登录页面</a></p>
                </div>
            `;
        });
    }
    
    // 工具函数：显示错误消息
    function showError(message) {
        // 移除已有的错误消息
        const existingError = document.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
        
        // 创建新的错误消息元素
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        
        // 在表单开始处插入错误消息
        const form = document.querySelector('form');
        form.insertBefore(errorDiv, form.firstChild);
    }
    
    // 工具函数：检查密码强度
    function checkPasswordStrength(password) {
        // 初始分数
        let score = 0;
        let feedback = [];
        
        // 长度检查
        if (password.length < 8) {
            feedback.push('密码长度应至少为8个字符');
        } else {
            score += 1;
        }
        
        // 复杂性检查
        if (/[A-Z]/.test(password)) score += 1;
        if (/[a-z]/.test(password)) score += 1;
        if (/[0-9]/.test(password)) score += 1;
        if (/[^A-Za-z0-9]/.test(password)) score += 1;
        
        if (!/[A-Z]/.test(password)) feedback.push('应包含至少一个大写字母');
        if (!/[a-z]/.test(password)) feedback.push('应包含至少一个小写字母');
        if (!/[0-9]/.test(password)) feedback.push('应包含至少一个数字');
        if (!/[^A-Za-z0-9]/.test(password)) feedback.push('应包含至少一个特殊字符');
        
        // 返回结果
        return {
            score: score,
            feedback: feedback,
            text: getStrengthText(score)
        };
    }
    
    // 工具函数：根据分数获取强度文本
    function getStrengthText(score) {
        if (score <= 1) return '弱';
        if (score <= 3) return '中';
        return '强';
    }
    
    // 工具函数：更新密码强度UI
    function updatePasswordStrengthUI(strength, strengthBar, strengthText) {
        // 更新强度条
        let percentage = (strength.score / 5) * 100;
        strengthBar.style.width = `${percentage}%`;
        
        // 根据强度设置颜色
        if (strength.score <= 1) {
            strengthBar.style.backgroundColor = '#e74c3c'; // 红色
        } else if (strength.score <= 3) {
            strengthBar.style.backgroundColor = '#f39c12'; // 黄色
        } else {
            strengthBar.style.backgroundColor = '#27ae60'; // 绿色
        }
        
        // 更新文本
        strengthText.textContent = `密码强度: ${strength.text}`;
        
        // 显示反馈
        const feedbackElement = document.querySelector('.password-feedback');
        if (feedbackElement) {
            if (strength.feedback.length > 0) {
                feedbackElement.innerHTML = strength.feedback.map(item => `<li>${item}</li>`).join('');
                feedbackElement.style.display = 'block';
            } else {
                feedbackElement.style.display = 'none';
            }
        }
    }
}); 