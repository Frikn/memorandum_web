import React from 'react';

function Footer() {
  const year = new Date().getFullYear();
  
  return (
    <footer className="footer">
      <div className="footer-container">
        <p>&copy; {year} 备忘录应用 - 保留所有权利</p>
      </div>
    </footer>
  );
}

export default Footer; 