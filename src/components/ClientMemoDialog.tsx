'use client';

import { useState, useEffect, useRef } from 'react';
import { Client } from '@/lib/mock-data';

interface ClientMemoDialogProps {
  client: Client | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (clientId: string, note: string) => void;
}

interface Note {
  id: string | number;
  content: string;
  date: string;
  user?: string;
}

export function ClientMemoDialog({ client, isOpen, onClose, onSave }: ClientMemoDialogProps) {
  const [note, setNote] = useState('');
  const [clientNotes, setClientNotes] = useState<Note[]>([]);
  const [isLoadingNotes, setIsLoadingNotes] = useState(false);
  
  // 메모 입력 영역 ref 추가
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // 대화상자가 열릴 때 텍스트 영역에 포커스 및 메모 불러오기
  useEffect(() => {
    if (isOpen && textareaRef.current) {
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
      
      // 클라이언트 ID가 있을 때만 메모 불러오기
      if (client?.id) {
        loadClientNotes(client.id);
      }
    }
  }, [isOpen, client?.id]);
  
  // 로컬 스토리지에서 클라이언트 메모 불러오기
  const loadClientNotes = (clientId: string) => {
    setIsLoadingNotes(true);
    
    try {
      // 먼저 새로운 형식의 스토리지 키로 확인
      const wizweblastNotes = localStorage.getItem(`wizweblast_notes_client_${clientId}`);
      if (wizweblastNotes) {
        const parsedNotes = JSON.parse(wizweblastNotes);
        
        if (parsedNotes.length > 0) {
          const formattedNotes = parsedNotes.map((item: any) => ({
            id: item.id,
            content: item.note || item.content,
            date: item.createdAt || item.created_at,
            user: item.createdBy || item.created_by || '로컬 저장'
          }));
          
          // 날짜 기준 내림차순 정렬
          formattedNotes.sort((a: Note, b: Note) => 
            new Date(b.date).getTime() - new Date(a.date).getTime()
          );
          
          setClientNotes(formattedNotes);
          setIsLoadingNotes(false);
          return;
        }
      }
      
      // 이전 형식의 스토리지 확인
      const localNotes = localStorage.getItem('client_notes');
      if (localNotes) {
        const parsedNotes = JSON.parse(localNotes);
        const filteredNotes = parsedNotes.filter((note: any) => note.clientId === clientId);
        
        if (filteredNotes.length > 0) {
          const formattedNotes = filteredNotes.map((item: any) => ({
            id: item.id,
            content: item.note,
            date: item.createdAt,
            user: item.createdBy || '로컬 저장'
          }));
          
          // 날짜 기준 내림차순 정렬
          formattedNotes.sort((a: Note, b: Note) => 
            new Date(b.date).getTime() - new Date(a.date).getTime()
          );
          
          setClientNotes(formattedNotes);
          
          // 이전 형식에서 로드한 데이터를 새 형식으로도 저장 (마이그레이션)
          try {
            localStorage.setItem(`wizweblast_notes_client_${clientId}`, JSON.stringify(
              filteredNotes.map((note: any) => ({
                id: note.id,
                note: note.note,
                content: note.note,
                createdAt: note.createdAt,
                created_at: note.createdAt,
                createdBy: note.createdBy,
                created_by: note.createdBy
              }))
            ));
            console.log('메모 데이터를 새 형식으로 마이그레이션했습니다.');
          } catch (migrationErr) {
            console.error('메모 데이터 마이그레이션 오류:', migrationErr);
          }
        } else {
          setClientNotes([]);
        }
      } else {
        setClientNotes([]);
      }
    } catch (err) {
      console.error('메모 로드 오류:', err);
      setClientNotes([]);
    } finally {
      setIsLoadingNotes(false);
    }
  };
  
  // 키보드 단축키 처리
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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
  }, [isOpen, onClose]);
  
  if (!isOpen || !client) return null;
  
  // 메모 저장 처리 함수
  const handleSaveAction = () => {
    if (note.trim()) {
      onSave(client.id, note);
      
      // 로컬 스토리지에 메모 직접 추가 (낙관적 UI 업데이트)
      try {
        const now = new Date().toISOString();
        const newNoteId = `local-${Date.now()}`;
        
        // 새 메모 데이터 생성
        const newNote = {
          id: newNoteId,
          clientId: client.id,
          note: note,
          content: note,
          createdAt: now,
          created_at: now,
          createdBy: '나',
          created_by: '나'
        };
        
        // 1. 이전 형식의 스토리지 업데이트 (호환성)
        const localNotes = JSON.parse(localStorage.getItem('client_notes') || '[]');
        localNotes.push(newNote);
        localStorage.setItem('client_notes', JSON.stringify(localNotes));
        
        // 2. 새로운 형식의 스토리지 업데이트
        const wizweblastNotes = JSON.parse(localStorage.getItem(`wizweblast_notes_client_${client.id}`) || '[]');
        wizweblastNotes.push(newNote);
        localStorage.setItem(`wizweblast_notes_client_${client.id}`, JSON.stringify(wizweblastNotes));
        
        // 새 메모를 목록 맨 위에 추가
        setClientNotes([
          {
            id: newNote.id,
            content: newNote.note,
            date: newNote.createdAt,
            user: newNote.createdBy
          },
          ...clientNotes
        ]);
        
        // 커스텀 이벤트를 발생시켜 UI 업데이트 알림
        window.dispatchEvent(new Event('note_updated'));
      } catch (storageErr) {
        console.error('로컬 스토리지 저장 오류:', storageErr);
      }
      
      setNote('');
    }
  };
  
  // 폼 제출 핸들러
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSaveAction();
  };
  
  // 텍스트 영역 키 이벤트 처리
  const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Ctrl+Enter 키로 저장
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && note.trim()) {
      e.preventDefault();
      handleSaveAction();
    }
  };

  // 메모 날짜 포맷팅
  const formatNoteDate = (dateString: string) => {
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

  // 랜덤 격려 메시지 (디자인 가이드에 맞게 유쾌한 메시지 추가)
  const encouragements = [
    "메모를 남겨서 팀원들과 정보를 공유해요! 👍",
    "좋은 기록은 좋은 결과로 이어져요! ✨",
    "메모 하나가 큰 차이를 만들어요! 🚀",
    "아이디어가 번뜩이나요? 지금 기록해요! 💡"
  ];
  
  const randomEncouragement = encouragements[Math.floor(Math.random() * encouragements.length)];
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
      <div 
        className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md transform transition-all animate-scale-up max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 부분 */}
        <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-100">
          <h3 className="text-lg font-bold flex items-center">
            <div className="mr-3 w-8 h-8 rounded-full bg-[#FFC107] bg-opacity-20 flex items-center justify-center">
              <span className="text-xl">{client.icon}</span>
            </div>
            <div>
              <div>{client.name}</div>
              <div className="text-xs text-gray-500">메모 관리</div>
            </div>
          </h3>
          <button 
            onClick={onClose}
            className="bg-gray-100 hover:bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
            title="닫기 (Esc)"
          >
            ✕
          </button>
        </div>
        
        {/* 격려 메시지 */}
        <div className="mb-4 bg-[#EEF2FB] rounded-lg p-3 text-sm text-[#2251D1] flex items-start">
          <span className="mr-2 mt-1">💡</span>
          <p>{randomEncouragement}</p>
        </div>
        
        <form onSubmit={handleSubmit} className="mb-4">
          <div className="mb-4">
            <textarea
              ref={textareaRef}
              className="w-full border border-gray-300 rounded-lg p-3 h-24 focus:ring-2 focus:ring-[#2251D1] focus:border-transparent transition-all resize-none"
              placeholder="메모 내용을 입력한 후 Ctrl+Enter를 눌러 저장하세요..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              onKeyDown={handleTextareaKeyDown}
              required
            />
            <div className="flex justify-between mt-1 text-xs text-gray-500">
              <span>Ctrl+Enter로 저장</span>
              <span>{note.length}/500자</span>
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <button
              type="submit"
              className="wiz-btn hover:translate-y-[-1px] flex items-center"
              title="저장 (Ctrl+Enter)"
              disabled={!note.trim()}
            >
              <span className="mr-1">💾</span> 저장
            </button>
          </div>
        </form>
        
        {/* 메모 목록 */}
        <div className="border-t border-gray-200 pt-3 mt-2">
          <h4 className="text-sm font-medium mb-3 flex items-center">
            <span className="mr-1">📝</span> 
            저장된 메모 ({clientNotes.length}개)
          </h4>
          
          <div className="overflow-y-auto max-h-[30vh]">
            {isLoadingNotes ? (
              <div className="text-center py-4 text-gray-500">
                <div className="inline-block animate-spin text-xl mb-2">⏳</div>
                <p className="text-sm">메모를 불러오는 중...</p>
              </div>
            ) : clientNotes.length > 0 ? (
              <div className="space-y-3">
                {clientNotes.map((noteItem) => (
                  <div 
                    key={noteItem.id} 
                    className={`p-3 rounded-lg ${typeof noteItem.id === 'string' && noteItem.id.startsWith('local-') ? 'bg-[#E3F2FD]' : 'bg-[#FFF8E1]'}`}
                  >
                    <div className="flex justify-between items-center mb-1 text-xs">
                      <span className="font-medium">{noteItem.user || '메모'}</span>
                      <span className="text-gray-500">{formatNoteDate(noteItem.date)}</span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap break-words">{noteItem.content}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                <p className="text-sm">저장된 메모가 없습니다.</p>
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