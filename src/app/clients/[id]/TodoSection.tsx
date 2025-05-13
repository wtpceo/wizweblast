'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, PlusCircle, X, User } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { Client } from '@/lib/mock-data';
import { TodoCard, Todo as BaseTodo } from '@/components/TodoCard';
import { TodoModal } from '@/components/TodoModal';
import Link from 'next/link';

// Todo 인터페이스 확장
interface Todo extends BaseTodo {
  createdBy?: string;
}

interface TodoSectionProps {
  client: Client;
  onClientUpdate?: (updatedClient: Client) => void;
}

export function TodoSection({ client, onClientUpdate }: TodoSectionProps) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDebug, setShowDebug] = useState(false);
  const [debugLog, setDebugLog] = useState<string>('');
  const [showTodoModal, setShowTodoModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedTodoId, setSelectedTodoId] = useState<string | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'mine' | 'assigned'>('all');
  const { user } = useUser();
  
  // 디버그 로그 추가 함수
  const addDebugLog = useCallback((message: string) => {
    setDebugLog(prev => `${new Date().toLocaleTimeString()}: ${message}\n${prev}`);
  }, []);
  
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
  
  // 사용자 목록 가져오기
  const fetchUsers = useCallback(async () => {
    try {
      setIsLoadingUsers(true);
      addDebugLog('사용자 목록 가져오기 시작');
      
      const response = await fetch('/api/users');
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: '알 수 없는 오류' }));
        throw new Error(`사용자 목록 조회 실패: ${response.status} - ${errorData.error || response.statusText}`);
      }
      
      const data = await response.json();
      addDebugLog(`${data.length}명의 사용자 정보 로드 성공`);
      
      // 사용자 정보에 이름과 이미지 URL 포함
      const usersWithDetails = data.map((user: any) => ({
        ...user,
        displayName: user.name,
        imageUrl: user.imageUrl || null
      }));
      
      setUsers(usersWithDetails);
      return usersWithDetails;
    } catch (err) {
      console.error('사용자 목록 로딩 오류:', err);
      addDebugLog(`사용자 목록 로딩 오류: ${err instanceof Error ? err.message : '알 수 없는 오류'}`);
      return [];
    } finally {
      setIsLoadingUsers(false);
    }
  }, [addDebugLog]);
  
  // 할 일 목록 가져오기
  const fetchTodos = useCallback(async () => {
    try {
      setIsLoading(true);
      addDebugLog(`광고주 ID ${client.id}의 할 일 목록 가져오기 시작`);
      
      // 사용자 목록 먼저 가져오기
      const usersList = await fetchUsers();
      
      // API에서 할 일 목록 조회
      const userId = user?.id;
      if (!userId) {
        addDebugLog('사용자 ID를 찾을 수 없음. 로그인 확인 필요');
        return;
      }
      
      addDebugLog(`API 호출: /api/todos?clientId=${client.id}`);
      const response = await fetch(`/api/todos?clientId=${client.id}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: '알 수 없는 오류' }));
        console.error('API 응답 상태:', response.status, response.statusText);
        console.error('오류 상세 정보:', errorData);
        const errorMessage = `할 일 목록을 가져오는 데 실패했습니다. (${response.status}: ${errorData.error || response.statusText})`;
        addDebugLog(`API 오류: ${errorMessage}`);
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      addDebugLog(`${data.length || 0}개의 할 일 데이터 로드 성공`);
      
      // 사용자 정보 포함하여 할 일 목록 업데이트
      const todosWithUserInfo = data.map((todo: any) => {
        const assignee = usersList.find((u: any) => u.id === todo.assignedTo);
        return {
          ...todo,
          assigneeName: assignee ? assignee.displayName || assignee.name : todo.assigneeName || '담당자 미지정',
          assigneeAvatar: assignee ? assignee.imageUrl : todo.assigneeAvatar || null,
          // created_by 필드가 없는 경우 현재 사용자 ID를 기본값으로 설정
          createdBy: todo.created_by || userId
        };
      });
      
      setTodos(todosWithUserInfo);
      
      // 로컬 스토리지에 캐싱
      try {
        localStorage.setItem(`wizweblast_todos_client_${client.id}`, JSON.stringify(todosWithUserInfo));
        addDebugLog('할 일 데이터 로컬 스토리지에 캐싱 완료');
      } catch (storageErr) {
        console.error('로컬 스토리지 저장 오류:', storageErr);
        addDebugLog(`로컬 스토리지 저장 실패: ${storageErr instanceof Error ? storageErr.message : '알 수 없는 오류'}`);
      }
    } catch (err) {
      console.error('할 일 목록 로딩 오류:', err);
      addDebugLog(`할 일 목록 로딩 오류: ${err instanceof Error ? err.message : '알 수 없는 오류'}`);
      
      // 로컬 스토리지에서 복구 시도
      try {
        addDebugLog('로컬 스토리지에서 할 일 목록 복구 시도');
        
        // 클라이언트별 캐시 확인
        const clientSpecificTodos = localStorage.getItem(`wizweblast_todos_client_${client.id}`);
        if (clientSpecificTodos) {
          const parsedTodos = JSON.parse(clientSpecificTodos);
          addDebugLog(`로컬 스토리지에서 ${parsedTodos.length || 0}개의 할 일 복구 성공`);
          setTodos(parsedTodos);
          return;
        }
        
        // 전체 할 일 목록에서 필터링
        const storedTodos = localStorage.getItem('wizweblast_todos');
        if (storedTodos) {
          const parsedTodos = JSON.parse(storedTodos);
          // 현재 광고주의 할 일만 필터링
          const clientTodos = parsedTodos.filter((todo: any) => todo.clientId === client.id);
          addDebugLog(`전체 캐시에서 클라이언트 ID ${client.id}로 필터링: ${clientTodos.length || 0}개 발견`);
          setTodos(clientTodos);
        } else {
          addDebugLog('사용 가능한 캐시 데이터가 없습니다');
        }
      } catch (parseErr) {
        console.error('로컬 스토리지 데이터 파싱 오류:', parseErr);
        addDebugLog(`캐시 데이터 파싱 오류: ${parseErr instanceof Error ? parseErr.message : '알 수 없는 오류'}`);
        setTodos([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [client.id, user?.id, addDebugLog, fetchUsers]);
  
  // 초기 로딩 - 의존성 배열에 fetchTodos 추가
  useEffect(() => {
    if (user?.id) {
      fetchTodos();
    }
  }, [fetchTodos]); // fetchTodos가 useCallback으로 메모이제이션되어 있으므로 안전하게 의존성 배열에 추가 가능
  
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
          // 전체 할 일 목록 업데이트
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
            addDebugLog('전체 할 일 로컬 스토리지 업데이트 완료');
          }
          
          // 클라이언트별 캐시도 업데이트
          const clientTodos = localStorage.getItem(`wizweblast_todos_client_${client.id}`);
          if (clientTodos) {
            const parsedClientTodos = JSON.parse(clientTodos);
            const updatedClientTodos = parsedClientTodos.map((todo: any) => 
              todo.id === todoId 
                ? { 
                    ...todo, 
                    completed: !currentStatus,
                    completedAt: !currentStatus ? new Date().toISOString() : undefined
                  } 
                : todo
            );
            localStorage.setItem(`wizweblast_todos_client_${client.id}`, JSON.stringify(updatedClientTodos));
            addDebugLog('클라이언트별 할 일 로컬 스토리지 업데이트 완료');
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
      
      // 오류 응답 처리
      if (!response.ok) {
        // API 실패 시 롤백
        setTodos(todos);
        const errorData = await response.json().catch(() => ({ error: '알 수 없는 오류' }));
        addDebugLog(`API 오류 (${response.status}): ${errorData.error || response.statusText}`);
        
        // 스키마 오류인 경우, 스키마 업데이트 시도
        if (errorData.suggestion && errorData.suggestion.includes('/api/update-todos-schema')) {
          addDebugLog('스키마 업데이트 필요: ' + errorData.message);
          
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
        
        throw new Error(`상태 변경에 실패했습니다. (${response.status}: ${errorData.error || response.statusText})`);
      }

      // API 응답 처리
      const data = await response.json();
      console.log('todo 완료 상태 변경 응답:', data);
      addDebugLog(`API 응답 성공: ${data.success ? '성공' : '실패'}`);
      
      if (data.success && data.todo) {
        // API 응답의 todo 데이터로 상태 업데이트
        const updatedTodo = {
          ...data.todo,
          clientId: data.todo.clientId || data.todo.client_id || todoId,
          clientName: data.todo.clientName || client.name || '광고주',
          clientIcon: data.todo.clientIcon || client.icon || '🏢',
          content: data.todo.content || '할 일',
          assignedTo: data.todo.assignedTo || data.todo.assigned_to || user?.id,
          completed: data.todo.completed,
          createdAt: data.todo.createdAt || data.todo.created_at || new Date().toISOString(),
          completedAt: data.todo.completedAt || data.todo.completed_at || undefined
        };
        
        addDebugLog(`업데이트된 할 일 데이터: 완료=${updatedTodo.completed}, 완료일=${updatedTodo.completedAt || '없음'}`);
        
        // 상태 업데이트
        setTodos(prevTodos => prevTodos.map(todo => 
          todo.id === todoId ? updatedTodo : todo
        ));
        
        // 로컬 스토리지 업데이트
        try {
          // 전체 할 일 목록 업데이트
          const storedTodos = localStorage.getItem('wizweblast_todos');
          if (storedTodos) {
            const parsedTodos = JSON.parse(storedTodos);
            const updatedStoredTodos = parsedTodos.map((todo: any) => 
              todo.id === todoId ? updatedTodo : todo
            );
            localStorage.setItem('wizweblast_todos', JSON.stringify(updatedStoredTodos));
            addDebugLog('전체 할 일 로컬 스토리지 업데이트 완료');
          }
          
          // 클라이언트별 캐시도 업데이트
          const clientTodos = localStorage.getItem(`wizweblast_todos_client_${client.id}`);
          if (clientTodos) {
            const parsedClientTodos = JSON.parse(clientTodos);
            const updatedClientTodos = parsedClientTodos.map((todo: any) => 
              todo.id === todoId ? updatedTodo : todo
            );
            localStorage.setItem(`wizweblast_todos_client_${client.id}`, JSON.stringify(updatedClientTodos));
            addDebugLog('클라이언트별 할 일 로컬 스토리지 업데이트 완료');
          }
        } catch (storageErr) {
          console.error('로컬 스토리지 업데이트 오류:', storageErr);
          addDebugLog(`로컬 스토리지 업데이트 오류: ${storageErr instanceof Error ? storageErr.message : '알 수 없는 오류'}`);
        }
      } else if (data._dev) {
        // 개발 환경에서 응답된 임시 데이터 처리
        addDebugLog(`개발 환경 응답: ${data.message || '상태 변경이 처리되었습니다.'}`);
      } else {
        // 응답은 성공했지만 todo 데이터가 없는 경우 - 경고 표시
        addDebugLog('API 응답이 올바르지 않음: todo 데이터 없음');
        console.warn('API 응답에 todo 데이터가 없습니다:', data);
      }
    } catch (err) {
      console.error('할 일 상태 변경 오류:', err);
      addDebugLog(`할 일 상태 변경 오류: ${err instanceof Error ? err.message : '알 수 없는 오류'}`);
      // 롤백
      setTodos(todos);
      alert('상태 변경 중 오류가 발생했습니다.');
    }
  };
  
  // 할 일 삭제 처리
  const handleDeleteTodo = async (todoId: string) => {
    try {
      addDebugLog(`할 일 ID ${todoId} 삭제 시작`);
      
      // 옵티미스틱 UI 업데이트
      const updatedTodos = todos.filter(todo => todo.id !== todoId);
      setTodos(updatedTodos);
      addDebugLog('UI에서 할 일 항목 제거 완료');
      
      // 로컬 스토리지 업데이트
      try {
        // 전체 할 일 목록 업데이트
        const storedTodos = localStorage.getItem('wizweblast_todos');
        if (storedTodos) {
          const parsedTodos = JSON.parse(storedTodos);
          const filteredTodos = parsedTodos.filter((todo: any) => todo.id !== todoId);
          localStorage.setItem('wizweblast_todos', JSON.stringify(filteredTodos));
          addDebugLog('전체 할 일 캐시에서 항목 제거 완료');
        }
        
        // 클라이언트별 캐시도 업데이트
        const clientTodos = localStorage.getItem(`wizweblast_todos_client_${client.id}`);
        if (clientTodos) {
          const parsedClientTodos = JSON.parse(clientTodos);
          const filteredClientTodos = parsedClientTodos.filter((todo: any) => todo.id !== todoId);
          localStorage.setItem(`wizweblast_todos_client_${client.id}`, JSON.stringify(filteredClientTodos));
          addDebugLog('클라이언트별 캐시에서 항목 제거 완료');
        }
      } catch (storageErr) {
        console.error('로컬 스토리지 업데이트 오류:', storageErr);
        addDebugLog(`로컬 스토리지 업데이트 오류: ${storageErr instanceof Error ? storageErr.message : '알 수 없는 오류'}`);
      }
      
      // 임시 ID(temp-)로 시작하는 할 일은 로컬에서만 처리
      if (todoId.startsWith('temp-')) {
        addDebugLog('임시 할 일(temp-)이므로 API 호출 없이 로컬에서만 삭제 처리 완료');
        return; // API 호출 없이 함수 종료
      }
      
      // API 호출
      addDebugLog(`API 호출: DELETE /api/todos?todoId=${todoId}`);
      const response = await fetch(`/api/todos?todoId=${todoId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        // API 실패 시 롤백
        setTodos(todos);
        const errorData = await response.json().catch(() => ({ error: '알 수 없는 오류' }));
        addDebugLog(`API 오류 (${response.status}): ${errorData.error || response.statusText}`);
        throw new Error(`할 일 삭제에 실패했습니다. (${response.status}: ${errorData.error || response.statusText})`);
      }
      
      // API 응답 처리
      const data = await response.json();
      addDebugLog(`API 응답: ${data.success ? '성공' : '실패'}`);
      
      if (data.success) {
        addDebugLog(`할 일 ID ${todoId} 삭제 성공`);
      } else if (data._dev) {
        // 개발 환경에서 응답된 임시 데이터 처리
        addDebugLog(`개발 환경 응답: ${data.message || '삭제가 처리되었습니다.'}`);
      }
      
      // 성공적으로 삭제되면 데이터 재조회
      fetchTodos();
    } catch (err) {
      console.error('할 일 삭제 오류:', err);
      addDebugLog(`할 일 삭제 오류: ${err instanceof Error ? err.message : '알 수 없는 오류'}`);
      // 롤백
      setTodos(todos);
      alert('할 일 삭제 중 오류가 발생했습니다.');
    }
  };
  
  // 할 일 추가
  const handleAddTodo = async (
    clientId: string, 
    content: string, 
    assignedTo: string, 
    dueDate: string | undefined,
    assigneeName: string,
    assigneeAvatar: string
  ) => {
    try {
      addDebugLog(`새 할 일 추가 시작: 클라이언트 ID ${clientId}`);
      
      // API 호출
      addDebugLog('API 호출: POST /api/todos');
      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientId,  // 원래 클라이언트 ID 전달 (route.ts에서 UUID 변환)
          content,
          assignedTo,
          assigneeName,
          assigneeAvatar,
          dueDate
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: '알 수 없는 오류' }));
        console.error('API 응답 상태:', response.status, response.statusText);
        console.error('오류 상세 정보:', errorData);
        const errorMessage = `할 일 등록에 실패했습니다. (${response.status}: ${errorData.error || response.statusText})`;
        addDebugLog(`API 오류: ${errorMessage}`);
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      addDebugLog(`API 응답: ${data.success ? '성공' : '실패'}`);
      
      if (data.success) {
        // 새 할 일 추가
        const newTodo: Todo = {
          ...data.todo,
          assigneeName: data.todo.assigneeName || assigneeName,
          assigneeAvatar: data.todo.assigneeAvatar || assigneeAvatar
        };
        addDebugLog(`할 일 등록 성공: ID ${newTodo.id}`);
        
        if (data.message) {
          addDebugLog(`메시지: ${data.message}`);
        }
        
        // UI 업데이트
        setTodos(prev => [newTodo, ...prev]);
        
        // 클라이언트의 최근 활동일 업데이트 (현재 시간으로)
        const now = new Date().toISOString();
        
        // 클라이언트 객체의 최근 활동일 로컬에서 업데이트
        if (client) {
          // 1. 단일 클라이언트 데이터 업데이트
          const updatedClient = { ...client, last_activity_at: now };
          
          try {
            // 2. 클라이언트 상세 정보 로컬 스토리지 업데이트
            localStorage.setItem(`wizweblast_client_${client.id}`, JSON.stringify(updatedClient));
            addDebugLog(`클라이언트 상세 정보의 최근 활동일이 업데이트되었습니다: ${now}`);
            
            // 3. 클라이언트 목록에서도 업데이트
            const storedClientsJSON = localStorage.getItem('wizweblast_clients');
            if (storedClientsJSON) {
              const storedClients = JSON.parse(storedClientsJSON);
              if (Array.isArray(storedClients)) {
                const updatedClients = storedClients.map(c => 
                  c.id === client.id ? { ...c, last_activity_at: now } : c
                );
                localStorage.setItem('wizweblast_clients', JSON.stringify(updatedClients));
                addDebugLog('클라이언트 목록에서도 최근 활동일 업데이트 완료');
              }
            }
            
            // 4. 부모 컴포넌트에 변경 사항 알림 (UI 업데이트를 위해)
            if (onClientUpdate) {
              const updatedClient = {
                ...client,
                last_activity_at: now
              };
              onClientUpdate(updatedClient);
              addDebugLog('onClientUpdate 콜백 호출 완료');
            }
            
            // 5. 전체 UI 갱신을 위해 클라이언트 목록 업데이트 이벤트 발생
            const updateEvent = new CustomEvent('client_updated', { 
              detail: { 
                clientId: client.id,
                last_activity_at: now
              },
              bubbles: true, // 이벤트 버블링 허용
              composed: true // Shadow DOM 경계를 넘어 이벤트 전파
            });
            window.dispatchEvent(updateEvent);
            addDebugLog('클라이언트 업데이트 이벤트 발생');
            
            // page.tsx에서 localStorage 직접 업데이트 추가 시도
            try {
              // 클라이언트 목록의 상태 업데이트 트리거
              localStorage.setItem('__temp_client_update_trigger', JSON.stringify({
                clientId: client.id,
                last_activity_at: now,
                timestamp: Date.now() // 항상 다른 값을 만들어 변경 감지
              }));
              addDebugLog('localStorage 업데이트 트리거 저장 완료');
              
              // 개별 클라이언트 정보 로컬 스토리지 업데이트 (목록에서 불러올 수 있도록)
              const clientData = localStorage.getItem(`wizweblast_client_${client.id}`);
              if (clientData) {
                const parsedClient = JSON.parse(clientData);
                parsedClient.last_activity_at = now;
                localStorage.setItem(`wizweblast_client_${client.id}`, JSON.stringify(parsedClient));
                addDebugLog('개별 클라이언트 데이터 업데이트 완료');
              }
              
              // 클라이언트 목록 전체 업데이트
              const allClientsData = localStorage.getItem('wizweblast_clients');
              if (allClientsData) {
                const parsedClients = JSON.parse(allClientsData);
                const updatedClients = parsedClients.map((c: any) => 
                  c.id === client.id ? { ...c, last_activity_at: now } : c
                );
                localStorage.setItem('wizweblast_clients', JSON.stringify(updatedClients));
                addDebugLog('전체 클라이언트 목록 업데이트 완료');
              }
              
            } catch (err) {
              console.error('localStorage 업데이트 실패:', err);
              addDebugLog(`localStorage 업데이트 실패: ${err instanceof Error ? err.message : '알 수 없는 오류'}`);
            }
            
          } catch (storageErr) {
            console.error('로컬 스토리지 업데이트 오류:', storageErr);
            addDebugLog(`클라이언트 데이터 업데이트 중 오류: ${storageErr instanceof Error ? storageErr.message : '알 수 없는 오류'}`);
          }
        }
        
        // 로컬 스토리지 업데이트
        try {
          // 클라이언트별 캐시 업데이트
          const clientSpecificTodos = localStorage.getItem(`wizweblast_todos_client_${client.id}`);
          if (clientSpecificTodos) {
            const parsedTodos = JSON.parse(clientSpecificTodos);
            const updatedTodos = [newTodo, ...parsedTodos];
            localStorage.setItem(`wizweblast_todos_client_${client.id}`, JSON.stringify(updatedTodos));
            addDebugLog('클라이언트별 캐시 업데이트 완료');
          }
          
          // 전체 할 일 목록 업데이트
          const storedTodos = localStorage.getItem('wizweblast_todos');
          let todosList = [];
          
          if (storedTodos) {
            todosList = JSON.parse(storedTodos);
          }
          
          todosList.unshift(newTodo);
          localStorage.setItem('wizweblast_todos', JSON.stringify(todosList));
          addDebugLog('전체 할 일 캐시 업데이트 완료');
        } catch (storageErr) {
          console.error('로컬 스토리지 저장 오류:', storageErr);
          addDebugLog(`로컬 스토리지 업데이트 오류: ${storageErr instanceof Error ? storageErr.message : '알 수 없는 오류'}`);
        }
      } else {
        const errorMessage = data.error || '할 일 등록 중 알 수 없는 오류가 발생했습니다';
        addDebugLog(`할 일 등록 실패: ${errorMessage}`);
        throw new Error(errorMessage);
      }
    } catch (err) {
      console.error('할 일 등록 오류:', err);
      addDebugLog(`할 일 등록 중 오류 발생: ${err instanceof Error ? err.message : '알 수 없는 오류'}`);
      alert(err instanceof Error ? err.message : '할 일 등록 중 오류가 발생했습니다.');
    }
  };
  
  // 담당자 변경
  const handleAssigneeChange = async (todoId: string) => {
    try {
      setSelectedTodoId(todoId);
      
      // 사용자 목록 가져오기
      const usersList = await fetchUsers();
      
      if (usersList.length === 0) {
        addDebugLog('사용자 목록을 가져올 수 없어 담당자 변경 불가');
        alert('사용자 목록을 가져올 수 없습니다. 다시 시도해주세요.');
        return;
      }
      
      // 담당자 변경 모달 표시
      setShowAssignModal(true);
    } catch (err) {
      console.error('담당자 변경 준비 오류:', err);
      addDebugLog(`담당자 변경 준비 오류: ${err instanceof Error ? err.message : '알 수 없는 오류'}`);
      alert('담당자 변경 준비 중 오류가 발생했습니다.');
    }
  };
  
  // 담당자 변경 처리
  const handleAssignTodo = async (todoId: string, newAssigneeId: string) => {
    try {
      addDebugLog(`할 일 ID ${todoId}의 담당자를 ${newAssigneeId}로 변경 시작`);
      
      // 현재 할 일 정보 확인
      const currentTodo = todos.find(todo => todo.id === todoId);
      if (!currentTodo) {
        throw new Error('할 일을 찾을 수 없습니다.');
      }
      
      // 담당자 정보 가져오기
      const assignee = users.find(u => u.id === newAssigneeId);
      const assigneeName = assignee ? assignee.name : '담당자 미지정';
      const assigneeAvatar = assignee ? assignee.imageUrl : null;
      
      // 옵티미스틱 UI 업데이트
      const updatedTodos = todos.map(todo => 
        todo.id === todoId 
          ? { 
              ...todo, 
              assignedTo: newAssigneeId,
              assigneeName,
              assigneeAvatar
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
          // 전체 할 일 목록 업데이트
          const storedTodos = localStorage.getItem('wizweblast_todos');
          if (storedTodos) {
            const parsedTodos = JSON.parse(storedTodos);
            const updatedStoredTodos = parsedTodos.map((todo: any) => 
              todo.id === todoId 
                ? { 
                    ...todo, 
                    assignedTo: newAssigneeId,
                    assigneeName,
                    assigneeAvatar
                  } 
                : todo
            );
            localStorage.setItem('wizweblast_todos', JSON.stringify(updatedStoredTodos));
            addDebugLog('전체 할 일 로컬 스토리지 업데이트 완료');
          }
          
          // 클라이언트별 캐시도 업데이트
          const clientTodos = localStorage.getItem(`wizweblast_todos_client_${client.id}`);
          if (clientTodos) {
            const parsedClientTodos = JSON.parse(clientTodos);
            const updatedClientTodos = parsedClientTodos.map((todo: any) => 
              todo.id === todoId 
                ? { 
                    ...todo, 
                    assignedTo: newAssigneeId,
                    assigneeName,
                    assigneeAvatar
                  } 
                : todo
            );
            localStorage.setItem(`wizweblast_todos_client_${client.id}`, JSON.stringify(updatedClientTodos));
            addDebugLog('클라이언트별 할 일 로컬 스토리지 업데이트 완료');
          }
          
          addDebugLog('임시 할 일 담당자 변경 완료');
          return; // API 호출 없이 함수 종료
        } catch (storageErr) {
          console.error('로컬 스토리지 업데이트 오류:', storageErr);
          addDebugLog(`로컬 스토리지 업데이트 오류: ${storageErr instanceof Error ? storageErr.message : '알 수 없는 오류'}`);
        }
      }
      
      // API 호출
      addDebugLog(`API 호출: PATCH /api/todos/${todoId}/assign`);
      const response = await fetch(`/api/todos/${todoId}/assign?force=true`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newAssigneeId }),
      });
      
      if (!response.ok) {
        // API 실패 시 롤백
        setTodos(todos);
        const errorData = await response.json().catch(() => ({ error: '알 수 없는 오류' }));
        addDebugLog(`API 오류 (${response.status}): ${errorData.error || response.statusText}`);
        
        // 권한 오류(403)인 경우 강제 변경 시도
        if (response.status === 403) {
          addDebugLog('권한 오류 발생, 강제 변경 시도');
          // 강제 변경 요청 시도
          const forceResponse = await fetch(`/api/todos/${todoId}/assign?force=true`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ newAssigneeId }),
          });
          
          if (!forceResponse.ok) {
            // 강제 변경도 실패한 경우
            const forceErrorData = await forceResponse.json().catch(() => ({ error: '알 수 없는 오류' }));
            addDebugLog(`강제 변경 실패 (${forceResponse.status}): ${forceErrorData.error || forceResponse.statusText}`);
            throw new Error(`담당자 변경에 실패했습니다. (${forceResponse.status}: ${forceErrorData.error || forceResponse.statusText})`);
          }
          
          // 강제 변경 성공
          const forceData = await forceResponse.json();
          addDebugLog(`강제 변경 성공: ${forceData.success ? '성공' : '실패'}`);
          
          if (forceData.success && forceData.todo) {
            // 성공적으로 변경된 경우 UI 업데이트
            const updatedTodo = {
              ...forceData.todo,
              clientId: forceData.todo.clientId || forceData.todo.client_id || todoId,
              clientName: forceData.todo.clientName || client.name || '광고주',
              clientIcon: forceData.todo.clientIcon || client.icon || '🏢',
              content: forceData.todo.content || '할 일',
              assignedTo: forceData.todo.assignedTo || forceData.todo.assigned_to,
              completed: forceData.todo.completed,
              createdAt: forceData.todo.createdAt || forceData.todo.created_at || new Date().toISOString(),
              completedAt: forceData.todo.completedAt || forceData.todo.completed_at || undefined
            };
            
            // 상태 업데이트
            setTodos(prevTodos => prevTodos.map(todo => 
              todo.id === todoId ? updatedTodo : todo
            ));
            
            // 로컬 스토리지 업데이트
            try {
              // 전체 할 일 목록 업데이트
              const storedTodos = localStorage.getItem('wizweblast_todos');
              if (storedTodos) {
                const parsedTodos = JSON.parse(storedTodos);
                const updatedStoredTodos = parsedTodos.map((todo: any) => 
                  todo.id === todoId ? updatedTodo : todo
                );
                localStorage.setItem('wizweblast_todos', JSON.stringify(updatedStoredTodos));
                addDebugLog('전체 할 일 로컬 스토리지 업데이트 완료');
              }
              
              // 클라이언트별 캐시도 업데이트
              const clientTodos = localStorage.getItem(`wizweblast_todos_client_${client.id}`);
              if (clientTodos) {
                const parsedClientTodos = JSON.parse(clientTodos);
                const updatedClientTodos = parsedClientTodos.map((todo: any) => 
                  todo.id === todoId ? updatedTodo : todo
                );
                localStorage.setItem(`wizweblast_todos_client_${client.id}`, JSON.stringify(updatedClientTodos));
                addDebugLog('클라이언트별 할 일 로컬 스토리지 업데이트 완료');
              }
            } catch (storageErr) {
              console.error('로컬 스토리지 업데이트 오류:', storageErr);
              addDebugLog(`로컬 스토리지 업데이트 오류: ${storageErr instanceof Error ? storageErr.message : '알 수 없는 오류'}`);
            }
            
            // 모달 닫기
            setShowAssignModal(false);
            setSelectedTodoId(null);
            return;
          }
        }
        
        throw new Error(`담당자 변경에 실패했습니다. (${response.status}: ${errorData.error || response.statusText})`);
      }
      
      // API 응답 처리
      const data = await response.json();
      addDebugLog(`API 응답: ${data.success ? '성공' : '실패'}`);
      
      if (data.success && data.todo) {
        // API 응답의 todo 데이터로 상태 업데이트
        const updatedTodo = {
          ...data.todo,
          clientId: data.todo.clientId || data.todo.client_id || todoId,
          clientName: data.todo.clientName || client.name || '광고주',
          clientIcon: data.todo.clientIcon || client.icon || '🏢',
          content: data.todo.content || '할 일',
          assignedTo: data.todo.assignedTo || data.todo.assigned_to,
          completed: data.todo.completed,
          createdAt: data.todo.createdAt || data.todo.created_at || new Date().toISOString(),
          completedAt: data.todo.completedAt || data.todo.completed_at || undefined
        };
        
        addDebugLog(`업데이트된 할 일 데이터: 담당자=${updatedTodo.assignedTo}`);
        
        // 상태 업데이트
        setTodos(prevTodos => prevTodos.map(todo => 
          todo.id === todoId ? updatedTodo : todo
        ));
        
        // 로컬 스토리지 업데이트
        try {
          // 전체 할 일 목록 업데이트
          const storedTodos = localStorage.getItem('wizweblast_todos');
          if (storedTodos) {
            const parsedTodos = JSON.parse(storedTodos);
            const updatedStoredTodos = parsedTodos.map((todo: any) => 
              todo.id === todoId ? updatedTodo : todo
            );
            localStorage.setItem('wizweblast_todos', JSON.stringify(updatedStoredTodos));
            addDebugLog('전체 할 일 로컬 스토리지 업데이트 완료');
          }
          
          // 클라이언트별 캐시도 업데이트
          const clientTodos = localStorage.getItem(`wizweblast_todos_client_${client.id}`);
          if (clientTodos) {
            const parsedClientTodos = JSON.parse(clientTodos);
            const updatedClientTodos = parsedClientTodos.map((todo: any) => 
              todo.id === todoId ? updatedTodo : todo
            );
            localStorage.setItem(`wizweblast_todos_client_${client.id}`, JSON.stringify(updatedClientTodos));
            addDebugLog('클라이언트별 할 일 로컬 스토리지 업데이트 완료');
          }
        } catch (storageErr) {
          console.error('로컬 스토리지 업데이트 오류:', storageErr);
          addDebugLog(`로컬 스토리지 업데이트 오류: ${storageErr instanceof Error ? storageErr.message : '알 수 없는 오류'}`);
        }
      }
      
      // 모달 닫기
      setShowAssignModal(false);
      setSelectedTodoId(null);
    } catch (err) {
      console.error('담당자 변경 오류:', err);
      addDebugLog(`담당자 변경 오류: ${err instanceof Error ? err.message : '알 수 없는 오류'}`);
      alert('담당자 변경 중 오류가 발생했습니다.');
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">할 일 관리</h2>
        </div>
        
        {/* 필터 탭 */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
              filter === 'all' 
                ? 'bg-[#2251D1] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            전체 할 일
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
              filter === 'active' 
                ? 'bg-[#4CAF50] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            진행 중
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
              filter === 'completed' 
                ? 'bg-[#9E9E9E] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            완료됨
          </button>
          <button
            onClick={() => setFilter('mine')}
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
              filter === 'mine' 
                ? 'bg-[#FF9800] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            내 할 일
          </button>
          <button
            onClick={() => setFilter('assigned')}
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
              filter === 'assigned' 
                ? 'bg-[#2196F3] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            내가 배정한 할 일
          </button>
        </div>
        
        {/* 할 일 추가 */}
        <div className="mb-4">
          <button
            onClick={() => setShowTodoModal(true)}
            className="wiz-btn-small w-full py-2 flex justify-center items-center"
          >
            <PlusCircle size={16} className="mr-1" /> 새 할 일 추가
          </button>
        </div>
      </div>
      
      <div className="p-6">
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#2251D1] border-t-transparent"></div>
          </div>
        ) : todos.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <p>이 광고주에 등록된 할 일이 없습니다.</p>
            <p className="text-sm mt-1">위 폼을 통해 새로운 할 일을 추가해보세요!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {todos
              .filter(todo => {
                // 필터 적용
                if (filter === 'active') return !todo.completed;
                if (filter === 'completed') return todo.completed;
                if (filter === 'mine') return todo.assignedTo === user?.id;
                if (filter === 'assigned') return todo.assignedTo !== user?.id && todo.createdBy === user?.id;
                return true; // 'all' 필터
              })
              .map(todo => (
                <TodoCard
                  key={todo.id}
                  todo={{
                    ...todo,
                    // 담당자 이름이 없거나 '담당자 미지정'인 경우 사용자 정보에서 이름 가져오기
                    assigneeName: todo.assigneeName && todo.assigneeName !== '담당자 미지정' 
                      ? todo.assigneeName 
                      : users.find(u => u.id === todo.assignedTo)?.name || '담당자 미지정'
                  }}
                  onComplete={handleToggleComplete}
                  onDelete={handleDeleteTodo}
                  onAssigneeChange={handleAssigneeChange}
                />
              ))}
          </div>
        )}
      </div>
      
      {/* 할 일 등록 모달 */}
      {showTodoModal && (
        <TodoModal
          client={client}
          isOpen={showTodoModal}
          onClose={() => setShowTodoModal(false)}
          onSave={handleAddTodo}
        />
      )}
      
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
                  이 할 일을 담당할 사용자를 선택하세요. <b>현재 담당자를 다시 선택하거나 다른 담당자로 변경할 수 있습니다.</b>
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