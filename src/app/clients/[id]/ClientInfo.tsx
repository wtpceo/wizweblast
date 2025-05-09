'use client';

import { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Client } from '@/lib/mock-data';
import { format, isValid, parse } from 'date-fns';
import { ko } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';

interface ClientInfoProps {
  client: Client;
  onContractUpdate: (start?: string, end?: string) => void;
}

export function ClientInfo({ client, onContractUpdate }: ClientInfoProps) {
  // 계약 시작일 상태
  const [startDate, setStartDate] = useState<Date | undefined>(
    client.contractStart ? new Date(client.contractStart) : undefined
  );
  
  // 계약 종료일 상태
  const [endDate, setEndDate] = useState<Date | undefined>(
    client.contractEnd ? new Date(client.contractEnd) : undefined
  );
  
  // 시작일 입력 상태
  const [startDateInput, setStartDateInput] = useState<string>(
    client.contractStart ? format(new Date(client.contractStart), 'yyyy-MM-dd') : ''
  );
  
  // 종료일 입력 상태
  const [endDateInput, setEndDateInput] = useState<string>(
    client.contractEnd ? format(new Date(client.contractEnd), 'yyyy-MM-dd') : ''
  );
  
  // 입력 유효성 상태
  const [startDateInvalid, setStartDateInvalid] = useState(false);
  const [endDateInvalid, setEndDateInvalid] = useState(false);
  
  // 편집 모드 상태
  const [isEditing, setIsEditing] = useState(false);
  
  // 계약 시작일 변경 시
  const handleStartDateSelect = (date: Date | undefined) => {
    setStartDate(date);
    if (date) {
      setStartDateInput(format(date, 'yyyy-MM-dd'));
      setStartDateInvalid(false);
    }
  };
  
  // 계약 종료일 변경 시
  const handleEndDateSelect = (date: Date | undefined) => {
    setEndDate(date);
    if (date) {
      setEndDateInput(format(date, 'yyyy-MM-dd'));
      setEndDateInvalid(false);
    }
  };
  
  // 시작일 직접 입력 시
  const handleStartDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setStartDateInput(value);
    
    // 입력된 날짜 파싱
    const parsedDate = parse(value, 'yyyy-MM-dd', new Date());
    
    if (isValid(parsedDate)) {
      setStartDate(parsedDate);
      setStartDateInvalid(false);
    } else {
      setStartDateInvalid(value !== '');
    }
  };
  
  // 종료일 직접 입력 시
  const handleEndDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEndDateInput(value);
    
    // 입력된 날짜 파싱
    const parsedDate = parse(value, 'yyyy-MM-dd', new Date());
    
    if (isValid(parsedDate)) {
      setEndDate(parsedDate);
      setEndDateInvalid(false);
    } else {
      setEndDateInvalid(value !== '');
    }
  };
  
  // 계약 정보 저장
  const handleSaveContract = () => {
    // 유효성 검사
    if (startDateInvalid || endDateInvalid || !startDate || !endDate) {
      alert('유효한 계약 기간을 입력해주세요.');
      return;
    }
    
    // 시작일이 종료일보다 이후인 경우
    if (startDate > endDate) {
      alert('계약 시작일은 종료일보다 이전이어야 합니다.');
      return;
    }
    
    // 업데이트 콜백 호출
    onContractUpdate(startDate.toISOString(), endDate.toISOString());
    
    // 편집 모드 종료
    setIsEditing(false);
  };
  
  // 남은 계약 일수 계산
  const getDaysRemaining = () => {
    if (!client.contractEnd) return null;
    
    const endDate = new Date(client.contractEnd);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };
  
  const daysRemaining = getDaysRemaining();
  
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      {/* 섹션 헤더 */}
      <div className="bg-[#EEF2FB] px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-bold flex items-center">
          <span className="text-xl mr-2">📋</span> 광고주 정보
        </h2>
      </div>
      
      {/* 정보 섹션 */}
      <div className="p-6 space-y-6">
        {/* 기본 정보 */}
        <div>
          <h3 className="text-sm font-semibold text-gray-500 mb-3">기본 정보</h3>
          
          <div className="space-y-4">
            {/* 업체명 */}
            <div className="flex justify-between">
              <span className="text-gray-600">업체명:</span>
              <span className="font-medium">{client.name}</span>
            </div>
            
            {/* 전화번호 */}
            <div className="flex justify-between">
              <span className="text-gray-600">전화번호:</span>
              <span className="font-medium">{client.phoneNumber || '정보 없음'}</span>
            </div>
            
            {/* 네이버 플레이스 */}
            <div className="flex justify-between items-center">
              <span className="text-gray-600">네이버 플레이스:</span>
              {client.naverPlaceUrl ? (
                <a 
                  href={client.naverPlaceUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-[#2251D1] hover:underline flex items-center"
                >
                  <span>바로가기</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              ) : (
                <span className="text-gray-400">정보 없음</span>
              )}
            </div>
          </div>
        </div>
        
        {/* 계약 정보 */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-semibold text-gray-500">계약 정보</h3>
            {!isEditing ? (
              <button 
                onClick={() => setIsEditing(true)} 
                className="text-xs bg-[#EEF2FB] text-[#2251D1] px-2 py-1 rounded hover:bg-[#DCE4F9] transition-colors"
              >
                수정
              </button>
            ) : (
              <div className="flex space-x-2">
                <button 
                  onClick={() => setIsEditing(false)} 
                  className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded hover:bg-gray-300 transition-colors"
                >
                  취소
                </button>
                <button 
                  onClick={handleSaveContract} 
                  className="text-xs bg-[#2251D1] text-white px-2 py-1 rounded hover:bg-[#1A41B6] transition-colors"
                >
                  저장
                </button>
              </div>
            )}
          </div>
          
          {isEditing ? (
            <div className="space-y-4 mt-4">
              {/* 계약 시작일 (편집 모드) */}
              <div>
                <label htmlFor="contractStart" className="block text-sm text-gray-600 mb-1">
                  계약 시작일
                </label>
                <div className="flex">
                  <input
                    id="contractStart"
                    type="text"
                    value={startDateInput}
                    onChange={handleStartDateInputChange}
                    placeholder="YYYY-MM-DD"
                    className={`flex-1 border ${startDateInvalid ? 'border-red-500' : 'border-gray-300'} rounded-l-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2251D1]`}
                  />
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className="bg-[#EEF2FB] p-2 rounded-r-lg border border-l-0 border-gray-300"
                        aria-label="달력에서 날짜 선택"
                      >
                        <CalendarIcon className="h-5 w-5 text-[#2251D1]" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={handleStartDateSelect}
                        locale={ko}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                {startDateInvalid && (
                  <p className="text-red-500 text-xs mt-1">유효한 날짜 형식이 아닙니다 (YYYY-MM-DD)</p>
                )}
              </div>
              
              {/* 계약 종료일 (편집 모드) */}
              <div>
                <label htmlFor="contractEnd" className="block text-sm text-gray-600 mb-1">
                  계약 종료일
                </label>
                <div className="flex">
                  <input
                    id="contractEnd"
                    type="text"
                    value={endDateInput}
                    onChange={handleEndDateInputChange}
                    placeholder="YYYY-MM-DD"
                    className={`flex-1 border ${endDateInvalid ? 'border-red-500' : 'border-gray-300'} rounded-l-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2251D1]`}
                  />
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className="bg-[#EEF2FB] p-2 rounded-r-lg border border-l-0 border-gray-300"
                        aria-label="달력에서 날짜 선택"
                      >
                        <CalendarIcon className="h-5 w-5 text-[#2251D1]" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={handleEndDateSelect}
                        locale={ko}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                {endDateInvalid && (
                  <p className="text-red-500 text-xs mt-1">유효한 날짜 형식이 아닙니다 (YYYY-MM-DD)</p>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* 계약 기간 (보기 모드) */}
              <div className="flex justify-between">
                <span className="text-gray-600">계약 기간:</span>
                <span className="font-medium">
                  {client.contractStart && client.contractEnd
                    ? `${format(new Date(client.contractStart), 'yyyy.MM.dd')} ~ ${format(new Date(client.contractEnd), 'yyyy.MM.dd')}`
                    : '정보 없음'}
                </span>
              </div>
              
              {/* 남은 일수 표시 */}
              {daysRemaining !== null && (
                <div className="flex justify-end">
                  <span
                    className={`text-xs px-3 py-1.5 rounded-full ${
                      daysRemaining <= 7 
                        ? 'bg-[#FFEBEE] text-[#F44336]' 
                        : daysRemaining <= 30 
                          ? 'bg-[#FFF8E1] text-[#FFC107]' 
                          : 'bg-[#E8F5E9] text-[#4CAF50]'
                    }`}
                  >
                    {daysRemaining > 0 
                      ? `계약 종료까지 ${daysRemaining}일 남음` 
                      : '계약이 만료되었습니다!'}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* 서비스 이용 현황 */}
        <div>
          <h3 className="text-sm font-semibold text-gray-500 mb-3">서비스 이용 현황</h3>
          
          <div className="flex flex-wrap gap-2">
            <div className={`text-xs px-3 py-1.5 rounded-full flex items-center ${client.usesCoupon ? 'bg-[#E3F2FD] text-[#2196F3]' : 'bg-gray-100 text-gray-500'}`}>
              <span className="mr-1">🎟️</span>
              {client.usesCoupon ? '쿠폰 사용중' : '쿠폰 미사용'}
            </div>
            <div className={`text-xs px-3 py-1.5 rounded-full flex items-center ${client.publishesNews ? 'bg-[#E8F5E9] text-[#4CAF50]' : 'bg-gray-100 text-gray-500'}`}>
              <span className="mr-1">📰</span>
              {client.publishesNews ? '소식 발행중' : '소식 미발행'}
            </div>
            <div className={`text-xs px-3 py-1.5 rounded-full flex items-center ${client.usesReservation ? 'bg-[#F3E5F5] text-[#9C27B0]' : 'bg-gray-100 text-gray-500'}`}>
              <span className="mr-1">📅</span>
              {client.usesReservation ? '예약 사용중' : '예약 미사용'}
            </div>
          </div>
        </div>
        
        {/* 상태 태그 */}
        {client.statusTags.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-500 mb-3">상태</h3>
            
            <div className="flex flex-wrap gap-2">
              {client.statusTags.includes('종료 임박') && (
                <div className="bg-[#FFF8E1] text-[#FFC107] border border-[#FFC107] text-xs px-3 py-1.5 rounded-full flex items-center">
                  <span className="mr-1">⏰</span>
                  종료 임박
                </div>
              )}
              {client.statusTags.includes('관리 소홀') && (
                <div className="bg-[#FFF3E0] text-[#FF9800] border border-[#FF9800] text-xs px-3 py-1.5 rounded-full flex items-center">
                  <span className="mr-1">⚠️</span>
                  관리 소홀
                </div>
              )}
              {client.statusTags.includes('민원 중') && (
                <div className="bg-[#FFEBEE] text-[#F44336] border border-[#F44336] text-xs px-3 py-1.5 rounded-full flex items-center">
                  <span className="mr-1">🔔</span>
                  민원 중
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* 정보 가져오기 버튼 (향후 확장용) */}
        <div className="pt-4 border-t border-gray-200">
          <button 
            className="w-full py-2 bg-[#EEF2FB] text-[#2251D1] rounded-lg font-medium hover:bg-[#DCE4F9] transition-colors flex items-center justify-center"
            onClick={() => alert('크롤링 기능은 향후 구현 예정입니다! 😊')}
          >
            <span className="mr-2">🔄</span>
            정보 자동으로 가져오기
          </button>
        </div>
      </div>
    </div>
  );
} 