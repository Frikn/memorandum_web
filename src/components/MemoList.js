import React, { useState } from 'react';
import MemoItem from './MemoItem';

function MemoList({ memos, onDelete, onEdit }) {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  // 处理过滤变化
  const handleFilterChange = e => {
    setFilter(e.target.value);
  };

  // 处理搜索变化
  const handleSearchChange = e => {
    setSearchTerm(e.target.value);
  };

  // 处理排序变化
  const handleSortChange = e => {
    setSortBy(e.target.value);
  };

  // 切换排序顺序
  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  // 过滤备忘录
  const filteredMemos = memos.filter(memo => {
    // 按优先级过滤
    if (filter !== 'all' && memo.priority !== filter) {
      return false;
    }
    
    // 按搜索词过滤
    if (
      searchTerm &&
      !memo.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !memo.content.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false;
    }
    
    return true;
  });

  // 排序备忘录
  const sortedMemos = [...filteredMemos].sort((a, b) => {
    let comparison = 0;
    
    if (sortBy === 'date') {
      comparison = new Date(a.createdAt) - new Date(b.createdAt);
    } else if (sortBy === 'title') {
      comparison = a.title.localeCompare(b.title);
    } else if (sortBy === 'priority') {
      const priorityOrder = { low: 1, normal: 2, high: 3 };
      comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  return (
    <div className="memo-list">
      <div className="memo-controls">
        <div className="search-filter">
          <input
            type="text"
            placeholder="搜索备忘录..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="search-input"
          />
          <select
            value={filter}
            onChange={handleFilterChange}
            className="filter-select"
          >
            <option value="all">所有优先级</option>
            <option value="low">低优先级</option>
            <option value="normal">中优先级</option>
            <option value="high">高优先级</option>
          </select>
        </div>
        <div className="sort-controls">
          <select
            value={sortBy}
            onChange={handleSortChange}
            className="sort-select"
          >
            <option value="date">按日期</option>
            <option value="title">按标题</option>
            <option value="priority">按优先级</option>
          </select>
          <button
            onClick={toggleSortOrder}
            className="sort-order-btn"
            title={sortOrder === 'asc' ? '升序' : '降序'}
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      {sortedMemos.length === 0 ? (
        <div className="no-memos">
          <p>没有找到备忘录</p>
        </div>
      ) : (
        <div className="memo-items">
          {sortedMemos.map(memo => (
            <MemoItem
              key={memo.id}
              memo={memo}
              onDelete={onDelete}
              onEdit={onEdit}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default MemoList; 