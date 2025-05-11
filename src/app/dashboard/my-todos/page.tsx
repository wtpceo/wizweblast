'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Header } from '@/components/Header';
import { TodoList } from '@/components/TodoList';
import { Todo } from '@/components/TodoCard';
import { toast } from 'sonner';

export default function MyTodosPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();
  const { isSignedIn, isLoaded, user } = useUser();
  
  // 할 일 목록 가져오기
  const fetchTodos = async () => {
    try {
      setIsLoading(true);
      
      // API에서 할 일 목록 조회
      const userId = user?.id;
      if (!userId) return;
      
      // API 요청
      const response = await fetch(`/api/todos?assignedTo=${userId}`);
      
      if (!response.ok) {
        throw new Error('할 일 목록을 가져오는 데 실패했습니다.');
      }
      
      const data = await response.json();
      
      // 데이터 저장 및 상태 업데이트
      setTodos(data);
      setError(null);
      
      // 로컬 스토리지에 캐싱
      try {
        localStorage.setItem('wizweblast_todos', JSON.stringify(data));
      } catch (storageErr) {
        console.error('로컬 스토리지 저장 오류:', storageErr);
      }
    } catch (err) {
      console.error('할 일 목록 로딩 오류:', err);
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
      
      // 로컬 스토리지에서 복구 시도
      try {
        const storedTodos = localStorage.getItem('wizweblast_todos');
        if (storedTodos) {
          const parsedTodos = JSON.parse(storedTodos);
          if (Array.isArray(parsedTodos) && parsedTodos.length > 0) {
            console.log('[로컬] 로컬 스토리지에서 할 일 데이터를 불러왔습니다:', parsedTodos.length + '개');
            setTodos(parsedTodos);
          }
        }
      } catch (parseErr) {
        console.error('[로컬] 로컬 스토리지 데이터 파싱 오류:', parseErr);
      }
    } finally {
      setIsLoading(false);
    }
  };
  
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
        localStorage.setItem('wizweblast_todos', JSON.stringify(updatedTodos));
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
      
      const data = await response.json();
      if (data.success) {
        toast.success(`할 일이 ${!currentStatus ? '완료' : '미완료'}로 변경되었습니다.`);
      }
    } catch (err) {
      console.error('할 일 상태 변경 오류:', err);
      toast.error('상태 변경 중 오류가 발생했습니다.');
      // 롤백
      setTodos(todos);
    }
  };
  
  // 담당자 변경
  const handleAssigneeChange = async (todoId: string) => {
    const newAssigneeId = prompt('새 담당자 ID를 입력하세요');
    if (!newAssigneeId) return;
    
    try {
      const response = await fetch(`/api/todos/${todoId}/assign`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          newAssigneeId
        }),
      });
      
      if (!response.ok) {
        throw new Error('담당자 변경에 실패했습니다.');
      }
      
      const data = await response.json();
      
      if (data.success) {
        // 목록 새로고침
        toast.success('담당자가 변경되었습니다.');
        fetchTodos();
      }
    } catch (err) {
      console.error('담당자 변경 오류:', err);
      toast.error('담당자 변경 중 오류가 발생했습니다.');
    }
  };
  
  // 로그인 유무 확인
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/');
    } else if (isLoaded && isSignedIn) {
      fetchTodos();
    }
  }, [isLoaded, isSignedIn, router]);
  
  // 키보드 단축키 핸들러
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // '/' 키: 검색창 포커스
      if (e.key === '/' && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        const searchInput = document.getElementById('todo-search');
        if (searchInput) {
          searchInput.focus();
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
  
  // 로딩 중일 때 표시할 화면
  if (!isLoaded || isLoading) {
    return (
      <div className="min-h-screen bg-[#F9FAFD] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-blue-500 border-t-transparent animate-spin mb-4 mx-auto"></div>
          <p className="text-lg text-blue-700 font-medium">로딩 중...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-[#F9FAFD]">
      <Header
        title="나의 할 일 목록"
        description="등록한 모든 할 일을 보고 관리하세요"
        icon="✅"
        actions={
          <div className="space-x-2">
            <input
              id="todo-search"
              type="text"
              placeholder="할 일 검색... ('/' 단축키)"
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        }
      />
      
      <div className="container mx-auto px-4 py-6">
        {/* 오류 메시지 */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-6">
            <h3 className="font-medium flex items-center mb-1">
              <span className="mr-2">⚠️</span> 오류 발생
            </h3>
            <p className="text-sm">{error}</p>
            <button 
              onClick={fetchTodos} 
              className="mt-2 text-red-700 bg-white border border-red-300 px-3 py-1 rounded-md text-sm hover:bg-red-50"
            >
              다시 시도
            </button>
          </div>
        )}
        
        {/* 할 일 목록 */}
        <TodoList 
          todos={todos}
          onComplete={handleToggleComplete}
          onAssigneeChange={handleAssigneeChange}
          groupByClient={true}
          showEmpty={true}
          emptyMessage="아직 등록된 할 일이 없습니다. 광고주 페이지에서 할 일을 추가해보세요."
        />
      </div>
    </div>
  );
} 