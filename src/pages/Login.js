import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config';

function Login({ onLogin }) {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { username, password } = formData;

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/login`, formData);
      onLogin('session-auth', response.data);
    } catch (err) {
      setError(err.response?.data?.error || '登录失败，请检查您的凭据');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>登录</h1>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">用户名</label>
          <input
            type="text"
            id="username"
            name="username"
            value={username}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">密码</label>
          <input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit" className="btn" disabled={loading}>
          {loading ? '登录中...' : '登录'}
        </button>
      </form>
      <div className="links" style={{ marginTop: '1rem' }}>
        <p>
          没有账号？ <Link to="/register">注册</Link>
        </p>
        <p>
          <Link to="/forgot-password">忘记密码？</Link>
        </p>
      </div>
    </div>
  );
}

export default Login; 