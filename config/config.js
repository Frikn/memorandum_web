// API配置
const CONFIG = {
    // 开发环境使用localhost
    dev: {
        API_BASE_URL: 'http://localhost:3000/api'
    },
    // 生产环境使用公网地址
    // 注意：在实际部署时，请将下面的地址替换为您的服务器公网IP或域名
    // 如果使用HTTPS，请将http改为https
    prod: {
        API_BASE_URL: 'http://您的服务器IP或域名:3000/api'
        // 示例: 'https://memos.example.com/api'
    }
};

// 根据当前环境选择配置
// 在生产环境部署时，更改此行为 const env = 'prod';
const env = window.location.hostname === 'localhost' ? 'dev' : 'prod';

// 导出配置
const ACTIVE_CONFIG = CONFIG[env];

// 确保配置对象在全局可用
window.APP_CONFIG = ACTIVE_CONFIG; 