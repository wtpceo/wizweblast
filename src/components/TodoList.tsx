'use client';

import { useState } from 'react';
import { TodoCard, Todo } from './TodoCard';

interface TodoListProps {
  todos: Todo[];
  onComplete: (id: string, currentStatus: boolean) => void;
  onAssigneeChange?: (id: string) => void;
  onDelete?: (id: string) => void;
  groupByClient?: boolean;
  showEmpty?: boolean;
  emptyMessage?: string;
}

export function TodoList({ 
  todos, 
  onComplete, 
  onAssigneeChange,
  onDelete,
  groupByClient = false,
  showEmpty = true,
  emptyMessage = '등록된 할 일이 없습니다'
}: TodoListProps) {
  // 필터 상태
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  
  // 필터링된 할 일 목록
  const filteredTodos = todos.filter(todo => {
    if (filter === 'all') return true;
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });
  
  // 광고주별로 그룹화
  const getTodosByClient = () => {
    const grouped: Record<string, Todo[]> = {};
    
    filteredTodos.forEach(todo => {
      const clientId = todo.clientId;
      if (!grouped[clientId]) {
        grouped[clientId] = [];
      }
      grouped[clientId].push(todo);
    });
    
    return grouped;
  };
  
  // 광고주별 그룹화된 할 일
  const todosByClient = getTodosByClient();
  
  // 빈 목록 표시
  if (filteredTodos.length === 0 && showEmpty) {
    return (
      <div>
        <div className="flex space-x-2 mb-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              filter === 'all' 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 border border-white/10'
            }`}
          >
            전체
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              filter === 'active' 
                ? 'bg-green-600 text-white shadow-lg shadow-green-900/30'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 border border-white/10'
            }`}
          >
            진행 중
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              filter === 'completed' 
                ? 'bg-slate-600 text-white shadow-lg shadow-slate-900/30'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 border border-white/10'
            }`}
          >
            완료됨
          </button>
        </div>
        
        <div className="bg-[#151523] rounded-lg shadow-xl p-8 text-center border border-white/10">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-xl font-medium mb-2 text-white">할 일이 없습니다</h3>
          <p className="text-slate-400 mb-4">
            {filter === 'all' 
              ? emptyMessage
              : filter === 'active'
                ? '모든 할 일이 완료되었습니다!'
                : '완료된 할 일이 없습니다.'}
          </p>
        </div>
      </div>
    );
  }
  
  // 필터 버튼
  const FilterButtons = () => (
    <div className="flex space-x-2 mb-4">
      <button
        onClick={() => setFilter('all')}
        className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
          filter === 'all' 
            ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30'
            : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 border border-white/10'
        }`}
      >
        전체 ({todos.length})
      </button>
      <button
        onClick={() => setFilter('active')}
        className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
          filter === 'active' 
            ? 'bg-green-600 text-white shadow-lg shadow-green-900/30'
            : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 border border-white/10'
        }`}
      >
        진행 중 ({todos.filter(t => !t.completed).length})
      </button>
      <button
        onClick={() => setFilter('completed')}
        className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
          filter === 'completed' 
            ? 'bg-slate-600 text-white shadow-lg shadow-slate-900/30'
            : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 border border-white/10'
        }`}
      >
        완료됨 ({todos.filter(t => t.completed).length})
      </button>
    </div>
  );
  
  // 그룹화하지 않은 일반 목록
  if (!groupByClient) {
    return (
      <div>
        <FilterButtons />
        
        <div className="space-y-3">
          {filteredTodos.map(todo => (
            <TodoCard
              key={todo.id}
              todo={todo}
              onComplete={onComplete}
              onAssigneeChange={onAssigneeChange}
              onDelete={onDelete}
            />
          ))}
        </div>
      </div>
    );
  }
  
  // 광고주별 그룹화된 목록
  return (
    <div>
      <FilterButtons />
      
      {Object.entries(todosByClient).map(([clientId, clientTodos]) => {
        // 클라이언트 정보는 첫 번째 할 일에서 가져옴
        const clientInfo = clientTodos[0];
        
        return (
          <div key={clientId} className="bg-[#151523] rounded-lg shadow-xl mb-6 overflow-hidden border border-white/10">
            {/* 광고주 헤더 */}
            <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 backdrop-blur-sm px-6 py-4 border-b border-white/10">
              <h2 className="text-lg font-bold flex items-center text-white">
                <span className="text-xl mr-2">{clientInfo.clientIcon || '🏢'}</span>
                <a href={`/clients/${clientId}`} className="hover:text-blue-300 transition-colors">
                  {clientInfo.clientName || '광고주'}
                </a>
                <span className="ml-2 text-sm font-normal text-slate-400">
                  {clientTodos.length}개의 할 일
                </span>
              </h2>
            </div>
            
            {/* 할 일 목록 */}
            <div className="p-4">
              {clientTodos.map(todo => (
                <TodoCard
                  key={todo.id}
                  todo={todo}
                  onComplete={onComplete}
                  onAssigneeChange={onAssigneeChange}
                  onDelete={onDelete}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
} 