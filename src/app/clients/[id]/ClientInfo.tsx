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
  
  // 기본 정보 수정 관련 상태 추가
  const [clientName, setClientName] = useState<string>(client.name || '');
  const [clientPhone, setClientPhone] = useState<string>(client.phoneNumber || '');
  const [clientNaverUrl, setClientNaverUrl] = useState<string>(client.naverPlaceUrl || '');
  
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
  
  // 기본 정보 저장 함수
  const handleSaveBasicInfo = async () => {
    try {
      if (!clientName.trim()) {
        alert('업체명은 필수 입력 사항입니다.');
        return;
      }

      // 업데이트할 클라이언트 정보
      const updatedClient = {
        ...client,
        name: clientName,
        phoneNumber: clientPhone,
        naverPlaceUrl: clientNaverUrl
      };

      // API 요청
      const response = await fetch(`/api/clients/${client.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedClient)
      });

      if (!response.ok) {
        throw new Error('API 저장에 실패했습니다.');
      }

      // 로컬 스토리지 업데이트
      localStorage.setItem(`wizweblast_client_${client.id}`, JSON.stringify(updatedClient));

      // 목록에 있는 경우 해당 데이터도 업데이트
      const storedClientsJSON = localStorage.getItem('wizweblast_clients');
      if (storedClientsJSON) {
        const storedClients = JSON.parse(storedClientsJSON);
        if (Array.isArray(storedClients)) {
          const updatedClients = storedClients.map(c => 
            c.id === client.id ? updatedClient : c
          );
          localStorage.setItem('wizweblast_clients', JSON.stringify(updatedClients));
        }
      }

      // 편집 모드 종료
      setIsEditing(false);
      
      // 성공 메시지
      alert('기본 정보가 업데이트 되었습니다! 👍');
      
      // 페이지 새로고침
      window.location.reload();
    } catch (error) {
      console.error('기본 정보 저장 실패:', error);
      alert('기본 정보 저장 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };
  
  // 서비스 이용 현황 편집 상태
  const [isServiceEditing, setIsServiceEditing] = useState(false);
  const [services, setServices] = useState({
    usesCoupon: client.usesCoupon,
    publishesNews: client.publishesNews,
    usesReservation: client.usesReservation
  });
  
  // 업종 정보 상태
  const [category, setCategory] = useState<string>('');
  const [existingCategory, setExistingCategory] = useState<boolean>(false);

  // 업종 정보 로컬 스토리지에서 불러오기
  useEffect(() => {
    try {
      const savedCategory = localStorage.getItem(`wizweblast_client_${client.id}_category`);
      if (savedCategory) {
        setCategory(savedCategory);
        setExistingCategory(true);
      }
    } catch (e) {
      console.error('업종 정보 로드 실패:', e);
    }
  }, [client.id]);
  
  // 서비스 이용 현황 저장
  const handleSaveServices = async () => {
    try {
      // 업종 정보 저장
      if (category.trim()) {
        localStorage.setItem(`wizweblast_client_${client.id}_category`, category);
        setExistingCategory(true);
      }

      // 서비스 정보 업데이트
      const updatedClient = {
        ...client,
        usesCoupon: services.usesCoupon,
        publishesNews: services.publishesNews,
        usesReservation: services.usesReservation
      };

      // API 요청 시도
      try {
        const response = await fetch(`/api/clients/${client.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updatedClient)
        });

        if (!response.ok) {
          throw new Error('API 저장에 실패했습니다.');
        }

        // 로컬 스토리지 업데이트
        localStorage.setItem(`wizweblast_client_${client.id}`, JSON.stringify(updatedClient));

        // 목록에 있는 경우 해당 데이터도 업데이트
        const storedClientsJSON = localStorage.getItem('wizweblast_clients');
        if (storedClientsJSON) {
          const storedClients = JSON.parse(storedClientsJSON);
          if (Array.isArray(storedClients)) {
            const updatedClients = storedClients.map(c => 
              c.id === client.id ? updatedClient : c
            );
            localStorage.setItem('wizweblast_clients', JSON.stringify(updatedClients));
          }
        }

        // 편집 모드 종료
        setIsServiceEditing(false);
        
        // 성공 메시지
        alert('서비스 이용 정보가 업데이트 되었습니다! 👍');
        
        // 페이지 새로고침
        window.location.reload();
      } catch (apiError) {
        console.error('API 저장 실패:', apiError);
        throw new Error('서버에 저장하는 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('서비스 정보 저장 실패:', error);
      alert('서비스 정보 저장 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  // 키보드 단축키 처리 핸들러 추가
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 수정 모드에서만 단축키 활성화
      if (isServiceEditing) {
        // Alt+S: 저장
        if (e.altKey && e.key === 's') {
          e.preventDefault();
          handleSaveServices();
        }
        // Esc: 취소
        else if (e.key === 'Escape') {
          e.preventDefault();
          setIsServiceEditing(false);
        }
      }
      
      // 기본 정보 수정 모드
      if (isEditing) {
        // Alt+S: 저장
        if (e.altKey && e.key === 's') {
          e.preventDefault();
          handleSaveBasicInfo();
        }
        // Esc: 취소
        else if (e.key === 'Escape') {
          e.preventDefault();
          setIsEditing(false);
        }
      }
    };

    // 이벤트 리스너 등록
    window.addEventListener('keydown', handleKeyDown);
    
    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isServiceEditing, isEditing]);

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
  
  // 네이버 플레이스 정보 크롤링 처리
  const handleScrapeInfo = async () => {
    if (!client.naverPlaceUrl) {
      alert('네이버 플레이스 URL이 설정되어 있지 않습니다.');
      return;
    }
    
    console.log("정보 자동으로 가져오기 버튼 클릭됨");
    console.log("API 호출 URL:", `/api/clients/${client.id}/scrape`);
    console.log("클라이언트 ID:", client.id);
    
    // 버튼 요소 찾기
    const button = document.querySelector('button[data-scrape-button]');
    const originalButtonText = button?.innerHTML || '';
    
    // 버튼 텍스트를 로딩 표시로 변경
    if (button) {
      button.innerHTML = '<span class="mr-2">🔄</span><span class="animate-pulse">정보 가져오는 중...</span>';
      button.setAttribute('disabled', 'true');
      button.classList.add('opacity-70');
    }
    
    try {
      console.log("API 요청 시작");
      const response = await fetch(`/api/clients/${client.id}/scrape`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log("API 응답 상태:", response.status, response.statusText);
      
      if (!response.ok) {
        console.error("API 응답 오류:", response.status);
        let errorMessage = '정보 가져오기에 실패했습니다.';
        
        try {
          const errorData = await response.json();
          console.error("오류 데이터:", errorData);
          errorMessage = errorData.error || errorMessage;
        } catch (parseError) {
          console.error("응답 파싱 오류:", parseError);
        }
        
        throw new Error(errorMessage);
      }
      
      console.log("응답 데이터 파싱 시작");
      const data = await response.json();
      console.log("파싱된 응답 데이터:", data);
      
      if (data.success) {
        console.log("API 호출 성공, 클라이언트 데이터:", data.client);
        
        // 로컬 스토리지에 업데이트된 클라이언트 정보 저장 (선택적)
        if (data.allClients && data.allClients.length > 0) {
          try {
            localStorage.setItem('wizweblast_clients', JSON.stringify(data.allClients));
            localStorage.setItem(`wizweblast_client_${client.id}`, JSON.stringify(data.client));
            console.log("클라이언트 데이터가 로컬 스토리지에 저장되었습니다.");
          } catch (storageErr) {
            console.error("로컬 스토리지 저장 실패:", storageErr);
          }
        }
        
        // 성공 알림을 자세하게 표시
        alert(`
네이버 플레이스에서 정보를 성공적으로 가져왔습니다!

업데이트된 정보:
- 쿠폰 사용: ${data.client.usesCoupon ? '사용중' : '미사용'}
- 소식 발행: ${data.client.publishesNews ? '발행중' : '미발행'}
- 예약 시스템: ${data.client.usesReservation ? '사용중' : '미사용'}
- 상태: ${data.client.statusTags.join(', ')}

페이지를 새로고침하여 변경사항을 확인하세요.
        `);
        
        // 페이지 새로고침 전에 상태 태그 업데이트 (DOM 직접 조작)
        try {
          const statusTagsContainer = document.querySelector('[data-status-tags-container]');
          if (statusTagsContainer && data.client.statusTags.includes('크롤링 완료')) {
            const newTag = document.createElement('div');
            newTag.className = "bg-[#E3F2FD] text-[#2196F3] border border-[#2196F3] text-xs px-3 py-1.5 rounded-full flex items-center";
            newTag.innerHTML = "<span class='mr-1'>🔄</span>크롤링 완료";
            
            // 중복 태그 추가 방지
            const existingTags = statusTagsContainer.querySelectorAll('div');
            let tagExists = false;
            existingTags.forEach((tag: Element) => {
              if (tag.textContent?.includes('크롤링 완료')) {
                tagExists = true;
              }
            });
            
            if (!tagExists) {
              statusTagsContainer.appendChild(newTag);
            }
          }
        } catch (domErr) {
          console.error("DOM 업데이트 실패:", domErr);
        }
        
        // 2초 후 페이지 새로고침
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        console.error("API 호출 실패:", data);
        throw new Error(data.error || '정보 가져오기에 실패했습니다.');
      }
    } catch (err: any) {
      console.error('크롤링 오류:', err);
      alert(`정보 가져오기 중 오류가 발생했습니다: ${err.message}`);
      
      // 오류 발생 시 버튼 원상 복구
      if (button) {
        button.innerHTML = originalButtonText;
        button.removeAttribute('disabled');
        button.classList.remove('opacity-70');
      }
    }
  };
  
  return (
    <div className="bg-[#151523] rounded-lg shadow-xl overflow-hidden border border-white/10">
      {/* 섹션 헤더 */}
      <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 backdrop-blur-sm px-6 py-4 border-b border-white/10">
        <h2 className="text-lg font-bold flex items-center text-white">
          <span className="text-xl mr-2">📋</span> 광고주 정보
          {client.statusTags.includes('신규') && (
            <span className="ml-2 text-xs bg-green-900/30 text-green-300 px-2 py-1 rounded-full border border-green-500/30">
              신규 등록
            </span>
          )}
        </h2>
      </div>
      
      {/* 정보 섹션 */}
      <div className="p-6 space-y-6 text-white">
        {/* 기본 정보 */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-semibold text-slate-400">기본 정보</h3>
            {!isEditing ? (
              <button 
                onClick={() => setIsEditing(true)} 
                className="text-xs bg-blue-900/30 text-blue-300 px-2 py-1 rounded hover:bg-blue-800/40 transition-colors border border-blue-500/30"
                title="수정하기 (편집 모드에서 Alt+S로 저장, Esc로 취소)"
              >
                수정
              </button>
            ) : (
              <div className="flex space-x-2">
                <button 
                  onClick={() => setIsEditing(false)} 
                  className="text-xs bg-white/10 text-white px-2 py-1 rounded hover:bg-white/20 transition-colors"
                  title="취소 (Esc)"
                >
                  취소
                </button>
                <button 
                  onClick={handleSaveBasicInfo} 
                  className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-500 transition-colors"
                  title="저장 (Alt+S)"
                >
                  저장
                </button>
              </div>
            )}
          </div>
          
          {isEditing ? (
            <div className="space-y-4">
              {/* 업체명 */}
              <div>
                <label htmlFor="name" className="block text-sm text-slate-300 mb-1">
                  업체명 <span className="text-red-500">*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full border border-slate-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-[#1e1e30] text-white"
                  required
                />
              </div>
              
              {/* 전화번호 */}
              <div>
                <label htmlFor="phoneNumber" className="block text-sm text-slate-300 mb-1">
                  전화번호
                </label>
                <input
                  id="phoneNumber"
                  type="text"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="예: 02-1234-5678"
                  className="w-full border border-slate-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-[#1e1e30] text-white"
                />
              </div>
              
              {/* 네이버 플레이스 */}
              <div>
                <label htmlFor="naverPlaceUrl" className="block text-sm text-slate-300 mb-1">
                  네이버 플레이스 URL
                </label>
                <input
                  id="naverPlaceUrl"
                  type="text"
                  value={clientNaverUrl}
                  onChange={(e) => setClientNaverUrl(e.target.value)}
                  placeholder="예: https://place.naver.com/..."
                  className="w-full border border-slate-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-[#1e1e30] text-white"
                />
                <p className="text-xs text-slate-400 mt-1">
                  전체 URL 또는 단축 URL(naver.me)을 입력하세요. "http://" 또는 "https://"는 생략 가능합니다.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* 업체명 */}
              <div className="flex justify-between">
                <span className="text-slate-300">업체명:</span>
                <span className="font-medium text-white">{client.name}</span>
              </div>
              
              {/* 전화번호 */}
              <div className="flex justify-between">
                <span className="text-slate-300">전화번호:</span>
                {client.phoneNumber ? (
                  <span className="font-medium text-white">{client.phoneNumber}</span>
                ) : (
                  <span className="text-slate-400 italic">미입력</span>
                )}
              </div>
              
              {/* 네이버 플레이스 */}
              <div className="flex justify-between">
                <span className="text-slate-300">네이버 플레이스:</span>
                {client.naverPlaceUrl ? (
                  <a 
                    href={client.naverPlaceUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-300 hover:text-blue-100 transition-colors"
                  >
                    바로가기
                  </a>
                ) : (
                  <span className="text-slate-400 italic">미입력</span>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* 계약 정보 */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-semibold text-slate-400">계약 정보</h3>
            {!isEditing ? (
              <button 
                onClick={() => setIsEditing(true)} 
                className="text-xs bg-blue-900/30 text-blue-300 px-2 py-1 rounded hover:bg-blue-800/40 transition-colors border border-blue-500/30"
                aria-label="계약 정보 수정"
                title="수정하기 (편집 모드에서 Alt+S로 저장, Esc로 취소)"
              >
                수정
              </button>
            ) : (
              <div className="flex space-x-2">
                <button 
                  onClick={() => setIsEditing(false)} 
                  className="text-xs bg-white/10 text-white px-2 py-1 rounded hover:bg-white/20 transition-colors"
                  aria-label="계약 정보 수정 취소"
                  title="취소 (Esc)"
                >
                  취소
                </button>
                <button 
                  onClick={handleSaveContract} 
                  className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-500 transition-colors"
                  aria-label="계약 정보 저장"
                  title="저장 (Alt+S)"
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
                <label htmlFor="contractStart" className="block text-sm text-slate-300 mb-1">
                  계약 시작일
                </label>
                <div className="flex">
                  <input
                    id="contractStart"
                    type="text"
                    value={startDateInput}
                    onChange={handleStartDateInputChange}
                    placeholder="YYYY-MM-DD"
                    className={`flex-1 border ${startDateInvalid ? 'border-red-500' : 'border-slate-600'} rounded-l-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-[#1e1e30] text-white`}
                  />
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className="bg-blue-900/50 p-2 rounded-r-lg border border-l-0 border-slate-600 text-blue-300 hover:bg-blue-800 transition-colors"
                        aria-label="달력에서 날짜 선택"
                      >
                        <CalendarIcon className="h-5 w-5" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-[#1e1e30] border border-slate-600">
                      <style jsx global>{`
                        /* 달력 전체 레이아웃 */
                        .rdp {
                          --rdp-cell-size: 40px !important;
                          --rdp-accent-color: #3b82f6 !important;
                          --rdp-background-color: #4f46e5 !important;
                          margin: 0 !important;
                        }
                        
                        /* 달력 화살표 스타일 강화 */
                        .rdp-nav {
                          position: relative !important;
                          display: flex !important;
                          justify-content: space-between !important;
                          width: 100% !important;
                        }
                        
                        .rdp-nav_button {
                          width: 36px !important;
                          height: 36px !important;
                          color: white !important;
                          background-color: #4f46e5 !important;
                          border: 2px solid #818cf8 !important;
                          border-radius: 50% !important;
                          padding: 0 !important;
                          margin: 0 !important;
                          display: flex !important;
                          align-items: center !important;
                          justify-content: center !important;
                          opacity: 1 !important;
                          position: absolute !important;
                          top: 50% !important;
                          transform: translateY(-50%) !important;
                          z-index: 10 !important;
                        }
                        
                        .rdp-nav_button_previous {
                          left: 8px !important;
                        }
                        
                        .rdp-nav_button_next {
                          right: 8px !important;
                        }
                        
                        .rdp-nav_button:hover {
                          background-color: #6366f1 !important;
                        }
                        
                        .rdp-nav_button svg {
                          width: 24px !important;
                          height: 24px !important;
                          stroke-width: 3px !important;
                        }
                        
                        /* 달력 헤더(요일) 배치 강화 */
                        .rdp-months {
                          display: flex !important;
                          justify-content: center !important;
                        }
                        
                        .rdp-month {
                          width: 100% !important;
                        }
                        
                        .rdp-table {
                          width: 100% !important;
                          max-width: 300px !important;
                          margin: 0 auto !important;
                        }
                        
                        .rdp-head {
                          margin-top: 10px !important;
                          margin-bottom: 10px !important;
                        }
                        
                        .rdp-head_row {
                          display: grid !important;
                          grid-template-columns: repeat(7, 1fr) !important;
                          width: 100% !important;
                        }
                        
                        .rdp-head_cell {
                          color: #93c5fd !important;
                          font-weight: 600 !important;
                          font-size: 0.9rem !important;
                          text-align: center !important;
                          padding: 8px 0 !important;
                          display: flex !important;
                          align-items: center !important;
                          justify-content: center !important;
                        }
                        
                        /* 날짜 그리드 레이아웃 개선 */
                        .rdp-tbody {
                          width: 100% !important;
                        }
                        
                        .rdp-row {
                          display: grid !important;
                          grid-template-columns: repeat(7, 1fr) !important;
                          width: 100% !important;
                        }
                        
                        .rdp-cell {
                          text-align: center !important;
                          padding: 2px !important;
                        }
                        
                        .rdp-day {
                          display: flex !important;
                          align-items: center !important;
                          justify-content: center !important;
                          width: 100% !important;
                          height: 36px !important;
                          margin: 0 auto !important;
                          border-radius: 50% !important;
                        }
                        
                        /* 선택된 날짜 스타일 */
                        .rdp-day_selected, 
                        .rdp-day_selected:hover {
                          background-color: #3b82f6 !important;
                          color: white !important;
                        }
                        
                        /* 캡션 (년월 표시) 개선 */
                        .rdp-caption {
                          position: relative !important;
                          display: flex !important;
                          align-items: center !important;
                          justify-content: center !important;
                          padding: 16px 0 !important;
                        }
                        
                        .rdp-caption_label {
                          font-size: 1.1rem !important;
                          font-weight: 600 !important;
                          color: white !important;
                          padding: 0 40px !important;
                        }
                      `}</style>
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={handleStartDateSelect}
                        locale={ko}
                        className="bg-[#1e1e30] text-white border-none"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                {startDateInvalid && (
                  <p className="text-red-400 text-xs mt-1">유효한 날짜 형식이 아닙니다 (YYYY-MM-DD)</p>
                )}
              </div>
              
              {/* 계약 종료일 (편집 모드) */}
              <div>
                <label htmlFor="contractEnd" className="block text-sm text-slate-300 mb-1">
                  계약 종료일
                </label>
                <div className="flex">
                  <input
                    id="contractEnd"
                    type="text"
                    value={endDateInput}
                    onChange={handleEndDateInputChange}
                    placeholder="YYYY-MM-DD"
                    className={`flex-1 border ${endDateInvalid ? 'border-red-500' : 'border-slate-600'} rounded-l-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-[#1e1e30] text-white`}
                  />
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className="bg-blue-900/50 p-2 rounded-r-lg border border-l-0 border-slate-600 text-blue-300 hover:bg-blue-800 transition-colors"
                        aria-label="달력에서 날짜 선택"
                      >
                        <CalendarIcon className="h-5 w-5" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-[#1e1e30] border border-slate-600">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={handleEndDateSelect}
                        locale={ko}
                        className="bg-[#1e1e30] text-white border-none"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                {endDateInvalid && (
                  <p className="text-red-400 text-xs mt-1">유효한 날짜 형식이 아닙니다 (YYYY-MM-DD)</p>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* 계약 기간 (보기 모드) */}
              <div className="flex justify-between">
                <span className="text-slate-300">계약 기간:</span>
                <span className="font-medium text-white">
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
                        ? 'bg-red-900/30 text-red-300 border border-red-500/30' 
                        : daysRemaining <= 30 
                          ? 'bg-amber-900/30 text-amber-300 border border-amber-500/30' 
                          : 'bg-green-900/30 text-green-300 border border-green-500/30'
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
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-semibold text-slate-400">서비스 이용 현황</h3>
            {!isServiceEditing ? (
              <button 
                onClick={() => setIsServiceEditing(true)} 
                className="text-xs bg-blue-900/30 text-blue-300 px-2 py-1 rounded hover:bg-blue-800/40 transition-colors border border-blue-500/30"
                aria-label="서비스 이용 현황 수정"
                title="수정하기 (편집 모드에서 Alt+S로 저장, Esc로 취소)"
              >
                수정
              </button>
            ) : (
              <div className="flex space-x-2">
                <button 
                  onClick={() => setIsServiceEditing(false)} 
                  className="text-xs bg-white/10 text-white px-2 py-1 rounded hover:bg-white/20 transition-colors"
                  aria-label="서비스 이용 현황 수정 취소"
                  title="취소 (Esc)"
                >
                  취소
                </button>
                <button 
                  onClick={handleSaveServices} 
                  className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-500 transition-colors"
                  aria-label="서비스 이용 현황 저장"
                  title="저장 (Alt+S)"
                >
                  저장
                </button>
              </div>
            )}
          </div>
          
          {isServiceEditing ? (
            <div className="space-y-4 mb-4">
              {/* 업종 정보 */}
              <div>
                <label htmlFor="category" className="block text-sm text-slate-300 mb-1">
                  업종 정보
                </label>
                <input
                  id="category"
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="예: 요리주점, 한식, 카페 등"
                  className="w-full border border-slate-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-[#1e1e30] text-white"
                />
                <p className="text-xs text-slate-400 mt-1">
                  업체의 카테고리를 입력하세요 (예: 요리주점, 한식, 카페 등)
                </p>
              </div>
              
              {/* 쿠폰 사용 */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="usesCoupon"
                  checked={services.usesCoupon}
                  onChange={(e) => setServices({...services, usesCoupon: e.target.checked})}
                  className="h-4 w-4 text-blue-500 rounded border-slate-600 focus:ring-blue-500 bg-[#1e1e30]"
                />
                <label htmlFor="usesCoupon" className="text-sm text-slate-300">
                  쿠폰 사용
                </label>
              </div>
              
              {/* 소식 발행 */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="publishesNews"
                  checked={services.publishesNews}
                  onChange={(e) => setServices({...services, publishesNews: e.target.checked})}
                  className="h-4 w-4 text-blue-500 rounded border-slate-600 focus:ring-blue-500 bg-[#1e1e30]"
                />
                <label htmlFor="publishesNews" className="text-sm text-slate-300">
                  소식 발행
                </label>
              </div>
              
              {/* 예약 사용 */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="usesReservation"
                  checked={services.usesReservation}
                  onChange={(e) => setServices({...services, usesReservation: e.target.checked})}
                  className="h-4 w-4 text-blue-500 rounded border-slate-600 focus:ring-blue-500 bg-[#1e1e30]"
                />
                <label htmlFor="usesReservation" className="text-sm text-slate-300">
                  예약 시스템 사용
                </label>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* 업종 표시 */}
              {existingCategory && (
                <div className="mb-3">
                  <span className="text-slate-300">업종:</span>
                  <span className="font-medium ml-2 text-white">{category}</span>
                </div>
              )}
              
              <div className="flex flex-wrap gap-2">
                <div className={`text-xs px-3 py-1.5 rounded-full flex items-center ${client.usesCoupon ? 'bg-blue-900/30 text-blue-300 border border-blue-500/30' : 'bg-slate-800/50 text-slate-400 border border-slate-700'}`}>
                  <span className="mr-1">🎟️</span>
                  {client.usesCoupon ? '쿠폰 사용중' : '쿠폰 미사용'}
                </div>
                <div className={`text-xs px-3 py-1.5 rounded-full flex items-center ${client.publishesNews ? 'bg-green-900/30 text-green-300 border border-green-500/30' : 'bg-slate-800/50 text-slate-400 border border-slate-700'}`}>
                  <span className="mr-1">📰</span>
                  {client.publishesNews ? '소식 발행중' : '소식 미발행'}
                </div>
                <div className={`text-xs px-3 py-1.5 rounded-full flex items-center ${client.usesReservation ? 'bg-purple-900/30 text-purple-300 border border-purple-500/30' : 'bg-slate-800/50 text-slate-400 border border-slate-700'}`}>
                  <span className="mr-1">📅</span>
                  {client.usesReservation ? '예약 사용중' : '예약 미사용'}
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* 상태 태그 */}
        {client.statusTags.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-slate-400 mb-3">상태</h3>
            
            <div data-status-tags-container className="flex flex-wrap gap-2">
              {client.statusTags.includes('종료 임박') && (
                <div className="bg-amber-900/30 text-amber-300 border border-amber-500/30 text-xs px-3 py-1.5 rounded-full flex items-center">
                  <span className="mr-1">⏰</span>
                  종료 임박
                </div>
              )}
              {client.statusTags.includes('관리 소홀') && (
                <div className="bg-orange-900/30 text-orange-300 border border-orange-500/30 text-xs px-3 py-1.5 rounded-full flex items-center">
                  <span className="mr-1">⚠️</span>
                  관리 소홀
                </div>
              )}
              {client.statusTags.includes('민원 중') && (
                <div className="bg-red-900/30 text-red-300 border border-red-500/30 text-xs px-3 py-1.5 rounded-full flex items-center">
                  <span className="mr-1">🔔</span>
                  민원 중
                </div>
              )}
              {client.statusTags.includes('크롤링 완료') && (
                <div className="bg-blue-900/30 text-blue-300 border border-blue-500/30 text-xs px-3 py-1.5 rounded-full flex items-center">
                  <span className="mr-1">🔄</span>
                  크롤링 완료
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* 정보 가져오기 버튼 (향후 확장용) */}
        <div className="pt-4 border-t border-white/10">
          <button 
            data-scrape-button
            className="w-full py-2 bg-gradient-to-r from-blue-800/40 to-indigo-800/40 text-blue-300 rounded-lg font-medium hover:from-blue-800/60 hover:to-indigo-800/60 transition-all duration-300 flex items-center justify-center border border-blue-500/30"
            onClick={handleScrapeInfo}
          >
            <span className="mr-2">🔄</span>
            정보 자동으로 가져오기
          </button>
        </div>
      </div>
    </div>
  );
} 