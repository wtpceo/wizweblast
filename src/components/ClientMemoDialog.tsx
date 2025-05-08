'use client';

import { useState } from 'react';
import { Client } from '@/lib/mock-data';

interface ClientMemoDialogProps {
  client: Client | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (clientId: string, note: string) => void;
}

export function ClientMemoDialog({ client, isOpen, onClose, onSave }: ClientMemoDialogProps) {
  const [note, setNote] = useState('');
  
  if (!isOpen || !client) return null;
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (note.trim()) {
      onSave(client.id, note);
      setNote('');
      onClose();
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
              className="w-full border border-gray-300 rounded-lg p-3 h-32 focus:ring-2 focus:ring-[#2251D1] focus:border-transparent transition-all resize-none"
              placeholder="메모 내용을 입력하세요..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              required
            />
            <div className="mt-1 text-xs text-right text-gray-500">
              {note.length}/500자
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg transition-all hover:shadow flex items-center"
            >
              <span className="mr-1">✕</span> 취소
            </button>
            <button
              type="submit"
              className="wiz-btn hover:translate-y-[-1px] flex items-center"
            >
              <span className="mr-1">💾</span> 저장
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 