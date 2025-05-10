'use client';

import { useState, useEffect, useRef } from 'react';
import { Client } from '@/lib/mock-data';

interface ClientTodoDialogProps {
  client: Client | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (clientId: string, content: string, assignedTo: string) => void;
}

export function ClientTodoDialog({ client, isOpen, onClose, onSave }: ClientTodoDialogProps) {
  const [content, setContent] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  
  // 입력 필드 ref 추가
  const contentInputRef = useRef<HTMLInputElement>(null);
  
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
  
  // 담당자 목록 (실제로는 API에서 가져올 수 있음)
  const teamMembers = [
    { id: 'user1', name: '김민수', emoji: '👨‍💼' },
    { id: 'user2', name: '이지영', emoji: '👩‍💼' },
    { id: 'user3', name: '박준호', emoji: '👨‍💻' },
    { id: 'user4', name: '최수진', emoji: '👩‍💻' }
  ];
  
  if (!isOpen || !client) return null;
  
  // 할 일 저장 처리 함수
  const handleSaveAction = () => {
    if (content.trim() && assignedTo) {
      onSave(client.id, content, assignedTo);
      setContent('');
      setAssignedTo('');
      onClose();
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
      <div 
        className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md transform transition-all animate-scale-up"
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
              <div className="text-xs text-gray-500">할 일 추가하기</div>
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
        
        <form onSubmit={handleSubmit}>
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
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              <span className="mr-2">👤</span> 담당자
            </label>
            
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
                  <span className="mr-2 text-lg">{member.emoji}</span>
                  <span className={assignedTo === member.id ? 'font-medium' : ''}>{member.name}</span>
                </button>
              ))}
            </div>
          </div>
          
          {/* 선택된 담당자 요약 */}
          {selectedMember && (
            <div className="mb-4 bg-[#F9FAFD] rounded-lg p-3 flex justify-between items-center">
              <div className="flex items-center">
                <span className="text-xl mr-2">{selectedMember.emoji}</span>
                <span className="font-medium">{selectedMember.name}</span>
              </div>
              <span className="text-xs text-[#2251D1]">담당자로 지정됨</span>
            </div>
          )}
          
          <div className="flex justify-between items-center">
            <div className="text-xs text-gray-500">
              {content.length > 0 && assignedTo
                ? "모든 정보가 입력되었어요! 👍 (Enter 키로 등록)"
                : "모든 항목을 입력해주세요"}
            </div>
            
            <div className="flex gap-2">
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
                disabled={!content || !assignedTo}
                className={`py-2 px-4 rounded-lg shadow transition-all flex items-center ${
                  content && assignedTo
                    ? 'bg-[#4CAF50] hover:bg-[#3d8b40] text-white hover:translate-y-[-1px]'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
                title="추가 (Enter)"
              >
                <span className="mr-1">✓</span> 추가
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
} 