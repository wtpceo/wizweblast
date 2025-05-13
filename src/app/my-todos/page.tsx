'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Header } from '@/components/Header';
import Link from 'next/link';
import { ClientTodo as BaseClientTodo } from '@/lib/mock-data';
import { format, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';
import { TodoCard } from '@/components/TodoCard';
import { X, User } from 'lucide-react';

// ClientTodo 타입 확장
interface ClientTodo extends BaseClientTodo {
  assigneeName?: string;
  assigneeAvatar?: string;
  createdBy?: string;
}

// 사용자 인터페이스 정의
interface UserInfo {
  id: string;
  name: string;
  imageUrl?: string;
}

export default function MyTodosPage() {
  const [todos, setTodos] = useState<ClientTodo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'mine' | 'assigned'>('all');
  const router = useRouter();
  const { isSignedIn, isLoaded, user } = useUser();
  
  // 담당자 변경 관련 상태
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedTodoId, setSelectedTodoId] = useState<string | null>(null);
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  
  // 할 일 목록 가져오기
  const fetchTodos = async () => {
    try {
      setIsLoading(true);
      
      // API에서 할 일 목록 조회
      const userId = user?.id;
      if (!userId) {
        return;
      }
      
      // API 요청 (에러 상세 정보 포함)
      const response = await fetch(`/api/todos?assignedTo=${userId}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: '알 수 없는 오류' }));
        throw new Error(`할 일 목록을 가져오는 데 실패했습니다. (${response.status}: ${errorData.error || response.statusText})`);
      }
      
      const data = await response.json();
      
      // 데이터 가공 - 담당자 이름과 createdBy 필드 추가
      const processedData = data.map((todo: any) => ({
        ...todo,
        // API에서 받은 created_by 필드를 createdBy로 매핑, 없으면 현재 사용자 ID
        createdBy: todo.created_by || userId
      }));
      
      // 데이터 저장 및 상태 업데이트
      setTodos(processedData);
      setError(null);
      
      // 로컬 스토리지에 캐싱 (순수하게 오프라인 복구용)
      try {
        localStorage.setItem('wizweblast_todos', JSON.stringify(processedData));
      } catch (storageErr) {
        console.error('로컬 스토리지 저장 오류:', storageErr);
      }
    } catch (err) {
      console.error('할 일 목록 로딩 오류:', err);
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
      
      // 로컬 스토리지에서 복구 시도 (네트워크 오류 시에만)
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
  
  // 사용자 목록 가져오기
  const fetchUsers = async () => {
    try {
      setIsLoadingUsers(true);
      
      const response = await fetch('/api/users');
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: '알 수 없는 오류' }));
        throw new Error(`사용자 목록을 가져오는 데 실패했습니다. (${response.status}: ${errorData.error || response.statusText})`);
      }
      
      const data = await response.json();
      
      setUsers(data);
    } catch (err) {
      console.error('사용자 목록 로딩 오류:', err);
      alert('사용자 목록을 불러오는 데 실패했습니다.');
    } finally {
      setIsLoadingUsers(false);
    }
  };
  
  // 담당자 변경 모달 열기
  const handleOpenAssignModal = (todoId: string) => {
    setSelectedTodoId(todoId);
    setShowAssignModal(true);
    
    // 사용자 목록이 없는 경우에만 조회
    if (users.length === 0) {
      fetchUsers();
    }
  };
  
  // 담당자 변경 처리
  const handleAssignTodo = async (todoId: string, newAssigneeId: string) => {
    try {
      // 현재 할 일 정보 확인
      const currentTodo = todos.find(todo => todo.id === todoId);
      if (!currentTodo) {
        throw new Error('할 일을 찾을 수 없습니다.');
      }
      
      // 담당자 정보 가져오기
      const assignee = users.find(u => u.id === newAssigneeId);
      const assigneeName = assignee ? assignee.name : '담당자 미지정';
      
      // API 호출
      const response = await fetch(`/api/todos/${todoId}/assign?force=true`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          newAssigneeId
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: '알 수 없는 오류' }));
        throw new Error(`담당자 변경에 실패했습니다. (${response.status}: ${errorData.error || response.statusText})`);
      }
      
      // 성공 시 UI 업데이트
      setTodos(prevTodos => 
        prevTodos.map(todo => 
          todo.id === todoId 
            ? {
                ...todo,
                assignedTo: newAssigneeId,
                assigneeName: assigneeName,
                assigneeAvatar: assignee?.imageUrl,
              }
            : todo
        )
      );
      
      // 모달 닫기
      setShowAssignModal(false);
      setSelectedTodoId(null);
    } catch (err) {
      console.error('담당자 변경 오류:', err);
      alert(`담당자 변경 중 오류: ${err instanceof Error ? err.message : '알 수 없는 오류'}`);
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
      
      // 임시 ID(temp-)로 시작하는 할 일은 로컬에서만 처리
      if (todoId.startsWith('temp-')) {
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
          return; // API 호출 없이 함수 종료
        } catch (storageErr) {
          console.error('로컬 스토리지 업데이트 오류:', storageErr);
        }
      }
      
      // 새로운 API 엔드포인트 사용
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
        throw new Error('서버 응답을 처리할 수 없습니다.');
      }
      
      if (!response.ok) {
        // API 실패 시 롤백
        setTodos(todos);
        
        // 스키마 오류인 경우, 스키마 업데이트 시도
        if (data.suggestion && data.suggestion.includes('/api/update-todos-schema')) {
          // 스키마 업데이트 API 호출
          const schemaUpdateResponse = await fetch('/api/update-todos-schema', {
            method: 'POST'
          });
          
          if (schemaUpdateResponse.ok) {
            // 다시 API 호출
            return handleToggleComplete(todoId, currentStatus);
          }
        }
        
        throw new Error(data.error || `상태 변경에 실패했습니다. (${response.status})`);
      }
      
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
          }
        } catch (storageErr) {
          console.error('로컬 스토리지 업데이트 오류:', storageErr);
        }
      } else {
        // 서버 응답이 성공이지만 todo 데이터가 없는 경우, 기존 옵티미스틱 업데이트 유지
      }
    } catch (err) {
      console.error('할 일 상태 변경 오류:', err);
      
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
    } else if (filter === 'mine') {
      filteredTodos = todos.filter(todo => todo.assignedTo === user?.id);
    } else if (filter === 'assigned') {
      filteredTodos = todos.filter(todo => todo.assignedTo !== user?.id && todo.createdBy === user?.id);
    }
    
    // 담당자별로 그룹화
    const myTodos = filteredTodos.filter(todo => todo.assignedTo === user?.id);
    const assignedByMe = filteredTodos.filter(todo => todo.assignedTo !== user?.id && todo.createdBy === user?.id);
    
    // 광고주별로 그룹화
    const groupedMyTodos: Record<string, ClientTodo[]> = {};
    const groupedAssignedByMe: Record<string, ClientTodo[]> = {};
    
    // 내가 담당하는 할일 그룹화
    myTodos.forEach(todo => {
      const clientId = todo.clientId;
      if (!groupedMyTodos[clientId]) {
        groupedMyTodos[clientId] = [];
      }
      groupedMyTodos[clientId].push(todo);
    });
    
    // 내가 배정한 할일 그룹화
    assignedByMe.forEach(todo => {
      const clientId = todo.clientId;
      if (!groupedAssignedByMe[clientId]) {
        groupedAssignedByMe[clientId] = [];
      }
      groupedAssignedByMe[clientId].push(todo);
    });
    
    return {
      myTodos: groupedMyTodos,
      assignedByMe: groupedAssignedByMe,
      hasMyTodos: Object.keys(groupedMyTodos).length > 0,
      hasAssignedByMe: Object.keys(groupedAssignedByMe).length > 0,
      isEmpty: filteredTodos.length === 0
    };
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
            <Link href="/clients" className="bg-white text-[#FF9800] px-4 py-2 rounded-lg hover:bg-opacity-90 transition-all duration-200 flex items-center text-sm font-medium shadow-sm hover:shadow">
              <span className="mr-2">🏢</span> 광고주 목록으로 이동
            </Link>
            <Link href="/dashboard" className="bg-white text-[#2251D1] px-4 py-2 rounded-lg hover:bg-opacity-90 transition-all duration-200 flex items-center text-sm font-medium shadow-sm hover:shadow">
              <span className="mr-2">📊</span> 대시보드로 돌아가기
            </Link>
          </div>
        }
      />
      
      <div className="container mx-auto px-4 py-6">
        {/* 필터 탭 */}
        <div className="bg-white rounded-lg shadow-sm mb-6 p-4">
          <div className="flex justify-between items-center flex-wrap gap-2">
            <div className="flex items-center space-x-2 flex-wrap gap-2">
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
                onClick={() => setFilter('mine')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filter === 'mine' 
                    ? 'bg-[#FF9800] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                내 할 일만
              </button>
              <button
                onClick={() => setFilter('assigned')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filter === 'assigned' 
                    ? 'bg-[#2196F3] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                내가 배정한 할 일
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
        {todosByClient.isEmpty && (
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
        {todosByClient.hasMyTodos && (
          <div className="bg-white rounded-lg shadow-sm mb-6 overflow-hidden">
            <div className="bg-[#EEF2FB] px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-bold flex items-center">
                <span className="text-xl mr-2">👤</span>
                <span className="text-[#2251D1]">나의 할 일</span>
              </h3>
            </div>
            
            <div className="p-4">
              {Object.entries(todosByClient.myTodos).map(([clientId, clientTodos]) => (
                <div key={clientId} className="mb-6">
                  <div className="flex items-center mb-3 border-b pb-2">
                    <span className="text-lg mr-2">{clientTodos[0].clientIcon || '🏢'}</span>
                    <Link href={`/clients/${clientId}`} className="text-gray-700 font-medium hover:underline">
                      {clientTodos[0].clientName || '광고주'}
                    </Link>
                    <span className="ml-2 text-sm text-gray-500">
                      {clientTodos.length}개의 할 일
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    {clientTodos.map(todo => (
                      <TodoCard 
                        key={todo.id}
                        todo={{
                          ...todo,
                          // 담당자 이름이 없거나 '담당자 미지정'인 경우 처리
                          assigneeName: todo.assigneeName && todo.assigneeName !== '담당자 미지정' 
                            ? todo.assigneeName 
                            : '담당자 미지정'
                        }}
                        onComplete={handleToggleComplete}
                        onDelete={handleDeleteTodo}
                        onAssigneeChange={handleOpenAssignModal}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {todosByClient.hasAssignedByMe && (
          <div className="bg-white rounded-lg shadow-sm mb-6 overflow-hidden">
            <div className="bg-[#EEF2FB] px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-bold flex items-center">
                <span className="text-xl mr-2">👥</span>
                <span className="text-[#2251D1]">내가 배정한 할 일</span>
              </h3>
            </div>
            
            <div className="p-4">
              {Object.entries(todosByClient.assignedByMe).map(([clientId, clientTodos]) => (
                <div key={clientId} className="mb-6">
                  <div className="flex items-center mb-3 border-b pb-2">
                    <span className="text-lg mr-2">{clientTodos[0].clientIcon || '🏢'}</span>
                    <Link href={`/clients/${clientId}`} className="text-gray-700 font-medium hover:underline">
                      {clientTodos[0].clientName || '광고주'}
                    </Link>
                    <span className="ml-2 text-sm text-gray-500">
                      {clientTodos.length}개의 할 일
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    {clientTodos.map(todo => (
                      <TodoCard 
                        key={todo.id}
                        todo={{
                          ...todo,
                          // 담당자 이름이 없거나 '담당자 미지정'인 경우 처리
                          assigneeName: todo.assigneeName && todo.assigneeName !== '담당자 미지정' 
                            ? todo.assigneeName 
                            : '담당자 미지정'
                        }}
                        onComplete={handleToggleComplete}
                        onDelete={handleDeleteTodo}
                        onAssigneeChange={handleOpenAssignModal}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* 담당자 변경 모달 */}
        {showAssignModal && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-auto">
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
                    할 일을 담당할 사용자를 선택하세요. 현재 담당자도 다시 선택할 수 있습니다.
                  </p>
                  <div className="space-y-2">
                    {users.map(user => {
                      const todo = todos.find(t => t.id === selectedTodoId);
                      const isCurrentAssignee = todo && todo.assignedTo === user.id;
                      
                      return (
                        <button
                          key={user.id}
                          className={`flex items-center p-3 border rounded-lg transition-all w-full ${
                            isCurrentAssignee 
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-200 hover:border-blue-300'
                          }`}
                          onClick={() => handleAssignTodo(selectedTodoId!, user.id)}
                        >
                          {user.imageUrl ? (
                            <img src={user.imageUrl} alt={user.name} className="w-8 h-8 rounded-full mr-3" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                              <User className="h-4 w-4 text-gray-500" />
                            </div>
                          )}
                          <span className="font-medium">{user.name}</span>
                          {isCurrentAssignee && (
                            <span className="ml-auto text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                              현재 담당자
                            </span>
                          )}
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
    </div>
  );
} 