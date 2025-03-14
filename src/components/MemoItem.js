import React, { useState } from 'react';

function MemoItem({ memo, onDelete, onEdit }) {
  const [expanded, setExpanded] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // 格式化日期
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('zh-CN', options);
  };

  // 获取优先级标签
  const getPriorityLabel = (priority) => {
    switch(priority) {
      case 'high': return '高';
      case 'normal': return '中';
      case 'low': return '低';
      default: return '中';
    }
  };

  // 获取优先级类名
  const getPriorityClass = (priority) => {
    switch(priority) {
      case 'high': return 'priority-high';
      case 'normal': return 'priority-normal';
      case 'low': return 'priority-low';
      default: return 'priority-normal';
    }
  };

  // 切换展开状态
  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  // 处理删除点击
  const handleDeleteClick = () => {
    if (confirmDelete) {
      onDelete(memo.id);
    } else {
      setConfirmDelete(true);
      // 5秒后重置确认状态
      setTimeout(() => {
        setConfirmDelete(false);
      }, 5000);
    }
  };

  // 处理编辑点击
  const handleEditClick = () => {
    onEdit(memo);
  };

  return (
    <div className={`memo-item ${expanded ? 'expanded' : ''}`}>
      <div className="memo-header" onClick={toggleExpand}>
        <h3 className="memo-title">{memo.title}</h3>
        <div className="memo-meta">
          <span className={`memo-priority ${getPriorityClass(memo.priority)}`}>
            {getPriorityLabel(memo.priority)}
          </span>
          <span className="memo-date">{formatDate(memo.createdAt)}</span>
        </div>
      </div>
      
      {expanded && (
        <div className="memo-content">
          <p>{memo.content}</p>
          <div className="memo-actions">
            <button 
              className="btn btn-secondary"
              onClick={handleEditClick}
            >
              编辑
            </button>
            <button 
              className={`btn ${confirmDelete ? 'btn-danger' : 'btn-secondary'}`}
              onClick={handleDeleteClick}
              style={{ marginLeft: '10px' }}
            >
              {confirmDelete ? '确认删除' : '删除'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default MemoItem; 