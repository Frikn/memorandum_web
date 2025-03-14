import React, { useState, useEffect } from 'react';

function MemoForm({ addMemo, updateMemo, currentMemo, isEditing, cancelEdit }) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    priority: 'normal'
  });
  const [loading, setLoading] = useState(false);

  // 当编辑状态或当前备忘录改变时，更新表单数据
  useEffect(() => {
    if (isEditing && currentMemo) {
      setFormData({
        title: currentMemo.title,
        content: currentMemo.content,
        priority: currentMemo.priority || 'normal'
      });
    } else {
      setFormData({
        title: '',
        content: '',
        priority: 'normal'
      });
    }
  }, [isEditing, currentMemo]);

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);

    let success;
    if (isEditing && currentMemo) {
      success = await updateMemo(currentMemo.id, formData);
    } else {
      success = await addMemo(formData);
    }

    if (success) {
      setFormData({
        title: '',
        content: '',
        priority: 'normal'
      });
    }

    setLoading(false);
  };

  return (
    <div className="memo-form">
      <h2>{isEditing ? '编辑备忘录' : '添加新备忘录'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">标题</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="content">内容</label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            rows="4"
            required
          ></textarea>
        </div>
        <div className="form-group">
          <label htmlFor="priority">优先级</label>
          <select
            id="priority"
            name="priority"
            value={formData.priority}
            onChange={handleChange}
          >
            <option value="low">低</option>
            <option value="normal">中</option>
            <option value="high">高</option>
          </select>
        </div>
        <div className="form-buttons">
          <button type="submit" className="btn" disabled={loading}>
            {loading ? '保存中...' : isEditing ? '更新' : '添加'}
          </button>
          {isEditing && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={cancelEdit}
              style={{ marginLeft: '10px' }}
            >
              取消
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default MemoForm; 