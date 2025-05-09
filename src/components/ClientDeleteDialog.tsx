'use client';

import { Client } from '@/lib/mock-data';
import Link from 'next/link';
import { useState } from 'react';

interface ClientDeleteDialogProps {
  client: Client | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete: (clientId: string) => void;
  isDeleting: boolean;
}

export function ClientDeleteDialog({ 
  client, 
  isOpen, 
  onClose, 
  onDelete,
  isDeleting 
}: ClientDeleteDialogProps) {
  if (!isOpen || !client) return null;
  
  const handleDelete = () => {
    onDelete(client.id);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
      <div 
        className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md transform transition-all animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 부분 */}
        <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-100">
          <h3 className="text-lg font-bold flex items-center">
            <div className="mr-3 w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
              <span className="text-xl">⚠️</span>
            </div>
            <div>
              <div>광고주 삭제</div>
              <div className="text-xs text-gray-500">이 작업은 되돌릴 수 없습니다</div>
            </div>
          </h3>
          <button 
            onClick={onClose}
            className="bg-gray-100 hover:bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
            disabled={isDeleting}
          >
            ✕
          </button>
        </div>
        
        {/* 경고 메시지 */}
        <div className="mb-6 bg-red-50 border border-red-100 rounded-lg p-4 text-sm text-red-700">
          <p className="font-medium mb-2">정말로 "{client.name}" 광고주를 삭제하시겠습니까?</p>
          <p>이 작업을 수행하면 모든 관련 데이터(메모, 할 일)가 함께 삭제되며 복구할 수 없습니다.</p>
        </div>
        
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg transition-all hover:shadow flex items-center"
            disabled={isDeleting}
          >
            <span className="mr-1">✕</span> 취소
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-all hover:shadow flex items-center"
            disabled={isDeleting}
          >
            <span className="mr-1">🗑️</span> {isDeleting ? '삭제 중...' : '삭제하기'}
          </button>
        </div>
      </div>
    </div>
  );
}
