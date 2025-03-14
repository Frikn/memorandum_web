import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config';

function ResetPassword() {
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { token } = useParams();
  const navigate = useNavigate();

  const { password, confirmPassword } = formData;

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // 验证密码匹配
    if (password !== confirmPassword) {
      setError('密码不匹配');
      return;
    }

    setLoading(true);

    try {
      await axios.post(`${API_BASE_URL}/reset-password/${token}`, { password });
      setSuccess('密码重置成功！正在跳转到登录页面...');
      
      // 3秒后跳转到登录页面
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || '密码重置失败，请稍后再试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>重置密码</h1>
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="password">新密码</label>
          <input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={handleChange}
            required
            minLength="6"
          />
        </div>
        <div className="form-group">
          <label htmlFor="confirmPassword">确认新密码</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={confirmPassword}
            onChange={handleChange}
            required
            minLength="6"
          />
        </div>
        <button type="submit" className="btn" disabled={loading}>
          {loading ? '重置中...' : '重置密码'}
        </button>
      </form>
      <div className="links" style={{ marginTop: '1rem' }}>
        <p>
          <Link to="/login">返回登录</Link>
        </p>
      </div>
    </div>
  );
}

export default ResetPassword; 