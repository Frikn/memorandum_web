import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => {
    setEmail(e.target.value);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await axios.post(`${API_BASE_URL}/forgot-password`, { email });
      setSuccess('密码重置链接已发送到您的邮箱，请查收');
    } catch (err) {
      setError(err.response?.data?.message || '发送重置链接失败，请稍后再试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>忘记密码</h1>
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">电子邮箱</label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit" className="btn" disabled={loading}>
          {loading ? '发送中...' : '发送重置链接'}
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

export default ForgotPassword; 