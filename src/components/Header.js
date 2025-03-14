import React from 'react';
import { Link } from 'react-router-dom';

function Header({ isAuthenticated, user, onLogout }) {
  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <Link to="/">备忘录应用</Link>
        </div>
        <nav className="nav">
          {isAuthenticated ? (
            <ul className="nav-list">
              <li className="nav-item">
                <span className="welcome-text">你好，{user?.username || '用户'}</span>
              </li>
              <li className="nav-item">
                <button onClick={onLogout} className="btn btn-secondary">
                  登出
                </button>
              </li>
            </ul>
          ) : (
            <ul className="nav-list">
              <li className="nav-item">
                <Link to="/login" className="nav-link">
                  登录
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/register" className="nav-link">
                  注册
                </Link>
              </li>
            </ul>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header; 