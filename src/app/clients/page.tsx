'use client';

import { useState, useEffect, useRef } from 'react';
import { ClientCard } from './ClientCard';
import { ClientMemoDialog } from '@/components/ClientMemoDialog';
import { ClientTodoDialog } from '@/components/ClientTodoDialog';
import { ClientRegisterDialog } from '@/components/ClientRegisterDialog';
import { Client } from '@/lib/mock-data';  // 타입만 가져옵니다
import Link from 'next/link';
import { Header } from '@/components/Header';

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [memoDialogOpen, setMemoDialogOpen] = useState(false);
  const [todoDialogOpen, setTodoDialogOpen] = useState(false);
  const [registerDialogOpen, setRegisterDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [animateIn, setAnimateIn] = useState(false);
  
  // 새로운 필터 상태 추가
  const [filterNoCoupon, setFilterNoCoupon] = useState<boolean>(false);
  const [filterNoNews, setFilterNoNews] = useState<boolean>(false);
  const [filterNoReservation, setFilterNoReservation] = useState<boolean>(false);
  
  // 상태 추가
  const [tipMessage, setTipMessage] = useState<string>('광고주 관리 시스템을 활용해 업무 효율을 높여보세요!');
  
  // 검색 입력란 ref 추가
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // 키보드 단축키 처리
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Alt+N: 새 광고주 등록
      if (e.altKey && e.key === 'n') {
        e.preventDefault();
        setRegisterDialogOpen(true);
      }
      
      // /: 검색창 포커스
      if (e.key === '/' && !registerDialogOpen && !memoDialogOpen && !todoDialogOpen) {
        // 입력 필드에서 이벤트가 발생하지 않았을 때만 처리
        if (!(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement)) {
          e.preventDefault();
          searchInputRef.current?.focus();
        }
      }
      
      // Esc: 검색어 초기화 (대화상자가 열려있지 않을 때만)
      if (e.key === 'Escape' && !registerDialogOpen && !memoDialogOpen && !todoDialogOpen) {
        if (searchTerm) {
          setSearchTerm('');
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [registerDialogOpen, memoDialogOpen, todoDialogOpen, searchTerm]);
  
  // API에서 광고주 데이터 가져오기
  useEffect(() => {
    const fetchClients = async () => {
      try {
        setIsLoading(true);
        console.log('[클라이언트] 광고주 목록 로드 시작');
        
        // 먼저 로컬 스토리지에서 데이터 확인
        try {
          const storedClients = localStorage.getItem('wizweblast_clients');
          if (storedClients) {
            try {
              const parsedClients = JSON.parse(storedClients);
              if (Array.isArray(parsedClients) && parsedClients.length > 0) {
                console.log('[클라이언트] 로컬 스토리지에서 광고주 데이터를 불러왔습니다:', parsedClients.length + '개');
                setClients(parsedClients);
                setError(null);
                setIsLoading(false);
                return; // 로컬 스토리지에서 데이터를 찾았으므로 API 호출 스킵
              }
            } catch (parseErr) {
              console.error('[클라이언트] 로컬 스토리지 데이터 파싱 오류:', parseErr);
            }
          }
        } catch (storageErr) {
          console.error('[클라이언트] 로컬 스토리지 접근 오류:', storageErr);
        }
        
        // 환경 정보 로깅 (개발 환경에서만)
        if (process.env.NODE_ENV !== 'production') {
          console.log('[클라이언트] 환경 정보:', { 
            env: process.env.NODE_ENV,
            baseUrl: window.location.origin
          });
        }
        
        const response = await fetch('/api/clients');
        console.log('[클라이언트] API 응답 상태:', response.status, response.statusText);
        
        if (!response.ok) {
          let errorMessage = '광고주 데이터를 가져오는 데 실패했습니다.';
          try {
            const errorData = await response.json();
            console.error('[클라이언트] API 응답 오류:', response.status, errorData);
            
            // fallbackData가 있으면 사용
            if (errorData && errorData.fallbackData && Array.isArray(errorData.fallbackData)) {
              console.log('[클라이언트] 서버 제공 폴백 데이터 사용:', errorData.fallbackData.length + '개 항목');
              
              const enhancedFallbackData = errorData.fallbackData.map((client: any, index: number) => {
                // 필요한 필드가 없는 경우 기본값 추가
                return {
                  id: client.id ? String(client.id) : `fallback-${Date.now()}-${index}`,
                  name: client.name || '이름 없음',
                  icon: client.icon || '🏢',
                  contractStart: client.contractStart || new Date().toISOString(),
                  contractEnd: client.contractEnd || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
                  statusTags: Array.isArray(client.statusTags) ? client.statusTags : ['정상'],
                  usesCoupon: client.usesCoupon !== undefined ? client.usesCoupon : false,
                  publishesNews: client.publishesNews !== undefined ? client.publishesNews : false,
                  usesReservation: client.usesReservation !== undefined ? client.usesReservation : false,
                  phoneNumber: client.phoneNumber || '',
                  naverPlaceUrl: client.naverPlaceUrl || ''
                };
              });
              
              setClients(enhancedFallbackData);
              setError(`서버 오류 발생: ${errorData.error || errorMessage} (서버 제공 폴백 데이터 사용 중)`);
              
              // 로컬 스토리지에 저장
              try {
                localStorage.setItem('wizweblast_clients', JSON.stringify(enhancedFallbackData));
              } catch (storageErr) {
                console.error('[클라이언트] 로컬 스토리지 저장 오류:', storageErr);
              }
              
              setIsLoading(false);
              return;
            }
            
            // 더 자세한 오류 메시지 사용
            errorMessage = errorData.error || errorData.message || errorMessage;
          } catch (jsonError) {
            console.error('[클라이언트] API 응답 JSON 파싱 오류:', jsonError);
          }
          
          throw new Error(errorMessage);
        }
        
        let data: any;
        try {
          data = await response.json();
          console.log('[클라이언트] 광고주 목록 API 응답:', data);
        } catch (jsonError) {
          console.error('[클라이언트] API 응답 JSON 파싱 오류:', jsonError);
          throw new Error('서버 응답을 파싱하는 중 오류가 발생했습니다.');
        }
        
        // API 응답 유효성 검사
        if (!data) {
          console.error('[클라이언트] 빈 API 응답:', data);
          throw new Error('서버에서 데이터를 받지 못했습니다.');
        }
        
        if (!Array.isArray(data)) {
          console.error('[클라이언트] 유효하지 않은 API 응답 데이터 형식:', data);
          
          // 오류 응답에 폴백 데이터가 있는지 확인
          if (data.fallbackData && Array.isArray(data.fallbackData)) {
            console.log('[클라이언트] 오류 응답의 폴백 데이터 사용:', data.fallbackData.length + '개 항목');
            data = data.fallbackData;
          } else {
            throw new Error('서버에서 유효하지 않은 데이터 형식을 받았습니다.');
          }
        }
        
        // API 응답에 필요한 필드가 없는 경우, 기본값 추가
        const enhancedData = data.map((client: any, index: number) => {
          // client가 객체가 아닌 경우 처리
          if (!client || typeof client !== 'object') {
            console.warn('[클라이언트] 유효하지 않은 광고주 데이터 항목 발견, 기본값으로 대체합니다.');
            return {
              id: `fallback-${Date.now()}-${index}`,
              name: '유효하지 않은 데이터',
              icon: '⚠️',
              contractStart: new Date().toISOString(),
              contractEnd: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
              statusTags: ['오류'],
              usesCoupon: false,
              publishesNews: false,
              usesReservation: false,
              phoneNumber: '',
              naverPlaceUrl: ''
            };
          }
          
          // snake_case와 camelCase 모두 지원
          const name = client.name || '';
          const icon = client.icon || '🏢';
          const contractStart = client.contractStart || client.contract_start || new Date().toISOString();
          const contractEnd = client.contractEnd || client.contract_end || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();
          const statusTags = Array.isArray(client.statusTags) ? client.statusTags : 
                             (Array.isArray(client.status_tags) ? client.status_tags : ['정상']);
          
          const usesCoupon = client.usesCoupon !== undefined ? client.usesCoupon : 
                              (client.uses_coupon !== undefined ? client.uses_coupon : false);
                              
          const publishesNews = client.publishesNews !== undefined ? client.publishesNews : 
                                (client.publishes_news !== undefined ? client.publishes_news : false);
                                
          const usesReservation = client.usesReservation !== undefined ? client.usesReservation : 
                                  (client.uses_reservation !== undefined ? client.uses_reservation : false);
                                  
          const phoneNumber = client.phoneNumber || client.phone_number || '';
          const naverPlaceUrl = client.naverPlaceUrl || client.naver_place_url || '';
          
          return {
            id: client.id ? String(client.id) : `id-${Date.now()}-${index}`,
            name,
            icon,
            contractStart,
            contractEnd,
            statusTags,
            usesCoupon,
            publishesNews,
            usesReservation,
            phoneNumber,
            naverPlaceUrl
          };
        });
        
        console.log('[클라이언트] 처리된 광고주 데이터:', enhancedData.length + '개');
        setClients(enhancedData);
        setError(null);
        
        // 로컬 스토리지에 저장
        try {
          localStorage.setItem('wizweblast_clients', JSON.stringify(enhancedData));
        } catch (storageErr) {
          console.error('[클라이언트] 로컬 스토리지 저장 오류:', storageErr);
        }
      } catch (err) {
        console.error('[클라이언트] 광고주 데이터 로딩 오류:', err);
        
        const errMsg = err instanceof Error ? err.message : String(err);
        setError(`광고주 데이터를 불러오는 중 오류가 발생했습니다: ${errMsg}`);
        
        // API 호출 실패 시 로컬 스토리지에서 데이터 가져오기
        try {
          const storedClients = localStorage.getItem('wizweblast_clients');
          if (storedClients) {
            try {
              const parsedClients = JSON.parse(storedClients);
              if (Array.isArray(parsedClients) && parsedClients.length > 0) {
                console.log('[클라이언트] 로컬 스토리지에서 광고주 데이터를 불러왔습니다:', parsedClients.length + '개');
                setClients(parsedClients);
                setError((prev) => prev + ' (저장된 데이터를 대신 표시합니다.)');
                
                // 로컬 스토리지에서 가져온 데이터도 유효성 검사
                const validClients = parsedClients.filter((c: any) => c && typeof c === 'object' && c.name);
                if (validClients.length < parsedClients.length) {
                  console.warn('[클라이언트] 로컬 스토리지에 유효하지 않은 데이터가 있습니다:', parsedClients.length - validClients.length + '개');
                  setClients(validClients);
                }
                
                return; // 로컬 스토리지 데이터 사용 시 모의 데이터 사용 안함
              }
            } catch (parseErr) {
              console.error('[클라이언트] 로컬 스토리지 데이터 파싱 오류:', parseErr);
            }
          }
          
          // 모의 데이터 표시
          console.log('[클라이언트] 모의 데이터 사용');
          const mockClients = [
            {
              id: 'mock-1',
              name: '샘플 광고주 (모의 데이터)',
              icon: '🏢',
              contractStart: '2024-01-01',
              contractEnd: '2024-12-31',
              statusTags: ['정상', '모의 데이터'],
              usesCoupon: true,
              publishesNews: true,
              usesReservation: true,
              phoneNumber: '02-1234-5678',
              naverPlaceUrl: 'https://place.naver.com/restaurant/12345678'
            },
            {
              id: 'mock-2',
              name: '카페 드림 (모의 데이터)',
              icon: '☕',
              contractStart: '2024-02-15',
              contractEnd: '2025-02-14',
              statusTags: ['정상', '모의 데이터'],
              usesCoupon: false,
              publishesNews: false,
              usesReservation: true,
              phoneNumber: '02-9876-5432',
              naverPlaceUrl: 'https://place.naver.com/restaurant/87654321'
            }
          ];
          setClients(mockClients);
          setError((prev) => prev + ' (모의 데이터를 대신 표시합니다.)');
        } catch (storageErr) {
          console.error('[클라이언트] 로컬 스토리지 데이터 로딩 오류:', storageErr);
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchClients();
  }, []);
  
  // 페이지 로딩 시 애니메이션 효과
  useEffect(() => {
    setAnimateIn(true);
    
    // 재미있는 팁 메시지 설정 (클라이언트 사이드에서만)
    const tips = ["종료 임박 고객에게 미리 연락하면 재계약률이 30% 높아져요! 🚀", "정기적인 고객 체크인으로 관리 소홀을 예방하세요! ⏰", "대시보드에서 민원 진행 상황을 실시간으로 확인하세요! 📊", "WIZ AI로 고객 데이터를 분석하면 성공률이 높아져요! 🤖", "할 일을 관리하면 업무 효율이 두 배로 올라갑니다! ✅"];
    const randomIndex = Math.floor(Math.random() * tips.length);
    setTipMessage(tips[randomIndex]);
  }, []);
  
  // 필터링된 광고주 목록
  const filteredClients = clients.filter(client => {
    // 클라이언트가 유효하지 않은 경우 필터링에서 제외
    if (!client || typeof client !== 'object') {
      return false;
    }
    
    // 검색어 필터링
    const matchesSearch = client.name 
      ? client.name.toLowerCase().includes(searchTerm.toLowerCase()) 
      : false;
    
    // 상태 필터링
    let matchesStatus = true;
    if (statusFilter !== 'all') {
      matchesStatus = client.statusTags?.includes(statusFilter) ?? false;
    }
    
    // 추가 필터링 (쿠폰/소식/예약)
    let matchesCouponFilter = true;
    let matchesNewsFilter = true;
    let matchesReservationFilter = true;
    
    if (filterNoCoupon) {
      matchesCouponFilter = !client.usesCoupon;
    }
    
    if (filterNoNews) {
      matchesNewsFilter = !client.publishesNews;
    }
    
    if (filterNoReservation) {
      matchesReservationFilter = !client.usesReservation;
    }
    
    return matchesSearch && matchesStatus && matchesCouponFilter && matchesNewsFilter && matchesReservationFilter;
  });
  
  // 상태별 카운트
  const statusCounts = {
    total: clients.length,
    nearExpiry: clients.filter(c => c && c.statusTags && Array.isArray(c.statusTags) && c.statusTags.includes('종료 임박')).length,
    poorManaged: clients.filter(c => c && c.statusTags && Array.isArray(c.statusTags) && c.statusTags.includes('관리 소홀')).length,
    complaints: clients.filter(c => c && c.statusTags && Array.isArray(c.statusTags) && c.statusTags.includes('민원 중')).length,
    noCoupon: clients.filter(c => c && c.usesCoupon === false).length,
    noNews: clients.filter(c => c && c.publishesNews === false).length,
    noReservation: clients.filter(c => c && c.usesReservation === false).length
  };
  
  // 필터 토글 함수
  const toggleFilter = (filter: 'coupon' | 'news' | 'reservation') => {
    if (filter === 'coupon') {
      setFilterNoCoupon(!filterNoCoupon);
    } else if (filter === 'news') {
      setFilterNoNews(!filterNoNews);
    } else if (filter === 'reservation') {
      setFilterNoReservation(!filterNoReservation);
    }
  };
  
  // 메모 추가 처리
  const handleAddNote = async (clientId: string, note: string) => {
    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          clientId,
          note
        })
      });
      
      if (!response.ok) {
        throw new Error('메모 추가에 실패했습니다.');
      }
      
      alert(`'${note}' 메모가 저장되었습니다. 굿잡! 🙌`);
    } catch (err) {
      console.error('메모 추가 오류:', err);
      alert('메모 추가 중 오류가 발생했습니다.');
    }
  };
  
  // 할 일 추가 처리
  const handleAddTodo = async (clientId: string, content: string, assignedTo: string) => {
    try {
      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          clientId,
          content,
          assignedTo
        })
      });
      
      if (!response.ok) {
        throw new Error('할 일 추가에 실패했습니다.');
      }
      
      alert(`'${content}' 할 일이 성공적으로 등록되었습니다! 👍`);
    } catch (err) {
      console.error('할 일 추가 오류:', err);
      alert('할 일 추가 중 오류가 발생했습니다.');
    }
  };
  
  // 메모 다이얼로그 열기
  const openMemoDialog = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    if (client) {
      setSelectedClient(client);
      setMemoDialogOpen(true);
    }
  };
  
  // 할 일 다이얼로그 열기
  const openTodoDialog = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    if (client) {
      setSelectedClient(client);
      setTodoDialogOpen(true);
    }
  };
  
  // 광고주 등록 처리
  const handleRegisterClient = async (newClient: Omit<Client, 'id'>) => {
    try {
      console.log('등록 요청 데이터:', newClient);
      
      // 로컬 ID 생성 (DB 저장 실패 시 폴백으로 사용)
      const localId = `temp-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      
      // 임시 클라이언트 객체 생성 (폴백용)
      const tempClient: Client = {
        ...newClient,
        id: localId
      };
      
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: newClient.name,
          contractStart: newClient.contractStart,
          contractEnd: newClient.contractEnd,
          statusTags: newClient.statusTags,
          icon: newClient.icon,
          usesCoupon: newClient.usesCoupon,
          publishesNews: newClient.publishesNews,
          usesReservation: newClient.usesReservation,
          phoneNumber: newClient.phoneNumber,
          naverPlaceUrl: newClient.naverPlaceUrl
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('서버 응답 오류:', response.status, errorData);
        
        // 폴백: 실패해도 UI에는 추가 (로컬에서만 작동)
        console.log('서버 저장 실패, 로컬 캐시에 임시 저장:', tempClient);
        setClients([tempClient, ...clients]);
        
        // 로컬 스토리지에도 임시 저장
        try {
          const storedClients = JSON.parse(localStorage.getItem('wizweblast_clients') || '[]');
          localStorage.setItem('wizweblast_clients', JSON.stringify([tempClient, ...storedClients]));
        } catch (storageErr) {
          console.error('로컬 스토리지 저장 오류:', storageErr);
        }
        
        setRegisterDialogOpen(false);
        alert(`'${newClient.name}' 광고주가 임시로 추가되었습니다. (서버 저장 실패: ${errorData?.error || '알 수 없는 오류'})`);
        return;
      }
      
      const data = await response.json();
      console.log('등록 성공 응답:', data);
      
      if (!data.client || !data.client.id) {
        console.error('서버 응답에 유효한 광고주 ID가 없음:', data);
        
        // 폴백: 서버 응답에 ID가 없어도 UI에는 추가
        setClients([tempClient, ...clients]);
        setRegisterDialogOpen(false);
        alert(`'${newClient.name}' 광고주가 임시로 추가되었습니다. (서버 응답 이상)`);
        return;
      }
      
      // 추가된 광고주를 목록에 추가
      const clientWithId: Client = {
        ...newClient,
        id: data.client.id
      };
      
      setClients([clientWithId, ...clients]);
      
      // 로컬 스토리지에도 저장
      try {
        const storedClients = JSON.parse(localStorage.getItem('wizweblast_clients') || '[]');
        localStorage.setItem('wizweblast_clients', JSON.stringify([clientWithId, ...storedClients]));
      } catch (storageErr) {
        console.error('로컬 스토리지 저장 오류:', storageErr);
      }
      
      setRegisterDialogOpen(false);
      
      alert(`'${newClient.name}' 광고주가 성공적으로 등록되었습니다! 👍`);
    } catch (err: any) {
      console.error('광고주 등록 오류:', err);
      alert(err.message || '광고주 등록 중 오류가 발생했습니다.');
    }
  };
  
  return (
    <div className="min-h-screen bg-[#F9FAFD] pb-10">
      <Header
        title="광고주 관리"
        description="광고주 정보를 확인하고 할 일이나 메모를 관리하세요."
        icon="👥"
        actions={
          <>
            <button
              onClick={() => setRegisterDialogOpen(true)}
              className="wiz-btn py-2 px-4 rounded-md shadow-sm flex items-center"
              aria-label="새 광고주 등록"
              title="새 광고주 등록 (Alt+N)"
            >
              <span className="mr-1">✨</span> 새 광고주 등록
            </button>
            <Link href="/dashboard" className="bg-white text-[#2251D1] px-4 py-2 rounded-lg hover:bg-opacity-90 transition-all duration-200 flex items-center text-sm font-medium shadow-sm hover:shadow">
              <span className="mr-2">📊</span> 대시보드로 돌아가기
            </Link>
          </>
        }
      />
      
      <div className="container mx-auto px-4 py-6">
        {/* 팁 메시지 */}
        <div className={`bg-[#EEF2FB] rounded-lg p-4 mb-6 flex items-start transition-all duration-500 delay-100 ${animateIn ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-5'}`}>
          <span className="text-2xl mr-3 mt-1">💡</span>
          <div>
            <h3 className="font-medium mb-1">오늘의 팁</h3>
            <p className="text-sm text-gray-700">{tipMessage}</p>
          </div>
        </div>
        
        {/* 로딩 상태 표시 */}
        {isLoading && (
          <div className="bg-white rounded-lg shadow-sm p-8 mb-6 text-center">
            <div className="animate-pulse flex flex-col items-center">
              <div className="h-12 w-12 bg-blue-200 rounded-full mb-4"></div>
              <div className="h-4 bg-blue-100 rounded w-1/3 mb-2"></div>
              <div className="h-3 bg-blue-50 rounded w-1/4"></div>
            </div>
            <p className="mt-4 text-gray-500">광고주 데이터 로드 중...</p>
          </div>
        )}
        
        {/* 오류 메시지 */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-6">
            <h3 className="font-medium flex items-center mb-1">
              <span className="mr-2">⚠️</span> 오류 발생
            </h3>
            <p className="text-sm">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-2 text-red-700 bg-white border border-red-300 px-3 py-1 rounded-md text-sm hover:bg-red-50"
            >
              새로고침
            </button>
          </div>
        )}
      
        {/* 검색 및 필터 */}
        {!isLoading && !error && (
          <>
            <div className={`bg-white rounded-lg shadow-sm p-4 mb-6 transition-all duration-500 delay-200 ${animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                {/* 검색 */}
                <div className="relative flex-1">
                  <div className="mb-6">
                    <div className="relative">
                      <input
                        type="text"
                        ref={searchInputRef}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="광고주 이름 검색... (/ 키로 포커스)"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        aria-label="광고주 검색"
                      />
                      {searchTerm && (
                        <button
                          onClick={() => setSearchTerm('')}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          aria-label="검색어 지우기"
                          title="검색어 지우기 (Esc)"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* 필터 */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">상태:</span>
                  <div className="flex flex-wrap gap-2">
                    <button
                      className={`px-3 py-2 rounded-lg text-sm transition-all ${statusFilter === 'all' ? 'bg-[#2251D1] text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                      onClick={() => setStatusFilter('all')}
                    >
                      전체 보기
                    </button>
                    <button
                      className={`px-3 py-2 rounded-lg text-sm transition-all flex items-center ${statusFilter === '종료 임박' ? 'bg-[#FFF8E1] text-[#FFC107] border border-[#FFC107]' : 'bg-gray-100 hover:bg-gray-200'}`}
                      onClick={() => setStatusFilter('종료 임박')}
                    >
                      <span className="mr-1">⏰</span> 종료 임박
                    </button>
                    <button
                      className={`px-3 py-2 rounded-lg text-sm transition-all flex items-center ${statusFilter === '관리 소홀' ? 'bg-[#FFF3E0] text-[#FF9800] border border-[#FF9800]' : 'bg-gray-100 hover:bg-gray-200'}`}
                      onClick={() => setStatusFilter('관리 소홀')}
                    >
                      <span className="mr-1">⚠️</span> 관리 소홀
                    </button>
                    <button
                      className={`px-3 py-2 rounded-lg text-sm transition-all flex items-center ${statusFilter === '민원 중' ? 'bg-[#FFEBEE] text-[#F44336] border border-[#F44336]' : 'bg-gray-100 hover:bg-gray-200'}`}
                      onClick={() => setStatusFilter('민원 중')}
                    >
                      <span className="mr-1">🔔</span> 민원 중
                    </button>
                  </div>
                </div>
              </div>
              
              {/* 추가 필터 (쿠폰/소식/예약) */}
              <div className="mt-4 flex flex-wrap gap-3">
                <span className="text-sm text-gray-600 self-center">추가 필터:</span>
                <button
                  className={`px-3 py-2 rounded-lg text-sm transition-all flex items-center ${filterNoCoupon ? 'bg-[#E3F2FD] text-[#2196F3] border border-[#2196F3]' : 'bg-gray-100 hover:bg-gray-200'}`}
                  onClick={() => toggleFilter('coupon')}
                >
                  <span className="mr-1">🎟️</span> 쿠폰 미사용 ({statusCounts.noCoupon})
                </button>
                <button
                  className={`px-3 py-2 rounded-lg text-sm transition-all flex items-center ${filterNoNews ? 'bg-[#E8F5E9] text-[#4CAF50] border border-[#4CAF50]' : 'bg-gray-100 hover:bg-gray-200'}`}
                  onClick={() => toggleFilter('news')}
                >
                  <span className="mr-1">📰</span> 소식 미발행 ({statusCounts.noNews})
                </button>
                <button
                  className={`px-3 py-2 rounded-lg text-sm transition-all flex items-center ${filterNoReservation ? 'bg-[#F3E5F5] text-[#9C27B0] border border-[#9C27B0]' : 'bg-gray-100 hover:bg-gray-200'}`}
                  onClick={() => toggleFilter('reservation')}
                >
                  <span className="mr-1">📅</span> 예약 미사용 ({statusCounts.noReservation})
                </button>
                {(filterNoCoupon || filterNoNews || filterNoReservation) && (
                  <button
                    className="px-3 py-2 rounded-lg text-sm transition-all bg-gray-200 hover:bg-gray-300 flex items-center"
                    onClick={() => {
                      setFilterNoCoupon(false);
                      setFilterNoNews(false);
                      setFilterNoReservation(false);
                    }}
                  >
                    <span className="mr-1">🔄</span> 필터 초기화
                  </button>
                )}
              </div>
            </div>
          
            {/* 광고주 목록 */}
            <div className={`transition-all duration-500 delay-300 ${animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
              {filteredClients.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredClients.map(client => (
                    <ClientCard
                      key={client.id}
                      client={client}
                      onAddTodo={() => openTodoDialog(client.id)}
                      onAddNote={() => openMemoDialog(client.id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-medium mb-2">검색 결과가 없습니다</h3>
                  <p className="text-gray-500 mb-4">다른 검색어나 필터를 사용해 보세요.</p>
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('all');
                      setFilterNoCoupon(false);
                      setFilterNoNews(false);
                      setFilterNoReservation(false);
                    }}
                    className="bg-[#2251D1] text-white px-4 py-2 rounded-lg hover:bg-[#1a3fa0] transition-all"
                  >
                    모두 보기
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
      
      {/* 다이얼로그 컴포넌트 */}
      {selectedClient && (
        <>
          <ClientMemoDialog
            isOpen={memoDialogOpen}
            onClose={() => setMemoDialogOpen(false)}
            client={selectedClient}
            onSave={handleAddNote}
          />
          
          <ClientTodoDialog
            isOpen={todoDialogOpen}
            onClose={() => setTodoDialogOpen(false)}
            client={selectedClient}
            onSave={handleAddTodo}
          />
        </>
      )}
      
      <ClientRegisterDialog
        isOpen={registerDialogOpen}
        onClose={() => setRegisterDialogOpen(false)}
        onSave={handleRegisterClient}
      />
    </div>
  );
} 