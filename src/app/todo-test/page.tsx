'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';

interface Todo {
  id: string;
  clientId: string;
  clientName?: string;
  content: string;
  completed: boolean;
  completedAt?: string;
  createdAt: string;
}

export default function TodoTestPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const { user } = useUser();
  
  // 할 일 목록 가져오기
  const fetchTodos = async () => {
    try {
      setLoading(true);
      setDebugInfo('API 호출 중...');
      
      const userId = user?.id;
      if (!userId) {
        setDebugInfo('사용자 ID가 없음');
        return;
      }
      
      // API 요청
      const response = await fetch(`/api/todos?assignedTo=${userId}`);
      
      if (!response.ok) {
        throw new Error(`할 일 목록을 가져오는 데 실패했습니다. (${response.status})`);
      }
      
      const data = await response.json();
      setTodos(data);
      setDebugInfo(`${data.length}개의 할 일을 불러왔습니다.`);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : '할 일 목록을 불러오는 중 오류가 발생했습니다.');
      setDebugInfo(`오류: ${err instanceof Error ? err.message : '알 수 없는 오류'}`);
    } finally {
      setLoading(false);
    }
  };
  
  // 할 일 상태 변경 - 일반 API 사용
  const toggleTodoViaAPI = async (todoId: string, currentStatus: boolean) => {
    try {
      setDebugInfo(`일반 API로 상태 변경 시도: ${todoId}, 현재 상태: ${currentStatus}`);
      
      const response = await fetch(`/api/todos`, {
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
        throw new Error(`상태 변경에 실패했습니다. (${response.status})`);
      }
      
      const data = await response.json();
      setDebugInfo(`API 응답: ${JSON.stringify(data, null, 2)}`);
      
      // 성공 시 목록 새로고침
      fetchTodos();
    } catch (err) {
      setError(err instanceof Error ? err.message : '상태 변경 중 오류가 발생했습니다.');
      setDebugInfo(`API 오류: ${err instanceof Error ? err.message : '알 수 없는 오류'}`);
    }
  };
  
  // 할 일 상태 변경 - 엔드포인트 직접 호출
  const toggleTodoViaEndpoint = async (todoId: string, currentStatus: boolean) => {
    try {
      setDebugInfo(`직접 엔드포인트로 상태 변경 시도: ${todoId}, 현재 상태: ${currentStatus}`);
      
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
        throw new Error(`상태 변경에 실패했습니다. (${response.status})`);
      }
      
      const data = await response.json();
      setDebugInfo(`엔드포인트 응답: ${JSON.stringify(data, null, 2)}`);
      
      // 성공 시 목록 새로고침
      fetchTodos();
    } catch (err) {
      setError(err instanceof Error ? err.message : '상태 변경 중 오류가 발생했습니다.');
      setDebugInfo(`엔드포인트 오류: ${err instanceof Error ? err.message : '알 수 없는 오류'}`);
    }
  };
  
  // 초기 로딩
  useEffect(() => {
    if (user?.id) {
      fetchTodos();
    }
  }, [user?.id]);
  
  // 캐시 지우기
  const clearCache = () => {
    try {
      const keys = Object.keys(localStorage);
      let count = 0;
      
      keys.forEach(key => {
        if (key.startsWith('wizweblast_todos') || key.includes('todos_client_')) {
          localStorage.removeItem(key);
          count++;
        }
      });
      
      setDebugInfo(`${count}개의 할 일 관련 캐시 데이터가 삭제되었습니다.`);
      
      // 데이터 새로고침
      fetchTodos();
    } catch (err) {
      setDebugInfo(`캐시 삭제 오류: ${err instanceof Error ? err.message : '알 수 없는 오류'}`);
    }
  };
  
  return (
    <div className="min-h-screen bg-[#F9FAFD] p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">할 일 완료 체크 디버그</h1>
        
        <div className="flex space-x-2 mb-6">
          <button
            onClick={fetchTodos}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            할 일 새로고침
          </button>
          
          <button
            onClick={clearCache}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            캐시 삭제
          </button>
          
          <Link href="/my-todos" className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700">
            할 일 목록으로
          </Link>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-6">
            <h3 className="font-medium mb-1">오류 발생</h3>
            <p>{error}</p>
          </div>
        )}
        
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
          <h3 className="font-medium mb-2">디버그 정보:</h3>
          <pre className="text-xs bg-gray-100 p-3 rounded whitespace-pre-wrap">{debugInfo}</pre>
        </div>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin mb-2 mx-auto"></div>
            <p>할 일 로딩 중...</p>
          </div>
        ) : (
          <div>
            <h2 className="text-xl font-semibold mb-4">할 일 목록 ({todos.length}개)</h2>
            
            {todos.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-500">할 일이 없습니다.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {todos.map(todo => (
                  <div key={todo.id} className={`border rounded-lg p-4 ${todo.completed ? 'bg-green-50' : 'bg-white'}`}>
                    <div className="flex justify-between mb-2">
                      <div>
                        <h3 className={`font-medium ${todo.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                          {todo.content}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {todo.clientName || '광고주'} | 
                          생성: {new Date(todo.createdAt).toLocaleString()} | 
                          {todo.completed && todo.completedAt 
                            ? ` 완료: ${new Date(todo.completedAt).toLocaleString()}` 
                            : ' 미완료'}
                        </p>
                      </div>
                      <div className="text-sm">
                        <span className={`px-2 py-1 rounded-full ${todo.completed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {todo.completed ? '완료됨' : '진행 중'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2 mt-3">
                      <button
                        onClick={() => toggleTodoViaAPI(todo.id, todo.completed)}
                        className="bg-blue-600 text-white px-3 py-1 text-sm rounded hover:bg-blue-700"
                      >
                        API로 {todo.completed ? '미완료 처리' : '완료 처리'}
                      </button>
                      
                      <button
                        onClick={() => toggleTodoViaEndpoint(todo.id, todo.completed)}
                        className="bg-purple-600 text-white px-3 py-1 text-sm rounded hover:bg-purple-700"
                      >
                        엔드포인트로 {todo.completed ? '미완료 처리' : '완료 처리'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 