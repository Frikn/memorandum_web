// API配置
const CONFIG = {
    // 开发环境使用localhost
    dev: {
        API_BASE_URL: 'http://localhost:3000/api'
    },
    // 生产环境使用公网地址
    // 在实际部署时，请将下面的地址替换为您的服务器公网IP或域名
    prod: {
        API_BASE_URL: 'http://您的服务器IP或域名:3000/api'
    }
};

// 根据当前环境选择配置
const env = window.location.hostname === 'localhost' ? 'dev' : 'prod';

// 导出配置
const ACTIVE_CONFIG = CONFIG[env];

// 确保配置对象在全局可用
window.APP_CONFIG = ACTIVE_CONFIG; 