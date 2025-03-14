import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from './config';

// 导入页面组件
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Header from './components/Header';
import Footer from './components/Footer';

// 导入样式
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 检查用户是否已登录
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // 我们使用后端提供的会话认证，因此不需要token
        const response = await axios.get(`${API_BASE_URL}/me`);
        setUser(response.data);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('认证检查失败:', error);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // 登录函数
  const login = (sessionId, userData) => {
    // 由于使用服务器会话，不需要在本地存储token
    setUser(userData);
    setIsAuthenticated(true);
  };

  // 登出函数
  const logout = async () => {
    try {
      await axios.post(`${API_BASE_URL}/logout`);
    } catch (error) {
      console.error('登出失败:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  // 保护路由组件
  const ProtectedRoute = ({ children }) => {
    if (loading) return <div className="loading">加载中...</div>;
    return isAuthenticated ? children : <Navigate to="/login" />;
  };

  return (
    <Router>
      <div className="app">
        <Header isAuthenticated={isAuthenticated} user={user} onLogout={logout} />
        <main className="main-content">
          {loading ? (
            <div className="loading">加载中...</div>
          ) : (
            <Routes>
              <Route path="/login" element={!isAuthenticated ? <Login onLogin={login} /> : <Navigate to="/dashboard" />} />
              <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/dashboard" />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard user={user} />
                </ProtectedRoute>
              } />
              <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
            </Routes>
          )}
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App; 