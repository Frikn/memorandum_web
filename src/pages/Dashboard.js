import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import MemoList from '../components/MemoList';
import MemoForm from '../components/MemoForm';

function Dashboard({ user }) {
  const [memos, setMemos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentMemo, setCurrentMemo] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // 获取所有备忘录
  const fetchMemos = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/memos`);
      setMemos(response.data);
      setError('');
    } catch (err) {
      setError('获取备忘录失败，请稍后再试');
      console.error('获取备忘录错误:', err);
    } finally {
      setLoading(false);
    }
  };

  // 组件挂载时获取备忘录
  useEffect(() => {
    fetchMemos();
  }, []);

  // 添加新备忘录
  const addMemo = async (memoData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/memos`, memoData);
      setMemos([...memos, response.data]);
      return true;
    } catch (err) {
      setError('添加备忘录失败，请稍后再试');
      console.error('添加备忘录错误:', err);
      return false;
    }
  };

  // 更新备忘录
  const updateMemo = async (id, memoData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/memos/${id}`, memoData);
      setMemos(memos.map(memo => memo.id === id ? response.data : memo));
      setIsEditing(false);
      setCurrentMemo(null);
      return true;
    } catch (err) {
      setError('更新备忘录失败，请稍后再试');
      console.error('更新备忘录错误:', err);
      return false;
    }
  };

  // 删除备忘录
  const deleteMemo = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/memos/${id}`);
      setMemos(memos.filter(memo => memo.id !== id));
      return true;
    } catch (err) {
      setError('删除备忘录失败，请稍后再试');
      console.error('删除备忘录错误:', err);
      return false;
    }
  };

  // 编辑备忘录
  const editMemo = (memo) => {
    setCurrentMemo(memo);
    setIsEditing(true);
  };

  // 取消编辑
  const cancelEdit = () => {
    setCurrentMemo(null);
    setIsEditing(false);
  };

  return (
    <div>
      <div className="container">
        <h1>欢迎, {user?.username || '用户'}!</h1>
        {error && <div className="alert alert-danger">{error}</div>}
        
        <MemoForm 
          addMemo={addMemo} 
          updateMemo={updateMemo} 
          currentMemo={currentMemo}
          isEditing={isEditing}
          cancelEdit={cancelEdit}
        />
      </div>

      <div className="container">
        <h2>我的备忘录</h2>
        {loading ? (
          <div className="loading">加载中...</div>
        ) : (
          <MemoList 
            memos={memos} 
            onDelete={deleteMemo} 
            onEdit={editMemo} 
          />
        )}
      </div>
    </div>
  );
}

export default Dashboard; 