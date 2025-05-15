'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { TodoCard } from '@/components/TodoCard';
import { Todo } from '@/components/TodoCard';
import { X, User } from 'lucide-react';
import Link from 'next/link';

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
    <div className="min-h-screen bg-[#0F0F1A] py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white flex items-center">
            <span className="mr-2 text-2xl">✅</span> 나의 할 일
          </h1>
          
          <div className="flex space-x-2">
            <Link 
              href="/clients" 
              className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white py-2 px-4 rounded-lg flex items-center transition-all duration-300 shadow-lg hover:shadow-amber-700/30 border border-amber-500/30 text-sm"
            >
              <span className="mr-2">🏢</span> 광고주 목록
            </Link>
            <Link 
              href="/dashboard" 
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white py-2 px-4 rounded-lg flex items-center transition-all duration-300 shadow-lg hover:shadow-blue-700/30 border border-blue-500/30 text-sm"
            >
              <span className="mr-2">📊</span> 대시보드
            </Link>
          </div>
        </div>
        
        {/* 필터 버튼 */}
        <div className="bg-[#151523] p-4 rounded-lg shadow-xl mb-6 border border-white/10">
          <div className="flex justify-between items-center flex-wrap gap-2">
            <div className="flex space-x-2 flex-wrap gap-2">
              <button 
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filter === 'all' 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-700/30' 
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 border border-white/10'
                }`}
              >
                전체
              </button>
              <button 
                onClick={() => setFilter('pending')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filter === 'pending' 
                    ? 'bg-amber-600 text-white shadow-lg shadow-amber-700/30' 
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 border border-white/10'
                }`}
              >
                진행 중
              </button>
              <button 
                onClick={() => setFilter('completed')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filter === 'completed' 
                    ? 'bg-green-600 text-white shadow-lg shadow-green-700/30' 
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 border border-white/10'
                }`}
              >
                완료됨
              </button>
            </div>
            
            <div className="text-sm text-slate-300">
              총 {todos.length}개의 할 일, {todos.filter(t => t.completed).length}개 완료됨
            </div>
          </div>
        </div>
        
        {/* 할 일 목록 */}
        <div className="bg-[#151523] rounded-lg shadow-xl p-6 border border-white/10">
          <div className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent"></div>
              </div>
            ) : error ? (
              <div className="bg-red-900/30 border border-red-500/30 text-red-300 p-4 rounded-lg">
                <div className="font-medium flex items-center mb-1">
                  <span className="mr-2">⚠️</span> 오류 발생
                </div>
                <p className="text-sm">{error}</p>
                <button 
                  onClick={fetchTodos} 
                  className="mt-2 text-red-300 bg-red-950/50 border border-red-500/30 px-3 py-1 rounded-md text-sm hover:bg-red-900/50 transition-colors"
                >
                  다시 시도
                </button>
              </div>
            ) : filteredTodos.length === 0 ? (
              <div className="text-center py-10 text-slate-400">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-medium mb-2 text-white">할 일이 없습니다</h3>
                <p>{filter === 'all' ? '등록된 할 일이 없습니다.' : filter === 'pending' ? '진행 중인 할 일이 없습니다.' : '완료된 할 일이 없습니다.'}</p>
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
        </div>
      </div>
      
      {/* 담당자 변경 모달 */}
      {showAssignModal && selectedTodoId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-[#151523] rounded-lg shadow-xl p-6 w-full max-w-md transform transition-all animate-scale-up border border-white/10">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-white">담당자 변경</h3>
              <button 
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedTodoId(null);
                }}
                className="bg-slate-800 hover:bg-slate-700 rounded-full w-8 h-8 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            {isLoadingUsers ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent"></div>
              </div>
            ) : (
              <>
                <p className="text-sm text-slate-400 mb-4">
                  이 할 일을 담당할 사용자를 선택하세요. <b className="text-slate-200">현재 담당자를 다시 선택하거나 다른 담당자로 변경할 수 있습니다.</b>
                </p>
                
                <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto pr-1 mb-4">
                  {users.map(user => {
                    const todo = todos.find(t => t.id === selectedTodoId);
                    const isCurrentAssignee = todo && todo.assignedTo === user.id;
                    
                    return (
                      <button
                        key={user.id}
                        className={`flex items-center p-3 rounded-lg transition-all ${
                          isCurrentAssignee 
                            ? 'bg-blue-900/30 text-blue-100 border border-blue-500/50 shadow-inner shadow-blue-700/20'
                            : 'bg-[#1e1e30] text-white hover:bg-[#242438] border border-white/10'
                        }`}
                        onClick={() => handleAssignTodo(selectedTodoId, user.id)}
                      >
                        {user.imageUrl ? (
                          <img 
                            src={user.imageUrl} 
                            alt={user.name} 
                            className="w-10 h-10 rounded-full mr-3 border border-white/20"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center mr-3 text-slate-300">
                            <User className="h-5 w-5" />
                          </div>
                        )}
                        <div className="text-left">
                          <div className={isCurrentAssignee ? 'font-medium' : ''}>
                            {user.name}
                            {isCurrentAssignee && <span className="ml-2 text-xs text-blue-300">(현재 담당자)</span>}
                          </div>
                          {user.department && (
                            <div className="text-xs text-slate-400">{user.department}</div>
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