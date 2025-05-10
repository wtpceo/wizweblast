'use client';

import { useState, useEffect, useRef } from 'react';
import { Client } from '@/lib/mock-data';

interface ClientMemoDialogProps {
  client: Client | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (clientId: string, note: string) => void;
}

export function ClientMemoDialog({ client, isOpen, onClose, onSave }: ClientMemoDialogProps) {
  const [note, setNote] = useState('');
  
  // 메모 입력 영역 ref 추가
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // 대화상자가 열릴 때 텍스트 영역에 포커스
  useEffect(() => {
    if (isOpen && textareaRef.current) {
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);
  
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
      setNote('');
      onClose();
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
        className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md transform transition-all animate-scale-up"
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
              <div className="text-xs text-gray-500">메모 추가하기</div>
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
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <textarea
              ref={textareaRef}
              className="w-full border border-gray-300 rounded-lg p-3 h-32 focus:ring-2 focus:ring-[#2251D1] focus:border-transparent transition-all resize-none"
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
              type="button"
              onClick={onClose}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg transition-all hover:shadow flex items-center"
              title="취소 (Esc)"
            >
              <span className="mr-1">✕</span> 취소
            </button>
            <button
              type="submit"
              className="wiz-btn hover:translate-y-[-1px] flex items-center"
              title="저장 (Ctrl+Enter)"
            >
              <span className="mr-1">💾</span> 저장
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 