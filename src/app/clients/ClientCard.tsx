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
  
  // 클라이언트 로컬 스토리지에서 최신 활동일 확인
  useEffect(() => {
    // 초기 설정 (처음 한 번만 설정)
    if (client.last_activity_at) {
      setLastActivityDate(client.last_activity_at);
    }
    
    // 로컬 스토리지 이벤트 리스너
    const checkLocalStorage = () => {
      try {
        // 클라이언트 개별 데이터 확인
        const clientData = localStorage.getItem(`wizweblast_client_${client.id}`);
        if (clientData) {
          const parsedClient = JSON.parse(clientData);
          if (parsedClient.last_activity_at && parsedClient.last_activity_at !== client.last_activity_at) {
            setLastActivityDate(parsedClient.last_activity_at);
          }
        }
        
        // 업데이트 트리거 확인
        const updateTrigger = localStorage.getItem('__temp_client_update_trigger');
        if (updateTrigger) {
          const triggerData = JSON.parse(updateTrigger);
          if (triggerData.clientId === client.id && triggerData.last_activity_at !== client.last_activity_at) {
            setLastActivityDate(triggerData.last_activity_at);
          }
        }
      } catch (e) {
        console.error('로컬 스토리지 활동일 확인 오류:', e);
      }
    };
    
    // 이벤트 리스너 등록 (함수 레퍼런스 유지를 위해 내부에서 정의)
    const handleStorage = () => checkLocalStorage();
    const handleFocus = () => checkLocalStorage();
    
    window.addEventListener('storage', handleStorage);
    window.addEventListener('focus', handleFocus);
    
    // 컴포넌트 마운트 시 확인
    checkLocalStorage();
    
    // 클린업
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('focus', handleFocus);
    };
  }, [client.id, client.last_activity_at]); // lastActivityDate 의존성 제거
  
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
  
  return (
    <div 
      className={`wiz-card p-0 overflow-hidden transition-all duration-200 flex flex-col h-[320px] ${
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
          <div className={`text-xs px-2.5 py-1 rounded-full flex items-center ${client.usesCoupon ? 'bg-[#E3F2FD] text-[#2196F3]' : 'bg-gray-100 text-gray-500'}`}>
            <span className="mr-1">🎟️</span>
            {client.usesCoupon ? '쿠폰 사용중' : '쿠폰 미사용'}
          </div>
          <div className={`text-xs px-2.5 py-1 rounded-full flex items-center ${client.publishesNews ? 'bg-[#E8F5E9] text-[#4CAF50]' : 'bg-gray-100 text-gray-500'}`}>
            <span className="mr-1">📰</span>
            {client.publishesNews ? '소식 발행중' : '소식 미발행'}
          </div>
          <div className={`text-xs px-2.5 py-1 rounded-full flex items-center ${client.usesReservation ? 'bg-[#F3E5F5] text-[#9C27B0]' : 'bg-gray-100 text-gray-500'}`}>
            <span className="mr-1">📅</span>
            {client.usesReservation ? '예약 사용중' : '예약 미사용'}
          </div>
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
        
        <div className="flex-grow"></div>
        
        {/* 액션 버튼 */}
        <div className="flex gap-2 mt-auto">
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