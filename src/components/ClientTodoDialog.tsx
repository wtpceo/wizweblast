'use client';

import { useState, useEffect, useRef } from 'react';
import { Client } from '@/lib/mock-data';

interface User {
  id: string;
  name: string;
  avatar_url?: string;
  email: string;
  role: string;
}

interface Todo {
  id: string | number;
  content: string;
  date: string;
  completed: boolean;
  assignedTo: string;
  assigneeName?: string;
}

interface ClientTodoDialogProps {
  client: Client | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (clientId: string, content: string, assignedTo: string) => void;
}

export function ClientTodoDialog({ client, isOpen, onClose, onSave }: ClientTodoDialogProps) {
  const [content, setContent] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientTodos, setClientTodos] = useState<Todo[]>([]);
  const [isLoadingTodos, setIsLoadingTodos] = useState(false);
  
  // 입력 필드 ref 추가
  const contentInputRef = useRef<HTMLInputElement>(null);
  
  // 사용자 목록 가져오기
  useEffect(() => {
    if (isOpen) {
      const fetchUsers = async () => {
        setIsLoading(true);
        setError(null);
        
        try {
          const response = await fetch('/api/users');
          
          if (!response.ok) {
            throw new Error('사용자 목록을 가져오는데 실패했습니다.');
          }
          
          const data = await response.json();
          setTeamMembers(data);
        } catch (err) {
          console.error('사용자 목록 로딩 오류:', err);
          setError('담당자 목록을 불러오는 중 오류가 발생했습니다.');
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchUsers();
      
      // 클라이언트 ID가 있을 때만 할 일 불러오기
      if (client?.id) {
        loadClientTodos(client.id);
      }
    }
  }, [isOpen, client?.id]);
  
  // 로컬 스토리지에서 할 일 불러오기
  const loadClientTodos = (clientId: string) => {
    setIsLoadingTodos(true);
    
    try {
      // 먼저 새로운 형식의 스토리지 키로 확인
      const wizweblastTodos = localStorage.getItem(`wizweblast_todos_client_${clientId}`);
      if (wizweblastTodos) {
        const parsedTodos = JSON.parse(wizweblastTodos);
        
        if (parsedTodos.length > 0) {
          const formattedTodos = parsedTodos.map((item: any) => ({
            id: item.id,
            content: item.content,
            date: item.createdAt || item.created_at,
            completed: item.completed || false,
            assignedTo: item.assignedTo || item.assigned_to,
            assigneeName: item.assigneeName || item.assignee_name || '담당자'
          }));
          
          // 날짜 기준 내림차순 정렬
          formattedTodos.sort((a: Todo, b: Todo) => 
            new Date(b.date).getTime() - new Date(a.date).getTime()
          );
          
          setClientTodos(formattedTodos);
          setIsLoadingTodos(false);
          return;
        }
      }
      
      // 이전 형식의 스토리지 확인
      const localTodos = localStorage.getItem('client_todos');
      if (localTodos) {
        const parsedTodos = JSON.parse(localTodos);
        const filteredTodos = parsedTodos.filter((todo: any) => todo.clientId === clientId);
        
        if (filteredTodos.length > 0) {
          const formattedTodos = filteredTodos.map((item: any) => ({
            id: item.id,
            content: item.content,
            date: item.createdAt,
            completed: item.completed || false,
            assignedTo: item.assignedTo,
            assigneeName: item.assigneeName || '담당자'
          }));
          
          // 날짜 기준 내림차순 정렬
          formattedTodos.sort((a: Todo, b: Todo) => 
            new Date(b.date).getTime() - new Date(a.date).getTime()
          );
          
          setClientTodos(formattedTodos);
          
          // 이전 형식에서 로드한 데이터를 새 형식으로도 저장 (마이그레이션)
          try {
            localStorage.setItem(`wizweblast_todos_client_${clientId}`, JSON.stringify(
              filteredTodos.map((todo: any) => ({
                id: todo.id,
                content: todo.content,
                createdAt: todo.createdAt,
                created_at: todo.createdAt,
                completed: todo.completed || false,
                assignedTo: todo.assignedTo,
                assigned_to: todo.assignedTo,
                assigneeName: todo.assigneeName || '담당자',
                assignee_name: todo.assigneeName || '담당자'
              }))
            ));
            console.log('할 일 데이터를 새 형식으로 마이그레이션했습니다.');
          } catch (migrationErr) {
            console.error('할 일 데이터 마이그레이션 오류:', migrationErr);
          }
        } else {
          setClientTodos([]);
        }
      } else {
        setClientTodos([]);
      }
    } catch (err) {
      console.error('할 일 로드 오류:', err);
      setClientTodos([]);
    } finally {
      setIsLoadingTodos(false);
    }
  };
  
  // 다이얼로그가 열릴 때 content 입력 필드에 포커스
  useEffect(() => {
    if (isOpen && contentInputRef.current) {
      setTimeout(() => {
        contentInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);
  
  // 키보드 단축키 처리
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 엔터키: 할 일 등록 (Alt키가 눌려있지 않을 때만)
      if (e.key === 'Enter' && !e.altKey && content.trim() && assignedTo) {
        // 입력 필드에서 발생한 이벤트가 아닐 때만 처리
        if (!(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement)) {
          e.preventDefault();
          handleSaveAction();
        }
      }
      
      // Esc: 다이얼로그 닫기
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, content, assignedTo, onClose]);
  
  if (!isOpen || !client) return null;
  
  // 할 일 저장 처리 함수
  const handleSaveAction = () => {
    if (content.trim() && assignedTo) {
      onSave(client.id, content, assignedTo);
      
      // 로컬 스토리지에 할 일 직접 추가 (낙관적 UI 업데이트)
      try {
        const selectedMember = teamMembers.find(m => m.id === assignedTo);
        const now = new Date().toISOString();
        const newTodoId = `local-${Date.now()}`;
        
        // 새 할 일 데이터 생성
        const newTodo = {
          id: newTodoId,
          clientId: client.id,
          content: content,
          createdAt: now,
          created_at: now,
          assignedTo: assignedTo,
          assigned_to: assignedTo,
          assigneeName: selectedMember?.name || '담당자',
          assignee_name: selectedMember?.name || '담당자',
          completed: false
        };
        
        // 1. 이전 형식의 스토리지 업데이트 (호환성)
        const localTodos = JSON.parse(localStorage.getItem('client_todos') || '[]');
        localTodos.push(newTodo);
        localStorage.setItem('client_todos', JSON.stringify(localTodos));
        
        // 2. 새로운 형식의 스토리지 업데이트
        const wizweblastTodos = JSON.parse(localStorage.getItem(`wizweblast_todos_client_${client.id}`) || '[]');
        wizweblastTodos.push(newTodo);
        localStorage.setItem(`wizweblast_todos_client_${client.id}`, JSON.stringify(wizweblastTodos));
        
        // 새 할 일을 목록 맨 위에 추가
        setClientTodos([
          {
            id: newTodo.id,
            content: newTodo.content,
            date: newTodo.createdAt,
            completed: newTodo.completed,
            assignedTo: newTodo.assignedTo,
            assigneeName: newTodo.assigneeName
          },
          ...clientTodos
        ]);
        
        // 커스텀 이벤트를 발생시켜 UI 업데이트 알림
        window.dispatchEvent(new Event('todo_updated'));
      } catch (storageErr) {
        console.error('로컬 스토리지 저장 오류:', storageErr);
      }
      
      setContent('');
      setAssignedTo('');
    }
  };
  
  // 폼 제출 핸들러
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSaveAction();
  };
  
  // 내용 입력 필드 키 이벤트 처리
  const handleContentKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // 엔터키 + 담당자 선택 완료 → 저장
    if (e.key === 'Enter' && assignedTo) {
      e.preventDefault();
      handleSaveAction();
    }
  };
  
  // 할 일 날짜 포맷팅
  const formatTodoDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      // 시간 포맷팅 추가 (24시간제)
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `오늘 ${hours}:${minutes}`;
    } else if (diffDays === 1) {
      return '어제';
    } else if (diffDays < 7) {
      return `${diffDays}일 전`;
    } else {
      return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
    }
  };
  
  // 재미있는 할 일 팁 메시지
  const todoTips = [
    "명확한 할 일은 생산성을 두 배로 높여줘요! 🚀",
    "마감일을 정하면 완료 확률이 42% 높아져요! ⏱️",
    "작은 할 일로 나누면 큰 목표도 달성할 수 있어요! ✨",
    "팀원과 함께라면 어려운 일도 즐겁게! 🤝"
  ];
  
  const randomTip = todoTips[Math.floor(Math.random() * todoTips.length)];
  
  // 선택한 담당자 정보 가져오기
  const selectedMember = assignedTo ? teamMembers.find(m => m.id === assignedTo) : null;
  
  // 사용자 이모지 매핑
  const getUserEmoji = (role: string) => {
    switch (role) {
      case 'admin':
        return '👨‍💼';
      case 'manager':
        return '👩‍💼';
      case 'developer':
        return '👨‍💻';
      case 'designer':
        return '👩‍🎨';
      case 'marketing':
        return '📊';
      default:
        return '👤';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
      <div 
        className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md transform transition-all animate-scale-up max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 부분 */}
        <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-100">
          <h3 className="text-lg font-bold flex items-center">
            <div className="mr-3 w-8 h-8 rounded-full bg-[#4CAF50] bg-opacity-20 flex items-center justify-center">
              <span className="text-xl">{client.icon}</span>
            </div>
            <div>
              <div>{client.name}</div>
              <div className="text-xs text-gray-500">할 일 관리</div>
            </div>
          </h3>
          <button 
            onClick={onClose}
            className="bg-gray-100 hover:bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
          >
            ✕
          </button>
        </div>
        
        {/* 팁 메시지 */}
        <div className="mb-4 bg-[#E8F5E9] rounded-lg p-3 text-sm text-[#4CAF50] flex items-start">
          <span className="mr-2 mt-1">✅</span>
          <p>{randomTip}</p>
        </div>
        
        <form onSubmit={handleSubmit} className="mb-4">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              <span className="mr-2">✏️</span> 할 일 내용
            </label>
            <input
              type="text"
              ref={contentInputRef}
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent transition-all"
              placeholder="할 일을 입력한 후 Enter 키를 눌러 등록하세요"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleContentKeyDown}
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              <span className="mr-2">👤</span> 담당자
            </label>
            
            {isLoading ? (
              <div className="text-center py-4">
                <div className="w-8 h-8 rounded-full border-4 border-[#4CAF50] border-t-transparent animate-spin mx-auto mb-2"></div>
                <p className="text-sm text-gray-500">담당자 목록을 불러오는 중...</p>
              </div>
            ) : error ? (
              <div className="text-center py-4 text-red-500">
                <p>{error}</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 mb-2">
                {teamMembers.map(member => (
                  <button
                    type="button"
                    key={member.id}
                    className={`flex items-center p-2 border rounded-lg transition-all ${
                      assignedTo === member.id 
                        ? 'border-[#4CAF50] bg-[#E8F5E9] text-[#4CAF50]'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onClick={() => setAssignedTo(member.id)}
                  >
                    <span className="mr-2 text-lg">{getUserEmoji(member.role)}</span>
                    <span className={assignedTo === member.id ? 'font-medium' : ''}>{member.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* 선택된 담당자 요약 */}
          {selectedMember && (
            <div className="mb-4 bg-[#F9FAFD] rounded-lg p-3 flex justify-between items-center">
              <div className="flex items-center">
                <span className="text-xl mr-2">{getUserEmoji(selectedMember.role)}</span>
                <span className="font-medium">{selectedMember.name}</span>
              </div>
              <span className="text-xs text-[#2251D1]">담당자로 지정됨</span>
            </div>
          )}
          
          <div className="flex justify-end gap-2">
            <button
              type="submit"
              className="wiz-btn bg-[#4CAF50] hover:bg-[#3d8b40] hover:translate-y-[-1px] flex items-center"
              disabled={!content.trim() || !assignedTo}
            >
              <span className="mr-1">✓</span> 할 일 추가
            </button>
          </div>
        </form>
        
        {/* 할 일 목록 */}
        <div className="border-t border-gray-200 pt-3 mt-2">
          <h4 className="text-sm font-medium mb-3 flex items-center">
            <span className="mr-1">📋</span> 
            진행 중인 할 일 ({clientTodos.filter(t => !t.completed).length}개)
          </h4>
          
          <div className="overflow-y-auto max-h-[30vh]">
            {isLoadingTodos ? (
              <div className="text-center py-4 text-gray-500">
                <div className="inline-block animate-spin text-xl mb-2">⏳</div>
                <p className="text-sm">할 일을 불러오는 중...</p>
              </div>
            ) : clientTodos.length > 0 ? (
              <div className="space-y-3">
                {clientTodos.map((todoItem) => (
                  <div 
                    key={todoItem.id} 
                    className={`p-3 rounded-lg ${todoItem.completed ? 'bg-[#E8F5E9]' : 'bg-[#E3F2FD]'}`}
                  >
                    <div className="flex justify-between items-center mb-1 text-xs">
                      <div className="font-medium flex items-center">
                        <span className="mr-1">{todoItem.completed ? '✅' : '⏳'}</span>
                        <span className={`${todoItem.completed ? 'text-green-600' : 'text-blue-600'}`}>
                          {todoItem.completed ? '완료됨' : '진행 중'}
                        </span>
                      </div>
                      <span className="text-gray-500">{formatTodoDate(todoItem.date)}</span>
                    </div>
                    <p className={`text-sm whitespace-pre-wrap break-words ${todoItem.completed ? 'line-through text-gray-500' : ''}`}>
                      {todoItem.content}
                    </p>
                    <div className="mt-1 text-xs text-gray-500 flex items-center">
                      <span className="mr-1">👤</span>
                      담당: {todoItem.assigneeName}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                <p className="text-sm">등록된 할 일이 없습니다.</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-4 pt-3 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg transition-all text-sm"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
} 