'use client';

import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { Client } from '@/lib/mock-data';
import { TodoCard, Todo } from '@/components/TodoCard';
import { TodoModal } from '@/components/TodoModal';
import Link from 'next/link';

interface TodoSectionProps {
  client: Client;
}

export function TodoSection({ client }: TodoSectionProps) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showTodoModal, setShowTodoModal] = useState(false);
  const { user } = useUser();
  
  // 할 일 목록 가져오기
  const fetchTodos = async () => {
    try {
      setIsLoading(true);
      
      // API에서 할 일 목록 조회
      const userId = user?.id;
      if (!userId) return;
      
      const response = await fetch(`/api/todos?clientId=${client.id}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: '알 수 없는 오류' }));
        console.error('API 응답 상태:', response.status, response.statusText);
        console.error('오류 상세 정보:', errorData);
        throw new Error(`할 일 목록을 가져오는 데 실패했습니다. (${response.status}: ${errorData.error || response.statusText})`);
      }
      
      const data = await response.json();
      setTodos(data);
      
      // 로컬 스토리지에 캐싱
      try {
        localStorage.setItem(`wizweblast_todos_client_${client.id}`, JSON.stringify(data));
      } catch (storageErr) {
        console.error('로컬 스토리지 저장 오류:', storageErr);
      }
    } catch (err) {
      console.error('할 일 목록 로딩 오류:', err);
      
      // 로컬 스토리지에서 복구 시도
      try {
        // 클라이언트별 캐시 확인
        const clientSpecificTodos = localStorage.getItem(`wizweblast_todos_client_${client.id}`);
        if (clientSpecificTodos) {
          const parsedTodos = JSON.parse(clientSpecificTodos);
          setTodos(parsedTodos);
          return;
        }
        
        // 전체 할 일 목록에서 필터링
        const storedTodos = localStorage.getItem('wizweblast_todos');
        if (storedTodos) {
          const parsedTodos = JSON.parse(storedTodos);
          // 현재 광고주의 할 일만 필터링
          const clientTodos = parsedTodos.filter((todo: any) => todo.clientId === client.id);
          setTodos(clientTodos);
        }
      } catch (parseErr) {
        console.error('로컬 스토리지 데이터 파싱 오류:', parseErr);
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // 초기 로딩
  useEffect(() => {
    if (user?.id) {
      fetchTodos();
    }
  }, [user?.id, client.id]);
  
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
      
      // 로컬 스토리지 업데이트
      try {
        const storedTodos = localStorage.getItem('wizweblast_todos');
        if (storedTodos) {
          const parsedTodos = JSON.parse(storedTodos);
          const updatedStoredTodos = parsedTodos.map((todo: any) => 
            todo.id === todoId 
              ? { 
                  ...todo, 
                  completed: !currentStatus,
                  completedAt: !currentStatus ? new Date().toISOString() : undefined
                } 
              : todo
          );
          localStorage.setItem('wizweblast_todos', JSON.stringify(updatedStoredTodos));
        }
      } catch (storageErr) {
        console.error('로컬 스토리지 업데이트 오류:', storageErr);
      }
      
      // API 호출
      const response = await fetch(`/api/todos/${todoId}/complete`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          completed: !currentStatus
        }),
      });
      
      if (!response.ok) {
        // API 실패 시 롤백
        setTodos(todos);
        throw new Error('상태 변경에 실패했습니다.');
      }
    } catch (err) {
      console.error('할 일 상태 변경 오류:', err);
      // 롤백
      setTodos(todos);
    }
  };
  
  // 할 일 추가
  const handleAddTodo = async (clientId: string, content: string, assignedTo: string, dueDate?: string) => {
    try {
      // API 호출
      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientId,
          content,
          assignedTo,
          dueDate
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: '알 수 없는 오류' }));
        console.error('API 응답 상태:', response.status, response.statusText);
        console.error('오류 상세 정보:', errorData);
        throw new Error(`할 일 등록에 실패했습니다. (${response.status}: ${errorData.error || response.statusText})`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        // 새 할 일 추가
        const newTodo: Todo = data.todo;
        
        // UI 업데이트
        setTodos(prev => [newTodo, ...prev]);
        
        // 로컬 스토리지 업데이트
        try {
          // 클라이언트별 캐시 업데이트
          const clientSpecificTodos = localStorage.getItem(`wizweblast_todos_client_${client.id}`);
          if (clientSpecificTodos) {
            const parsedTodos = JSON.parse(clientSpecificTodos);
            const updatedTodos = [newTodo, ...parsedTodos];
            localStorage.setItem(`wizweblast_todos_client_${client.id}`, JSON.stringify(updatedTodos));
          }
          
          // 전체 할 일 목록 업데이트
          const storedTodos = localStorage.getItem('wizweblast_todos');
          let todosList = [];
          
          if (storedTodos) {
            todosList = JSON.parse(storedTodos);
          }
          
          todosList.unshift(newTodo);
          localStorage.setItem('wizweblast_todos', JSON.stringify(todosList));
        } catch (storageErr) {
          console.error('로컬 스토리지 저장 오류:', storageErr);
        }
      } else {
        throw new Error(data.error || '할 일 등록 중 알 수 없는 오류가 발생했습니다');
      }
    } catch (err) {
      console.error('할 일 등록 오류:', err);
      alert(err instanceof Error ? err.message : '할 일 등록 중 오류가 발생했습니다.');
    }
  };
  
  // 담당자 변경
  const handleAssigneeChange = (todoId: string) => {
    // 담당자 변경 로직 구현
    alert('담당자 변경 기능은 준비 중입니다.');
  };
  
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">할 일 목록</h2>
        <div className="flex items-center space-x-2">
          <Link href="/my-todos" className="text-sm text-[#2251D1] hover:underline">
            나의 할 일 모아보기
          </Link>
          <button
            onClick={() => setShowTodoModal(true)}
            className="bg-[#2251D1] text-white px-3 py-2 rounded-lg flex items-center text-sm"
          >
            <Plus className="w-4 h-4 mr-1" />
            새 할 일 등록
          </button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="bg-white rounded-lg p-6 text-center">
          <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin mb-2 mx-auto"></div>
          <p className="text-gray-500">할 일 목록을 가져오는 중...</p>
        </div>
      ) : todos.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
          <div className="text-4xl mb-3">📝</div>
          <h3 className="text-lg font-medium mb-2">등록된 할 일이 없습니다</h3>
          <p className="text-gray-500 mb-4">
            이 광고주에 필요한 할 일을 등록하고 관리해보세요
          </p>
          <button
            onClick={() => setShowTodoModal(true)}
            className="bg-[#2251D1] text-white px-4 py-2 rounded-lg inline-flex items-center text-sm"
          >
            <Plus className="w-4 h-4 mr-1" />
            새 할 일 등록하기
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {todos.map(todo => (
            <TodoCard
              key={todo.id}
              todo={todo}
              onComplete={handleToggleComplete}
              onAssigneeChange={handleAssigneeChange}
            />
          ))}
        </div>
      )}
      
      {/* 할 일 등록 모달 */}
      {showTodoModal && (
        <TodoModal
          client={client}
          isOpen={showTodoModal}
          onClose={() => setShowTodoModal(false)}
          onSave={handleAddTodo}
        />
      )}
    </div>
  );
} 