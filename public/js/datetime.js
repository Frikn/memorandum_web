// 更新当前日期和时间
function updateDateTime() {
    try {
        const now = new Date();
        
        // 更新日期
        const dateOptions = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
        const dateString = now.toLocaleDateString('zh-CN', dateOptions);
        const dateElement = document.getElementById('currentDate');
        if (dateElement) {
            dateElement.textContent = dateString;
        }
        
        // 更新时间
        const timeOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
        const timeString = now.toLocaleTimeString('zh-CN', timeOptions);
        const timeElement = document.getElementById('currentTime');
        if (timeElement) {
            timeElement.textContent = timeString;
        }
    } catch (error) {
        console.error('更新日期时间出错:', error);
    }
}

// 每秒更新一次时间
setInterval(updateDateTime, 1000);

// 初始化时立即更新
document.addEventListener('DOMContentLoaded', updateDateTime); 