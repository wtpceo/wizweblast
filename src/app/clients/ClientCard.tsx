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
  
  // 계약 기간 포맷팅 함수
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
  };
  
  // 최근 활동일 포맷팅 및 경과일 계산
  const formatActivityDate = (dateString?: string) => {
    if (!dateString) return { formatted: '정보 없음', daysAgo: 0 };
    
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = today.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    // 시간 포맷팅 추가 (24시간제)
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return {
      formatted: `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')} ${hours}:${minutes}`,
      daysAgo: diffDays
    };
  };
  
  // 계약 종료까지 남은 일수 계산
  const getDaysRemaining = () => {
    const endDate = new Date(client.contractEnd);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };
  
  const daysRemaining = getDaysRemaining();
  
  // 상태 태그별 색상 및 아이콘 매핑
  const getStatusTagStyles = (tag: string) => {
    switch(tag) {
      case '종료 임박':
        return {
          bg: 'bg-[#FFF8E1]',
          text: 'text-[#FFC107]',
          border: 'border-[#FFC107]',
          icon: '⏰'
        };
      case '관리 소홀':
        return {
          bg: 'bg-[#FFF3E0]',
          text: 'text-[#FF9800]',
          border: 'border-[#FF9800]',
          icon: '⚠️'
        };
      case '민원 중':
        return {
          bg: 'bg-[#FFEBEE]',
          text: 'text-[#F44336]',
          border: 'border-[#F44336]',
          icon: '🔔'
        };
      default:
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-600',
          border: 'border-gray-300',
          icon: '📝'
        };
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
  
  // 메모 날짜 포맷팅
  const formatNoteDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return '오늘';
    } else if (diffDays === 1) {
      return '어제';
    } else if (diffDays < 7) {
      return `${diffDays}일 전`;
    } else {
      return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
    }
  };

  // 네이버 플레이스 URL 포맷팅
  const formatNaverUrl = (url?: string) => {
    if (!url) return '';
    
    // URL이 'http'로 시작하지 않으면 'https://'를 추가
    if (!url.startsWith('http')) {
      return `https://${url}`;
    }
    return url;
  };
  
  // 카드 하단 버튼 - 할 일/메모 추가
  const bottomControls = (
    <div className="absolute -bottom-10 left-0 right-0 flex justify-between px-2">
      <button
        onClick={(e) => { e.stopPropagation(); onAddTodo(client.id); }}
        className="bg-white hover:bg-gray-50 text-blue-600 flex items-center gap-1 py-1.5 px-3 rounded-lg shadow-sm border border-gray-100 transition-all hover:shadow"
      >
        <span className="text-blue-500 text-sm">✓</span>
        <span className="text-sm font-medium">할 일</span>
        {todoCount > 0 && (
          <span className="ml-1 bg-blue-100 text-blue-800 text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {todoCount > 9 ? '9+' : todoCount}
          </span>
        )}
      </button>
      
      <button
        onClick={(e) => { e.stopPropagation(); onAddNote(client.id); }}
        className="bg-white hover:bg-gray-50 text-violet-600 flex items-center gap-1 py-1.5 px-3 rounded-lg shadow-sm border border-gray-100 transition-all hover:shadow"
      >
        <span className="text-violet-500 text-sm">✎</span>
        <span className="text-sm font-medium">메모</span>
        {noteCount > 0 && (
          <span className="ml-1 bg-violet-100 text-violet-800 text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {noteCount > 9 ? '9+' : noteCount}
          </span>
        )}
      </button>
    </div>
  );
  
  return (
    <div className="relative mb-14">
      <div 
        className={`wiz-card p-0 overflow-hidden transition-all duration-200 flex flex-col h-[340px] ${
          isHovered ? 'shadow-md transform scale-[1.01]' : 'shadow-sm'
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* 광고주 헤더 */}
        <div className={`p-4 flex items-center ${client.statusTags.includes('민원 중') ? 'bg-[#FFEBEE]' : client.statusTags.includes('관리 소홀') ? 'bg-[#FFF3E0]' : client.statusTags.includes('종료 임박') ? 'bg-[#FFF8E1]' : 'bg-[#EEF2FB]'}`}>
          <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-3xl shadow-sm">
            <span role="img" aria-label={client.name}>{client.icon}</span>
          </div>
          <div className="ml-4">
            <h3 className="font-bold text-lg">{client.name}</h3>
            <div className="text-xs text-gray-600">ID: {client.id}</div>
          </div>
        </div>
        
        <div className="p-5 flex-1 flex flex-col">
          {/* 계약 기간 */}
          <div className="mb-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">계약기간:</span>
              <span className="font-medium">{formatDate(client.contractStart)} ~ {formatDate(client.contractEnd)}</span>
            </div>
            {/* 남은 일수 표시 */}
            {daysRemaining <= 30 && (
              <div className="mt-1 flex justify-end">
                <span className={`text-xs px-2 py-1 rounded-full ${daysRemaining <= 7 ? 'bg-[#FFEBEE] text-[#F44336]' : 'bg-[#FFF8E1] text-[#FFC107]'}`}>
                  {daysRemaining > 0 ? `계약 종료까지 ${daysRemaining}일 남음` : '계약이 만료되었습니다!'}
                </span>
              </div>
            )}
          </div>
          
          {/* 최근 활동일 */}
          <div className="mb-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">최근 활동일:</span>
              {lastActivityDate ? (
                (() => {
                  const { formatted, daysAgo } = formatActivityDate(lastActivityDate);
                  return (
                    <span className={`font-medium ${daysAgo >= 5 ? 'text-[#FF9800]' : ''}`}>
                      {formatted}
                    </span>
                  );
                })()
              ) : (
                <span className="text-gray-400">정보 없음</span>
              )}
            </div>
            {lastActivityDate && (() => {
              const { daysAgo } = formatActivityDate(lastActivityDate);
              if (daysAgo >= 5) {
                return (
                  <div className="mt-1 flex justify-end">
                    <span className="text-xs px-2 py-1 rounded-full bg-[#FFF3E0] text-[#FF9800]">
                      {daysAgo}일 동안 활동 없음
                    </span>
                  </div>
                );
              }
              return null;
            })()}
          </div>
          
          {/* 서비스 사용 현황 */}
          <div className="mb-4 flex flex-wrap gap-2">
            <Link 
              href={`/clients/${client.id}?tab=info`} 
              className={`text-xs px-2.5 py-1 rounded-full flex items-center cursor-pointer hover:shadow-sm transition-shadow ${client.usesCoupon ? 'bg-[#E3F2FD] text-[#2196F3]' : 'bg-gray-100 text-gray-500'}`}
            >
              <span className="mr-1">🎟️</span>
              {client.usesCoupon ? '쿠폰 사용중' : '쿠폰 미사용'}
            </Link>
            <Link 
              href={`/clients/${client.id}?tab=info`} 
              className={`text-xs px-2.5 py-1 rounded-full flex items-center cursor-pointer hover:shadow-sm transition-shadow ${client.publishesNews ? 'bg-[#E8F5E9] text-[#4CAF50]' : 'bg-gray-100 text-gray-500'}`}
            >
              <span className="mr-1">📰</span>
              {client.publishesNews ? '소식 발행중' : '소식 미발행'}
            </Link>
            <Link 
              href={`/clients/${client.id}?tab=info`} 
              className={`text-xs px-2.5 py-1 rounded-full flex items-center cursor-pointer hover:shadow-sm transition-shadow ${client.usesReservation ? 'bg-[#F3E5F5] text-[#9C27B0]' : 'bg-gray-100 text-gray-500'}`}
            >
              <span className="mr-1">📅</span>
              {client.usesReservation ? '예약 사용중' : '예약 미사용'}
            </Link>
          </div>
          
          {/* 상태 태그 */}
          {client.statusTags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {client.statusTags.map(tag => {
                const style = getStatusTagStyles(tag);
                return (
                  <div 
                    key={tag} 
                    className={`${style.bg} ${style.text} text-xs px-2.5 py-1 rounded-full border ${style.border} flex items-center`}
                  >
                    <span className="mr-1">{style.icon}</span>
                    {tag}
                  </div>
                );
              })}
            </div>
          )}
          
          {/* 상태별 짧은 설명 */}
          {client.statusTags.includes('관리 소홀') && (
            <p className="text-xs text-[#FF9800] mb-4">
              📊 지난 2주간 업데이트가 없었어요. 확인이 필요해요!
            </p>
          )}
          {client.statusTags.includes('민원 중') && (
            <p className="text-xs text-[#F44336] mb-4">
              ⚡ 고객 불만 접수! 빠른 대응이 필요합니다.
            </p>
          )}
          
          {/* 메모 미리보기 버튼 */}
          {clientNotes.length > 0 && (
            <div className="mb-3">
              <button 
                onClick={toggleNotes}
                className="text-xs flex items-center text-[#FFC107] hover:underline cursor-pointer"
              >
                <span className="mr-1">📝</span> 
                {showNotes ? "메모 숨기기" : `${clientNotes.length}개의 메모 보기`}
              </button>
            </div>
          )}
          
          {/* 할 일 미리보기 버튼 */}
          {clientTodos.length > 0 && (
            <div className="mb-3">
              <button 
                onClick={toggleTodos}
                className="text-xs flex items-center text-[#4CAF50] hover:underline cursor-pointer"
              >
                <span className="mr-1">✓</span> 
                {showTodos ? "할 일 숨기기" : `${clientTodos.length}개의 할 일 보기`}
              </button>
            </div>
          )}
          
          {/* 네이버 플레이스 링크 */}
          {client.naverPlaceUrl && (
            <div className="mb-3">
              <a 
                href={formatNaverUrl(client.naverPlaceUrl)} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-xs flex items-center text-[#03C75A] hover:underline"
              >
                <span className="mr-1">🔗</span>
                네이버 플레이스 바로가기
              </a>
            </div>
          )}
          
          <div className="flex-grow"></div>
          
          {/* 액션 버튼 */}
          <div className="flex gap-2 mt-auto">
            <Link 
              href={`/clients/${client.id}`} 
              className="wiz-btn flex-1 py-1.5 text-center text-sm flex items-center justify-center hover:translate-y-[-1px]"
            >
              상세 보기
            </Link>
            {client.naverPlaceUrl && (
              <a 
                href={formatNaverUrl(client.naverPlaceUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#03C75A] hover:bg-[#02B14F] text-white py-1.5 px-3 rounded-lg shadow transition-all duration-200 text-sm flex items-center hover:translate-y-[-1px]"
              >
                <span className="mr-1">N</span>
              </a>
            )}
          </div>
          
          {/* 재미있는 미세 카피 */}
          <div className="mt-3 text-center">
            <span className="text-xs text-gray-400 italic">
              {isHovered ? '👆 액션을 선택해보세요!' : '이 고객의 성공을 돕고 있어요!'}
            </span>
          </div>
        </div>
      </div>
      
      {/* 카드 바깥에 위치한 액션 버튼 */}
      {bottomControls}
      
      {/* 메모 미리보기 */}
      {showNotes && clientNotes.length > 0 && (
        <div className="absolute top-0 right-0 left-0 mt-16 bg-white shadow-lg rounded-b-lg z-20 p-3 border-t border-gray-100 overflow-hidden max-h-48 overflow-y-auto">
          {clientNotes.map(note => (
            <div key={note.id} className="text-sm mb-2 bg-orange-50 rounded-lg p-2 relative hover:bg-orange-100 transition-colors">
              <div className="text-xs text-gray-500 mb-1">
                {new Date(note.date).toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
              <div className="whitespace-pre-wrap break-words">{note.content}</div>
            </div>
          ))}
          {noteCount > 3 && (
            <div className="text-xs text-center mt-2 text-blue-600 font-medium">
              <Link href={`/clients/${client.id}?tab=notes`} className="hover:underline">
                + {noteCount - 3}개 더 보기
              </Link>
            </div>
          )}
        </div>
      )}
      
      {/* 할 일 미리보기 */}
      {showTodos && clientTodos.length > 0 && (
        <div className="absolute top-0 right-0 left-0 mt-16 bg-white shadow-lg rounded-b-lg z-20 p-3 border-t border-gray-100 overflow-hidden max-h-48 overflow-y-auto">
          {clientTodos.map(todo => (
            <div key={todo.id} className={`text-sm mb-2 ${todo.completed ? 'bg-green-50' : 'bg-blue-50'} rounded-lg p-2 relative hover:bg-blue-100 transition-colors`}>
              <div className="text-xs text-gray-500 mb-1 flex justify-between">
                <div className={`${todo.completed ? 'text-green-600' : 'text-blue-600'} font-medium flex items-center`}>
                  <span className="mr-1">{todo.completed ? '✅' : '⏳'}</span>
                  {todo.completed ? '완료됨' : '진행 중'}
                </div>
                <span>
                  {new Date(todo.date).toLocaleDateString('ko-KR', {
                    month: 'short',
                    day: 'numeric'
                  })}
                </span>
              </div>
              <div className={`whitespace-pre-wrap break-words ${todo.completed ? 'line-through text-gray-500' : ''}`}>{todo.content}</div>
            </div>
          ))}
          {todoCount > 3 && (
            <div className="text-xs text-center mt-2 text-blue-600 font-medium">
              <Link href={`/clients/${client.id}?tab=todos`} className="hover:underline">
                + {todoCount - 3}개 더 보기
              </Link>
            </div>
          )}
        </div>
      )}
      
      {/* 메모 버튼 */}
      {clientNotes.length > 0 && (
        <button
          className="absolute top-2 right-2 bg-white hover:bg-violet-50 shadow-sm p-1.5 rounded-full border border-gray-200 focus:outline-none transition-colors"
          onClick={toggleNotes}
          title={showNotes ? "메모 숨기기" : "메모 보기"}
        >
          <span className={`text-xs inline-flex items-center justify-center h-5 w-5 ${showNotes ? 'text-violet-700 bg-violet-100' : 'text-violet-500 bg-violet-50'} rounded-full transition-colors`}>
            {showNotes ? "✕" : clientNotes.length}
          </span>
        </button>
      )}
      
      {/* 할 일 버튼 */}
      {clientTodos.length > 0 && (
        <button
          className="absolute top-2 right-10 bg-white hover:bg-blue-50 shadow-sm p-1.5 rounded-full border border-gray-200 focus:outline-none transition-colors"
          onClick={toggleTodos}
          title={showTodos ? "할 일 숨기기" : "할 일 보기"}
        >
          <span className={`text-xs inline-flex items-center justify-center h-5 w-5 ${showTodos ? 'text-blue-700 bg-blue-100' : 'text-blue-500 bg-blue-50'} rounded-full transition-colors`}>
            {showTodos ? "✕" : clientTodos.length}
          </span>
        </button>
      )}
    </div>
  );
} 