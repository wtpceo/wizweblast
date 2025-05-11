'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Header } from '@/components/Header';
import Link from 'next/link';
import { ClientTodo } from '@/lib/mock-data';
import { format, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';

export default function MyTodosPage() {
  const [todos, setTodos] = useState<ClientTodo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const router = useRouter();
  const { isSignedIn, isLoaded, user } = useUser();

  // 할 일 목록 가져오기
  const fetchTodos = async () => {
    try {
      setIsLoading(true);
      
      // API에서 할 일 목록 조회
      const userId = user?.id;
      if (!userId) return;
      
      // API 요청 (에러 상세 정보 포함)
      const response = await fetch(`/api/todos?assignedTo=${userId}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: '알 수 없는 오류' }));
        console.error('API 응답 상태:', response.status, response.statusText);
        console.error('오류 상세 정보:', errorData);
        throw new Error(`할 일 목록을 가져오는 데 실패했습니다. (${response.status}: ${errorData.error || response.statusText})`);
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
      const response = await fetch('/api/todos', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          todoId,
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
      alert('상태 변경 중 오류가 발생했습니다.');
    }
  };
  
  // 광고주별로 할 일 그룹화
  const getTodosByClient = () => {
    let filteredTodos = todos;
    
    // 필터 적용
    if (filter === 'active') {
      filteredTodos = todos.filter(todo => !todo.completed);
    } else if (filter === 'completed') {
      filteredTodos = todos.filter(todo => todo.completed);
    }
    
    // 광고주별로 그룹화
    const groupedTodos: Record<string, ClientTodo[]> = {};
    
    filteredTodos.forEach(todo => {
      const clientId = todo.clientId;
      if (!groupedTodos[clientId]) {
        groupedTodos[clientId] = [];
      }
      groupedTodos[clientId].push(todo);
    });
    
    return groupedTodos;
  };
  
  // 광고주별 그룹화된 할 일
  const todosByClient = getTodosByClient();
  
  // 로그인 유무 확인
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/');
    } else if (isLoaded && isSignedIn) {
      fetchTodos();
    }
  }, [isLoaded, isSignedIn, router]);
  
  // 로딩 중일 때 표시할 화면
  if (!isLoaded || isLoading) {
    return (
      <div className="min-h-screen bg-[#F9FAFD] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-[#2251D1] border-t-transparent animate-spin mb-4 mx-auto"></div>
          <p className="text-lg text-[#2251D1] font-medium">로딩 중...</p>
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
          <Link href="/dashboard" className="bg-white text-[#2251D1] px-4 py-2 rounded-lg hover:bg-opacity-90 transition-all duration-200 flex items-center text-sm font-medium shadow-sm hover:shadow">
            <span className="mr-2">📊</span> 대시보드로 돌아가기
          </Link>
        }
      />
      
      <div className="container mx-auto px-4 py-6">
        {/* 필터 탭 */}
        <div className="bg-white rounded-lg shadow-sm mb-6 p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filter === 'all' 
                    ? 'bg-[#2251D1] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                전체 할 일
              </button>
              <button
                onClick={() => setFilter('active')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filter === 'active' 
                    ? 'bg-[#4CAF50] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                진행 중
              </button>
              <button
                onClick={() => setFilter('completed')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filter === 'completed' 
                    ? 'bg-[#9E9E9E] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                완료됨
              </button>
            </div>
            <div className="text-sm text-gray-500">
              총 {todos.length}개의 할 일, {todos.filter(t => t.completed).length}개 완료됨
            </div>
          </div>
        </div>
        
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
        
        {/* 할 일 목록이 비어있는 경우 */}
        {Object.keys(todosByClient).length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-medium mb-2">할 일이 없습니다</h3>
            <p className="text-gray-500 mb-4">
              {filter === 'all' 
                ? '아직 등록된 할 일이 없습니다. 광고주 페이지에서 할 일을 추가해보세요.'
                : filter === 'active'
                  ? '모든 할 일이 완료되었습니다!'
                  : '완료된 할 일이 없습니다.'}
            </p>
            <Link 
              href="/clients"
              className="inline-block bg-[#2251D1] text-white px-4 py-2 rounded-lg hover:bg-[#1a3fa0] transition-all"
            >
              광고주 목록으로 이동
            </Link>
          </div>
        )}
        
        {/* 광고주별 할 일 목록 */}
        {Object.entries(todosByClient).map(([clientId, clientTodos]) => {
          // 클라이언트 정보는 첫 번째 할 일에서 가져옴
          const clientInfo = clientTodos[0];
          
          return (
            <div key={clientId} className="bg-white rounded-lg shadow-sm mb-6 overflow-hidden">
              {/* 광고주 헤더 */}
              <div className="bg-[#EEF2FB] px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-bold flex items-center">
                  <span className="text-xl mr-2">{clientInfo.clientIcon || '🏢'}</span>
                  <Link href={`/clients/${clientId}`} className="hover:underline text-[#2251D1]">
                    {clientInfo.clientName || '광고주'}
                  </Link>
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    {clientTodos.length}개의 할 일
                  </span>
                </h2>
              </div>
              
              {/* 할 일 목록 */}
              <div className="divide-y divide-gray-100">
                {clientTodos.map(todo => (
                  <div 
                    key={todo.id} 
                    className={`px-6 py-4 flex items-center justify-between ${
                      todo.completed ? 'bg-gray-50' : ''
                    }`}
                  >
                    <div className="flex items-start">
                      {/* 체크박스 */}
                      <div className="mr-4 mt-1">
                        <button
                          onClick={() => handleToggleComplete(todo.id, todo.completed)}
                          className={`w-5 h-5 rounded-full border ${
                            todo.completed 
                              ? 'bg-[#4CAF50] border-[#4CAF50] flex items-center justify-center text-white' 
                              : 'border-gray-300 hover:border-[#4CAF50]'
                          }`}
                          aria-label={todo.completed ? "완료 취소하기" : "완료 처리하기"}
                        >
                          {todo.completed && (
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                          )}
                        </button>
                      </div>
                      
                      {/* 할 일 내용 */}
                      <div>
                        <p className={`font-medium ${todo.completed ? 'line-through text-gray-500' : ''}`}>
                          {todo.content}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          등록일: {format(parseISO(todo.createdAt), 'yyyy년 MM월 dd일', { locale: ko })}
                          {todo.completed && todo.completedAt && (
                            <span className="ml-2">
                              완료일: {format(parseISO(todo.completedAt), 'yyyy년 MM월 dd일', { locale: ko })}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    
                    {/* 할 일 액션 */}
                    <div>
                      <Link 
                        href={`/clients/${clientId}`}
                        className="text-xs px-3 py-1.5 rounded-full bg-[#EEF2FB] text-[#2251D1] hover:bg-[#DCE4F9] transition-colors"
                      >
                        광고주 보기
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
} 