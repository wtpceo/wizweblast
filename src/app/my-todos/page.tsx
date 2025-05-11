'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Header } from '@/components/Header';
import Link from 'next/link';
import { ClientTodo } from '@/lib/mock-data';
import { format, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';
import { TodoCard } from '@/components/TodoCard';

export default function MyTodosPage() {
  const [todos, setTodos] = useState<ClientTodo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [showDebug, setShowDebug] = useState(false);
  const [debugLog, setDebugLog] = useState<string>('');
  const router = useRouter();
  const { isSignedIn, isLoaded, user } = useUser();

  // 디버그 로그 추가 함수
  const addDebugLog = (message: string) => {
    setDebugLog(prev => `${new Date().toLocaleTimeString()}: ${message}\n${prev}`);
  };

  // 캐시 삭제 함수
  const clearTodoCache = () => {
    try {
      const keys = Object.keys(localStorage);
      let count = 0;
      
      keys.forEach(key => {
        if (key.startsWith('wizweblast_todos') || key.includes('todos_client_')) {
          localStorage.removeItem(key);
          count++;
        }
      });
      
      addDebugLog(`${count}개의 할 일 관련 캐시가 삭제되었습니다.`);
      
      // 데이터 새로고침
      fetchTodos();
    } catch (err) {
      addDebugLog(`캐시 삭제 중 오류 발생: ${err instanceof Error ? err.message : '알 수 없는 오류'}`);
    }
  };

  // 할 일 목록 가져오기
  const fetchTodos = async () => {
    try {
      setIsLoading(true);
      addDebugLog('할 일 목록 가져오기 시작');
      
      // API에서 할 일 목록 조회
      const userId = user?.id;
      if (!userId) {
        addDebugLog('사용자 ID를 찾을 수 없음. 로그인 확인 필요');
        return;
      }
      
      // API 요청 (에러 상세 정보 포함)
      const response = await fetch(`/api/todos?assignedTo=${userId}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: '알 수 없는 오류' }));
        addDebugLog(`API 오류 (${response.status}): ${errorData.error || response.statusText}`);
        throw new Error(`할 일 목록을 가져오는 데 실패했습니다. (${response.status}: ${errorData.error || response.statusText})`);
      }
      
      const data = await response.json();
      addDebugLog(`${data.length}개 할 일 데이터 받음`);
      
      // 데이터 저장 및 상태 업데이트
      setTodos(data);
      setError(null);
      
      // 로컬 스토리지에 캐싱 (순수하게 오프라인 복구용)
      try {
        localStorage.setItem('wizweblast_todos', JSON.stringify(data));
        addDebugLog('할 일 데이터 로컬 스토리지에 백업 완료 (오프라인 복구용)');
      } catch (storageErr) {
        console.error('로컬 스토리지 저장 오류:', storageErr);
        addDebugLog(`로컬 스토리지 저장 오류: ${storageErr instanceof Error ? storageErr.message : '알 수 없는 오류'}`);
      }
    } catch (err) {
      console.error('할 일 목록 로딩 오류:', err);
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
      addDebugLog(`할 일 목록 로딩 오류: ${err instanceof Error ? err.message : '알 수 없는 오류'}`);
      
      // 로컬 스토리지에서 복구 시도 (네트워크 오류 시에만)
      try {
        addDebugLog('네트워크 오류로 로컬 백업에서 복구 시도 중');
        const storedTodos = localStorage.getItem('wizweblast_todos');
        if (storedTodos) {
          const parsedTodos = JSON.parse(storedTodos);
          if (Array.isArray(parsedTodos) && parsedTodos.length > 0) {
            console.log('[로컬] 로컬 스토리지에서 할 일 데이터를 불러왔습니다:', parsedTodos.length + '개');
            addDebugLog(`로컬 스토리지에서 ${parsedTodos.length}개 할 일 임시 복구 (서버 연결 시 자동 갱신됨)`);
            setTodos(parsedTodos);
          }
        }
      } catch (parseErr) {
        console.error('[로컬] 로컬 스토리지 데이터 파싱 오류:', parseErr);
        addDebugLog(`로컬 스토리지 파싱 오류: ${parseErr instanceof Error ? parseErr.message : '알 수 없는 오류'}`);
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // 할 일 완료 처리
  const handleToggleComplete = async (todoId: string, currentStatus: boolean) => {
    try {
      addDebugLog(`할 일 ID ${todoId} 완료 상태 변경 시작 (${currentStatus} → ${!currentStatus})`);
      
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
      addDebugLog('UI 옵티미스틱 업데이트 완료');
      
      // 임시 ID(temp-)로 시작하는 할 일은 로컬에서만 처리
      if (todoId.startsWith('temp-')) {
        addDebugLog('임시 할 일(temp-)이므로 로컬에서만 상태 변경 처리');
        
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
            addDebugLog('로컬 스토리지 업데이트 완료');
          }
          addDebugLog('임시 할 일 상태 변경 완료');
          return; // API 호출 없이 함수 종료
        } catch (storageErr) {
          console.error('로컬 스토리지 업데이트 오류:', storageErr);
          addDebugLog(`로컬 스토리지 업데이트 오류: ${storageErr instanceof Error ? storageErr.message : '알 수 없는 오류'}`);
        }
      }
      
      // 새로운 API 엔드포인트 사용
      addDebugLog('새 API 엔드포인트 호출 시작: /api/todos/' + todoId + '/toggle');
      const response = await fetch(`/api/todos/${todoId}/toggle`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      // 응답 데이터 추출 (오류 처리를 포함하여)
      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error('응답 파싱 오류:', parseError);
        addDebugLog(`응답 파싱 오류: ${parseError instanceof Error ? parseError.message : '알 수 없는 오류'}`);
        throw new Error('서버 응답을 처리할 수 없습니다.');
      }
      
      if (!response.ok) {
        // API 실패 시 롤백
        setTodos(todos);
        
        // 스키마 오류인 경우, 스키마 업데이트 시도
        if (data.suggestion && data.suggestion.includes('/api/update-todos-schema')) {
          addDebugLog('스키마 업데이트 필요: ' + data.message);
          
          // 스키마 업데이트 API 호출
          const schemaUpdateResponse = await fetch('/api/update-todos-schema', {
            method: 'POST'
          });
          
          if (schemaUpdateResponse.ok) {
            addDebugLog('스키마 업데이트 성공, 다시 시도합니다.');
            // 다시 API 호출
            return handleToggleComplete(todoId, currentStatus);
          } else {
            addDebugLog('스키마 업데이트 실패');
          }
        }
        
        addDebugLog(`API 오류 (${response.status}): ${data.error || '알 수 없는 오류'}`);
        throw new Error(data.error || `상태 변경에 실패했습니다. (${response.status})`);
      }
      
      console.log('할 일 완료 상태 변경 응답:', data);
      addDebugLog(`API 응답 성공: ${data.success ? '성공' : '실패'}`);
      
      if (data.success && data.todo) {
        // API 응답의 todo 데이터로 상태 업데이트
        const updatedTodo = {
          ...data.todo,
          // 일부 필드가 없을 경우에 대비한 기본값 설정
          clientId: data.todo.clientId || data.todo.client_id || todoId,
          clientName: data.todo.clientName || '광고주',
          clientIcon: data.todo.clientIcon || '🏢',
          content: data.todo.content || '할 일',
          assignedTo: data.todo.assignedTo || data.todo.assigned_to || user?.id,
          completed: data.todo.completed,
          createdAt: data.todo.createdAt || data.todo.created_at || new Date().toISOString(),
          completedAt: data.todo.completedAt || data.todo.completed_at || undefined
        };
        
        addDebugLog(`업데이트된 할 일 데이터: 완료=${updatedTodo.completed}, 완료일=${updatedTodo.completedAt || '없음'}`);
        
        // 상태 업데이트
        setTodos(prevTodos => prevTodos.map(todo => 
          todo.id === todoId ? { ...todo, ...updatedTodo } : todo
        ));
        
        // 로컬 스토리지 업데이트
        try {
          const storedTodos = localStorage.getItem('wizweblast_todos');
          if (storedTodos) {
            const parsedTodos = JSON.parse(storedTodos);
            const updatedStoredTodos = parsedTodos.map((todo: any) => 
              todo.id === todoId ? { ...todo, ...updatedTodo } : todo
            );
            localStorage.setItem('wizweblast_todos', JSON.stringify(updatedStoredTodos));
            addDebugLog('로컬 스토리지 업데이트 완료');
          }
        } catch (storageErr) {
          console.error('로컬 스토리지 업데이트 오류:', storageErr);
          addDebugLog(`로컬 스토리지 업데이트 오류: ${storageErr instanceof Error ? storageErr.message : '알 수 없는 오류'}`);
        }
      } else {
        // 서버 응답이 성공이지만 todo 데이터가 없는 경우, 기존 옵티미스틱 업데이트 유지
        addDebugLog('서버 응답에 todo 데이터가 없습니다. 옵티미스틱 업데이트를 유지합니다.');
      }
    } catch (err) {
      console.error('할 일 상태 변경 오류:', err);
      addDebugLog(`할 일 상태 변경 오류: ${err instanceof Error ? err.message : '알 수 없는 오류'}`);
      
      // 조용히 오류 처리 - 사용자 경험을 방해하지 않도록
      if (process.env.NODE_ENV !== 'development') {
        // 프로덕션 환경에서만 알림 표시
        alert('상태 변경 중 오류가 발생했습니다. 페이지를 새로고침하고 다시 시도해주세요.');
      }
      
      // 롤백
      setTodos(todos);
    }
  };
  
  // 할 일 삭제 처리
  const handleDeleteTodo = async (todoId: string) => {
    try {
      // 옵티미스틱 UI 업데이트
      const updatedTodos = todos.filter(todo => todo.id !== todoId);
      setTodos(updatedTodos);
      
      // 로컬 스토리지 업데이트
      try {
        localStorage.setItem('wizweblast_todos', JSON.stringify(updatedTodos));
      } catch (storageErr) {
        console.error('로컬 스토리지 업데이트 오류:', storageErr);
      }
      
      // 임시 ID(temp-)로 시작하는 할 일은 로컬에서만 처리
      if (todoId.startsWith('temp-')) {
        addDebugLog(`임시 할 일 ID ${todoId} 로컬에서만 삭제 처리 완료`);
        return; // API 호출 없이 함수 종료
      }
      
      // API 호출
      const response = await fetch(`/api/todos?todoId=${todoId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        // API 실패 시 롤백
        setTodos(todos);
        throw new Error('할 일 삭제에 실패했습니다.');
      }
      
      const data = await response.json();
      console.log('할 일 삭제 성공:', data);
      
      // 재조회
      fetchTodos();
    } catch (err) {
      console.error('할 일 삭제 오류:', err);
      alert('할 일 삭제 중 오류가 발생했습니다.');
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
          <div className="flex space-x-2">
            <button
              onClick={() => setShowDebug(!showDebug)}
              className="bg-gray-600 text-white px-3 py-2 rounded-lg hover:bg-gray-700 text-sm"
            >
              {showDebug ? '디버그 숨기기' : '디버그 보기'}
            </button>
            <button
              onClick={clearTodoCache}
              className="bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 text-sm"
            >
              캐시 삭제
            </button>
            <Link href="/dashboard" className="bg-white text-[#2251D1] px-4 py-2 rounded-lg hover:bg-opacity-90 transition-all duration-200 flex items-center text-sm font-medium shadow-sm hover:shadow">
              <span className="mr-2">📊</span> 대시보드로 돌아가기
            </Link>
          </div>
        }
      />
      
      <div className="container mx-auto px-4 py-6">
        {/* 디버그 패널 */}
        {showDebug && (
          <div className="bg-gray-800 text-green-400 p-4 mb-6 rounded-lg overflow-auto" style={{ maxHeight: '300px' }}>
            <h3 className="text-white font-mono mb-2">디버그 로그:</h3>
            <pre className="font-mono text-xs whitespace-pre-wrap">{debugLog || '로그가 없습니다.'}</pre>
          </div>
        )}
        
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
        {Object.keys(todosByClient).length > 0 ? (
          Object.entries(todosByClient).map(([clientId, clientTodos]) => (
            <div key={clientId} className="bg-white rounded-lg shadow-sm mb-6 overflow-hidden">
              <div className="bg-[#EEF2FB] px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-bold flex items-center">
                  <span className="text-xl mr-2">{clientTodos[0].clientIcon || '🏢'}</span>
                  <Link href={`/clients/${clientId}`} className="hover:underline text-[#2251D1]">
                    {clientTodos[0].clientName || '광고주'}
                  </Link>
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    {clientTodos.length}개의 할 일
                  </span>
                </h3>
              </div>
              
              <div className="p-4">
                {clientTodos.map(todo => (
                  <div key={todo.id} className="mb-3">
                    <TodoCard 
                      todo={todo} 
                      onComplete={handleToggleComplete}
                      onDelete={handleDeleteTodo}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-xl font-medium mb-2">
              {filter === 'all' 
                ? '할 일이 없습니다' 
                : filter === 'active' 
                  ? '모든 할 일을 완료했습니다!' 
                  : '완료된 할 일이 없습니다'
              }
            </h3>
            <p className="text-gray-500 mb-4">
              {filter === 'all' 
                ? '광고주 페이지에서 새로운 할 일을 추가해보세요.' 
                : filter === 'active' 
                  ? '잘 하셨어요! 다른 할 일이 추가되면 여기에 표시됩니다.' 
                  : '할 일을 완료하면 이곳에 표시됩니다.'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 