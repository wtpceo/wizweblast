'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { TodoCard } from '@/components/TodoCard';
import { Todo } from '@/components/TodoCard';
import { X, User } from 'lucide-react';

export default function TodosPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending'>('all');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedTodoId, setSelectedTodoId] = useState<string | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const { user } = useUser();

  // 할 일 목록 가져오기
  const fetchTodos = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // 현재 사용자의 할 일 목록 가져오기
      const response = await fetch(`/api/todos?assignedTo=${user.id}`);
      
      if (!response.ok) {
        throw new Error(`할 일 목록을 가져오는데 실패했습니다: ${response.status}`);
      }
      
      const data = await response.json();
      setTodos(data);
    } catch (err) {
      console.error('할 일 목록 로딩 오류:', err);
      setError(err instanceof Error ? err.message : '할 일 목록을 가져오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // 사용자 목록 가져오기
  const fetchUsers = useCallback(async () => {
    try {
      setIsLoadingUsers(true);
      
      const response = await fetch('/api/users');
      
      if (!response.ok) {
        throw new Error(`사용자 목록을 가져오는데 실패했습니다: ${response.status}`);
      }
      
      const data = await response.json();
      setUsers(data);
      return data;
    } catch (err) {
      console.error('사용자 목록 로딩 오류:', err);
      return [];
    } finally {
      setIsLoadingUsers(false);
    }
  }, []);

  // 초기 로딩
  useEffect(() => {
    if (user?.id) {
      fetchTodos();
    }
  }, [fetchTodos, user?.id]);

  // 할 일 완료 처리
  const handleToggleComplete = async (todoId: string, currentStatus: boolean) => {
    try {
      // 옵티미스틱 UI 업데이트
      const updatedTodos = todos.map(todo => 
        todo.id === todoId 
          ? { 
              ...todo, 
              completed: !currentStatus,
              completedAt: !currentStatus ? new Date().toISOString() : undefined
            } 
          : todo
      );
      
      setTodos(updatedTodos);
      
      // API 호출
      const response = await fetch(`/api/todos/${todoId}/toggle`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        // 실패 시 롤백
        setTodos(todos);
        throw new Error(`상태 변경에 실패했습니다: ${response.status}`);
      }
      
      // 성공 시 데이터 갱신
      fetchTodos();
    } catch (err) {
      console.error('할 일 상태 변경 오류:', err);
      alert('상태 변경 중 오류가 발생했습니다.');
    }
  };

  // 할 일 삭제
  const handleDeleteTodo = async (todoId: string) => {
    if (!confirm('이 할 일을 삭제하시겠습니까?')) return;
    
    try {
      // 옵티미스틱 UI 업데이트
      const updatedTodos = todos.filter(todo => todo.id !== todoId);
      setTodos(updatedTodos);
      
      // API 호출
      const response = await fetch(`/api/todos?todoId=${todoId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        // 실패 시 롤백
        setTodos(todos);
        throw new Error(`삭제에 실패했습니다: ${response.status}`);
      }
    } catch (err) {
      console.error('할 일 삭제 오류:', err);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  // 담당자 변경 모달 표시
  const handleAssigneeChange = async (todoId: string) => {
    try {
      setSelectedTodoId(todoId);
      
      // 사용자 목록 가져오기
      const usersList = await fetchUsers();
      
      if (usersList.length === 0) {
        alert('사용자 목록을 가져올 수 없습니다. 다시 시도해주세요.');
        return;
      }
      
      // 담당자 변경 모달 표시
      setShowAssignModal(true);
    } catch (err) {
      console.error('담당자 변경 준비 오류:', err);
      alert('담당자 변경 준비 중 오류가 발생했습니다.');
    }
  };

  // 담당자 변경 처리
  const handleAssignTodo = async (todoId: string, newAssigneeId: string) => {
    try {
      // 옵티미스틱 UI 업데이트
      const updatedTodos = todos.map(todo => 
        todo.id === todoId 
          ? { ...todo, assignedTo: newAssigneeId } 
          : todo
      );
      
      setTodos(updatedTodos);
      
      // API 호출
      const response = await fetch(`/api/todos/${todoId}/assign`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newAssigneeId }),
      });
      
      if (!response.ok) {
        // 실패 시 롤백
        setTodos(todos);
        throw new Error(`담당자 변경에 실패했습니다: ${response.status}`);
      }
      
      // 모달 닫기
      setShowAssignModal(false);
      setSelectedTodoId(null);
      
      // 데이터 갱신
      fetchTodos();
    } catch (err) {
      console.error('담당자 변경 오류:', err);
      alert('담당자 변경 중 오류가 발생했습니다.');
    }
  };

  // 필터링된 할 일 목록
  const filteredTodos = todos.filter(todo => {
    if (filter === 'all') return true;
    if (filter === 'completed') return todo.completed;
    if (filter === 'pending') return !todo.completed;
    return true;
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">나의 할 일</h1>
      
      {/* 필터 버튼 */}
      <div className="flex space-x-2 mb-6">
        <button 
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-md ${
            filter === 'all' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          전체
        </button>
        <button 
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded-md ${
            filter === 'pending' 
              ? 'bg-amber-500 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          진행 중
        </button>
        <button 
          onClick={() => setFilter('completed')}
          className={`px-4 py-2 rounded-md ${
            filter === 'completed' 
              ? 'bg-green-500 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          완료됨
        </button>
      </div>
      
      {/* 할 일 목록 */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
            {error}
          </div>
        ) : filteredTodos.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <p>{filter === 'all' ? '등록된 할 일이 없습니다.' : '해당하는 할 일이 없습니다.'}</p>
          </div>
        ) : (
          filteredTodos.map(todo => (
            <TodoCard
              key={todo.id}
              todo={todo}
              onComplete={handleToggleComplete}
              onDelete={handleDeleteTodo}
              onAssigneeChange={handleAssigneeChange}
            />
          ))
        )}
      </div>
      
      {/* 담당자 변경 모달 */}
      {showAssignModal && selectedTodoId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md transform transition-all animate-scale-up">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">담당자 변경</h3>
              <button 
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedTodoId(null);
                }}
                className="bg-gray-100 hover:bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            {isLoadingUsers ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-500 mb-4">
                  이 할 일을 담당할 사용자를 선택하세요.
                </p>
                
                <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto mb-4">
                  {users.map(user => {
                    const todo = todos.find(t => t.id === selectedTodoId);
                    const isCurrentAssignee = todo && todo.assignedTo === user.id;
                    
                    return (
                      <button
                        key={user.id}
                        className={`flex items-center p-3 border rounded-lg transition-all ${
                          isCurrentAssignee 
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-blue-300'
                        }`}
                        onClick={() => handleAssignTodo(selectedTodoId, user.id)}
                        disabled={isCurrentAssignee}
                      >
                        {user.imageUrl ? (
                          <img 
                            src={user.imageUrl} 
                            alt={user.name} 
                            className="w-10 h-10 rounded-full mr-3"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                            <User className="h-5 w-5 text-gray-500" />
                          </div>
                        )}
                        <div className="text-left">
                          <div className={isCurrentAssignee ? 'font-medium' : ''}>
                            {user.name}
                            {isCurrentAssignee && <span className="ml-2 text-xs">(현재 담당자)</span>}
                          </div>
                          {user.department && (
                            <div className="text-xs text-gray-500">{user.department}</div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 