'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Client } from '@/lib/mock-data';

interface ClientCardProps {
  client: Client;
  onAddTodo: (clientId: string) => void;
  onAddNote: (clientId: string) => void;
}

export function ClientCard({ client, onAddTodo, onAddNote }: ClientCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [lastActivityDate, setLastActivityDate] = useState<string | undefined>(client.last_activity_at);
  const [clientNotes, setClientNotes] = useState<{id: string | number, content: string, date: string}[]>([]);
  const [showNotes, setShowNotes] = useState(false);
  const [noteCount, setNoteCount] = useState(0);
  const [clientTodos, setClientTodos] = useState<{id: string | number, content: string, date: string, completed: boolean}[]>([]);
  const [showTodos, setShowTodos] = useState(false);
  const [todoCount, setTodoCount] = useState(0);
  
  // 클라이언트 로컬 스토리지에서 최신 활동일 확인
  useEffect(() => {
    // 초기 설정 (처음 한 번만 설정)
    if (client.last_activity_at) {
      setLastActivityDate(client.last_activity_at);
    }
    
    // 로컬 스토리지에서 메모 개수 확인
    try {
      const localNotes = localStorage.getItem(`wizweblast_notes_client_${client.id}`);
      if (localNotes) {
        const parsedNotes = JSON.parse(localNotes);
        const clientNotesCount = parsedNotes.length;
        setNoteCount(clientNotesCount);
      } else {
        // 이전 형식의 스토리지도 확인
        const oldLocalNotes = localStorage.getItem('client_notes');
        if (oldLocalNotes) {
          const parsedNotes = JSON.parse(oldLocalNotes);
          const clientNotesCount = parsedNotes.filter((note: any) => note.clientId === client.id).length;
          setNoteCount(clientNotesCount);
        }
      }
    } catch (err) {
      console.error('로컬 저장소 메모 로드 오류:', err);
    }
    
    // 스토리지 변경 감지 이벤트 등록
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === `wizweblast_notes_client_${client.id}` || event.key === 'client_notes') {
        try {
          const localNotes = localStorage.getItem(`wizweblast_notes_client_${client.id}`);
          if (localNotes) {
            const parsedNotes = JSON.parse(localNotes);
            const clientNotesCount = parsedNotes.length;
            setNoteCount(clientNotesCount);
          } else {
            // 이전 형식의 스토리지도 확인
            const oldLocalNotes = localStorage.getItem('client_notes');
            if (oldLocalNotes) {
              const parsedNotes = JSON.parse(oldLocalNotes);
              const clientNotesCount = parsedNotes.filter((note: any) => note.clientId === client.id).length;
              setNoteCount(clientNotesCount);
            }
          }
        } catch (err) {
          console.error('스토리지 변경 감지 오류:', err);
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [client.id, client.last_activity_at]);
  
  // 로컬 스토리지에서 메모 로드
  const loadNotes = () => {
    try {
      // 새로운 형식의 스토리지 먼저 확인
      const localNotes = localStorage.getItem(`wizweblast_notes_client_${client.id}`);
      if (localNotes) {
        const parsedNotes = JSON.parse(localNotes);
        
        if (parsedNotes.length > 0) {
          // 날짜 기준 내림차순 정렬
          parsedNotes.sort((a: any, b: any) => 
            new Date(b.createdAt || b.created_at).getTime() - new Date(a.createdAt || a.created_at).getTime()
          );
          
          // 상위 3개만 가져오기
          const recentNotes = parsedNotes.slice(0, 3);
          
          const formattedNotes = recentNotes.map((item: any) => ({
            id: item.id,
            content: item.note || item.content,
            date: item.createdAt || item.created_at
          }));
          
          setClientNotes(formattedNotes);
          setNoteCount(parsedNotes.length);
          return;
        }
      }
      
      // 이전 형식의 스토리지 확인
      const oldLocalNotes = localStorage.getItem('client_notes');
      if (oldLocalNotes) {
        const parsedNotes = JSON.parse(oldLocalNotes);
        const filteredNotes = parsedNotes.filter((note: any) => note.clientId === client.id);
        
        if (filteredNotes.length > 0) {
          // 날짜 기준 내림차순 정렬
          filteredNotes.sort((a: any, b: any) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          
          // 상위 3개만 가져오기
          const recentNotes = filteredNotes.slice(0, 3);
          
          const formattedNotes = recentNotes.map((item: any) => ({
            id: item.id,
            content: item.note,
            date: item.createdAt
          }));
          
          setClientNotes(formattedNotes);
          setNoteCount(filteredNotes.length);
        } else {
          setClientNotes([]);
          setNoteCount(0);
        }
      }
    } catch (err) {
      console.error('메모 로드 오류:', err);
      setClientNotes([]);
    }
  };
  
  // 컴포넌트 마운트시 메모 로드
  useEffect(() => {
    loadNotes();
    
    // 스토리지 변경 감지 이벤트
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === `wizweblast_notes_client_${client.id}` || event.key === 'client_notes') {
        loadNotes();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // 커스텀 이벤트 리스너 추가
    const handleCustomNoteUpdate = () => loadNotes();
    window.addEventListener('note_updated', handleCustomNoteUpdate);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('note_updated', handleCustomNoteUpdate);
    };
  }, [client.id]);
  
  // 할 일 데이터 로드 함수
  const loadTodos = () => {
    try {
      // 새로운 형식의 스토리지 먼저 확인
      const localTodos = localStorage.getItem(`wizweblast_todos_client_${client.id}`);
      if (localTodos) {
        const parsedTodos = JSON.parse(localTodos);
        
        if (parsedTodos.length > 0) {
          // 날짜 기준 내림차순 정렬
          parsedTodos.sort((a: any, b: any) => 
            new Date(b.createdAt || b.created_at).getTime() - new Date(a.createdAt || a.created_at).getTime()
          );
          
          // 상위 3개만 가져오기
          const recentTodos = parsedTodos.slice(0, 3);
          
          const formattedTodos = recentTodos.map((item: any) => ({
            id: item.id,
            content: item.content,
            date: item.createdAt || item.created_at,
            completed: item.completed || false
          }));
          
          setClientTodos(formattedTodos);
          setTodoCount(parsedTodos.length);
          return;
        }
      }
      
      // 이전 형식의 스토리지 확인
      const oldLocalTodos = localStorage.getItem('client_todos');
      if (oldLocalTodos) {
        const parsedTodos = JSON.parse(oldLocalTodos);
        const filteredTodos = parsedTodos.filter((todo: any) => todo.clientId === client.id);
        
        if (filteredTodos.length > 0) {
          // 날짜 기준 내림차순 정렬
          filteredTodos.sort((a: any, b: any) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          
          // 상위 3개만 가져오기
          const recentTodos = filteredTodos.slice(0, 3);
          
          const formattedTodos = recentTodos.map((item: any) => ({
            id: item.id,
            content: item.content,
            date: item.createdAt,
            completed: item.completed || false
          }));
          
          setClientTodos(formattedTodos);
          setTodoCount(filteredTodos.length);
        } else {
          setClientTodos([]);
          setTodoCount(0);
        }
      }
    } catch (err) {
      console.error('할 일 로드 오류:', err);
      setClientTodos([]);
    }
  };
  
  // 할 일 보기 토글
  const toggleTodos = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowTodos(!showTodos);
    // 보여질 때 최신 데이터 로딩
    if (!showTodos) {
      loadTodos();
    }
  };
  
  // 컴포넌트 마운트시 할 일 로드
  useEffect(() => {
    loadTodos();
    
    // 스토리지 변경 감지 이벤트
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === `wizweblast_todos_client_${client.id}` || event.key === 'client_todos') {
        loadTodos();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // 커스텀 이벤트 리스너 추가
    const handleCustomTodoUpdate = () => loadTodos();
    window.addEventListener('todo_updated', handleCustomTodoUpdate);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('todo_updated', handleCustomTodoUpdate);
    };
  }, [client.id]);
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };
  
  const formatActivityDate = (dateString?: string) => {
    if (!dateString) return '활동 없음';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      // 당일
      const hours = date.getHours();
      const minutes = date.getMinutes();
      return `오늘 ${hours}시 ${minutes}분`;
    } else if (diffDays === 1) {
      return '어제';
    } else if (diffDays < 7) {
      return `${diffDays}일 전`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks}주 전`;
    } else {
      return formatDate(dateString);
    }
  };
  
  const getDaysRemaining = () => {
    const today = new Date();
    const endDate = new Date(client.contractEnd);
    
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };
  
  const getStatusTagStyles = (tag: string) => {
    switch (tag) {
      case '정상':
        return 'bg-green-900/30 text-green-300 border border-green-500/30';
      case '종료 임박':
        return 'bg-amber-900/30 text-amber-300 border border-amber-500/30';
      case '관리 소홀':
        return 'bg-orange-900/30 text-orange-300 border border-orange-500/30';
      case '민원 중':
        return 'bg-red-900/30 text-red-300 border border-red-500/30';
      case '계약 종료':
        return 'bg-slate-700/30 text-slate-300 border border-slate-500/30';
      case '신규':
        return 'bg-blue-900/30 text-blue-300 border border-blue-500/30';
      case 'VIP':
        return 'bg-purple-900/30 text-purple-300 border border-purple-500/30';
      case '모의 데이터':
        return 'bg-pink-900/30 text-pink-300 border border-pink-500/30';
      default:
        return 'bg-gray-900/30 text-gray-300 border border-gray-500/30';
    }
  };
  
  // 메모 보기 토글
  const toggleNotes = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowNotes(!showNotes);
    // 보여질 때 최신 데이터 로딩
    if (!showNotes) {
      loadNotes();
    }
  };
  
  // 메모 날짜 포맷
  const formatNoteDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return '오늘';
    } else if (diffDays === 1) {
      return '어제';
    } else {
      return `${diffDays}일 전`;
    }
  };
  
  // 네이버 URL 간소화
  const formatNaverUrl = (url?: string) => {
    if (!url) return '';
    
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname;
      const pathname = urlObj.pathname;
      
      if (hostname.includes('naver.com')) {
        if (pathname.length > 15) {
          return `${hostname}${pathname.substring(0, 15)}...`;
        } else {
          return `${hostname}${pathname}`;
        }
      }
      
      return url;
    } catch (e) {
      return url;
    }
  };
  
  return (
    <div 
      className="relative overflow-hidden bg-[#151523] rounded-lg shadow-xl group transition-all duration-300 hover:shadow-blue-900/30 hover:scale-[1.02] flex flex-col h-full"
      onMouseEnter={() => setIsHovered(true)} 
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 카드 그라데이션 배경 */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-800/20 to-purple-800/20 opacity-50 group-hover:opacity-80 transition-all duration-500"></div>
      
      {/* 카드 배경 블러 */}
      <div className="absolute inset-0 bg-[#151523]/80 backdrop-blur-sm z-0"></div>
      
      {/* 카드 테두리 */}
      <div className="absolute inset-0 border border-white/10 rounded-lg z-10"></div>
      
      {/* 종료 임박 표시 (남은 일수가 30일 이하이면 표시) */}
      {getDaysRemaining() <= 30 && getDaysRemaining() >= 0 && (
        <div className="absolute top-0 right-0 bg-amber-900/60 px-2 py-1 rounded-bl-lg z-20 backdrop-blur-sm">
          <div className="flex items-center space-x-1">
            <span className="text-white text-xs font-bold animate-pulse">⏰</span>
            <span className="text-white text-xs">{getDaysRemaining()}일 남음</span>
          </div>
        </div>
      )}
      
      {/* 종료된 계약 표시 */}
      {getDaysRemaining() < 0 && (
        <div className="absolute top-0 right-0 bg-gray-800/60 px-2 py-1 rounded-bl-lg z-20 backdrop-blur-sm">
          <span className="text-white text-xs">종료됨</span>
        </div>
      )}
      
      {/* 카드 콘텐츠 */}
      <div className="relative p-5 z-10 flex flex-col h-full">
        {/* 상단 정보 - 클릭 가능한 부분 */}
        <div onClick={() => window.location.href = `/clients/${client.id}`} className="cursor-pointer">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white/10 mr-3 group-hover:scale-110 transition-all duration-300 shadow-inner shadow-black/10">
              <span className="text-xl">{client.icon || '🏢'}</span>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white group-hover:text-blue-300 transition-colors duration-300 truncate">{client.name}</h3>
              <div className="flex items-center text-xs text-slate-400">
                <span className="mr-1">계약:</span>
                <span className="text-slate-300">{formatDate(client.contractStart)} ~ {formatDate(client.contractEnd)}</span>
              </div>
            </div>
          </div>
          
          {/* 상태 태그 */}
          <div className="flex flex-wrap gap-2 mb-3">
            {client.statusTags && client.statusTags.map((tag, index) => (
              <span
                key={index}
                className={`inline-block px-2 py-1 text-xs rounded-md ${getStatusTagStyles(tag)}`}
              >
                {tag}
              </span>
            ))}
          </div>
          
          {/* 정보 아이콘 */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className={`flex flex-col items-center justify-center py-2 rounded-lg ${client.usesCoupon ? 'bg-blue-900/30 text-blue-300 border border-blue-500/30' : 'bg-white/5 text-slate-400 border border-white/10'}`}>
              <span>🎟️</span>
              <span className="text-xs mt-1">{client.usesCoupon ? '쿠폰' : '쿠폰 X'}</span>
            </div>
            <div className={`flex flex-col items-center justify-center py-2 rounded-lg ${client.publishesNews ? 'bg-green-900/30 text-green-300 border border-green-500/30' : 'bg-white/5 text-slate-400 border border-white/10'}`}>
              <span>📰</span>
              <span className="text-xs mt-1">{client.publishesNews ? '소식' : '소식 X'}</span>
            </div>
            <div className={`flex flex-col items-center justify-center py-2 rounded-lg ${client.usesReservation ? 'bg-purple-900/30 text-purple-300 border border-purple-500/30' : 'bg-white/5 text-slate-400 border border-white/10'}`}>
              <span>📅</span>
              <span className="text-xs mt-1">{client.usesReservation ? '예약' : '예약 X'}</span>
            </div>
          </div>
        </div>
        
        {/* 추가 정보 - 독립된 링크들 */}
        <div className="space-y-2 mb-4">
          {client.phoneNumber && (
            <div className="flex items-center text-sm">
              <span className="mr-2 text-slate-400">📞</span>
              <a 
                href={`tel:${client.phoneNumber}`} 
                className="text-slate-300 hover:text-blue-300 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                {client.phoneNumber}
              </a>
            </div>
          )}
          
          {client.naverPlaceUrl && (
            <div className="flex items-center text-sm">
              <span className="mr-2 text-slate-400">🔗</span>
              <a 
                href={client.naverPlaceUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-slate-300 hover:text-blue-300 transition-colors truncate"
                onClick={(e) => e.stopPropagation()}
              >
                {formatNaverUrl(client.naverPlaceUrl)}
              </a>
            </div>
          )}
          
          <div className="flex items-center text-sm">
            <span className="mr-2 text-slate-400">🕒</span>
            <span className="text-slate-300">최근 활동: {formatActivityDate(lastActivityDate)}</span>
          </div>
        </div>
        
        {/* 메모 섹션 */}
        <div className="mb-4">
          <div 
            className="mb-2 flex items-center cursor-pointer text-slate-300 hover:text-blue-300 transition-colors" 
            onClick={toggleNotes}
          >
            <span className="mr-2">📝</span>
            <span className="text-sm font-medium">메모 ({noteCount})</span>
            <span className="ml-auto">{showNotes ? '▲' : '▼'}</span>
          </div>
          
          {showNotes && clientNotes.length > 0 && (
            <div className="ml-6 space-y-2 animate-fadeIn">
              {clientNotes.map(note => (
                <div key={String(note.id)} className="bg-white/5 rounded-lg p-2 border border-white/10">
                  <p className="text-sm text-slate-300 mb-1">{note.content}</p>
                  <p className="text-xs text-slate-400 text-right">{formatNoteDate(note.date)}</p>
                </div>
              ))}
            </div>
          )}
          
          {showNotes && clientNotes.length === 0 && (
            <div className="ml-6 text-sm text-slate-400">
              메모가 없습니다.
            </div>
          )}
        </div>
        
        {/* 할 일 섹션 */}
        <div className="mb-4">
          <div 
            className="mb-2 flex items-center cursor-pointer text-slate-300 hover:text-blue-300 transition-colors" 
            onClick={toggleTodos}
          >
            <span className="mr-2">✅</span>
            <span className="text-sm font-medium">할 일 ({todoCount})</span>
            <span className="ml-auto">{showTodos ? '▲' : '▼'}</span>
          </div>
          
          {showTodos && clientTodos.length > 0 && (
            <div className="ml-6 space-y-2 animate-fadeIn">
              {clientTodos.map(todo => (
                <div key={String(todo.id)} className={`rounded-lg p-2 border ${todo.completed ? 'bg-green-900/20 border-green-500/30' : 'bg-white/5 border-white/10'}`}>
                  <p className={`text-sm ${todo.completed ? 'text-green-300 line-through' : 'text-slate-300'} mb-1`}>{todo.content}</p>
                  <p className="text-xs text-slate-400 text-right">{formatNoteDate(todo.date)}</p>
                </div>
              ))}
            </div>
          )}
          
          {showTodos && clientTodos.length === 0 && (
            <div className="ml-6 text-sm text-slate-400">
              할 일이 없습니다.
            </div>
          )}
        </div>
        
        {/* 상세 페이지로 이동하는 링크 버튼 */}
        <div className="mt-2 mb-4">
          <Link href={`/clients/${client.id}`}>
            <div className="text-center py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all duration-300 text-sm border border-white/10">
              상세 정보 보기
            </div>
          </Link>
        </div>
        
        {/* 액션 버튼 */}
        <div className="flex mt-auto justify-between">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onAddNote(client.id);
            }}
            className="px-3 py-2 bg-blue-900/30 text-blue-300 rounded-lg hover:bg-blue-800/50 transition-all duration-300 text-sm flex items-center border border-blue-500/30"
          >
            <span className="mr-1">📝</span> 메모 추가
          </button>
          
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onAddTodo(client.id);
            }}
            className="px-3 py-2 bg-green-900/30 text-green-300 rounded-lg hover:bg-green-800/50 transition-all duration-300 text-sm flex items-center border border-green-500/30"
          >
            <span className="mr-1">✅</span> 할 일 추가
          </button>
        </div>
      </div>
      
      {/* 반짝이는 효과 */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -translate-x-full group-hover:translate-x-full animate-[shimmer_3s_infinite] pointer-events-none z-20"></div>
    </div>
  );
} 