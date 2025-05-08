'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Client } from '@/lib/mock-data';

interface ClientCardProps {
  client: Client;
  onAddTodo: (clientId: string) => void;
  onAddNote: (clientId: string) => void;
}

export function ClientCard({ client, onAddTodo, onAddNote }: ClientCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  // 계약 기간 포맷팅 함수
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
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
  
  return (
    <div 
      className={`wiz-card p-0 overflow-hidden transition-all duration-200 ${
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
      
      <div className="p-5">
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
        
        {/* 액션 버튼 */}
        <div className="flex gap-2 mt-5">
          <Link 
            href={`/clients/${client.id}`} 
            className="wiz-btn flex-1 py-1.5 text-center text-sm flex items-center justify-center hover:translate-y-[-1px]"
          >
            상세 보기
          </Link>
          <button
            onClick={() => onAddTodo(client.id)}
            className="bg-[#4CAF50] hover:bg-[#3d8b40] text-white py-1.5 px-3 rounded-lg shadow transition-all duration-200 text-sm flex items-center hover:translate-y-[-1px]"
          >
            <span className="mr-1">+</span> 할 일
          </button>
          <button
            onClick={() => onAddNote(client.id)}
            className="bg-[#FFC107] hover:bg-[#e6ac00] text-white py-1.5 px-3 rounded-lg shadow transition-all duration-200 text-sm flex items-center hover:translate-y-[-1px]"
          >
            ✍️ 메모
          </button>
        </div>
        
        {/* 재미있는 미세 카피 */}
        <div className="mt-3 text-center">
          <span className="text-xs text-gray-400 italic">
            {isHovered ? '👆 액션을 선택해보세요!' : '이 고객의 성공을 돕고 있어요!'}
          </span>
        </div>
      </div>
    </div>
  );
} 